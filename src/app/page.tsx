// src/pages/index.tsx
import Topbar from "@/components/common/topbar";
import { FiSearch } from "react-icons/fi";
import React from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col b-purple-50">
      {/* ─── Topbar / Navigation ───────────────────────────────────────────── */}
      <Topbar />

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="bg-white flex-grow">
        <div className="max-w-7xl mx-auto px-4 mt-16 py-24 flex flex-col items-center text-center">
          {/* ─── Gradient Heading (inline colors) ─────────────────────────── */}
          <h1
            className="
              text-5xl sm:text-6xl lg:text-7xl font-extrabold
              bg-clip-text text-transparent
              bg-gradient-to-r from-[#ef2f5b] to-[#ff6b8a]
            "
          >
            ShareMitra
          </h1>

          {/* ─── Short Tagline / Subtitle ─────────────────────────────────── */}
          <p className="mt-4 text-xl md:text-2xl text-gray-600 max-w-2xl">
            Empower your community, share your favorite deals, and earn rewards.
          </p>

          {/* ─── Search Bar with Icon ─────────────────────────────────────── */}
          <div className="relative mt-8 w-full sm:w-3/4 md:w-2/3 lg:w-1/2">
            <input
              type="text"
              placeholder="Search tasks, offers, or influencers..."
              className="
                w-full border border-gray-300 rounded-full
                py-3 px-6 pr-12
                focus:outline-none focus:ring-2 focus:ring-[#ef2f5b] focus:border-[#ef2f5b]
              "
            />
            <button
              type="button"
              className="
                absolute right-3 top-1/2 transform -translate-y-1/2
                text-[#ef2f5b] hover:text-[#dd1f4b]
              "
            >
              <FiSearch className="w-5 h-5" />
            </button>
          </div>

          {/* ─── Sign Up Button (inline colors) ───────────────────────────── */}
          <div className="mt-8">
            <button
              className="
                inline-flex items-center justify-center
                bg-[#ef2f5b] hover:bg-[#dd1f4b]
                text-white font-semibold rounded-full
                py-3 px-8 transition
              "
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* ─── Three Cards Section ─────────────────────────────────────────── */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Earn Rewards
              </h3>
              <p className="text-gray-600">
                Complete simple tasks and watch your wallet grow.
              </p>
              <button className="mt-4 inline-flex items-center text-[#ef2f5b] hover:text-[#dd1f4b] font-medium">
                Get Started →
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Share with Friends
              </h3>
              <p className="text-gray-600">
                Spread the word and unlock exclusive bonuses.
              </p>
              <button className="mt-4 inline-flex items-center text-[#ef2f5b] hover:text-[#dd1f4b] font-medium">
                Learn More →
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Track Your Progress
              </h3>
              <p className="text-gray-600">
                Monitor your tasks, earnings, and referrals in one place.
              </p>
              <button className="mt-4 inline-flex items-center text-[#ef2f5b] hover:text-[#dd1f4b] font-medium">
                View Dashboard →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
