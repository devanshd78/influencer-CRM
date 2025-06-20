// File: app/brand/(protected)/messages/data.ts
import { get } from "@/lib/api";

export interface Influencer {
  id: string;
  name: string;
}

interface RawInfluencer {
  influencerId: string;
  name: string;
}

/**
 * Fetch & normalize all influencers
 */
export async function getInfluencers(): Promise<Influencer[]> {
  const raw = await get<RawInfluencer[]>("/influencer/getlist");
  return raw.map((i) => ({
    id: i.influencerId,
    name: i.name,
  }));
}

/**
 * Look up a single influencer by ID
 */
export async function getInfluencerById(
  id: string
): Promise<Influencer | null> {
  const list = await getInfluencers();
  return list.find((inf) => inf.id === id) ?? null;
}
