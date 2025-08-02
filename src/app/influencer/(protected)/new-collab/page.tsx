/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  HiOutlineSearch,
  HiChevronDown,
  HiChevronUp,
  HiFilter,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import { get, post } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

// === Domain Types ===
interface Campaign {
  _id: string;
  campaignId: string;
  productName: string;
  description: string;
  ageRange: string;
  gender: string;
  location: string;
  interests: string[];
  goal: string;
  budget: string;
  timeline: string; // e.g. "01-08-25 → 31-08-25"
}

interface InterestOption {
  _id: string;
  name: string;
}

// === Main component ===
export default function BrowseCampaignsPage() {
  const router = useRouter();

  // === Pagination ===
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);

  // === Filter & search state ===
  const [interestOptions, setInterestOptions] = useState<InterestOption[]>([]);
  const [tempInterests, setTempInterests] = useState<string[]>([]);
  const [tempGender, setTempGender] = useState<string>("all");
  const [tempAge, setTempAge] = useState<{ min?: number; max?: number }>({});
  const [tempLocation, setTempLocation] = useState<string>("all");
  const [tempGoal, setTempGoal] = useState<string>("all");
  const [tempBudget, setTempBudget] = useState<string>("all");
  const [tempTimeline, setTempTimeline] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    interest: false,
    gender: false,
    age: false,
    location: false,
    goal: false,
    budget: false,
    timeline: false,
  });
  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // === Data ===
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Load filter option lists ===
  useEffect(() => {
    get<InterestOption[]>("/interest/getlist").then(setInterestOptions);
    // Add other lookups: /goal/getall, /location/getall, etc.
  }, []);

  // === Fetch campaigns with filters, pagination, search ===
  const fetchCampaigns = useCallback(() => {
    setLoading(true);
    setError(null);

    const body: Record<string, unknown> = {
      page: currentPage,
      limit: pageSize,
    };

    if (searchQuery.trim()) body.search = searchQuery.trim();
    if (tempInterests.length) body.interests = tempInterests;
    if (tempGender !== "all") body.gender = tempGender;
    if (tempLocation !== "all") body.location = tempLocation;
    if (tempGoal !== "all") body.goal = tempGoal;
    if (tempBudget !== "all") body.budget = tempBudget;
    if (tempTimeline !== "all") body.timeline = tempTimeline;
    if (tempAge.min) body.ageMin = tempAge.min;
    if (tempAge.max) body.ageMax = tempAge.max;

    post<{ success: boolean; count: number; data: Campaign[] }>(
      "/campaigns/getlist",
      body
    )
      .then((res) => {
        setCampaigns(res.data);
        const pages = Math.ceil(res.count / pageSize) || 1;
        setTotalPages(pages);
      })
      .catch(() => setError("Unable to load campaigns."))
      .finally(() => setLoading(false));
  }, [
    currentPage,
    searchQuery,
    tempInterests,
    tempGender,
    tempLocation,
    tempGoal,
    tempBudget,
    tempTimeline,
    tempAge,
  ]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const applyFilters = () => {
    setCurrentPage(1);
    fetchCampaigns();
  };

  // === Filter sidebar content ===
  const filterContent = (
    <div className="w-full md:w-72 h-screen overflow-y-auto bg-white p-6 flex flex-col border-r">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">
        Filter Campaigns
      </h2>
      <div className="flex-1 space-y-6 pr-2">
        {/* Interests */}
        <div>
          <button
            onClick={() => toggleSection("interest")}
            className="flex w-full justify-between items-center py-2 font-medium border-b"
          >
            <span>Interests</span>
            {openSections.interest ? <HiChevronUp /> : <HiChevronDown />}
          </button>
          {openSections.interest && (
            <ul className="mt-2 space-y-2">
              {interestOptions.map((opt) => (
                <li key={opt._id} className="flex items-center">
                  <Checkbox
                    id={`int-${opt._id}`}
                    checked={tempInterests.includes(opt._id)}
                    onCheckedChange={(c) =>
                      setTempInterests((prev) =>
                        c ? [...prev, opt._id] : prev.filter((id) => id !== opt._id)
                      )
                    }
                  />
                  <label htmlFor={`int-${opt._id}`} className="ml-2">
                    {opt.name}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Gender */}
        <div>
          <button
            onClick={() => toggleSection("gender")}
            className="flex w-full justify-between items-center py-2 font-medium border-b"
          >
            <span>Gender</span>
            {openSections.gender ? <HiChevronUp /> : <HiChevronDown />}
          </button>
          {openSections.gender && (
            <Select value={tempGender} onValueChange={setTempGender}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="any">Any</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Age */}
        <div>
          <button
            onClick={() => toggleSection("age")}
            className="flex w-full justify-between items-center py-2 font-medium border-b"
          >
            <span>Age Range</span>
            {openSections.age ? <HiChevronUp /> : <HiChevronDown />}
          </button>
          {openSections.age && (
            <div className="mt-2 space-y-2">
              <Input
                type="number"
                placeholder="Min age"
                className="w-full"
                value={tempAge.min ?? ""}
                onChange={(e) =>
                  setTempAge((a) => ({
                    ...a,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
              <Input
                type="number"
                placeholder="Max age"
                className="w-full"
                value={tempAge.max ?? ""}
                onChange={(e) =>
                  setTempAge((a) => ({
                    ...a,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          )}
        </div>

        {/* Location */}
        {/* Repeat for location / goal / budget / timeline with Select or custom pickers */}

        <Button
          onClick={applyFilters}
          className="w-full mt-4 bg-gradient-to-r from-[#FFBF00] to-[#FFDB58] text-gray-800"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );

  // === Main page ===
  return (
    <div className="flex min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:block fixed h-screen w-72 overflow-y-auto bg-white border-r z-10">
        {filterContent}
      </aside>

      {/* Content area (offset for sidebar) */}
      <div className="flex-1 md:ml-72 flex flex-col">
        {/* Mobile Filters */}
        <div className="md:hidden flex justify-end p-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <HiFilter className="w-5 h-5" />
                <span>Filters</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="fixed inset-0 p-0 bg-white">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <DialogTitle className="text-lg font-semibold">
                    Filters
                  </DialogTitle>
                  <DialogClose className="text-gray-600" />
                </div>
                <div className="flex-1 overflow-auto p-6">{filterContent}</div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search bar */}
        <div className="my-6 px-6 flex items-center">
          <div className="relative w-full max-w-3xl bg-white rounded-full">
            <Input
              placeholder="Search for campaign..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-20 h-16 text-lg rounded-full border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
              <span className="bg-gradient-to-r from-[#FFBF00] to-[#FFDB58] p-3 rounded-full shadow">
                <HiOutlineSearch className="w-6 h-6 text-gray-800" />
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto px-6 pb-6">
          <Table className="min-w-full border rounded-lg bg-white overflow-x-auto">
            <TableHeader className="bg-gradient-to-r from-[#FFBF00] to-[#FFDB58] text-gray-800 sticky top-0">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Loading campaigns…
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-4 text-red-600"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : campaigns.length > 0 ? (
                campaigns.map((c) => (
                  <TableRow key={c._id} className="hover:bg-yellow-50">
                    <TableCell>{c.productName}</TableCell>
                    <TableCell>{c.goal}</TableCell>
                    <TableCell>{c.budget}</TableCell>
                    <TableCell>{c.gender}</TableCell>
                    <TableCell>{c.ageRange}</TableCell>
                    <TableCell>{c.location}</TableCell>
                    <TableCell>{c.timeline}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(`/brand/browse-campaigns/view?id=${c.campaignId}`)
                        }
                        className="bg-gradient-to-r from-[#FFBF00] to-[#FFDB58] text-gray-800"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No campaigns found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex justify-end items-center p-4 space-x-2">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"
      >
        <HiChevronLeft size={20} />
      </button>
      <span className="text-gray-800">
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
