"use client";

import React, { useEffect, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { get } from "@/lib/api";

interface Interest {
  _id: string;
  name: string;
}

interface Influencer {
  _id: string;
  name: string;
  avatarUrl?: string;
  interests: string[]; // array of interest _id
  followerCount?: number;
  location?: string;
}

export default function BrowseInfluencersPage() {
  // ─── State ─────────────────────────────────────────────────────────────
  const [interestOptions, setInterestOptions] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [filtered, setFiltered] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Fetch Interest Options from API ────────────────────────────────────
  useEffect(() => {
    async function fetchInterests() {
      try {
        // returns array of { _id, name }
        const data: Interest[] = await get("/interest/getlist");
        setInterestOptions(data);
      } catch (error) {
        console.error("Error loading interests:", error);
      }
    }
    fetchInterests();
  }, []);

  // ─── Fetch Influencers from API ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data: Influencer[] = await get("/influencer/list", {});
        setInfluencers(data);
        setFiltered(data);
      } catch (error) {
        console.error("Error loading influencers:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ─── Filter Logic ───────────────────────────────────────────────────────
  useEffect(() => {
    if (selectedInterests.size === 0) {
      setFiltered(influencers);
    } else {
      setFiltered(
        influencers.filter((inf) =>
          inf.interests.some((i) => selectedInterests.has(i))
        )
      );
    }
  }, [selectedInterests, influencers]);

  const toggleInterest = (id: string) =>
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ─── Loading / Empty States ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="animate-pulse rounded-lg bg-gray-200 p-6 text-gray-500">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
          Browse Influencers
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Panel */}
          <aside className="w-full lg:w-1/4 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Filter by Interest</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {interestOptions.map((opt) => (
                <label
                  key={opt._id}
                  className="flex items-center space-x-2 text-sm"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600"
                    checked={selectedInterests.has(opt._id)}
                    onChange={() => toggleInterest(opt._id)}
                  />
                  <span className="text-gray-700">{opt.name}</span>
                </label>
              ))}
            </div>
            <button
              className="mt-4 text-sm text-indigo-600 hover:underline"
              onClick={() => setSelectedInterests(new Set())}
            >
              Clear All
            </button>
          </aside>

          {/* Influencers Grid */}
          <section className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length === 0 ? (
              <p className="col-span-full text-center text-gray-600">
                No influencers match the selected interests.
              </p>
            ) : (
              filtered.map((inf) => (
                <div
                  key={inf._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col"
                >
                  <img
                    src={inf.avatarUrl || "/default-avatar.png"}
                    alt={inf.name}
                    className="h-32 w-32 rounded-full object-cover mx-auto"
                  />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">
                    {inf.name}
                  </h3>
                  {inf.location && (
                    <p className="text-sm text-gray-500 text-center">
                      {inf.location}
                    </p>
                  )}
                  {inf.followerCount != null && (
                    <p className="text-sm text-gray-500 text-center">
                      {inf.followerCount.toLocaleString()} followers
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap justify-center gap-1">
                    {inf.interests.map((id) => {
                      const opt = interestOptions.find((i) => i._id === id);
                      return (
                        <span
                          key={id}
                          className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-1"
                        >
                          {opt?.name || id}
                        </span>
                      );
                    })}
                  </div>
                  <button className="mt-auto bg-indigo-600 text-white text-sm rounded-md py-2 hover:bg-indigo-700 transition">
                    View Profile
                  </button>
                </div>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
