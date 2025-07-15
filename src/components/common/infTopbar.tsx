// src/components/InfluencerTopbar.tsx
"use client";

import React, {
  useState,
  useEffect,
  useRef,
} from "react";
import {
  HiSearch,
  HiUserCircle,
  HiChevronDown,
  HiMenu,
  HiX,
} from "react-icons/hi";
import { get } from "@/lib/api";

interface InfluencerTopbarProps {
  onSidebarOpen: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
}

export default function InfluencerTopbar({ onSidebarOpen }: InfluencerTopbarProps) {
  // profile state
  const [influencerName, setInfluencerName] = useState("");
  const [email, setEmail] = useState("");
  const [subscriptionName, setSubscriptionName] = useState("");
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // profile menu
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);

  // desktop vs mobile flag
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // fetch influencer info
  useEffect(() => {
    const infId = typeof window !== "undefined" ? localStorage.getItem("influencerId") : null;
    if (!infId) {
      setError("No influencerId found");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await get<{
          name: string;
          email: string;
          subscription: { planName: string; expiresAt: string };
        }>(`/influencer/getbyid?id=${infId}`);
        setInfluencerName(data.name);
        setEmail(data.email);
        setSubscriptionName(data.subscription.planName);
        setSubscriptionExpiresAt(data.subscription.expiresAt);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // close profile menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    window.clearTimeout(debounceRef.current!);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const results = await get<SearchResult[]>(
          `/search/campaigns?query=${encodeURIComponent(searchQuery)}`
        );
        setSearchResults(results);
      } catch (err) {
        console.error("Search error", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, [searchQuery]);

  const formattedExpiry = subscriptionExpiresAt
    ? new Date(subscriptionExpiresAt).toLocaleDateString()
    : "";

  return (
    <header className="w-full bg-white shadow-sm relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Sidebar toggle + Search */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onSidebarOpen}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none"
            >
              <HiMenu size={24} className="text-gray-600" />
            </button>

            <div className="relative">
              {/* Mobile: show icon */}
              <HiSearch
                size={20}
                className="text-gray-600 cursor-pointer md:hidden"
                onClick={() => setSearchOpen(true)}
              />

              {/* Input: desktop always, mobile when open */}
              <div
                className={`flex items-center border border-gray-200 rounded-md bg-gray-100
                  ${searchOpen ? "absolute left-0 top-full mt-1 w-64" : "hidden md:flex"}
                `}
              >
                <input
                  type="text"
                  className="flex-1 px-3 py-2 bg-transparent text-sm focus:outline-none"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchOpen && (
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="p-2"
                  >
                    <HiX size={18} className="text-gray-600" />
                  </button>
                )}
              </div>

              {/* Results dropdown */}
              {(searchOpen || isDesktop) && searchQuery && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg overflow-auto max-h-60 z-20">
                  {searchLoading ? (
                    <div className="p-3 text-gray-500 text-sm">Loading…</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((r) => (
                      <a
                        key={r.id}
                        href={r.url}
                        className="block px-4 py-2 hover:bg-gray-50"
                      >
                        <p className="text-sm font-medium text-gray-800">
                          {r.title}
                        </p>
                        {r.subtitle && (
                          <p className="text-xs text-gray-500">{r.subtitle}</p>
                        )}
                      </a>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500 text-sm">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Profile & Name */}
          <div className="flex items-center space-x-6">
            {loading ? (
              <span className="text-gray-500 text-sm">Loading…</span>
            ) : error ? (
              <span className="text-red-500 text-sm">{error}</span>
            ) : (
              <span className="text-gray-800 font-medium text-sm">
                {influencerName}
              </span>
            )}

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center space-x-1 p-2 rounded-md hover:bg-gray-100 focus:outline-none"
              >
                <HiUserCircle size={24} className="text-gray-600" />
                <HiChevronDown size={16} className="text-gray-600" />
              </button>

              {menuOpen && !loading && !error && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">
                      {influencerName}
                    </p>
                    <p className="text-sm text-gray-500">{email}</p>
                    <p className="text-sm text-gray-500">
                      {subscriptionName.charAt(0).toUpperCase() + subscriptionName.slice(1)} Plan
                    </p>
                    <p className="text-xs text-gray-500">
                      Expires: {formattedExpiry}
                    </p>
                  </div>
                  <ul className="py-1">
                    <li className="px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                      <a href="/influencer/profile">View Profile</a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
