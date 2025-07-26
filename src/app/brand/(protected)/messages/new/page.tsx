"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { post } from "@/lib/api";

interface RawInfluencer {
  influencerId: string;
  name: string;
}

interface Influencer {
  id: string;
  name: string;
}

export default function NewChatPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const brandId =
    typeof window !== "undefined" ? localStorage.getItem("brandId") : null;

  useEffect(() => {
    (async () => {
      try {
        // adjust to your real endpoint
        const rawList = await post<RawInfluencer[]>("/influencer/getlist");
        const uiList = rawList.map((inf) => ({
          id: inf.influencerId,
          name: inf.name,
        }));
        setInfluencers(uiList);
      } catch (err) {
        console.error(err);
        setError("Failed to load influencers.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = influencers.filter((inf) =>
    inf.name.toLowerCase().includes(query.toLowerCase())
  );

  const startChat = async (influencerId: string) => {
    if (!brandId) return;
    try {
      const { roomId } = await post<{ roomId: string }>("/chat/room", {
        brandId,
        influencerId,
      });
      router.replace(`/brand/messages/${roomId}`);
    } catch (err) {
      console.error(err);
      setError("Unable to start chat. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Cancel
        </Button>
        <h2 className="flex-1 text-lg font-semibold text-center">New Chat</h2>
      </div>

      <Input
        placeholder="Search influencers…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4"
      />

      {loading ? (
        <div className="text-center text-sm text-gray-500">Loading…</div>
      ) : error ? (
        <div className="text-center text-sm text-red-500">{error}</div>
      ) : (
        <ScrollArea className="overflow-auto flex-1">
          {filtered.map((inf) => (
            <div
              key={inf.id}
              className="flex items-center space-x-3 px-2 py-3 hover:bg-gray-100 rounded cursor-pointer transition-colors bg-white shadow-sm rounded-md mb-2"
              onClick={() => startChat(inf.id)}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {inf.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{inf.name}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-sm text-gray-500">
              No influencers found.
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}
