"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { post } from "@/lib/api";
import { motion } from "framer-motion";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface MilestoneEntry {
  milestoneHistoryId: string;
  influencerId: string;
  campaignId: string;
  milestoneTitle: string;
  amount: number;
  milestoneDescription?: string;
  dueDate?: string;
  status?: string;
}

interface MilestoneHistoryCardProps {
  influencerId?: string | null;
  campaignId?: string | null;
  className?: string;
}

const formatDate = (dateStr?: string) =>
  (dateStr ? new Date(dateStr) : new Date()).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const formatCurrency = (amt: number) =>
  amt.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

// ─── Skeleton Loader ───────────────────────────────────────────────────────────
const TimelineSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="relative">
    <span className="absolute left-5 top-6 bottom-0 w-[2px] bg-gradient-to-b from-[#FFB64C]/50 to-[#FF7236]/50" aria-hidden />
    <ol className="pl-16 space-y-8">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="relative flex gap-4 items-start">
          <span className="w-4 h-4 rounded-full bg-gradient-to-r from-[#FFA135]/30 to-[#FF7236]/30 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-44 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </li>
      ))}
    </ol>
  </div>
);

// ─── Card ──────────────────────────────────────────────────────────────────────
const MilestoneHistoryCard: React.FC<MilestoneHistoryCardProps> = ({
  influencerId = null,
  campaignId = null,
  className = "",
}) => {
  const [brandId, setBrandId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<MilestoneEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Grab brandId once from localStorage - runs only on mount
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("brandId") : null;
    if (stored) setBrandId(stored);
  }, []);

  const fetchMilestones = async () => {
    if (!brandId) return;
    setLoading(true);
    setError(null);

    let endpoint = "/milestone/byBrand";
    const body: Record<string, any> = { brandId };

    if (influencerId && campaignId) {
      endpoint = "/milestone/getMilestome";
      body.influencerId = influencerId;
      body.campaignId = campaignId;
    } else if (influencerId) {
      endpoint = "/milestone/byInfluencer";
      body.influencerId = influencerId;
    } else if (campaignId) {
      endpoint = "/milestone/byCampaign";
      body.campaignId = campaignId;
    }

    try {
      const data = await post<{ milestones: MilestoneEntry[] }>(endpoint, body);
      setMilestones(data.milestones || []);
    } catch (err: any) {
      setError(err.message || "Failed to load milestones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId, influencerId, campaignId]);

  return (
    <div
      className={`relative p-6 bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#FFA135] to-[#FF7236] shadow-md">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L9 13.414l4.707-4.707z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FFA135] to-[#FF7236]">
          Milestone Timeline
        </h3>
      </div>

      {/* Validation Errors ---------------------------------------------------- */}
      {!brandId && (
        <p className="text-red-600 font-medium">
          No <code>brandId</code> found in localStorage.
        </p>
      )}

      {/* Loading -------------------------------------------------------------- */}
      {brandId && loading && <TimelineSkeleton rows={3} />}

      {/* Error ---------------------------------------------------------------- */}
      {brandId && !loading && error && (
        <div className="space-y-3">
          <p className="text-red-600 font-medium">{error}</p>
          <Button size="sm" variant="outline" className="border-red-400 text-red-600 hover:bg-red-50" onClick={fetchMilestones}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty ---------------------------------------------------------------- */}
      {brandId && !loading && !error && milestones.length === 0 && (
        <div className="space-y-3">
          <p className="text-gray-600 italic">No milestones found.</p>
          <Button size="sm" variant="outline" onClick={fetchMilestones}>
            Refresh
          </Button>
        </div>
      )}

      {/* Populated ------------------------------------------------------------ */}
      {brandId && !loading && !error && milestones.length > 0 && (
        <div className="relative">
          <span className="absolute left-5 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#FFA135] to-[#FF7236]" aria-hidden />
          <ol className="pl-16 space-y-8">
            {milestones.map((m, idx) => (
              <motion.li
                key={m.milestoneHistoryId}
                className="relative flex gap-4 items-start group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
              >
                {/* Marker */}
                <span className="w-5 h-5 mt-1 rounded-full bg-gradient-to-r from-[#FFA135] to-[#FF7236] shadow-md group-hover:scale-110 transition-transform duration-300" />

                <div className="flex-1 space-y-1 bg-gradient-to-r from-[#FFA135]/15 to-[#FF7236]/15 backdrop-blur-md p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-semibold text-gray-900 group-hover:text-[#FF7236] transition-colors">
                      {m.milestoneTitle}
                    </h4>
                    <span className="text-base font-bold text-gray-800">
                      {formatCurrency(m.amount)}
                    </span>
                  </div>
                  <time className="block text-xs text-gray-500 italic">
                    {formatDate(m.dueDate)}
                  </time>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {m.milestoneDescription || "–"}
                  </p>
                  <span className="inline-block px-3 py-0.5 mt-2 text-xs font-semibold rounded-full bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white">
                    {(m.status || "Paid").toUpperCase()}
                  </span>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default MilestoneHistoryCard;
