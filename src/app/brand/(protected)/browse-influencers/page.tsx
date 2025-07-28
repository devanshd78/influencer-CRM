"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { HiOutlineSearch, HiChevronDown, HiChevronUp, HiFilter, HiChevronLeft, HiChevronRight } from "react-icons/hi";
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

// === Helpers ===
interface Option { value: string; label: string }
interface Country { _id: string; countryName: string; callingCode: string; countryCode: string; flag: string }
interface CountryOption { value: string; label: string; country: Country }
function buildCountryOptions(countries: Country[]): CountryOption[] {
  return countries.map(c => ({ value: c.countryCode, label: `${c.flag} ${c.countryName}`, country: c }));
}

// === Domain Types ===
interface Category { _id: string; name: string }
interface AudienceBifurcation { malePercentage: number; femalePercentage: number }
interface Subscription { planName: string }
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);

  // Filter & search states
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [platformOptions, setPlatformOptions] = useState<Option[]>([]);
  const [audienceSizeOptions, setAudienceSizeOptions] = useState<{ _id: string; range: string }[]>([]);
  const [ageOptions, setAgeOptions] = useState<Option[]>([]);

  const [tempCategories, setTempCategories] = useState<string[]>([]);
  const [tempCountry, setTempCountry] = useState<string>("all");
  const [tempPlatform, setTempPlatform] = useState<string>("all");
  const [tempAgeGroup, setTempAgeGroup] = useState<string>("all");
  const [tempAudienceSize, setTempAudienceSize] = useState<string>("all");
  const [tempGenderBifurcation, setTempGenderBifurcation] = useState<{ maleMin?: number; femaleMin?: number }>({});
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: false,
    audience: false,
    country: false,
    platform: false,
    gender: false,
    age: false,
  });
  const toggleSection = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const countryOptions = useMemo(() => buildCountryOptions(countries), [countries]);

  // Data
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load filter option lists
  useEffect(() => {
    get<Category[]>('/interest/getlist').then(setCategories).catch(() => {});
    get<Country[]>('/country/getall').then(setCountries).catch(() => {});
    get<{ _id: string; name: string; platformId: string }[]>('/platform/getall')
      .then(arr => setPlatformOptions(arr.map(p => ({ value: p.platformId, label: p.name }))))
      .catch(() => {});
    get<{ _id: string; range: string }[]>('/audience/getlist').then(setAudienceSizeOptions).catch(() => {});
    get<{ _id: string; range: string; audienceId: string }[]>('/audienceRange/getall')
      .then(arr => setAgeOptions(arr.map(r => ({ value: r.audienceId, label: r.range }))))
      .catch(() => {});
  }, []);

  // Fetch influencers with filters, pagination, search
  const fetchInfluencers = useCallback(() => {
    setLoading(true);
    setError(null);
    const body: any = {
      page: currentPage,
      limit: pageSize,
      search: searchQuery.trim() || undefined,
    };
    if (tempCategories.length) body.categories = tempCategories;
    if (tempCountry !== 'all') body.countryId = tempCountry;
    if (tempPlatform !== 'all') body.platformId = tempPlatform;
    if (tempAgeGroup !== 'all') body.ageGroup = tempAgeGroup;
    if (tempAudienceSize !== 'all') body.audienceRange = tempAudienceSize;
    const { maleMin, femaleMin } = tempGenderBifurcation;
    if (typeof maleMin === 'number') body.malePercentageMin = maleMin;
    if (typeof femaleMin === 'number') body.femalePercentageMin = femaleMin;

    post<{ success: boolean; count: number; data: Influencer[] }>('/filters/getlist', body)
      .then(res => {
        setInfluencers(res.data);
        const pages = Math.ceil(res.count / pageSize) || 1;
        setTotalPages(pages);
      })
      .catch(() => setError('Unable to load influencers.'))
      .finally(() => setLoading(false));
  }, [currentPage, searchQuery, tempCategories, tempCountry, tempPlatform, tempAgeGroup, tempAudienceSize, tempGenderBifurcation]);

  useEffect(() => { fetchInfluencers(); }, [fetchInfluencers]);

  const applyFilters = () => {
    setCurrentPage(1);
    fetchInfluencers();
  };

  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-600">{error}</div>;
  }

  const filterContent = (
    <div className="w-full md:w-72 bg-white p-6 flex flex-col h-full overflow-y-auto border-l-2">
      <h2 className="text-xl font-semibold mb-6">Filter Influencers</h2>
      <div className="flex-1 space-y-6">
        {/* Category */}
        <div>
          <button onClick={() => toggleSection('category')} className="flex w-full justify-between items-center py-2 font-medium border-b">
            <span>Category</span>
            {openSections.category ? <HiChevronUp /> : <HiChevronDown />}
          </button>
          {openSections.category && (
            <ul className="mt-2 space-y-2">
              {categories.map((cat, i) => (
                <li key={`${cat._id}-${i}`} className="flex items-center">
                  <Checkbox
                    id={`cat-${cat._id}`}
                    checked={tempCategories.includes(cat._id)}
                    onCheckedChange={c =>
                      setTempCategories(prev =>
                        c ? [...prev, cat._id] : prev.filter(id => id !== cat._id)
                      )
                    }
                  />
                  <label htmlFor={`cat-${cat._id}`} className="ml-2">{cat.name}</label>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Audience Size */}
        <div>
          <button onClick={() => toggleSection('audience')} className="flex w-full justify-between items-center py-2 font-medium border-b">
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
                {audienceSizeOptions.map(opt => (
                  <SelectItem key={opt._id} value={opt._id}>{opt.range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {/* Country */}
        <div>
          <button onClick={() => toggleSection('country')} className="flex w-full justify-between items-center py-2 font-medium border-b">
            <span>Country</span>
            {openSections.country ? <HiChevronUp /> : <HiChevronDown />}
          </button>
          {openSections.country && (
            <Select value={tempCountry} onValueChange={setTempCountry}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Countries</SelectItem>
                {countryOptions.map((opt,i) => (
                  <SelectItem key={`${opt.value}-${i}`} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {/* Platform */}
        <div>
          <button onClick={() => toggleSection('platform')} className="flex w-full justify-between items-center py-2 font-medium border-b">
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
                {platformOptions.map((opt,i) => (
                  <SelectItem key={`${opt.value}-${i}`} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {/* Gender Split */}
        <div>
          <button onClick={() => toggleSection('gender')} className="flex w-full justify-between items-center py-2 font-medium border-b">
            <span>Gender Split</span>
            {openSections.gender ? <HiChevronUp /> : <HiChevronDown />}
          </button>
          {openSections.gender && (
            <div className="mt-2 space-y-2">
              <Input
                type="number"
                placeholder="Min male %"
                className="w-full"
                value={tempGenderBifurcation.maleMin ?? ''}
                onChange={e =>
                  setTempGenderBifurcation(b => ({
                    ...b,
                    maleMin: e.target.value ? Number(e.target.value) : undefined
                  }))
                }
              />
              <Input
                type="number"
                placeholder="Min female %"
                className="w-full"
                value={tempGenderBifurcation.femaleMin ?? ''}
                onChange={e =>
                  setTempGenderBifurcation(b => ({
                    ...b,
                    femaleMin: e.target.value ? Number(e.target.value) : undefined
                  }))
                }
              />
            </div>
          )}
        </div>
        {/* Age Group */}
        <div>
          <button onClick={() => toggleSection('age')} className="flex w-full justify-between items-center py-2 font-medium border-b">
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
                {ageOptions.map((opt,i) => (
                  <SelectItem key={`${opt.value}-${i}`} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Button onClick={applyFilters} className="w-full mt-4 bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white">
          Apply Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
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
                <DialogTitle className="text-lg font-semibold">Filters</DialogTitle>
                <DialogClose className="text-gray-600" />
              </div>
              <div className="flex-1 overflow-auto p-6">{filterContent}</div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex border-r h-full">{filterContent}</aside>
      {/* Main content */}
      <main className="flex-1 p-6 flex flex-col">
        {/* Search bar */}
        <div className="mb-6 flex items-center">
          <div className="relative w-full max-w-3xl bg-white rounded-full">
            <Input
              placeholder="Search for influencer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
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
        <div className="flex-1 overflow-auto">
          <Table className="border rounded-lg overflow-hidden bg-white">
            <TableHeader className="bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white">
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
                  <TableCell colSpan={8} className="text-center py-4">Loading influencers…</TableCell>
                </TableRow>
              ) : influencers.length > 0 ? (
                influencers.map(inf => (
                  <TableRow key={inf._id} className="hover:bg-orange-50">
                    <TableCell>{inf.name}</TableCell>
                    <TableCell>{inf.categoryName.map(name => (<Badge key={name} className="mr-1">{name}</Badge>))}</TableCell>
                    <TableCell>{inf.audienceRange}</TableCell>
                    <TableCell>{inf.county}</TableCell>
                    <TableCell>{inf.platformName}</TableCell>
                    <TableCell>{inf.audienceBifurcation.malePercentage}% / {inf.audienceBifurcation.femalePercentage}%</TableCell>
                    <TableCell>{inf.audienceAgeRange}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => router.push(`/brand/browse-influencers/view?id=${inf.influencerId}`)} className="bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">No influencers found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
          onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        />
        </div>
        {/* Pagination */}
      </main>
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
