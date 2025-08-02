/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HiChevronLeft,
  HiDownload,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ====== Domain & Dummy ======
interface AudienceBifurcation {
  malePercentage: number;
  femalePercentage: number;
}
interface DemographicSlice {
  label: string;
  percentage: number;
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
  topCountries: DemographicSlice[];
  ageBreakdown: DemographicSlice[];
  interests: string[];
  gallery: string[];
  mediaKitPdf?: string;
  email?: string;
  website?: string;
}

/** --- DUMMY PAYLOAD --- */
const DUMMY_MEDIA_KIT: MediaKit = {
  influencerId: "inf-001",
  name: "Alex Rivera",
  profileImage:
    "https://source.unsplash.com/featured/160x160?face,portrait,smile",
  bio: "Lifestyle & tech creator sharing everyday hacks, smart gadgets and positivity ✨",
  followers: 285000,
  engagementRate: 4.37,
  platformName: "Instagram",
  categories: ["Lifestyle", "Tech", "Productivity"],
  audienceBifurcation: { malePercentage: 62, femalePercentage: 38 },
  topCountries: [
    { label: "🇺🇸 USA", percentage: 47 },
    { label: "🇬🇧 UK", percentage: 17 },
    { label: "🇨🇦 Canada", percentage: 8 },
  ],
  ageBreakdown: [
    { label: "13-17", percentage: 6 },
    { label: "18-24", percentage: 41 },
    { label: "25-34", percentage: 32 },
    { label: "35-44", percentage: 15 },
    { label: "45-54", percentage: 6 },
  ],
  interests: ["Mobile Gadgets", "Fitness", "Self-Improvement", "Travel"],
  gallery: [
    "https://source.unsplash.com/featured/400x400?smartphone,flatlay",
    "https://source.unsplash.com/featured/400x400?laptop,coffee",
    "https://source.unsplash.com/featured/400x400?travel,city",
  ],
  mediaKitPdf:
    "https://www.africau.edu/images/default/sample.pdf", // just a sample PDF
  email: "alexrivera@example.com",
  website: "https://alexrivera.dev",
};

// ====== Component ======
export default function InfluencerMediaKitPageDummy() {
  const router = useRouter();
  const [data] = useState<MediaKit>(DUMMY_MEDIA_KIT);

  const Stat = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col items-center">
      <span className="text-lg font-semibold">{value}</span>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Back */}
        <button
          className="flex items-center mb-4 text-gray-600 hover:text-gray-800"
          onClick={() => router.back()}
        >
          <HiChevronLeft className="mr-1" /> Back
        </button>

        {/* Hero */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row items-center">
          <img
            src={data.profileImage}
            alt={data.name}
            width={160}
            height={160}
            className="rounded-full object-cover border"
          />
          <div className="md:ml-8 mt-4 md:mt-0 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-800">{data.name}</h1>
            <p className="text-gray-600 mt-2">{data.bio}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {data.categories.map((c) => (
                <Badge key={c}>{c}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="col-span-2 sm:col-span-1 bg-gradient-to-r from-[#FFBF00] to-[#FFDB58] rounded-lg p-4 text-center">
            <Stat
              label="Followers"
              value={Intl.NumberFormat().format(data.followers)}
            />
          </div>
          <div className="col-span-2 sm:col-span-1 bg-gradient-to-r from-[#FFBF00] to-[#FFDB58] rounded-lg p-4 text-center">
            <Stat
              label="Engagement"
              value={`${data.engagementRate.toFixed(2)}%`}
            />
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <Stat label="Platform" value={data.platformName} />
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <Stat
              label="Male / Female"
              value={`${data.audienceBifurcation.malePercentage}% / ${data.audienceBifurcation.femalePercentage}%`}
            />
          </div>
        </div>

        {/* Demographics */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Age Breakdown
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Age</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.ageBreakdown.map((a) => (
                  <TableRow key={a.label}>
                    <TableCell>{a.label}</TableCell>
                    <TableCell className="text-right">
                      {a.percentage}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Top Countries
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topCountries.map((c) => (
                  <TableRow key={c.label}>
                    <TableCell>{c.label}</TableCell>
                    <TableCell className="text-right">
                      {c.percentage}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Interests */}
        <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Audience Interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.interests.map((i) => (
              <Badge key={i}>{i}</Badge>
            ))}
          </div>
        </div>

        {/* Gallery */}
        {data.gallery.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Featured Content
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {data.gallery.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Gallery item ${idx + 1}`}
                  width={400}
                  height={400}
                  className="rounded-lg object-cover w-full h-60"
                />
              ))}
            </div>
          </div>
        )}

        {/* Contact & Download */}
        <div className="flex flex-wrap gap-4 mt-10">
          {data.email && (
            <a href={`mailto:${data.email}`}>
              <Button className="bg-gradient-to-r from-[#FFBF00] to-[#FFDB58] text-gray-800">
                Contact
              </Button>
            </a>
          )}

          {data.mediaKitPdf && (
            <a href={data.mediaKitPdf} target="_blank" rel="noopener">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-gray-300"
              >
                <HiDownload /> Download PDF
              </Button>
            </a>
          )}

          {data.website && (
            <a
              href={data.website}
              target="_blank"
              rel="noopener"
              className="ml-auto text-sm text-gray-600 hover:underline"
            >
              {data.website}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
