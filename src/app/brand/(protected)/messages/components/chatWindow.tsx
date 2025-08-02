"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  HiPaperAirplane,
  HiPaperClip,
  HiArrowDown,
  HiReply,
  HiX,
} from "react-icons/hi";
import { post } from "@/lib/api";

type Message = {
  messageId: string;        // from server
  clientId?: string;        // local temp id
  senderId: string;
  text: string;
  timestamp: string;
  replyTo?: { text: string; idx: number } | null;
};

const CHAR_LIMIT = 2000;
const SCROLL_THRESHOLD = 50;

const msgKey = (m: Pick<Message, "senderId" | "timestamp" | "text" | "messageId">) =>
  m.messageId || `${m.senderId}__${m.timestamp}__${m.text}`;

export default function ChatWindow({ params }: { params: { roomId: string } }) {
  const { roomId } = params;
  const router = useRouter();
  const brandId = typeof window !== "undefined" ? localStorage.getItem("brandId") : null;

  // state
  const [partnerName, setPartnerName] = useState("Chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<{ text: string; idx: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [showScrollDown, setShowScrollDown] = useState(false);

  // refs
  const scrollWrapRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const optimisticMap = useRef<Record<string, string>>({}); // hash -> clientId
  const mountedRef = useRef(false); // StrictMode guard
  const wsMadeRef = useRef(false); // StrictMode guard
  const historyLoadedRef = useRef(false); // StrictMode guard

  // helpers --------------------------------------------------

  const isNearBottom = (el: HTMLDivElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD;

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollWrapRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    setShowScrollDown(false);
  }, []);

  const onScroll = () => {
    const el = scrollWrapRef.current;
    if (!el) return;
    setShowScrollDown(!isNearBottom(el));
  };

  const upsertMessage = useCallback((incoming: Message) => {
    setMessages((prev) => {
      const incomingHash = msgKey(incoming);
      // 1) by messageId/hash
      if (prev.some((m) => msgKey(m) === incomingHash)) return prev;

      // 2) if our optimistic exists (no clientId from server) try hash match
      if (!incoming.clientId) {
        const tempIdx = prev.findIndex(
          (m) =>
            !m.messageId &&
            m.senderId === incoming.senderId &&
            m.text === incoming.text &&
            m.timestamp === incoming.timestamp
        );
        if (tempIdx !== -1) {
          const next = [...prev];
          next[tempIdx] = { ...incoming };
          return next;
        }
      }

      return [...prev, incoming];
    });
  }, []);

  // data loading --------------------------------------------

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    if (!brandId) return;
    post<{ rooms: any[] }>("/chat/rooms", { userId: brandId })
      .then(({ rooms }) => {
        const room = rooms.find((r) => r.roomId === roomId);
        const other = room?.participants.find((p: any) => p.userId !== brandId);
        if (other) setPartnerName(other.name);
      })
      .catch(() => setError("Unable to load conversation info."));
  }, [roomId, brandId]);

  const loadHistory = useCallback(() => {
    if (historyLoadedRef.current) return;
    historyLoadedRef.current = true;

    post<{ messages: Message[] }>("/chat/history", { roomId, limit: 100 })
      .then(({ messages: msgs }) => setMessages(msgs || []))
      .catch(() => setError("Failed to load messages."))
      .finally(() => {
        setLoading(false);
        requestAnimationFrame(() => scrollToBottom(false));
      });
  }, [roomId, scrollToBottom]);

  useEffect(loadHistory, [loadHistory]);

  // websocket ------------------------------------------------

  useEffect(() => {
    if (wsMadeRef.current) return;
    wsMadeRef.current = true;

    const url = process.env.NEXT_PUBLIC_WS_URL || "ws://infuencer.onrender.com/ws";
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ type: "joinChat", roomId }));

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.type === "chatMessage" && data.roomId === roomId) {
          const serverMsg: Message = data.message;
          // if server echoed a clientId we sent, attach it
          const hash = msgKey(serverMsg);
          const clientId = optimisticMap.current[hash];
          if (clientId) serverMsg.clientId = clientId;
          upsertMessage(serverMsg);

          const el = scrollWrapRef.current;
          if (el && isNearBottom(el)) scrollToBottom();
        }
      } catch {
      }
    };

    ws.onerror = () => {console.log(error);
     setError("WebSocket error");}

    return () => ws.close();
  }, [roomId, upsertMessage, scrollToBottom]);

  // send msg -------------------------------------------------

  const sendMessage = async () => {
    if (!input.trim() || !brandId) return;

    const text = input.trim();
    const now = new Date().toISOString();
    const clientId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const optimistic: Message = {
      messageId: "",
      clientId,
      senderId: brandId,
      text,
      timestamp: now,
      replyTo: replyTo ? { ...replyTo } : null,
    };

    const hash = msgKey(optimistic);
    optimisticMap.current[hash] = clientId;

    setMessages((prev) => [...prev, optimistic]);
    requestAnimationFrame(() => scrollToBottom());

    const packet = {
      type: "sendChatMessage",
      roomId,
      senderId: brandId,
      text,
      timestamp: now,
      replyTo: replyTo?.text ?? null,
      clientId,
    };

    const sendViaRest = async () => {
      try {
        const { message } = await post<{ message: Message }>("/chat/message", {
          roomId,
          senderId: brandId,
          text,
          replyTo: replyTo?.text ?? null,
          clientId,
        });
        upsertMessage(message);
      } catch {
        setError("Failed to send message");
        setMessages((prev) => prev.filter((m) => m.clientId !== clientId));
        delete optimisticMap.current[hash];
      }
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(packet));
    } else {
      await sendViaRest();
    }

    setInput("");
    setReplyTo(null);
  };

  const toggleExpand = (idx: number) =>
    setExpanded((e) => ({ ...e, [idx]: !e[idx] }));

  // jsx ------------------------------------------------------

  return (
    <Card className="relative flex h-screen flex-col min-h-0">
      {/* HEADER */}
      <CardHeader className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white">
        <Button variant="ghost" className="text-white" onClick={() => router.back()}>
          ← Back
        </Button>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarFallback>{partnerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-semibold">{partnerName}</h3>
        </div>
        <div style={{ width: 64 }} />
      </CardHeader>

      {/* BODY */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* MESSAGES */}
        <div className="relative flex-1 min-h-0">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Loading chat…
            </div>
          ) : (
            <div
              ref={scrollWrapRef}
              className="h-full overflow-y-auto px-6 py-4 pr-2 space-y-4 pb-4"
              onScroll={onScroll}
            >
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === brandId;
                const time = new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const tooLong = msg.text.length > CHAR_LIMIT;
                const text = !tooLong || expanded[idx]
                  ? msg.text
                  : msg.text.slice(0, CHAR_LIMIT) + "...";

                return (
                  <div
                    key={msg.messageId || msg.clientId}
                    className={`group flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>{partnerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}

                    <div className="max-w-lg">
                      {msg.replyTo && (
                        <div className="border-l-2 border-gray-300 pl-3 mb-1 text-xs italic text-gray-600">
                          {msg.replyTo.text}
                        </div>
                      )}

                      <CardContent
                        className={`p-3 rounded-xl break-words ${
                          isMe
                            ? "bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{text}</p>
                        {tooLong && (
                          <button
                            onClick={() => toggleExpand(idx)}
                            className="mt-1 text-sm font-medium text-gray-800 hover:underline"
                          >
                            {expanded[idx] ? "Show less" : "Read more"}
                          </button>
                        )}
                      </CardContent>

                      <p
                        className={`text-xs mt-1 ${
                          isMe ? "text-right" : "text-left"
                        } text-gray-600`}
                      >
                        {time}
                      </p>
                    </div>

                    <button
                      onClick={() => setReplyTo({ text: msg.text, idx })}
                      className="opacity-0 group-hover:opacity-100 ml-2 self-start text-gray-500 hover:text-gray-700"
                      title="Reply"
                    >
                      <HiReply className="h-5 w-5" />
                    </button>

                    {isMe && (
                      <Avatar className="h-8 w-8 ml-2 border-2 border-[#FFBF00]">
                        <AvatarFallback>I</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* scroll-down button */}
          {showScrollDown && (
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-4 right-6 bg-white hover:bg-gray-100 text-gray-800"
              onClick={() => scrollToBottom()}
            >
              <HiArrowDown className="h-6 w-6" />
            </Button>
          )}
        </div>

        {/* INPUT */}
        <CardFooter className="bg-gray-50 border-t px-6 py-4">
          <div className="w-full">
            {replyTo && (
              <div className="mb-2 flex justify-between items-center bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="text-sm italic text-gray-600">
                  Replying to: {replyTo.text.slice(0, 100)}
                </span>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <HiX className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <HiPaperClip className="h-6 w-6 text-gray-800 cursor-pointer hover:text-gray-600" />
              <Textarea
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                className="flex-1 resize-none bg-white focus:ring-2 focus:ring-[#FFBF00] rounded-lg p-2"
              />
              <Button
                size="icon"
                className="bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white hover:opacity-90"
                disabled={!input.trim()}
                onClick={sendMessage}
              >
                <HiPaperAirplane className="h-5 w-5 rotate-90" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </div>

      {error && (
        <p className="absolute bottom-0 w-full text-center text-xs text-red-500 pb-2">
          {error}
        </p>
      )}
    </Card>
  );
}
