"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { get, post } from "@/lib/api";
import {
  HiChevronLeft,
  HiCheckCircle,
  HiXCircle,
  HiOutlineMail,
  HiPhone,
  HiLocationMarker,
  HiChevronRight as HiChevronRightIcon,
  HiChevronLeft as HiChevronLeftIcon,
  HiChevronUp,
  HiChevronDown
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HiChevronDoubleRight } from "react-icons/hi2";

// Domain types
interface Feature {
  key: string;
  limit: number;
  used: number;
}

interface BrandDetail {
  brandId: string;
  name: string;
  email: string;
  callingcode?: string;
  phone?: string;
  county?: string;
  createdAt: string;
  updatedAt?: string;
  walletBalance: number;
  subscription: {
    planName: string;
    planId: string;
    startedAt: string;
    expiresAt: string;
    features: Feature[];
  };
  subscriptionExpired: boolean;
}

interface Campaign {
  campaignsId: string;
  productOrServiceName: string;
  goal?: string;
  timeline: { startDate: string; endDate: string };
  applicantCount?: number;
  isActive: number;
}

interface CampaignListResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  status: number;
  campaigns: Campaign[];
}

type StatusFilter = 0 | 1 | 2; // 0: All, 1: Active, 2: Inactive

type SortKey = keyof Campaign | "startDate" | "endDate" | "status";

