"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineChartBar, HiOutlineUsers, HiOutlineCurrencyDollar } from "react-icons/hi";
import { format } from "date-fns";
import { post } from "@/lib/api";

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

  useEffect(() => {
    const brandId = localStorage.getItem("brandId");
    if (!brandId) {
      setError("No brandId found in localStorage");
      return;
    }

    (async () => {
      try {
        const json = await post<DashboardData>("/dash/brand", { brandId });
        // if no active campaigns, send them to create flow
        if (json.totalActiveCampaigns === 0) {
          router.push("/brand/create-campaign");
          return;
        }
        setData(json);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(
          err.response?.data?.error ||
          err.message ||
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

  const { brandName, totalActiveCampaigns, totalInfluencers, budgetRemaining } = data;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="flex-1 px-6 py-8">
          {/* Welcome Banner */}
          <div className="rounded-lg bg-white p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#ef2f5b] mb-2">
              Welcome Back, {brandName}!
            </h2>
            <p className="text-gray-700">
              Here’s a quick overview of your account as of {today}. Click any card to view details.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Active Campaigns */}
            <div
              className="bg-white rounded-lg shadow p-5 flex items-center space-x-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push("/brand/dashboard/previous")}
            >
              <div className="p-3 bg-[#ef2f5b]/20 rounded-full">
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
              <div className="p-3 bg-[#4f46e5]/20 rounded-full">
                <HiOutlineUsers className="text-[#4f46e5]" size={32} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">
                  {totalInfluencers.toLocaleString()}
                </p>
                <p className="text-gray-600">Total Influencers</p>
              </div>
            </div>

            {/* Budget Remaining */}
            <div
              className="bg-white rounded-lg shadow p-5 flex items-center space-x-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push("/brand/dashboard/settings")}
            >
              <div className="p-3 bg-[#10b981]/20 rounded-full">
                <HiOutlineCurrencyDollar className="text-[#10b981]" size={32} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">
                  ${budgetRemaining.toLocaleString()}
                </p>
                <p className="text-gray-600">Budget Remaining</p>
              </div>
            </div>
          </div>

          {/* Recent Activity / Placeholder */}
          <section className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Activity
            </h3>
            <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
              {/* Example activity row */}
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">
                    Created a new campaign: “Back to School 2025”
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Mar 1, 2025</p>
                </div>
                <button
                  onClick={() => {
                    window.location.href = "/brand/dashboard/previous";
                  }}
                  className="text-[#ef2f5b] hover:underline text-sm font-medium"
                >
                  View
                </button>
              </div>
              {/* More rows can go here… */}
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">
                    Influencer “TechWithTom” accepted your collaboration
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Feb 25, 2025</p>
                </div>
                <button
                  onClick={() => {
                    window.location.href = "/brand/dashboard/browse";
                  }}
                  className="text-[#ef2f5b] hover:underline text-sm font-medium"
                >
                  View
                </button>
              </div>
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">
                    Campaign “Holiday Promo 2024” marked as Completed
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Nov 20, 2024</p>
                </div>
                <button
                  onClick={() => {
                    window.location.href = "/brand/dashboard/previous";
                  }}
                  className="text-[#ef2f5b] hover:underline text-sm font-medium"
                >
                  View
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
