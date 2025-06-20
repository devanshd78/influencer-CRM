// components/BrandTopbar.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  HiSearch,
  HiUserCircle,
  HiChevronDown,
  HiMenu,
  HiCreditCard,
} from "react-icons/hi";
import { get } from "@/lib/api";

export default function BrandTopbar({
  onSidebarOpen,
}: {
  onSidebarOpen: () => void;
}) {
  const [brandName, setBrandName] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const brandId =
      typeof window !== "undefined"
        ? localStorage.getItem("brandId")
        : null;

    if (!brandId) {
      setError("No brandId in localStorage");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // Your GET returns: { name, email, phone, ..., walletBalance }
        const data = await get<{
          name: string;
          walletBalance: number;
          // you can type other fields if you want
        }>(`/brand?id=${brandId}`);

        setBrandName(data.name);
        setWalletBalance(data.walletBalance);
      } catch (err: any) {
        console.error(err);
        setError(
          err.message ||
            "Failed to load brand info and wallet balance"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Hamburger + Search */}
          <div className="flex items-center">
            <button
              onClick={onSidebarOpen}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <HiMenu size={24} className="text-gray-600" />
            </button>
            <div className="ml-2 w-full max-w-xs">
              <div className="relative">
                <HiSearch
                  className="absolute inset-y-0 left-3 my-auto text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search Influencers, campaigns..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef2f5b] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Right: Brand, Wallet & Profile */}
          <div className="flex items-center space-x-6">
            {/* Brand Name */}
            {loading ? (
              <span className="text-gray-500 text-sm">Loading…</span>
            ) : error ? (
              <span className="text-red-500 text-sm">{error}</span>
            ) : (
              <span className="text-gray-800 font-medium text-sm">
                {brandName}
              </span>
            )}

            {/* Wallet */}
            {!loading && !error && (
              <button
                className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm focus:outline-none"
                title="View wallet balance"
              >
                <HiCreditCard
                  className="text-gray-600"
                  size={20}
                />
                <span className="font-medium text-gray-800">
                  $ {walletBalance?.toFixed(2)}
                </span>
              </button>
            )}

            {/* Profile Menu */}
            <div className="relative">
              <button className="flex items-center space-x-1 focus:outline-none">
                <HiUserCircle
                  className="text-gray-600"
                  size={24}
                />
                <HiChevronDown
                  className="text-gray-600"
                  size={16}
                />
              </button>
              {/* Optional dropdown here */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
