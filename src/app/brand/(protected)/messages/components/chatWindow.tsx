// File: app/brand/(protected)/messages/components/ChatWindow.tsx
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  HiPaperAirplane,
  HiPaperClip,
  HiArrowDown,
} from "react-icons/hi";
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
  const socketRef = useRef<Socket | null>(null);

  // Fetch room info for partner name
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

  // Load last messages
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

  // Real-time socket
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL!);
    socketRef.current = socket;
    socket.emit("joinChat", { roomId });
    socket.on("chatMessage", ({ message }: { message: Message }) => {
      setMessages((prev) => [...prev, message]);
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!input.trim() || !influencerId) return;
    const msg: Message = {
      senderId: influencerId,
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };
    socketRef.current?.emit("sendChatMessage", { roomId, ...msg });
    setMessages((prev) => [...prev, msg]);
    setInput("");
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
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
        <div className="flex space-x-2">
          {/* Add action icons if desired */}
          {/* <Button variant="ghost"><HiUsers /></Button> */}
          {/* <Button variant="ghost"><HiDotsVertical /></Button> */}
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
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === influencerId;
              const time = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div
                  key={idx}
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
                        isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-200 rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </CardContent>
                    <p
                      className={`text-xs mt-1 ${
                        isMe ? "text-right text-white/70" : "text-left text-gray-500"
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
        {/* Scroll-to-bottom */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-4 right-4 bg-white rounded-full shadow-md"
          onClick={() =>
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
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
          <Button
            size="icon"
            disabled={!input.trim()}
            onClick={sendMessage}
          >
            <HiPaperAirplane className="h-5 w-5 rotate-90" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
