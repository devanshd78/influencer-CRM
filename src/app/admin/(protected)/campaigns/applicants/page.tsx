
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api, { post } from "@/lib/api";
import Swal from "sweetalert2";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FloatingLabelInput } from "@/components/common/FloatingLabelInput";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineSearch,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from "react-icons/hi";
import { CheckCircle, Clock, XCircle } from "lucide-react";


interface Influencer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  socialMedia: string;
  categoryName: string;
  audienceRange: string;
  createdAt: string;
  callingcode: string;
  influencerId: string;
  isAssigned: number;
  isAccepted: number;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

export default function AppliedInfluencersPage() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const router = useRouter();

  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [applicantCount, setApplicantCount] = useState(0);
  const [isContracted, setIsContracted] = useState<number>(0);
  const [isAccepted, setIsAccepted] = useState<number>(0);

  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE_OPTIONS[0],
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE_OPTIONS[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Influencer>("createdAt");
  const [sortOrder, setSortOrder] = useState<1 | 0>(1);


  // Navigate to details
  const handleViewDetails = (inf: Influencer) => {
    router.push(`/admin/influencers/view?influencerId=${inf.influencerId}`);
  };

  // Fetch applicants
  useEffect(() => {
    if (!campaignId) {
      setError("No campaign selected.");
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const {
          meta: m,
          influencers: list,
          applicantCount: cnt,
          isAccepted,
          isContracted,
          contractId,
        } = await post<{
          meta: Meta;
          influencers: Influencer[];
          applicantCount: number;
          isAccepted: number;
          isContracted: number;
          contractId: string | null;
        }>("apply/list", {
          campaignId,
          page,
          limit,
          search: searchTerm.trim(),
          sortField,
          sortOrder,
        });
        setInfluencers(list);
        setApplicantCount(cnt);
        setIsAccepted(isAccepted);
        setIsContracted(isContracted);
        setMeta(m);
      } catch {
        setError("Failed to load applicants.");
      } finally {
        setLoading(false);
      }
    })();
  }, [campaignId, page, limit, searchTerm, sortField, sortOrder]);

  // Sorting helpers
  const toggleSort = (field: keyof Influencer) => {
    setPage(1);
    if (sortField === field) setSortOrder(o => (o === 1 ? 0 : 1));
    else {
      setSortField(field);
      setSortOrder(1);
    }
  };
  const SortIndicator = ({ field }: { field: keyof Influencer }) =>
    sortField === field
      ? sortOrder === 1
        ? <HiOutlineChevronDown className="inline ml-1 w-4 h-4" />
        : <HiOutlineChevronUp className="inline ml-1 w-4 h-4" />
      : null;

  // Render rows
  const rows = useMemo(() =>
    influencers.map(inf => (
      <TableRow key={inf._id} className="hover:bg-muted/60">
        <TableCell>
          <HiOutlineUser className="inline mr-2 text-gray-400" />
          {inf.name}
          <div className="block text-xs text-muted-foreground">{inf.socialMedia}</div>
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className="capitalize">{inf.categoryName}</Badge>
        </TableCell>
        <TableCell>{inf.audienceRange}</TableCell>
        <TableCell>
          <a href={`mailto:${inf.email}`} onClick={e => e.stopPropagation()} className="text-primary underline-offset-2 hover:underline">
            {inf.email}
          </a>
        </TableCell>
        <TableCell>{`${inf.callingcode} ${inf.phone}`}</TableCell>
        <TableCell className="whitespace-nowrap">
          <HiOutlineCalendar className="inline mr-1" />
          {new Date(inf.createdAt).toLocaleDateString()}
        </TableCell>
        <TableCell className="flex space-x-2 justify-center">
          {inf.isAccepted === 1 ? (
            <Badge variant="outline" className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium">Approved</span>
            </Badge>
          ) : inf.isAssigned === 1 ? (
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-medium">Pending Acceptance</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center space-x-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium">Not Approved</span>
            </Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
            onClick={() => handleViewDetails(inf)}
          >
            View
          </Button>
        </TableCell>
      </TableRow>
    )),
    [influencers, isAccepted ,isContracted]
  );

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white p-4 rounded-md shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Applied Influencers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and review applicants for your campaign</p>
        </div>
        <Card className="w-full md:w-40">
          <CardContent className="p-3 flex flex-col items-center gap-1">
            <p className="text-3xl font-bold text-primary">{applicantCount}</p>
            <span className="text-xs text-muted-foreground">Total Applicants</span>
          </CardContent>
        </Card>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-md shadow-sm">
        <div className="relative w-full sm:w-72">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search influencers..."
            value={searchTerm}
            onChange={e => { setPage(1); setSearchTerm(e.target.value); }}
            className="pl-10 w-full"
          />
        </div>
        <select
          value={limit}
          onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
          className="h-10 rounded-md border bg-white px-3 text-sm self-end sm:self-auto"
        >
          {PAGE_SIZE_OPTIONS.map(n => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton rows={limit} />
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <div className="bg-white rounded-md shadow-sm overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => toggleSort("name")} className="cursor-pointer select-none">
                  Name <SortIndicator field="name" />
                </TableHead>
                <TableHead onClick={() => toggleSort("categoryName")} className="cursor-pointer select-none">
                  Category <SortIndicator field="categoryName" />
                </TableHead>
                <TableHead onClick={() => toggleSort("audienceRange")} className="cursor-pointer select-none">
                  Audience <SortIndicator field="audienceRange" />
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead onClick={() => toggleSort("createdAt")} className="cursor-pointer select-none">
                  Date <SortIndicator field="createdAt" />
                </TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {influencers.length ? rows : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No influencers match criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center md:justify-end items-center gap-2">
          <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(p => Math.max(p - 1, 1))}>
            <HiChevronLeft />
          </Button>
          <span className="text-sm">Page <strong>{page}</strong> of {meta.totalPages}</span>
          <Button variant="outline" size="icon" disabled={page === meta.totalPages} onClick={() => setPage(p => Math.min(p + 1, meta.totalPages))}>
            <HiChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}

const LoadingSkeleton = ({ rows, mobile }: { rows: number; mobile?: boolean }) => (
  <div className={`p-6 space-y-2 ${mobile ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : ""}`}>
    {Array(rows).fill(0).map((_, i) => (
      <Skeleton key={i} className={mobile ? "h-28 w-full rounded-md" : "h-12 w-full rounded-md"} />
    ))}
  </div>
);

const ErrorMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="p-6 text-center text-destructive">{children}</p>
);
