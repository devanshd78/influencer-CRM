"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  Users,
  TrendingUp,
  Monitor,
  PieChart,
  AlertCircle,
  Download,
  Mail,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { post } from "@/lib/api";

/* --------------------------------------------------------------------------
 * CONSTANTS & TYPES
 * ----------------------------------------------------------------------- */

const API_ENDPOINTS = {
  MEDIA_KIT_GET: "/media-kit/influencer",
} as const;

const COLORS = {
  GRADIENT: "from-[#FFA135] via-[#FF8735] to-[#FF7236]",
  CARD_BG: "bg-white/60 backdrop-blur-lg shadow-xl ring-1 ring-black/5",
} as const;

interface CountrySlice {
  _id: string;
  name: string;
  percentage: number;
}
interface AgeSlice {
  _id: string;
  range: string;
  percentage: number;
}
interface AudienceBifurcation {
  malePercentage: number;
  femalePercentage: number;
}
interface MediaKit {
  influencerId: string;
  name: string;
  profileImage: string;
  bio: string;
  followers: number;
  engagementRate: number;
  platformName: string;
  categories: string[];
  audienceBifurcation: AudienceBifurcation;
  topCountries: CountrySlice[];
  ageBreakdown: AgeSlice[];
  interests: string[];
  gallery: string[];
  rateCard?: string;
  notes?: string;
  mediaKitPdf?: string;
  email?: string;
  website?: string;
}

/* --------------------------------------------------------------------------
 * HELPERS
 * ----------------------------------------------------------------------- */

const mapCountrySlice = (raw: any): CountrySlice => ({
  _id: raw.countryId ?? raw._id ?? "",
  name: raw.name ?? raw.label ?? "",
  percentage: Number(raw.percentage) || 0,
});
const mapAgeSlice = (raw: any): AgeSlice => ({
  _id: raw.audienceRangeId ?? raw._id ?? "",
  range: raw.range ?? raw.label ?? "",
  percentage: Number(raw.percentage) || 0,
});
const normalizeMediaKit = (raw: any): MediaKit => ({
  influencerId: raw.influencerId ?? raw.id ?? "",
  name: raw.name ?? "Unknown",
  profileImage: raw.profileImage
    ? `${process.env.NEXT_PUBLIC_CDN ?? ""}${raw.profileImage}`
    : "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop",
  bio: raw.bio ?? "",
  followers: Number(raw.followers) || 0,
  engagementRate: Number(raw.engagementRate) || 0,
  platformName: raw.platformName ?? raw.platform ?? "",
  categories: raw.categories,
  audienceBifurcation:
    raw.audienceBifurcation ?? { malePercentage: 0, femalePercentage: 0 },
  topCountries: Array.isArray(raw.topCountries)
    ? raw.topCountries.map(mapCountrySlice)
    : [],
  ageBreakdown: Array.isArray(raw.ageBreakdown)
    ? raw.ageBreakdown.map(mapAgeSlice)
    : [],
  interests: Array.isArray(raw.interests) ? raw.interests : [],
  gallery: Array.isArray(raw.gallery) ? raw.gallery : [],
  rateCard: raw.rateCard ?? "",
  notes: raw.notes ?? "",
  mediaKitPdf: raw.mediaKitPdf ?? raw.pdfUrl ?? undefined,
  email: raw.email,
  website: raw.website,
});
const numFmt = new Intl.NumberFormat();

/* --------------------------------------------------------------------------
 * PRESENTATIONAL COMPONENTS
 * ----------------------------------------------------------------------- */

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-6 animate-pulse">
    <Skeleton className="w-32 h-32" />
  </div>
);

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}
const StatCard = ({ label, value, icon }: StatCardProps) => (
  <div
    className={cn(
      "rounded-2xl p-5 text-center text-white shadow-md hover:shadow-lg transition-all duration-200",
      `bg-gradient-to-r ${COLORS.GRADIENT}`
    )}
  >
    {icon && <div className="flex justify-center mb-2 opacity-90">{icon}</div>}
    <p className="text-2xl font-bold drop-shadow-sm">{value}</p>
    <p className="mt-1 text-xs font-medium uppercase opacity-90 tracking-wider">{label}</p>
  </div>
);

