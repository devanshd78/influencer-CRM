"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { post } from "@/lib/api";

interface RawBrand {
  brandId: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

export default function NewChatPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const router = useRouter();

  const influencerId =
    typeof window !== "undefined" ? localStorage.getItem("influencerId") : null;

  useEffect(() => {
    (async () => {
      try {
        const { brands: rawList } = await post<{ brands: RawBrand[] }>(
          "/brand/getall"
        );
        setBrands(rawList.map((b) => ({ id: b.brandId, name: b.name })));
      } catch (err) {
        console.error(err);
        setError("Failed to load brands.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(query.toLowerCase())
  );

  const startChat = async (brandId: string) => {
    if (!influencerId) return;
    try {
      const { roomId } = await post<{ roomId: string }>("/chat/room", {
        brandId,
        influencerId,
      });
      router.replace(`/influencer/messages/${roomId}`);
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
        placeholder="Search brands…"
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
          {filtered.map((b) => (
            <div
              key={b.id}
              className="flex items-center space-x-3 px-2 py-3 hover:bg-gray-100 rounded cursor-pointer transition-colors bg-white shadow-sm rounded-md mb-2"
              onClick={() => startChat(b.id)}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback>{b.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{b.name}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-sm text-gray-500">
              No brands found.
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}
