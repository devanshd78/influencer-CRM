"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import type { Socket } from "socket.io-client";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  senderId: string;
  text: string;
  timestamp: string;
  replyTo?: { text: string; idx: number };
};

type RoomSummary = {
  roomId: string;
  participants: { userId: string; name: string }[];
};

const CHAR_LIMIT = 200;

export default function ChatWindow({ params }: { params: { roomId: string } }) {
  const { roomId } = params;
  const router = useRouter();
  const influencerId =
    typeof window !== "undefined" ? localStorage.getItem("influencerId") : null;

  const [partnerName, setPartnerName] = useState("Chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<{ text: string; idx: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // track which messages are expanded
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch partner name
  useEffect(() => {
    if (!influencerId) return;
    (async () => {
      try {
        const { rooms } = await post<{ rooms: RoomSummary[] }>("/chat/rooms", {
          userId: influencerId,
        });
        const room = rooms.find((r) => r.roomId === roomId);
        const other = room?.participants.find((p) => p.userId !== influencerId);
        if (other) setPartnerName(other.name);
      } catch {
        setError("Unable to load conversation info.");
      }
    })();
  }, [roomId, influencerId]);

  // Load messages
  useEffect(() => {
    (async () => {
      try {
        const { messages: msgs } = await post<{ messages: Message[] }>(
          "/chat/history",
          { roomId, limit: 100 }
        );
        setMessages(msgs || []);
      } catch {
        setError("Failed to load messages.");
      } finally {
        setLoading(false);
      }
    })();
  }, [roomId]);

  // Socket.io
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL!);
    socketRef.current = socket;
    socket.emit("joinChat", { roomId });
    socket.on("chatMessage", ({ message }: { message: Message }) => {
      setMessages((prev) => [...prev, message]);
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // Send message
  const sendMessage = () => {
    if (!input.trim() || !influencerId) return;
    const msg: Message = {
      senderId: influencerId,
      text: input.trim(),
      timestamp: new Date().toISOString(),
      replyTo: replyTo || undefined,
    };
    socketRef.current?.emit("sendChatMessage", { roomId, ...msg });
    setMessages((prev) => [...prev, msg]);
    setInput("");
    setReplyTo(null);
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  // Toggle expansion of a message
  const toggleExpand = (idx: number) => {
    setExpanded((e) => ({ ...e, [idx]: !e[idx] }));
  };

  return (
    <Card className="relative flex flex-col h-full bg-white shadow">
      {/* Header */}
      <CardHeader className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back
        </Button>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{partnerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-semibold text-gray-800">{partnerName}</h3>
        </div>
      </CardHeader>

      {/* Messages */}
      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Loading chat…
          </div>
        ) : (
          <ScrollArea
            ref={scrollRef}
            className="h-full px-6 py-4 space-y-4 overflow-auto"
          >
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === influencerId;
              const time = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              // Determine whether to truncate
              const isExpanded = expanded[idx];
              const tooLong = msg.text.length > CHAR_LIMIT;
              const displayText =
                !tooLong || isExpanded
                  ? msg.text
                  : msg.text.slice(0, CHAR_LIMIT) + "...";

              return (
                <div
                  key={idx}
                  className={`group flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {!isMe && (
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>{partnerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}

                  <div className="max-w-lg">
                    {msg.replyTo && (
                      <div className="border-l-2 border-gray-300 pl-3 mb-1 text-xs text-gray-600 italic">
                        {msg.replyTo.text}
                      </div>
                    )}

                    <CardContent
                      className={`p-3 rounded-xl break-words ${
                        isMe
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {displayText}
                      </p>
                      {tooLong && (
                        <button
                          onClick={() => toggleExpand(idx)}
                          className="mt-1 text-sm font-medium text-blue-500 hover:underline"
                        >
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}
                    </CardContent>

                    <p
                      className={`text-xs mt-1 ${
                        isMe ? "text-right text-white/70" : "text-left text-gray-500"
                      }`}
                    >
                      {time}
                    </p>
                  </div>

                  <button
                    onClick={() => setReplyTo({ text: msg.text, idx })}
                    className="opacity-0 group-hover:opacity-100 ml-2 self-start text-gray-400 hover:text-gray-600"
                    title="Reply"
                  >
                    <HiReply className="h-5 w-5" />
                  </button>

                  {isMe && (
                    <Avatar className="h-8 w-8 ml-2">
                      <AvatarFallback>{/* initial */}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
          </ScrollArea>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-24 right-6 bg-white rounded-full shadow-md hover:bg-gray-100"
          onClick={() =>
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: "smooth",
            })
          }
        >
          <HiArrowDown className="h-6 w-6 text-gray-500" />
        </Button>
      </div>

      {/* Reply banner + Input */}
      <div className="absolute inset-x-0 bottom-0 bg-gray-50 border-t px-6 py-4">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between bg-white px-4 py-2 rounded-lg shadow-sm">
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
          <HiPaperClip className="h-6 w-6 text-gray-400 cursor-pointer hover:text-gray-600" />
          <Textarea
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), sendMessage())
            }
            rows={1}
            className="flex-1 resize-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2"
          />
          <Button
            size="icon"
            variant="ghost"
            disabled={!input.trim()}
            onClick={sendMessage}
            className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 rounded-lg p-2"
          >
            <HiPaperAirplane className="h-5 w-5 rotate-90" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