interface BreakdownProps {
  title: string;
  slices: { _id: string; label: string; percentage: number }[];
}
const BreakdownCard = ({ title, slices }: BreakdownProps) => (
  <Card className={COLORS.CARD_BG}>
    <CardHeader>
      <CardTitle className="text-gray-800 flex items-center gap-2">
        <PieChart className="h-5 w-5 text-orange-500" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {slices.map((s) => (
        <div
          key={s._id}
          className="flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-orange-50"
        >
          <span className="font-medium text-gray-700 truncate max-w-[8rem] sm:max-w-none">
            {s.label}
          </span>
          <div className="flex items-center gap-3 w-48">
            <Progress value={s.percentage} className="flex-1 h-2" />
            <span className="text-sm font-semibold text-gray-700 w-10 text-right">
              {s.percentage}%
            </span>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

/* --------------------------------------------------------------------------
 * PAGE COMPONENT
 * ----------------------------------------------------------------------- */

export default function BrandMediaKitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const influencerId = searchParams.get("id") || "";

  const [data, setData] = useState<MediaKit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!influencerId) {
        setError("No influencer selected");
        setLoading(false);
        return;
      }
      try {
        const res = await post(API_ENDPOINTS.MEDIA_KIT_GET, { influencerId });
        setData(normalizeMediaKit(res));
      } catch (err: any) {
        setError(err?.message ?? "Failed to load media kit");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [influencerId]);

  if (loading) return <LoadingSkeleton />;
  if (error || !data)
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-6">
        <Card className={cn("max-w-md w-full text-center", COLORS.CARD_BG)}>
          <CardContent className="p-8 space-y-5">
            <AlertCircle className="h-14 w-14 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold">Unable to Load Media Kit</h2>
            <p className="text-sm text-gray-600 max-w-xs mx-auto">{error}</p>
            <Button variant="outline" onClick={() => router.back()} className="gap-1">
              <ChevronLeft className="h-4 w-4" />Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  const {
    name,
    profileImage,
    bio,
    followers,
    engagementRate,
    platformName,
    categories,
    audienceBifurcation,
    topCountries,
    ageBreakdown,
    interests,
    gallery,
    rateCard,
    notes,
    mediaKitPdf,
    email,
    website,
  } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-1 hover:bg-orange-100 text-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />Back
          </Button>
        </header>

        {/* Hero */}
        <Card className={cn(COLORS.CARD_BG, "overflow-hidden") }>
          <CardContent className="p-0">
            <div className={`bg-gradient-to-r ${COLORS.GRADIENT} h-28 md:h-32`} />
            <div className="p-8 -mt-6 md:-mt-6">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
                <img
                  src={profileImage}
                  alt={name}
                  className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg hover:scale-105 transition-transform duration-200"
                />
                <div className="flex-1 space-y-4 w-full pt-4">
                  <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    {name}
                  </h1>
                  <p className="text-gray-700 leading-relaxed max-w-2xl whitespace-pre-line">
                    {bio}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((c) => (
                      <Badge key={c} className="bg-orange-100 text-orange-700 px-3 py-1 text-sm rounded-full">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCard label="Followers" value={numFmt.format(followers)} icon={<Users className="h-6 w-6" />} />
          <StatCard label="Engagement" value={`${engagementRate.toFixed(2)}%`} icon={<TrendingUp className="h-6 w-6" />} />
          <StatCard label="Platform" value={platformName} icon={<Monitor className="h-6 w-6" />} />
          <StatCard label="Gender" value={`${audienceBifurcation.malePercentage}% / ${audienceBifurcation.femalePercentage}%`} icon={<PieChart className="h-6 w-6" />} />
        </div>

        {/* Demographics */}
        {(ageBreakdown.length || topCountries.length) && (
          <div className="grid md:grid-cols-2 gap-6">
            {ageBreakdown.length > 0 && (
              <BreakdownCard
                title="Age Breakdown"
                slices={ageBreakdown.map((a) => ({ _id: a._id, label: a.range, percentage: a.percentage }))}
              />
            )}
            {topCountries.length > 0 && (
              <BreakdownCard
                title="Top Countries"
                slices={topCountries.map((c) => ({ _id: c._id, label: c.name, percentage: c.percentage }))}
              />
            )}
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <Card className={COLORS.CARD_BG}>
            <CardHeader>
              <CardTitle className="text-gray-800">Audience Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {interests.map((i) => (
                  <Badge key={i} className="border-orange-300 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm">
                    {i}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rate Card */}
        {rateCard && (
          <Card className={COLORS.CARD_BG}>
            <CardHeader>
              <CardTitle className="text-gray-800">Rate Card</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-orange-50/50 p-4 rounded-xl">
                {rateCard}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Additional Notes */}
        {notes && (
          <Card className={COLORS.CARD_BG}>
            <CardHeader>
              <CardTitle className="text-gray-800">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                {notes}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <Card className={COLORS.CARD_BG}>
            <CardHeader>
              <CardTitle className="text-gray-800">Featured Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gallery.map((url, i) => (
                  <div key={i} className="relative group overflow-hidden rounded-xl shadow-md">
                    <img
                      src={url}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact */}
        {(email || mediaKitPdf || website) && (
          <Card className={COLORS.CARD_BG}>
            <CardContent className="p-6 flex flex-wrap items-center gap-4">
              {email && (
                <Button asChild className={`bg-gradient-to-r ${COLORS.GRADIENT} text-white hover:opacity-95`}>
                  <a href={`mailto:${email}`}> <Mail className="h-4 w-4 mr-2" />Contact </a>
                </Button>
              )}
              {mediaKitPdf && (
                <Button asChild variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                  <a href={mediaKitPdf} target="_blank" rel="noopener">
                    <Download className="h-4 w-4 mr-2" />Download PDF
                  </a>
                </Button>
              )}
              {website && (
                <Button asChild variant="ghost" className="text-orange-700 hover:text-orange-900 ml-auto">
                  <a href={website.startsWith("http") ? website : `https://${website}`} target="_blank" rel="noopener">
                    <Globe className="h-4 w-4 mr-2" />Visit Website
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}