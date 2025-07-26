"use client";

import React, { useEffect, useState, useMemo } from "react";
import { HiOutlineSearch, HiChevronDown, HiChevronUp } from "react-icons/hi";
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
import { useRouter } from "next/navigation";

interface Category {
  _id: string;
  name: string;
}

interface Subscription {
  planName: string;
  startedAt: string;
  expiresAt?: string;
}

interface Influencer {
  _id: string;
  influencerId: string;
  name: string;
  email: string;
  categoryId: string;
  categoryName?: string;
  audienceSize?: number;
  country?: string;
  platform?: string;
  malePercentage?: number;
  femalePercentage?: number;
  audienceAgeGroup?: string;
  subscription: Subscription;
}

export default function BrowseInfluencersPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [audienceSize, setAudienceSize] = useState<{ min?: number; max?: number }>({});
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [ageGroup, setAgeGroup] = useState<string>("all");
  const [genderRange, setGenderRange] = useState<{ min?: number; max?: number }>({});
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Temp state for filters
  const [tempCategories, setTempCategories] = useState<string[]>([]);
  const [tempAudienceSize, setTempAudienceSize] = useState<{ min?: number; max?: number }>({});
  const [tempCountry, setTempCountry] = useState<string>("all");
  const [tempPlatform, setTempPlatform] = useState<string>("all");
  const [tempAgeGroup, setTempAgeGroup] = useState<string>("all");
  const [tempGenderRange, setTempGenderRange] = useState<{ min?: number; max?: number }>({});

  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    audience: false,
    country: false,
    platform: false,
    gender: false,
    age: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await get<Category[]>("/interest/getlist");
        setCategories(res);
      } catch {
        setError("Unable to load categories.");
      }
    })();
  }, []);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const res = await post<Influencer[]>("/influencer/getlist", {});
        setInfluencers(res);
      } catch {
        setError("Unable to load influencers.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const applyFilters = () => {
    setSelectedCategories(tempCategories);
    setAudienceSize(tempAudienceSize);
    setSelectedCountry(tempCountry);
    setSelectedPlatform(tempPlatform);
    setAgeGroup(tempAgeGroup);
    setGenderRange(tempGenderRange);
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return influencers.filter(inf => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(inf.categoryId);

      const matchesSearch =
        !q ||
        inf.name?.toLowerCase().includes(q) ||
        inf.email?.toLowerCase().includes(q);

      const matchesSize =
        (!audienceSize.min || (inf.audienceSize ?? 0) >= audienceSize.min) &&
        (!audienceSize.max || (inf.audienceSize ?? 0) <= audienceSize.max);

      const matchesCountry =
        selectedCountry === "all" || inf.country === selectedCountry;

      const matchesPlatform =
        selectedPlatform === "all" || inf.platform === selectedPlatform;

      const matchesAge =
        ageGroup === "all" || inf.audienceAgeGroup === ageGroup;

      const matchesGender =
        (!genderRange.min || (inf.malePercentage ?? 0) >= genderRange.min) &&
        (!genderRange.max || (inf.malePercentage ?? 0) <= genderRange.max);

      return (
        matchesCategory &&
        matchesSearch &&
        matchesSize &&
        matchesCountry &&
        matchesPlatform &&
        matchesAge &&
        matchesGender
      );
    });
  }, [
    influencers,
    selectedCategories,
    searchQuery,
    audienceSize,
    selectedCountry,
    selectedPlatform,
    ageGroup,
    genderRange,
  ]);


  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading influencers...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );

  return (
    <div className="min-h-full flex">
      <aside className="w-72 bg-white border-r p-6 hidden md:flex flex-col h-screen overflow-y-auto border-l">
        <h2 className="text-xl font-semibold mb-6">
          Filter Influencers
        </h2>
        <div className="flex-1">
          {/* Category Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("category")}
              className="flex w-full justify-between items-center py-2 text-gray-700 font-medium border-b"
            >
              <span>Category</span>
              {openSections.category ? (
                <HiChevronUp />
              ) : (
                <HiChevronDown />
              )}
            </button>
            {openSections.category && (
              <ul className="mt-2 space-y-2">
                {categories.map((cat) => (
                  <li
                    key={cat._id}
                    className="flex items-center"
                  >
                    <Checkbox
                      id={`cat-${cat._id}`}
                      checked={tempCategories.includes(
                        cat._id
                      )}
                      onCheckedChange={(checked) => {
                        setTempCategories((prev) =>
                          checked
                            ? [...prev, cat._id]
                            : prev.filter(
                              (id) => id !== cat._id
                            )
                        );
                      }}
                    />
                    <label
                      htmlFor={`cat-${cat._id}`}
                      className="ml-2 text-gray-600"
                    >
                      {cat.name}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Audience Size Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("audience")}
              className="flex w-full justify-between items-center py-2 text-gray-700 font-medium border-b"
            >
              <span>Audience Size</span>
              {openSections.audience ? (
                <HiChevronUp />
              ) : (
                <HiChevronDown />
              )}
            </button>
            {openSections.audience && (
              <div className="mt-2 flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={tempAudienceSize.min ?? ""}
                  onChange={(e) =>
                    setTempAudienceSize((s) => ({
                      ...s,
                      min: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-1/2"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={tempAudienceSize.max ?? ""}
                  onChange={(e) =>
                    setTempAudienceSize((s) => ({
                      ...s,
                      max: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-1/2"
                />
              </div>
            )}
          </div>

          {/* Country Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("country")}
              className="flex w-full justify-between items-center py-2 text-gray-700 font-medium border-b"
            >
              <span>Country</span>
              {openSections.country ? (
                <HiChevronUp />
              ) : (
                <HiChevronDown />
              )}
            </button>
            {openSections.country && (
              <div className="mt-2">
                <Select
                  value={tempCountry}
                  onValueChange={setTempCountry}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Countries
                    </SelectItem>
                    <SelectItem value="US">
                      United States
                    </SelectItem>
                    <SelectItem value="UK">
                      United Kingdom
                    </SelectItem>
                    <SelectItem value="CA">
                      Canada
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Platform Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("platform")}
              className="flex w-full justify-between items-center py-2 text-gray-700 font-medium border-b"
            >
              <span>Platform</span>
              {openSections.platform ? (
                <HiChevronUp />
              ) : (
                <HiChevronDown />
              )}
            </button>
            {openSections.platform && (
              <div className="mt-2">
                <Select
                  value={tempPlatform}
                  onValueChange={setTempPlatform}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Platforms
                    </SelectItem>
                    <SelectItem value="Instagram">
                      Instagram
                    </SelectItem>
                    <SelectItem value="YouTube">
                      YouTube
                    </SelectItem>
                    <SelectItem value="TikTok">
                      TikTok
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Gender Split Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("gender")}
              className="flex w-full justify-between items-center py-2 text-gray-700 font-medium border-b"
            >
              <span>Gender Split</span>
              {openSections.gender ? (
                <HiChevronUp />
              ) : (
                <HiChevronDown />
              )}
            </button>
            {openSections.gender && (
              <div className="mt-2 flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min %"
                  value={tempGenderRange.min ?? ""}
                  onChange={(e) =>
                    setTempGenderRange((g) => ({
                      ...g,
                      min: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-1/2"
                />
                <Input
                  type="number"
                  placeholder="Max %"
                  value={tempGenderRange.max ?? ""}
                  onChange={(e) =>
                    setTempGenderRange((g) => ({
                      ...g,
                      max: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-1/2"
                />
              </div>
            )}
          </div>

          {/* Age Group Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("age")}
              className="flex w-full justify-between items-center py-2 text-gray-700 font-medium border-b"
            >
              <span>Age Group</span>
              {openSections.age ? (
                <HiChevronUp />
              ) : (
                <HiChevronDown />
              )}
            </button>
            {openSections.age && (
              <div className="mt-2">
                <Select
                  value={tempAgeGroup}
                  onValueChange={setTempAgeGroup}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Ages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Ages
                    </SelectItem>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45+">45+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button
            onClick={applyFilters}
            className="w-full mt-4 bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white"
          >
            Apply Filters
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6">
<div className="mb-6 flex items-center">
  <div className="relative w-full max-w-3xl bg-white rounded-full">
    <Input
      placeholder="Search for influencer..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="
        w-full
        pl-6 pr-20
        h-16
        text-lg
        placeholder:text-lg
        placeholder:text-gray-400
        rounded-full
        border border-orange-300
        border-3
        focus:outline-none focus:ring-2 focus:ring-orange-400
      "
    />
    <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
      <span className="bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white p-3 rounded-full shadow">
        <HiOutlineSearch className="w-6 h-6" />
      </span>
    </div>
  </div>
</div>


        <Table className="border rounded-lg overflow-hidden bg-white">
          <TableHeader className="bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white">
            <TableRow>
              <TableHead>Influencer Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Audience Size</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Gender (M%/ F%)</TableHead>
              <TableHead>Age Group</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((inf) => (
              <TableRow key={inf._id} className="border-b hover:bg-orange-50 height-[108px]">
                <TableCell className="px-6 py-4">{inf.name}</TableCell>
                <TableCell>
                  <Badge>{inf.categoryName || "—"}</Badge>
                </TableCell>
                <TableCell>
                  {inf.audienceSize?.toLocaleString() || "—"}
                </TableCell>
                <TableCell>{inf.country || "—"}</TableCell>
                <TableCell>{inf.platform || "—"}</TableCell>
                <TableCell>
                  {inf.malePercentage ?? "—"}% / {inf.femalePercentage ?? "—"}%
                </TableCell>
                <TableCell>{inf.audienceAgeGroup || "—"}</TableCell>
                <TableCell>
                  <Button onClick={()=> router.push(`/brand/browse-influencers/view?id=${inf.influencerId}`)} className="cursor-pointer bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white" size="sm" >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </div>
  );
}
