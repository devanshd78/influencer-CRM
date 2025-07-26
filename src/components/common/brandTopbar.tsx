// src/components/BrandTopbar.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  HiSearch,
  HiUserCircle,
  HiChevronDown,
  HiMenu,
  HiCreditCard,
  HiX,
} from "react-icons/hi";
import { get } from "@/lib/api";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
}

export default function BrandTopbar({
  onSidebarOpen,
}: {
  onSidebarOpen: () => void;
}) {
  const router = useRouter();
  // Profile / subscription state
  const [brandName, setBrandName] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [subscriptionName, setSubscriptionName] = useState("");
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile menu
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);

  // Track desktop vs mobile
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Load brand info
  useEffect(() => {
    const brandId =
      typeof window !== "undefined" ? localStorage.getItem("brandId") : null;
    if (!brandId) {
      setError("No brandId in localStorage");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await get<{
          name: string;
          email: string;
          walletBalance: number;
          subscription: { planName: string; expiresAt: string };
        }>(`/brand?id=${brandId}`);
        setBrandName(data.name);
        setEmail(data.email);
        setWalletBalance(data.walletBalance);
        setSubscriptionName(data.subscription.planName);
        setSubscriptionExpiresAt(data.subscription.expiresAt);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load brand info");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Profile menu click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(async () => {
      try {
        const results = await get<SearchResult[]>(
          `/search/brand?query=${encodeURIComponent(searchQuery)}`
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
    <header className="w-full bg-white shadow-sm relative z-20">
      <div className="flex items-center justify-end h-16 px-4 border-b border-gray-200">
        {/* Left: Hamburger + Search */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onSidebarOpen}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none"
          >
            <HiMenu size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Right: Wallet, Name, Profile */}
        <div className="flex items-center space-x-6">
          {!loading && !error && walletBalance !== null && (
            <button
              onClick={() => router.push('/brand/milestone-history')}
              className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-md cursor-pointer"
              title="Wallet balance"
            >
              <HiCreditCard size={20} className="text-gray-600" />
              <span className="font-large text-gray-800">
                ${walletBalance.toFixed(2)}
              </span>
            </button>
          )}

          {loading ? (
            <span className="text-gray-500 text-sm">Loading…</span>
          ) : error ? (
            <span className="text-red-500 text-sm">{error}</span>
          ) : (
            <span className="text-gray-800 font-medium text-lg">
              {brandName}
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
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-md font-semibold text-gray-700">
                    {brandName}
                  </p>
                  <p className="text-sm text-gray-500">{email}</p>
                  <p className="text-md text-gray-500">
                    Plan:{" "}
                    {subscriptionName.charAt(0).toUpperCase() +
                      subscriptionName.slice(1)}
                  </p>
                  <p className="text-md text-gray-500">
                    Expires: {formattedExpiry}
                  </p>
                </div>
                <ul className="py-1">
                  <li className="px-4 py-2 hover:bg-gray-100 text-md">
                    <a href="/brand/profile">View Profile</a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
