// File: app/brand/(protected)/messages/components/ChatWindow.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HiPaperAirplane, HiPaperClip, HiArrowDown } from "react-icons/hi";
import { post } from "@/lib/api";

type Message = {
  senderId: string;
  text: string;
  timestamp: string;
};

type RoomSummary = {
  roomId: string;
  participants: { userId: string; name: string }[];
};

export default function ChatWindow({
  params,
}: {
  params: { roomId: string };
}) {
  const { roomId } = params;
  const router = useRouter();
  const influencerId =
    typeof window !== "undefined" ? localStorage.getItem("brandId") : null;

  const [partnerName, setPartnerName] = useState("Chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // WebSocket ref
  const wsRef = useRef<WebSocket | null>(null);

  // 1) Fetch room info for partner name
  useEffect(() => {
    if (!influencerId) return;
    (async () => {
      try {
        const { rooms } = await post<{ rooms: RoomSummary[] }>("/chat/rooms", {
          userId: influencerId,
        });
        const room = rooms.find((r) => r.roomId === roomId);
        const other = room?.participants.find(
          (p) => p.userId !== influencerId
        );
        if (other) setPartnerName(other.name);
      } catch {
        setError("Unable to load conversation info.");
      }
    })();
  }, [roomId, influencerId]);

  // 2) Load last messages
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

  // 3) Open WebSocket
  useEffect(() => {
    const socketUrl = `${process.env.NEXT_PUBLIC_WS_URL}?roomId=${encodeURIComponent(
      roomId
    )}`;
    const ws = new WebSocket(socketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // Notify server we’ve joined
      const joinMsg = { type: "joinChat", payload: { roomId } };
      ws.send(JSON.stringify(joinMsg));
    };

    ws.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);
        if (type === "chatMessage") {
          setMessages((prev) => [...prev, payload.message as Message]);
          scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      } catch {
        console.error("Invalid WS message", event.data);
      }
    };

    ws.onerror = (ev) => {
      setError("WebSocket error");
      console.error("WebSocket error:", ev);
    };

    ws.onclose = () => {
      // Optionally try to reconnect…
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!input.trim() || !influencerId) return;

    const msg: Message = {
      senderId: influencerId,
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const outgoing = {
      type: "sendChatMessage",
      payload: { roomId, ...msg },
    };
    wsRef.current?.send(JSON.stringify(outgoing));

    setMessages((prev) => [...prev, msg]);
    setInput("");
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <CardHeader className="flex items-center justify-between px-4 py-2 border-b">
        <Button variant="ghost" onClick={() => router.back()}>
          ←
        </Button>
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{partnerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold">{partnerName}</h3>
        </div>
      </CardHeader>

      {/* Messages */}
      <div className="relative flex-1">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            Loading chat…
          </div>
        ) : (
          <ScrollArea ref={scrollRef} className="h-full px-4 py-2 space-y-4">
            {messages.map((msg, i) => {
              const isMe = msg.senderId === influencerId;
              const time = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div
                  key={i}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {!isMe && (
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback>{partnerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="max-w-[70%]">
                    <CardContent
                      className={`p-2 rounded-lg ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-200 rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </CardContent>
                    <p
                      className={`text-xs mt-1 ${
                        isMe
                          ? "text-right text-white/70"
                          : "text-left text-gray-500"
                      }`}
                    >
                      {time}
                    </p>
                  </div>
                  {isMe && (
                    <Avatar className="h-6 w-6 ml-2">
                      <AvatarFallback>{/* your initial */}</AvatarFallback>
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
          className="absolute bottom-4 right-4 bg-white rounded-full shadow-md"
          onClick={() =>
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: "smooth",
            })
          }
        >
          <HiArrowDown className="h-5 w-5" />
        </Button>
      </div>

      {/* Input */}
      <CardFooter className="px-4 py-2 border-t">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <HiPaperClip className="h-5 w-5 text-gray-500" />
          </Button>
          <Input
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1"
          />
          <Button size="icon" disabled={!input.trim()} onClick={sendMessage}>
            <HiPaperAirplane className="h-5 w-5 rotate-90" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
