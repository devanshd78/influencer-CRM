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
import dynamic from "next/dynamic";          // already present above
import { Label } from "@/components/ui/label";
const ReactSelect = dynamic(() => import("react-select"), { ssr: false });

// === Helpers ===
interface Option {
  value: string;
  label: string;
}

interface Country {
  _id: string;
  countryName: string;
  callingCode: string;
  countryCode: string;
  flag: string;
}
interface CountryOption {
  value: string;
  label: string;
  country: Country;
}
function buildCountryOptions(countries: Country[]): CountryOption[] {
  return countries.map((c) => ({
    value: c._id,
    label: `${c.flag} ${c.countryName}`,
    country: c,
  }));
}

// === Domain Types ===
interface Category {
  _id: string;
  name: string;
}
interface AudienceBifurcation {
  malePercentage: number;
  femalePercentage: number;
}
interface Subscription {
  planName: string;
}
interface Influencer {
  _id: string;
  influencerId: string;
  name: string;
  email: string;
  bio: string;
  categories: string[];
  categoryName: string[];
  audienceBifurcation: AudienceBifurcation;
  subscription: Subscription;
  audienceAgeRange: string;
  audienceRange: string;
  county: string;
  platformName: string;
}

export default function BrowseInfluencersPage() {
  const router = useRouter();

  // === Pagination ===
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);

  // === Filter & search state ===
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [platformOptions, setPlatformOptions] = useState<Option[]>([]);
  const [audienceSizeOptions, setAudienceSizeOptions] = useState<{
    _id: string;
    range: string;
  }[]>([]);
  const [ageOptions, setAgeOptions] = useState<Option[]>([]);

  const [tempCategories, setTempCategories] = useState<string[]>([]);
  const [tempPlatform, setTempPlatform] = useState<string>("all");
  const [tempAgeGroup, setTempAgeGroup] = useState<string>("all");
  const [tempAudienceSize, setTempAudienceSize] = useState<string>("all");
  const [tempCountries, setTempCountries] = useState<CountryOption[]>([]);
  const [tempMaleSplit, setTempMaleSplit] = useState<string>("all");
  const [tempFemaleSplit, setTempFemaleSplit] = useState<string>("all");

  const [searchQuery, setSearchQuery] = useState<string>("");

  // Collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: false,
    audience: false,
    country: false,
    platform: false,
    gender: false,
    age: false,
  });
  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const countryOptions = useMemo(
    () => buildCountryOptions(countries),
    [countries]
  );

  // === Data ===
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Load filter option lists ===
  useEffect(() => {
    get<Category[]>("/interest/getlist").then(setCategories).catch(() => {
      /* ignore */
    });
    get<Country[]>("/country/getall").then(setCountries).catch(() => {
    });
    get<{ _id: string; name: string; platformId: string }[]>(
      "/platform/getall"
    )
      .then((arr) =>
        setPlatformOptions(
          arr.map((p) => ({ value: p.platformId, label: p.name }))
        )
      )
      .catch(() => {
        /* ignore */
      });
    get<{ _id: string; range: string }[]>("/audience/getlist")
      .then(setAudienceSizeOptions)
      .catch(() => {
        /* ignore */
      });
    get<{ _id: string; range: string; audienceId: string }[]>(
      "/audienceRange/getall"
    )
      .then((arr) =>
        setAgeOptions(arr.map((r) => ({ value: r.audienceId, label: r.range })))
      )
      .catch(() => {
        /* ignore */
      });
  }, []);

  // === Fetch influencers with filters, pagination, search ===
  const fetchInfluencers = useCallback(() => {
    setLoading(true);
    setError(null);

    const body: Record<string, unknown> = {
      page: currentPage,
      limit: pageSize,
    };

    if (searchQuery.trim()) body.search = searchQuery.trim();
    if (tempCategories.length) body.categories = tempCategories;
    if (tempCountries.length) body.countryId = tempCountries.map((c) => c.value);
    if (tempPlatform !== "all") body.platformId = tempPlatform;
    if (tempAgeGroup !== "all") body.ageGroup = tempAgeGroup;
    if (tempAudienceSize !== "all") body.audienceRange = tempAudienceSize;
    if (tempMaleSplit !== "all") {
      const [minM, maxM] = tempMaleSplit.split("-").map((v) => Number(v));
      body.malePercentageMin = minM;
      body.malePercentageMax = maxM;
    }
    if (tempFemaleSplit !== "all") {
      const [minF, maxF] = tempFemaleSplit.split("-").map((v) => Number(v));
      body.femalePercentageMin = minF;
      body.femalePercentageMax = maxF;
    }

    post<{ success: boolean; count: number; data: Influencer[] }>(
      "/filters/getlist",
      body
    )
      .then((res) => {
        setInfluencers(res.data);
        console.log(res.data);

        const pages = Math.ceil(res.count / pageSize) || 1;
        setTotalPages(pages);
      })
      .catch(() => setError("Unable to load influencers."))
      .finally(() => setLoading(false));
  }, [
    currentPage,
    searchQuery,
    tempCategories,
    tempCountries,
    tempPlatform,
    tempAgeGroup,
    tempAudienceSize,
    tempMaleSplit,
    tempFemaleSplit
  ]);

  useEffect(() => {
    fetchInfluencers();
  }, [fetchInfluencers]);

  const applyFilters = () => {
    setCurrentPage(1);
    fetchInfluencers();
  };

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  // === Filter sidebar content ===
  const filterContent = (
    <div className="w-full md:w-72 h-screen overflow-y-auto bg-white p-6 flex flex-col border-r">
      <h2 className="text-xl font-semibold mb-6">Filter Influencers</h2>
      <div className="flex-1 space-y-6 pr-2">
        {/* Category */}
        <div>
          <button
            onClick={() => toggleSection("category")}
            className="flex w-full justify-between items-center py-2 font-medium border-b"
          >
            <span>Category</span>
            {openSections.category ? <HiChevronUp /> : <HiChevronDown />}
          </button>
          {openSections.category && (
            <ul className="mt-2 space-y-2">
              {categories.map((cat) => (
                <li key={cat._id} className="flex items-center">
                  <Checkbox
                    id={`cat-${cat._id}`}
                    checked={tempCategories.includes(cat._id)}
                    onCheckedChange={(c) =>
                      setTempCategories((prev) =>
                        c ? [...prev, cat._id] : prev.filter((id) => id !== cat._id)
                      )
                    }
                  />
                  <label htmlFor={`cat-${cat._id}`} className="ml-2">
                    {cat.name}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Audience Size */}
        <div>
          <button
            onClick={() => toggleSection("audience")}
            className="flex w-full justify-between items-center py-2 font-medium border-b"
          >
            <span>Audience Size</span>
            {openSections.audience ? <HiChevronUp /> : <HiChevronDown />}
          </button>
          {openSections.audience && (
            <Select value={tempAudienceSize} onValueChange={setTempAudienceSize}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Sizes" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Sizes</SelectItem>
                {audienceSizeOptions.map((opt) => (
                  <SelectItem key={opt._id} value={opt._id}>
                    {opt.range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Country */}
        <div>
          <button
            onClick={() => toggleSection("country")}
            className="flex w-full justify-between items-center py-2 font-medium border-b"
          >
            <span>Country</span>
            {openSections.country ? <HiChevronUp /> : <HiChevronDown />}
          </button>
          {openSections.country && (
            <ReactSelect
              isMulti
              options={countryOptions}
              value={tempCountries}
              placeholder="All Countries"
              onChange={(v) => setTempCountries(v as CountryOption[])}
              className="react-select-container"
              classNamePrefix="react-select"
            />

          )}
        </div>

        {/* Platform */}
        <div>
          <button
            onClick={() => toggleSection("platform")}
            className="flex w-full justify-between items-center py-2 font-medium border-b"
          >
            <span>Platform</span>
            {openSections.platform ? <HiChevronUp /> : <HiChevronDown />}
          </button>
          {openSections.platform && (
            <Select value={tempPlatform} onValueChange={setTempPlatform}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Platforms</SelectItem>
                {platformOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Gender Split */}
        <div>
          <button
            onClick={() => toggleSection("gender")}
            className="flex w-full justify-between items-center py-2 font-medium border-b"
          >
            <span>Gender Split</span>
            {openSections.gender ? <HiChevronUp /> : <HiChevronDown />}
          </button>
          {openSections.gender && (
            <div className="space-y-4">
              {/* Male % Split */}
              <Label className="text-sm font-medium">Male % Split</Label>
              <Select value={tempMaleSplit} onValueChange={setTempMaleSplit}>
                <SelectTrigger className="w-full"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="0-10">0–10%</SelectItem>
                  <SelectItem value="10-25">10–25%</SelectItem>
                  <SelectItem value="25-50">25–50%</SelectItem>
                  <SelectItem value="50-75">50–75%</SelectItem>
                  <SelectItem value="75-100">75–100%</SelectItem>
                </SelectContent>
              </Select>

              {/* Female % Split */}
              <Label className="text-sm font-medium">Female % Split</Label>
              <Select value={tempFemaleSplit} onValueChange={setTempFemaleSplit}>
                <SelectTrigger className="w-full"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="0-10">0–10%</SelectItem>
                  <SelectItem value="10-25">10–25%</SelectItem>
                  <SelectItem value="25-50">25–50%</SelectItem>
                  <SelectItem value="50-75">50–75%</SelectItem>
                  <SelectItem value="75-100">75–100%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Age Group */}
        <div>
          <button
            onClick={() => toggleSection("age")}
            className="flex w-full justify-between items-center py-2 font-medium border-b"
          >
            <span>Age Group</span>
            {openSections.age ? <HiChevronUp /> : <HiChevronDown />}
          </button>
          {openSections.age && (
            <Select value={tempAgeGroup} onValueChange={setTempAgeGroup}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Ages" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Ages</SelectItem>
                {ageOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Button
          onClick={applyFilters}
          className="w-full mt-4 bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white"
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
      <aside className="hidden md:block fixed h-screen w-72 overflow-y-auto bg-white border-r border-l-2  . z-10">
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
              placeholder="Search for influencer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-20 h-16 text-lg rounded-full border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
              <span className="bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white p-3 rounded-full shadow">
                <HiOutlineSearch className="w-6 h-6" />
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto px-6 pb-6">
          <Table className="min-w-full border rounded-lg bg-white overflow-x-auto">
            <TableHeader className="bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white sticky top-0">
              <TableRow>
                <TableHead>Influencer Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Audience Size</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Gender (M%/F%)</TableHead>
                <TableHead>Age Group</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Loading influencers…
                  </TableCell>
                </TableRow>
              ) : influencers.length > 0 ? (
                influencers.map((inf) => (
                  <TableRow key={inf._id} className="hover:bg-orange-50">
                    <TableCell>{inf.name}</TableCell>
                    <TableCell>
                      {inf.categoryName.map((name) => (
                        <Badge key={name} className="mr-1">
                          {name}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>{inf.audienceRange}</TableCell>
                    <TableCell>{inf.county}</TableCell>
                    <TableCell>{inf.platformName}</TableCell>
                    <TableCell>
                      {inf.audienceBifurcation?.malePercentage}% / {" "}
                      {inf.audienceBifurcation?.femalePercentage}%
                    </TableCell>
                    <TableCell>{inf.audienceAgeRange}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(`/brand/browse-influencers/view?id=${inf.influencerId}`)
                        }
                        className="bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white"
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(`/brand/messages/new?to=${inf.influencerId}`)
                        }
                        className="bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white"
                      >
                        Message
                      </Button>
                    </TableCell>

                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No influencers found
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
