"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [email, setEmail] = useState<string>("");
  const [subscriptionName, setSubscriptionName] = useState<string>("");
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        // API returns full brand object including subscription details
        const data = await get<{
          name: string;
          email: string;
          walletBalance: number;
          subscription: {
            planName: string;
            expiresAt: string;
            features: { key: string; limit: number; used: number }[];
          };
        }>(`/brand?id=${brandId}`);

        setBrandName(data.name);
        setEmail(data.email);
        setWalletBalance(data.walletBalance);
        setSubscriptionName(data.subscription.planName);
        setSubscriptionExpiresAt(data.subscription.expiresAt);
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

  const formattedExpiry = subscriptionExpiresAt
    ? new Date(subscriptionExpiresAt).toLocaleDateString()
    : "";

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
                  ${walletBalance?.toFixed(2)}
                </span>
              </button>
            )}

            {loading ? (
              <span className="text-gray-500 text-sm">Loading…</span>
            ) : error ? (
              <span className="text-red-500 text-sm">{error}</span>
            ) : (
              <span className="text-gray-800 font-medium text-sm">
                {brandName}
              </span>
            )}

            {/* Profile Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center space-x-1 focus:outline-none cursor-pointer p-2 rounded-md hover:bg-gray-100"
              >
                <HiUserCircle
                  className="text-gray-600"
                  size={24}
                />
                <HiChevronDown
                  className="text-gray-600"
                  size={16}
                />
              </button>

              {menuOpen && !loading && !error && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">
                      {brandName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {email}
                    </p>
                  </div>
                  <ul className="py-1">
                    <li className="px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                      Plan: {subscriptionName.charAt(0).toUpperCase() + subscriptionName.slice(1)}
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                      Expires: {formattedExpiry}
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                      <a href="/brand/profile">View Profile</a>
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                      <a href="/brand/billing">Billing &amp; Payment</a>
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 text-sm text-red-600">
                      <button onClick={() => {/* implement logout */}}>
                        Sign Out
                      </button>
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
