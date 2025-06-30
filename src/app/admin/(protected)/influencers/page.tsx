"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { get, post } from "@/lib/api";
import {
  HiOutlineRefresh,
  HiOutlineEye,
  HiChevronLeft,
  HiChevronRight,
  HiCheckCircle,
  HiXCircle,
} from "react-icons/hi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface SubscriptionFeature {
  key: string;
  limit: number;
  used: number;
}

interface Influencer {
  influencerId: string;
  name: string;
  email: string;
  phone: string;
  socialMedia: string;
  county: string;
  callingcode: string;
  subscription: {
    planName: string;
    expiresAt?: string;
    features: SubscriptionFeature[];
  };
  subscriptionExpired: boolean;
  createdAt: string;
}

export default function AdminInfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNonExpiredOnly, setShowNonExpiredOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const fetchInfluencers = async () => {
    setLoading(true);
    setError(null);
    try {
      // API returns an array of Influencer objects
      const data = await post<Influencer[]>("/influencer/getlist");
      setInfluencers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load influencers.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return influencers
      .filter(i => (showNonExpiredOnly ? !i.subscriptionExpired : true))
      .filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.email.toLowerCase().includes(search.toLowerCase()) ||
        i.socialMedia.toLowerCase().includes(search.toLowerCase())
      );
  }, [influencers, showNonExpiredOnly, search]);

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
        <h1 className="text-3xl font-semibold">All Influencers (Admin)</h1>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search influencers..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="max-w-sm"
          />
          <Button onClick={fetchInfluencers} variant="default" size="sm">
            <HiOutlineRefresh className="mr-2 h-4 w-4" /> Reload
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id="non-expired-only"
          checked={showNonExpiredOnly}
          onCheckedChange={checked => { setShowNonExpiredOnly(!!checked); setCurrentPage(1); }}
        />
        <label htmlFor="non-expired-only" className="text-gray-700">
          Show Non-Expired Only
        </label>
      </div>

      {loading ? (
        <Card className="text-center py-20 text-gray-500">Loading influencers…</Card>
      ) : error ? (
        <Card className="text-center py-20 text-red-600">{error}</Card>
      ) : paginated.length === 0 ? (
        <Card className="text-center py-20 text-gray-600">
          No influencers {showNonExpiredOnly ? 'non-expired' : 'found'}.
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Social</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(i => (
                <TableRow key={i.influencerId}>
                  <TableCell>{i.influencerId}</TableCell>
                  <TableCell>{i.name}</TableCell>
                  <TableCell>{i.email}</TableCell>
                  <TableCell>{`${i.callingcode}${i.phone}`}</TableCell>
                  <TableCell>{i.socialMedia}</TableCell>
                  <TableCell>{i.subscription.planName}</TableCell>
                  <TableCell>{i.subscription.expiresAt ? formatDate(i.subscription.expiresAt) : 'N/A'}</TableCell>
                  <TableCell>{formatDate(i.createdAt)}</TableCell>
                  <TableCell>
                    {!i.subscriptionExpired ? (
                      <span className="inline-flex items-center space-x-1 text-green-600">
                        <HiCheckCircle /><span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-red-600">
                        <HiXCircle /><span>Expired</span>
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/admin/influencers/view?influencerId=${i.influencerId}`}
                          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                        >
                          <HiOutlineEye size={18} />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>View Influencer</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

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
            Page {currentPage} of {Math.ceil(filtered.length / itemsPerPage)}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filtered.length / itemsPerPage)))}
            disabled={currentPage === Math.ceil(filtered.length / itemsPerPage)}
          >
            <HiChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}
