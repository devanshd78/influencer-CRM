"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { get } from "@/lib/api";
import {
  HiOutlineRefresh,
  HiCheckCircle,
  HiXCircle,
  HiOutlineEye,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface Campaign {
  campaignsId: string;
  brandName?: string;
  productOrServiceName: string;
  description: string;
  timeline: { startDate: string; endDate: string };
  budget: number;
  isActive: number;
  interestName?: string;
  goal?: string;
  applicantCount?: number;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await get<Campaign[]>("/campaign/getall");
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return campaigns
      .filter(c => (showActiveOnly ? c.isActive === 1 : true))
      .filter(c =>
        c.productOrServiceName.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        (c.brandName || "").toLowerCase().includes(search.toLowerCase())
      );
  }, [campaigns, showActiveOnly, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-semibold">All Campaigns (Admin)</h1>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="max-w-sm"
          />
          <Button onClick={fetchAll} variant="default" size="sm">
            <HiOutlineRefresh className="mr-2 h-4 w-4" /> Reload
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id="active-only"
          checked={showActiveOnly}
          onCheckedChange={checked => { setShowActiveOnly(!!checked); setCurrentPage(1); }}
        />
        <label htmlFor="active-only" className="text-gray-700">
          Show Active Only
        </label>
      </div>

      {loading ? (
        <Card className="text-center py-20 text-gray-500">
          Loading campaigns…
        </Card>
      ) : error ? (
        <Card className="text-center py-20 text-red-600">
          {error}
        </Card>
      ) : paginated.length === 0 ? (
        <Card className="text-center py-20 text-gray-600">
          No campaigns {showActiveOnly ? 'active' : 'found'}.
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(c => (
                <TableRow key={c.campaignsId}>
                  <TableCell>{c.campaignsId}</TableCell>
                  <TableCell>{c.brandName || '—'}</TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {c.productOrServiceName}
                    </div>
                    <div className="text-gray-600 line-clamp-1">
                      {c.description}
                    </div>
                  </TableCell>
                  <TableCell>{c.goal || '—'}</TableCell>
                  <TableCell>{c.interestName || '—'}</TableCell>
                  <TableCell>
                    {formatDate(c.timeline.startDate)} — {formatDate(c.timeline.endDate)}
                  </TableCell>
                  <TableCell>${c.budget.toLocaleString()}</TableCell>
                  <TableCell>{c.applicantCount ?? 0}</TableCell>
                  <TableCell>
                    {c.isActive === 1 ? (
                      <span className="inline-flex items-center space-x-1 text-green-600">
                        <HiCheckCircle /> <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-red-600">
                        <HiXCircle /> <span>Inactive</span>
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/admin/campaigns/view?id=${c.campaignsId}`}
                          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                        >
                          <HiOutlineEye size={18} />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>View Details</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {!loading && !error && paginated.length > 0 && (
        <div className="flex justify-end items-center p-4 space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            <HiChevronLeft />
          </Button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <HiChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}