export default function ViewBrandPage() {
  const router = useRouter();
  const params = useSearchParams();
  const brandId = params.get("brandId") || undefined;

  // Brand state
  const [brand, setBrand] = useState<BrandDetail | null>(null);
  const [loadingBrand, setLoadingBrand] = useState(true);
  const [errorBrand, setErrorBrand] = useState<string | null>(null);

  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [errorCampaigns, setErrorCampaigns] = useState<string | null>(null);
  const [campaignsPage, setCampaignsPage] = useState(1);
  const [campaignsTotal, setCampaignsTotal] = useState(0);
  const [campaignsTotalPages, setCampaignsTotalPages] = useState(1);

  // Search, filter, sort
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(0);
  const [sortBy, setSortBy] = useState<SortKey>("productOrServiceName");
  const [sortAsc, setSortAsc] = useState(true);

  const campaignsLimit = 10;

  // Fetch brand details
  const fetchBrand = async (id: string) => {
    setLoadingBrand(true);
    try {
      const data = await get<BrandDetail>("/admin/brand/getById", { id });
      setBrand(data);
      setErrorBrand(null);
    } catch (err: any) {
      setErrorBrand(err.message || "Failed to load brand.");
    } finally {
      setLoadingBrand(false);
    }
  };

  // Fetch campaigns with backend-supported search, filter, sort, pagination
  const fetchCampaigns = async () => {
    if (!brandId) return;
    setLoadingCampaigns(true);
    try {
      const payload = {
        brandId,
        page: campaignsPage,
        limit: campaignsLimit,
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder: sortAsc ? "asc" : "desc"
      };
      const resp = await post<CampaignListResponse>("/admin/campaign/getByBrandId", payload);
      setCampaigns(resp.campaigns);
      setCampaignsTotal(resp.total);
      setCampaignsTotalPages(resp.totalPages);
      setCampaignsPage(resp.page);
      setErrorCampaigns(null);
    } catch (err: any) {
      setErrorCampaigns(err.message || "Failed to load campaigns.");
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // Initial and dependencies
  useEffect(() => {
    if (brandId) {
      fetchBrand(brandId);
    }
  }, [brandId]);

  useEffect(() => {
    fetchCampaigns();
  }, [brandId, campaignsPage, searchTerm, statusFilter, sortBy, sortAsc]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else {
      setSortBy(key);
      setSortAsc(true);
    }
    setCampaignsPage(1);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-8">
      {/* Back */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
      >
        <HiChevronLeftIcon className="h-5 w-5" />
        <span>Back</span>
      </Button>

      {/* Brand */}
      {loadingBrand ? (
        <Card className="p-6 animate-pulse space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-full" />
        </Card>
      ) : errorBrand ? (
        <Card className="p-6 text-red-600">Error: {errorBrand}</Card>
      ) : brand ? (
          <Card className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-white shadow-sm">
            <div className="flex justify-center md:justify-start">
              <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl text-gray-500">
                {brand.name.charAt(0)}
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-3xl font-bold text-gray-900">{brand.name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${brand.subscriptionExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}> 
                  {brand.subscriptionExpired ? 'Expired' : 'Active'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-gray-700">
                <div className="space-y-2">
                  <p className="flex items-center space-x-2"><HiOutlineMail className="h-5 w-5"/><span>{brand.email}</span></p>
                  <p className="flex items-center space-x-2"><HiPhone className="h-5 w-5"/><span>{brand.callingcode}{brand.phone}</span></p>
                  <p className="flex items-center space-x-2"><HiLocationMarker className="h-5 w-5"/><span>{brand.county}</span></p>
                </div>
                <div className="space-y-2">
                  <p><strong>Created:</strong> {formatDate(brand.createdAt)}</p>
                  {brand.updatedAt && <p><strong>Updated:</strong> {formatDate(brand.updatedAt)}</p>}
                  <p><strong>Wallet Balance:</strong> <span className="font-semibold">${brand.walletBalance.toFixed(2)}</span></p>
                </div>
              </div>
            </div>
          </Card>
      ) : null}

      {/* Subscription Section */}
      {brand && (
        <Card className="p-6 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-gray-900">Subscription</h3>
            <span className="px-4 py-1 bg-blue-50 text-blue-800 rounded-full font-medium">{brand.subscription.planName}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 mb-6">
            <p><strong>Started:</strong> {formatDate(brand.subscription.startedAt)}</p>
            <p><strong>Expires:</strong> {formatDate(brand.subscription.expiresAt)}</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Feature</TableHead>
                <TableHead>Limit</TableHead>
                <TableHead>Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brand.subscription.features.map((f, i) => (
                <TableRow key={f.key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <TableCell className="capitalize py-2 text-gray-800">{f.key.replace(/_/g,' ')}</TableCell>
                  <TableCell className="py-2 text-gray-800">{f.limit}</TableCell>
                  <TableCell className="py-2 text-gray-800">{f.used}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Campaigns Section */}
      <Card className="p-6 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
          <h3 className="text-2xl font-semibold text-gray-900">Campaigns</h3>
          <div className="flex space-x-2">
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCampaignsPage(1); }}
              className="w-full sm:w-64"
            />
            <Select
              value={statusFilter.toString()}
              onValueChange={val => { setStatusFilter(Number(val) as StatusFilter); setCampaignsPage(1); }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All</SelectItem>
                <SelectItem value="1">Active</SelectItem>
                <SelectItem value="2">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loadingCampaigns ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, idx) => <Skeleton key={idx} className="h-6 w-full"/>)}
          </div>
        ) : errorCampaigns ? (
          <p className="text-red-600">Error: {errorCampaigns}</p>
        ) : campaigns.length === 0 ? (
          <p className="text-gray-600">No campaigns found.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  {[
                    { label: 'Name', key: 'productOrServiceName' },
                    { label: 'Goal', key: 'goal' },
                    { label: 'Start', key: 'startDate' },
                    { label: 'End', key: 'endDate' },
                    { label: 'Applicants', key: 'applicantCount' },
                    { label: 'Status', key: 'status' },
                    { label: 'Actions', key: '' }
                  ].map(col => (
                    <TableHead
                      key={col.label}
                      className={col.key ? 'cursor-pointer select-none' : ''}
                      onClick={() => col.key && toggleSort(col.key as SortKey)}
                    >
                      <div className="flex items-center">
                        {col.label}
                        {col.key && sortBy === col.key && (sortAsc ? <HiChevronUp className="ml-1"/> : <HiChevronDown className="ml-1"/>)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map(c => (
                  <TableRow key={c.campaignsId}>
                    <TableCell className="font-medium">{c.productOrServiceName}</TableCell>
                    <TableCell>{c.goal || '—'}</TableCell>
                    <TableCell>{formatDate(c.timeline.startDate)}</TableCell>
                    <TableCell>{formatDate(c.timeline.endDate)}</TableCell>
                    <TableCell>{c.applicantCount || 0}</TableCell>
                    <TableCell>
                      {c.isActive === 1 ? (
                        <span className="text-green-600 inline-flex items-center"><HiCheckCircle className="mr-1"/>Active</span>
                      ) : (
                        <span className="text-red-600 inline-flex items-center"><HiXCircle className="mr-1"/>Inactive</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/campaigns/view?id=${c.campaignsId}`)}
                      >
                        <HiChevronDoubleRight className="h-5 w-5"/>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {campaignsTotalPages > 1 && (
              <div className="flex justify-end items-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCampaignsPage(p => Math.max(p - 1, 1))}
                  disabled={campaignsPage === 1}
                >
                  <HiChevronLeftIcon />
                </Button>
                <span className="text-sm">{campaignsPage} / {campaignsTotalPages}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCampaignsPage(p => Math.min(p + 1, campaignsTotalPages))}
                  disabled={campaignsPage === campaignsTotalPages}
                >
                  <HiChevronRightIcon />
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}