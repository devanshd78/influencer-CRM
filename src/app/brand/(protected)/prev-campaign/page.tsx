"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  HiSearch,
  HiOutlineEye,
  HiChevronLeft,
  HiChevronRight,
  HiChevronDown,
  HiChevronUp,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { get } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Campaign {
  id: string;
  productOrServiceName: string;
  description: string;
  timeline: {
    startDate: string;
    endDate: string;
  };
  isActive: number;
  budget: number;
  applicantCount: number;
}

export default function BrandActiveCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState<Record<string, number>>({});

  const itemsPerPage = 10;

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const brandId =
        typeof window !== "undefined"
          ? localStorage.getItem("brandId")
          : null;
      if (!brandId) throw new Error("No brandId found in localStorage.");
      const data = await get<Campaign[]>("/campaign/previous", { brandId });
      const normalized = data.map((c: any) => ({
        id: c.campaignsId,
        productOrServiceName: c.productOrServiceName,
        description: c.description,
        timeline: c.timeline,
        isActive: c.isActive,
        budget: c.budget,
        applicantCount: c.applicantCount || 0,
      }));
      setCampaigns(normalized);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || "Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const toggleExpand = async (campaign: Campaign) => {
    const id = campaign.id;
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
      setExpandedIds(newSet);
    } else {
      newSet.add(id);
      setExpandedIds(newSet);
      if (!(id in counts)) {
        try {
          const res = await get<{ count: number }>(
            "/campaign/influencers",
            { campaignId: id }
          );
          setCounts((prev) => ({ ...prev, [id]: res.count }));
        } catch {
          setCounts((prev) => ({ ...prev, [id]: 0 }));
        }
      }
    }
  };

  const filtered = campaigns.filter((c) => {
    const term = search.trim().toLowerCase();
    return (
      c.productOrServiceName.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / itemsPerPage)
  );
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));

  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amt);

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Previous Campaigns</h1>
      </div>

      <div className="mb-6 max-w-md">
        <div className="relative">
          <HiSearch
            className="absolute inset-y-0 left-3 my-auto text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : paginated.length === 0 ? (
        <p className="text-gray-700">No campaigns found.</p>
      ) : (
        <TableView
          data={paginated}
          expandedIds={expandedIds}
          counts={counts}
          onToggle={toggleExpand}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
      />
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg animate-pulse">
      <div className="p-6">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );
}

  const TABLE_GRADIENT_FROM = "#FFA135";
  const TABLE_GRADIENT_TO = "#FF7236";


function TableView({
  data,
  formatDate,
  formatCurrency,
}: any) {
  return (
    // Gradient border wrapper
    <div
      className="p-[1.5px] rounded-lg bg-gradient-to-r shadow"
    >
      {/* Inner table container */}
      <div className="overflow-x-auto bg-white rounded-[0.5rem]">
        <table className="w-full text-sm text-gray-600">
          <thead
            className="text-left text-white"
            style={{
              backgroundImage: `linear-gradient(to right, ${TABLE_GRADIENT_FROM}, ${TABLE_GRADIENT_TO})`,
            }}
          >
            <tr>
              {[
                "Campaign",
                "Budget",
                "Status",
                "Timeline",
                "Influencers Applied",
                "Actions",
              ].map((h: string, i: number) => (
                <th
                  key={i}
                  className="px-6 py-3 font-medium whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((c: Campaign, idx: number) => (
              <React.Fragment key={c.id}>
                <tr
                  className={`
                    ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    group
                    transition-colors
                    hover:bg-transparent
                  `}
                  // gradient hover overlay
                  style={{
                    backgroundImage:
                      "var(--row-hover-gradient)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget.style.backgroundImage = `linear-gradient(to right, ${TABLE_GRADIENT_FROM}11, ${TABLE_GRADIENT_TO}11)`);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundImage = "";
                  }}
                >
                  <td className="px-6 py-4 align-top">
                    <div className="font-medium text-gray-900">
                      {c.productOrServiceName}
                    </div>
                    <div className="text-gray-600 line-clamp-1">
                      {c.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-top">
                    {formatCurrency(c.budget)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-top">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        c.isActive === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {c.isActive === 1 ? "Active" : "Completed"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-top">
                    {formatDate(c.timeline.startDate)} –{" "}
                    {formatDate(c.timeline.endDate)}
                  </td>
                  <td className="px-6 py-4 text-center align-top">
                    {c.applicantCount ?? "0"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-top">
                    <div className="flex items-center space-x-2">
                      {/* View Campaign Details */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={`/brand/prev-campaign/view-campaign?id=${c.id}`}
                            className="p-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 focus:outline-none"
                          >
                            <HiOutlineEye size={18} />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>View Campaign</TooltipContent>
                      </Tooltip>

                      {/* View Applied Influencers */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={`/brand/prev-campaign/applied-inf?id=${c.id}&name=${encodeURIComponent(c.productOrServiceName)}`}
                            className="relative flex items-center p-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 focus:outline-none"
                          >
                            <HiOutlineUserGroup size={18} />
                            {c.applicantCount > 0 && (
                              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-white bg-[#ef2f5b] rounded-full">
                                {c.applicantCount}
                              </span>
                            )}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>View Influencers</TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function Pagination({ currentPage, totalPages, onPrev, onNext }: any) {
  return (
    <div className="flex justify-end items-center p-4 space-x-2">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"
      >
        <HiChevronLeft size={20} />
      </button>
      <span className="text-gray-700">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"
      >
        <HiChevronRight size={20} />
      </button>
    </div>
  );
}
