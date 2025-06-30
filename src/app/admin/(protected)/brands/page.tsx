"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { get, post } from "@/lib/api";
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

interface SubscriptionFeature {
  key: string;
  limit: number;
  used: number;
}

interface Brand {
  brandId: string;
  name: string;
  email: string;
  phone: string;
  county: string;
  callingcode: string;
  subscription: {
    planName: string;
    expiresAt: string;
    features: SubscriptionFeature[];
  };
  subscriptionExpired: boolean;
  createdAt: string;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await post<{ brands: Brand[] }>("/brand/getall");
      setBrands(Array.isArray(data.brands) ? data.brands : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load brands.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return brands
      .filter(b => (showActiveOnly ? !b.subscriptionExpired : true))
      .filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.email.toLowerCase().includes(search.toLowerCase()) ||
        b.subscription.planName.toLowerCase().includes(search.toLowerCase())
      );
  }, [brands, showActiveOnly, search]);

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
        <h1 className="text-3xl font-semibold">All Brands (Admin)</h1>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search brands..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="max-w-sm"
          />
          <Button onClick={fetchBrands} variant="default" size="sm">
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
          Show Non-Expired Only
        </label>
      </div>

      {loading ? (
        <Card className="text-center py-20 text-gray-500">
          Loading brands…
        </Card>
      ) : error ? (
        <Card className="text-center py-20 text-red-600">
          {error}
        </Card>
      ) : paginated.length === 0 ? (
        <Card className="text-center py-20 text-gray-600">
          No brands {showActiveOnly ? 'non-expired' : 'found'}.
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
                <TableHead>Location</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(b => (
                <TableRow key={b.brandId}>
                  <TableCell>{b.brandId}</TableCell>
                  <TableCell>{b.name}</TableCell>
                  <TableCell>{b.email}</TableCell>
                  <TableCell>{`${b.callingcode}${b.phone}`}</TableCell>
                  <TableCell>{b.county}</TableCell>
                  <TableCell>{b.subscription.planName}</TableCell>
                  <TableCell>{formatDate(b.subscription.expiresAt)}</TableCell>
                  <TableCell>{formatDate(b.createdAt)}</TableCell>
                  <TableCell>
                    {b.subscriptionExpired ? (
                      <span className="inline-flex items-center space-x-1 text-red-600">
                        <HiXCircle /> <span>Expired</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-green-600">
                        <HiCheckCircle /> <span>Active</span>
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/admin/brands/view?brandId=${b.brandId}`}
                          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                        >
                          <HiOutlineEye size={18} />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>View Brand</TooltipContent>
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