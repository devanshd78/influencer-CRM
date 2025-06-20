"use client";

import React, { useState, useEffect } from "react";
import { HiSearch, HiUserCircle, HiChevronDown, HiMenu } from "react-icons/hi";
import { get } from "@/lib/api";

interface InfluencerTopbarProps {
  onSidebarOpen: () => void;
}

export default function InfluencerTopbar({ onSidebarOpen }: InfluencerTopbarProps) {
  const [influencerName, setInfluencerName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const influencerId =
      typeof window !== "undefined"
        ? localStorage.getItem("influencerId")
        : null;

    if (!influencerId) {
      setError("No influencerId found in localStorage");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const data = await get<{ name: string }>(`/influencer/getbyid?id=${influencerId}`);
        if (data.name) {
          setInfluencerName(data.name);
        } else {
          setError("Influencer name not found in response");
        }
      } catch (err: any) {
        console.error("Error fetching influencer data:", err);
        setError(err.message || "Failed to fetch influencer info");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Mobile Menu + Search */}
          <div className="flex items-center">
            <button
              onClick={onSidebarOpen}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <HiMenu size={24} className="text-gray-600" />
            </button>

            <div className="ml-2 w-full max-w-sm">
              <div className="relative">
                <HiSearch className="absolute inset-y-0 left-3 my-auto text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search campaigns, Brands..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Right Section: Fetched Influencer Name & Profile */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <span className="text-gray-500 text-sm">Loading...</span>
            ) : error ? (
              <span className="text-red-500 text-sm">{error}</span>
            ) : (
              <span className="text-gray-800 font-medium text-sm">{influencerName}</span>
            )}

            <div className="relative">
              <button className="flex items-center space-x-1 focus:outline-none">
                <HiUserCircle className="text-gray-600" size={24} />
                <HiChevronDown className="text-gray-600" size={16} />
              </button>
              {/*
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</button>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Logout</button>
              </div>
              */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}