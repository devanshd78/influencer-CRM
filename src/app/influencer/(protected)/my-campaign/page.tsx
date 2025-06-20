"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  HiOutlineEye,
  HiOutlineUser,
  HiChevronLeft,
  HiChevronRight,
  HiX,
} from "react-icons/hi";
import api, { post } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { set } from "date-fns";

interface Campaign {
  id: string;
  brandId: string;
  brandName: string;
  productOrServiceName: string;
  description: string;
  timeline: { startDate: string; endDate: string };
  isActive: number;
  budget: number;
  isApproved: number;
  isContracted: number;
  contractId: string;
  isAccepted: number;
}

interface CampaignsResponse {
  meta: { total: number; page: number; limit: number; totalPages: number };
  campaigns: any[];
}

export default function MyCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [hasAccepted, setHasAccepted] = useState(false);
  const [contractId, setContractId] = useState<string>("");
  const [isAccepted, setIsAccepted] = useState(0);

  const itemsPerPage = 10;

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const influencerId = typeof window !== "undefined"
        ? localStorage.getItem("influencerId")
        : null;
      if (!influencerId) throw new Error("No influencer ID found.");

      const payload = {
        influencerId,
        search: search.trim(),
        page: currentPage,
        limit: itemsPerPage,
      };
      const data = await post<CampaignsResponse>("/campaign/myCampaign", payload);
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
        isContracted: c.isContracted,
        contractId: c.contractId,
        isAccepted: c.isAccepted,
      }));
      setCampaigns(normalized);
      setTotalPages(data.meta.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  }, [search, currentPage]);

  const handleAcceptContract = async () => {
    if (!contractId) return;
    try {
      await post("/contract/accept", {
        contractId
      });
      Swal.fire("Accepted!", "You have accepted the contract.", "success");
      setShowPdfModal(false);
      setHasAccepted(false);
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to accept contract.", "error");
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
      .format(new Date(dateStr));
  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amt);

  const handleViewContract = async (c: Campaign) => {
    try {
      const influencerId = typeof window !== "undefined"
        ? localStorage.getItem("influencerId")
        : null;
      if (!influencerId) throw new Error("No influencer ID.");

      // Use axios instance to request a blob
      const response = await api.post(
        "/contract/view",
        { contractId: c.contractId },
        { responseType: "blob" }
      );

      // Create URL and show modal
      const url = URL.createObjectURL(response.data);
      setPdfUrl(url);
      setShowPdfModal(true);
      setContractId(c.contractId);
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to load contract PDF.", "error");
      setContractId("");
    }
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">My Campaigns</h1>
      </div>

      {loading ? (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          {/* your skeleton */}
        </div>
      ) : error ? (
        <p className="text-red-600 text-center py-6">{error}</p>
      ) : campaigns.length === 0 ? (
        <p className="text-gray-700 text-center py-6">No campaigns found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="w-full text-sm text-gray-600">
            <thead className="bg-gray-100">
              <tr>
                {["Campaign", "Brand", "Budget", "Status", "Timeline", "Approval", "Actions"].map((h, i) => (
                  <th key={i} className="px-6 py-3 font-medium whitespace-nowrap text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, idx) => (
                <tr key={c.id}
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{c.productOrServiceName}</div>
                    <div className="text-gray-600 line-clamp-1">{c.description}</div>
                  </td>
                  <td className="px-6 py-4 text-center">{c.brandName}</td>
                  <td className="px-6 py-4">{formatCurrency(c.budget)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${c.isActive === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                      {c.isActive === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {formatDate(c.timeline.startDate)} - {formatDate(c.timeline.endDate)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Approved
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-center space-x-2 whitespace-nowrap">
                    {c.isContracted === 1 && (
                      <Button variant="outline" className="bg-indigo-600 text-white" onClick={() => { handleViewContract(c); setIsAccepted(c.isAccepted) }}>
                        View Contract
                      </Button>
                    )}
                    <Link href={`/influencer/my-campaign/view-brand?id=${c.brandId}`}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100"
                    >
                      <HiOutlineUser size={18} />
                    </Link>
                    <Link href={`/influencer/my-campaign/view-campaign?id=${c.id}`}
                      className="p-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200"
                    >
                      <HiOutlineEye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* pagination */}
          <div className="flex justify-end items-center p-4 space-x-2">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"
            ><HiChevronLeft size={20} /></button>
            <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"
            ><HiChevronRight size={20} /></button>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg w-11/12 max-w-4xl h-[80vh] overflow-hidden flex flex-col">
            {/* Close button */}
            <button
              onClick={() => {
                URL.revokeObjectURL(pdfUrl);
                setShowPdfModal(false);
                setHasAccepted(false);
              }}
              className="absolute top-2 right-2 p-2 text-gray-600 hover:text-gray-900"
            >
              <HiX size={24} />
            </button>

            {/* PDF viewer */}
            <iframe
              src={pdfUrl}
              className="w-full flex-grow"
              title="Contract PDF"
            />

            {/* Accept UI */}
            <div className="p-4 border-t flex items-center justify-between">
              {isAccepted === 1 ? (
                <span className="text-green-600 font-semibold">You have accepted this contract.</span>
              ) : (
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hasAccepted}
                    onChange={e => setHasAccepted(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">I Accept</span>
                </label>
              )}

              {/* button group on the right */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowPdfModal(false)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Cancel
                </Button>

                {isAccepted === 0 && (
                  <Button
                    onClick={handleAcceptContract}
                    disabled={!hasAccepted}
                    className={
                      hasAccepted
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }
                  >
                    Accept Contract
                  </Button>
                )}
              </div>
            </div>


          </div>
        </div>
      )}
    </div>
  );
}
