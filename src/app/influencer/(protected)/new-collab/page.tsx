"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  HiSearch,
  HiOutlineEye,
  HiOutlineUser,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import { post } from "@/lib/api";

interface Campaign {
  id: string;
  brandId: string;
  brandName: string;
  productOrServiceName: string;
  description: string;
  timeline: {
    startDate: string;
    endDate: string;
  };
  isActive: number;
  budget: number;
  isApproved: number;
}

interface CampaignsResponse {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  campaigns: Campaign[];
}

export default function MyCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 10;

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const influencerId =
        typeof window !== "undefined"
          ? localStorage.getItem("influencerId")
          : null;
      if (!influencerId) throw new Error("No influencer ID found.");

      const payload = {
        influencerId,
        search: search.trim(),
        page: currentPage,
        limit: itemsPerPage,
      };

      // Adjust endpoint path if yours differs
      const data = await post<CampaignsResponse>(
        "/campaign/byInfluencer",
        payload
      );

      // normalize the shape
      const normalized = data.campaigns.map((c: any) => ({
        id: c.campaignsId,
        brandId: c.brandId,
        brandName: c.brandName,
        productOrServiceName: c.productOrServiceName,
        description: c.description,
        timeline: c.timeline,
        isActive: c.isActive,
        budget: c.budget,
        isApproved: c.isApproved,
      }));

      setCampaigns(normalized);
      setTotalPages(data.meta.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  }, [search, currentPage]);

  // re-fetch on search or page change
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Top Featured Campaigns for You</h1>
      </div>

      {/* <div className="mb-6 max-w-md">
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
      </div> */}

      {loading ? (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          {/* …same skeleton table as before… */}
        </div>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : campaigns.length === 0 ? (
        <p className="text-gray-700">No campaigns found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="w-full text-sm text-gray-600">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "Campaign",
                  "Brand",
                  "Budget",
                  "Status",
                  "Timeline",
                  "Approval",
                  "Actions",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="px-6 py-3 text-left font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, idx) => (
                <tr
                  key={c.id}
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition-colors`}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {c.productOrServiceName}
                    </div>
                    <div className="text-gray-600 line-clamp-1">
                      {c.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-800 whitespace-nowrap text-center">
                    {c.brandName}
                  </td>
                  <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
                    {formatCurrency(c.budget)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${c.isActive === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {c.isActive === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
                    {formatDate(c.timeline.startDate)} -{" "}
                    {formatDate(c.timeline.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${c.isApproved === 0
                          ? "bg-red-100 text-gray-800"       // Not Applied
                          : c.isApproved === 1
                            ? "bg-yellow-100 text-yellow-800"   // Pending
                            : "bg-blue-100 text-blue-800"     // Approved
                        }`}
                    >
                      {c.isApproved === 0
                        ? "Not Applied"
                        : c.isApproved === 1
                          ? "Pending"
                          : "Approved"}
                    </span>
                  </td>

                  <td className="px-6 py-4 flex justify-center space-x-2 whitespace-nowrap">
                    <Link
                      href={`/influencer/new-collab/view-brand?id=${c.brandId}`}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 focus:outline-none"
                    >
                      <HiOutlineUser size={18} />
                    </Link>
                    <Link
                      href={`/influencer/new-collab/view-campaign?id=${c.id}`}
                      className="p-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 focus:outline-none"
                    >
                      <HiOutlineEye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-end items-center p-4 space-x-2">
            <button
              onClick={() =>
                setCurrentPage((p) => Math.max(p - 1, 1))
              }
              disabled={currentPage === 1}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"
            >
              <HiChevronLeft size={20} />
            </button>
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"
            >
              <HiChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
