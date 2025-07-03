"use client";

import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import Link from "next/link";
import { post } from "@/lib/api";
import { HiOutlineRefresh, HiOutlineEye, HiChevronUp, HiChevronDown, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";

// Domain types updated to handle optional subscription for some records
interface Subscription {
  planName: string;
  expiresAt: string;
}

export interface Influencer {
  influencerId: string;
  name: string;
  email: string;
  callingcode?: string;
  phone?: string;
  socialMedia: string;
  subscriptionExpired?: boolean;
  subscription?: Subscription;
}

interface GetListResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  influencers: Influencer[];
}

const SORTABLE_FIELDS: { [key: string]: string } = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  socialMedia: "Platform",
  planName: "Plan",
  expiresAt: "Expires",
  subscriptionExpired: "Status",
};

const AdminInfluencersPage: NextPage = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  const fetchInfluencers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: pageSize, search, sortBy, sortOrder };
      const response = await post<GetListResponse>(
        "/admin/influencer/getlist",
        params
      );
      setInfluencers(response.influencers);
      setTotal(response.total);
      setPage(response.page);
      setPageSize(response.limit);
      setTotalPages(response.totalPages)
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load influencers.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInfluencers();
  }, [page, pageSize, search, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold">
          Influencers Administration
        </h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name, email, platform..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-64"
          />
          <Button
            variant="outline"
            onClick={fetchInfluencers}
            disabled={loading}
          >
            <HiOutlineRefresh
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="text-red-600 p-4">{error}</Card>
      )}

      <Card className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {Object.entries(SORTABLE_FIELDS).map(([field, label]) => (
                <TableHead
                  key={field}
                  onClick={() => toggleSort(field)}
                  className="cursor-pointer select-none"
                >
                  <div className="flex items-center">
                    {label}
                    {sortBy === field &&
                      (sortOrder === "asc" ? (
                        <HiChevronUp className="ml-1" />
                      ) : (
                        <HiChevronDown className="ml-1" />
                      ))}
                  </div>
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: pageSize }).map((_, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {Array(
                      Object.keys(SORTABLE_FIELDS).length + 1
                    )
                      .fill(0)
                      .map((_, cellIdx) => (
                        <TableCell key={cellIdx}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </TableCell>
                      ))}
                  </TableRow>
                ))
              : influencers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={Object.keys(SORTABLE_FIELDS).length + 1}
                    className="text-center text-gray-500 py-8"
                  >
                    No influencers match the criteria.
                  </TableCell>
                </TableRow>
              ) : (
                influencers.map((inf) => (
                  <TableRow key={inf.influencerId}>
                    <TableCell>{inf.name}</TableCell>
                    <TableCell>{inf.email}</TableCell>
                    <TableCell>
                      {inf.callingcode
                        ? `${inf.callingcode}${inf.phone}`
                        : inf.phone}
                    </TableCell>
                    <TableCell>{inf.socialMedia}</TableCell>
                    <TableCell>
                      {inf.subscription?.planName ?? "-"}
                    </TableCell>
                    <TableCell>
                      {inf.subscription?.expiresAt
                        ? new Date(
                            inf.subscription.expiresAt
                          ).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          inf.subscriptionExpired
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {inf.subscriptionExpired ? "Expired" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={`/admin/influencers/view?influencerId=${inf.influencerId}`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                            >
                              <HiOutlineEye />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          View details
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
          </TableBody>
        </Table>
      </Card>

      {!loading && !error && influencers.length > 0 && (
        <div className="flex justify-between items-center p-4">
          <div className="text-sm text-gray-700">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(p => Math.max(p - 1, 1))}>
              <HiChevronLeft />
            </Button>
            <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage(p => Math.min(p + 1, totalPages))}>
              <HiChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInfluencersPage;
