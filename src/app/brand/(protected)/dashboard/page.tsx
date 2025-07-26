// components/BrandDashboardHome.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineCurrencyDollar,
  HiSearch,
  HiX,
  HiOutlineSearch,
} from "react-icons/hi";
import { format } from "date-fns";
import { post } from "@/lib/api";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Input } from "@headlessui/react";

interface DashboardData {
  brandName: string;
  totalActiveCampaigns: number;
  totalInfluencers: number;
  budgetRemaining: number;
}

export default function BrandDashboardHome() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const today = format(new Date(), "MMMM d, yyyy");

  // --- Search state ---
  const [searchOpen, setSearchOpen] = useState(false); // mobile only
  const [searchQuery, setSearchQuery] = useState("");
  const searchFormRef = useRef<HTMLFormElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Focus the input whenever we open the mobile sheet
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      // small delay to ensure element is mounted
      const id = requestAnimationFrame(() => searchInputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [searchOpen]);

  // Close search if user clicks outside (mobile view)
  useEffect(() => {
    if (!searchOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!searchFormRef.current) return;
      if (!searchFormRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [searchOpen]);

  // ESC key closes mobile search
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [searchOpen]);

  // Submit handler -> navigate to results page
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const q = searchQuery.trim();
      if (!q) return;
      // Adjust destination route as needed. Using /brand/search for now.
      router.push(`/brand/search?query=${encodeURIComponent(q)}`);
      setSearchOpen(false);
    },
    [router, searchQuery]
  );

  // Load dashboard data ------------------------------------------------------
  useEffect(() => {
    const brandId = typeof window !== "undefined" ? localStorage.getItem("brandId") : null;
    if (!brandId) {
      setError("No brandId found in localStorage");
      return;
    }
    (async () => {
      try {
        const json = await post<DashboardData>("/dash/brand", { brandId });
        setData(json);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(
          err?.response?.data?.error ||
          err?.message ||
          "Could not load dashboard data"
        );
      }
    })();
  }, [router]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading dashboard…</p>
      </div>
    );
  }

  const {
    brandName,
    totalActiveCampaigns,
    totalInfluencers,
    budgetRemaining,
  } = data;

  const accentFrom = "#FFA135";
  const accentTo = "#FF7236";

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="flex-1 px-6 py-8">
          {/* Mobile search trigger */}
          {/* Mobile open trigger */}
          <button
            type="button"
            aria-label="Open search"
            className="md:hidden mb-2 inline-flex items-center justify-center text-gray-600"
            onClick={() => setSearchOpen(true)}
          >
            <HiSearch size={20} />
          </button>

          {/* Search wrapper (responsive) */}
          {/* Search + Zero-Campaign CTA Row */}
          <div
            className="
    w-full
    flex flex-col md:flex-row
    md:items-center md:gap-6
  "
          >

            {/* Zero campaigns CTA (shows only when count === 0) */}
            {data.totalActiveCampaigns === 0 && (
              <div className="w-full md:flex-1 flex items-center py-8 px-4 md:py-0 md:px-0">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push('/brand/create-campaign')}
                  onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') && router.push('/login')
                  }
                  className="
          group
          flex flex-col sm:flex-row
          items-center justify-center
          text-center
          gap-4
          w-full max-w-xl
          p-6
          rounded-2xl
          shadow-md
          transform transition-all
          bg-gradient-to-r from-[#FF8C00] via-[#FF5E7E] to-[#D12E53]
          hover:scale-105 hover:shadow-lg
          cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C00]
        "
                >
                  <PlayCircle className="h-8 w-8 text-white group-hover:animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-white font-bold text-lg">Create New Campaign</p>
                    <p className="text-white/90 text-sm">
                      Find perfect Influencer for your brand
                    </p>
                  </div>
                  <ArrowRight
                    className="
            h-5 w-5 text-white
            transform transition-transform group-hover:translate-x-1
          "
                  />
                </div>
              </div>
            )}

            {/* Search Wrapper */}
            <div
              className={[
                "w-full md:w-1/3",
                searchOpen
                  ? "fixed inset-x-0 top-0 z-50 px-4 md:static md:px-0"
                  : "hidden md:block",
              ].join(" ")}
            >
              <form
                ref={searchFormRef}
                onSubmit={handleSearchSubmit}
                className="relative"
              >
                {/* Gradient border wrapper */}
                <div className="relative w-full max-w-3xl bg-white rounded-full">
                  <Input
                    placeholder="Search for influencer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="
        w-full
        pl-6 pr-20
        h-16
        text-lg
        placeholder:text-lg
        placeholder:text-gray-400
        rounded-full
        border border-orange-300
        border-3
        focus:outline-none focus:ring-2 focus:ring-orange-400
      "
                  />
                  <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                    <span className="bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white p-3 rounded-full shadow">
                      <HiOutlineSearch className="w-6 h-6" />
                    </span>
                  </div>
                </div>
                {/* Mobile close button (absolute, outside gradient border) */}
                {searchOpen && (
                  <button
                    type="button"
                    aria-label="Close search"
                    onClick={() => setSearchOpen(false)}
                    className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow md:hidden"
                  >
                    <HiX size={16} className="text-gray-600" />
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Mobile backdrop (kept outside row so it overlays card too) */}
          {searchOpen && (
            <div
              aria-hidden="true"
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setSearchOpen(false)}
            />
          )}


          {/* Backdrop for mobile search */}
          {searchOpen && (
            <div
              aria-hidden="true"
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setSearchOpen(false)}
            />
          )}


          {/* Welcome Banner */}
          <div className="rounded-lg bg-white p-6 mb-8 mt-4 md:mt-6">
            <h2
              className="text-xl font-semibold mb-2"
              style={{
                background: `linear-gradient(to right, ${accentFrom}, ${accentTo})`,
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Welcome Back, {brandName}!
            </h2>
            <p className="text-gray-700">
              Here’s a quick overview of your account as of {today}.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Active Campaigns */}
            <div
              className="bg-white rounded-lg shadow p-5 flex items-center space-x-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push("/brand/active-campaign")}
            >
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: `${accentFrom}20` }}
              >
                <HiOutlineChartBar className="text-[#ef2f5b]" size={32} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">
                  {totalActiveCampaigns}
                </p>
                <p className="text-gray-600">Active Campaigns</p>
              </div>
            </div>

            {/* Total Influencers */}
            <div
              className="bg-white rounded-lg shadow p-5 flex items-center space-x-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push("/brand/browse-influencers")}
            >
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: `${accentFrom}20` }}
              >
                <HiOutlineUsers className="text-[#4f46e5]" size={32} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">
                  {totalInfluencers.toLocaleString()}
                </p>
                <p className="text-gray-600">Hired Influencers</p>
              </div>
            </div>

            {/* Budget Remaining */}
            <div
              className="bg-white rounded-lg shadow p-5 flex items-center space-x-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push("/brand/dashboard/settings")}
            >
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: `${accentFrom}20` }}
              >
                <HiOutlineCurrencyDollar
                  className="text-[#10b981]"
                  size={32}
                />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">
                  ${""}{budgetRemaining.toLocaleString()}
                </p>
                <p className="text-gray-600">Budget Remaining</p>
              </div>
            </div>
          </div>


          {/* Recent Activity */}
          {
            data.totalActiveCampaigns > 0 && (
              <section className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Recent Campaign
                </h3>
                <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
                  {[
                    {
                      title: 'Created a new campaign: “Back to School 2025”',
                      date: "Mar 1, 2025",
                      href: "/brand/prev-campaign",
                    },
                    {
                      title: 'Influencer “TechWithTom” accepted your collaboration',
                      date: "Feb 25, 2025",
                      href: "/brand/browse-influencers",
                    },
                    {
                      title: 'Campaign “Holiday Promo 2024” marked as Completed',
                      date: "Nov 20, 2024",
                      href: "/brand/prev-campaign",
                    },
                  ].map((act, idx) => (
                    <div
                      key={idx}
                      className="px-6 py-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-700">{act.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{act.date}</p>
                      </div>
                      <button
                        onClick={() => router.push(act.href)}
                        className="text-sm font-medium hover:underline"
                        style={{
                          background: `linear-gradient(to right, ${accentFrom}, ${accentTo})`,
                          WebkitBackgroundClip: "text",
                          color: "transparent",
                        }}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
        </main>
      </div>
    </div>
  );
}
