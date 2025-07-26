"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, MessageCircle } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { get } from "@/lib/api";

/* ------------------------------------------------------------------
 * Types & Helpers
 * ----------------------------------------------------------------*/

const COLORS = ["#FFA135", "#FF7236"] as const;
// Disabled slice color
const DISABLED_COLOR = "#E5E7EB";

interface AgeGroup {
  label: string;
  value: string;
}
interface AudienceSplit {
  male: number;
  female: number;
}
interface Influencer {
  name: string;
  email: string;
  phone: string;
  category: string;
  audienceSize: string;
  country: string;
  gender: "Male" | "Female";
  platform: string;
  socialMedia: string;
  profileLink: string;
  audienceSplit: AudienceSplit;
  ageGroups: AgeGroup[];
  avatarUrl?: string;
  coverUrl?: string;
}

interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  performance: number;
}

const normaliseInfluencer = (raw: any): Influencer => ({
  name: raw.name,
  email: raw.email,
  phone: `${raw.callingcode} ${raw.phone}`,
  category: raw.categoryName?.join(", ") ?? "—",
  audienceSize: raw.audienceRange ?? "—",
  country: raw.county ?? "—",
  gender: raw.gender === 0 ? "Male" : "Female",
  platform: raw.platformName,
  profileLink: raw.profileLink,
  socialMedia: raw.socialMedia,
  audienceSplit: {
    male: raw.audienceBifurcation?.malePercentage ?? 0,
    female: raw.audienceBifurcation?.femalePercentage ?? 0,
  },
  ageGroups: [
    {
      label: raw.audienceAgeRange ?? "—",
      value: raw.audienceAgeRange ?? "—",
    },
  ],
  avatarUrl: raw.profileImage
    ? `${process.env.NEXT_PUBLIC_CDN ?? ""}${raw.profileImage}`
    : undefined,
  coverUrl: undefined,
});

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const influencerId = searchParams.get("id");

  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [previousCampaign, setPreviousCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!influencerId) {
      setLoading(false);
      setError("No influencer selected");
      return;
    }

    (async () => {
      try {
        const data = await get(`/influencer/getbyid`, { id: influencerId });
        setInfluencer(normaliseInfluencer(data));
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load influencer details. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [influencerId]);

  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (error || !influencer)
    return <div className="p-8 text-center text-red-500">{error}</div>;

  const {
    name,
    email,
    phone,
    category,
    audienceSize,
    country,
    gender,
    socialMedia,
    platform,
    profileLink,
    audienceSplit,
    ageGroups,
    avatarUrl,
    coverUrl,
  } = influencer;

  // Gender split data
  const genderData = [
    { name: "Male", value: audienceSplit.male },
    { name: "Female", value: audienceSplit.female },
  ];

  // Age‐range slice on a 0–100 scale:
  const [low, high] = (ageGroups[0]?.value || "0-0")
    .split("-")
    .map((n) => parseInt(n, 10));
  const before = low;
  const range = high - low;
  const after = 100 - high;
  const ageRangeData = [
    { name: `0–${low}`, value: before },
    { name: `${low}–${high}`, value: range },
    { name: `${high}–100`, value: after },
  ];
  // Define colors: only highlight the 18-24 slice
  const ageRangeColors = [DISABLED_COLOR, COLORS[0], DISABLED_COLOR];
  // Custom label for gender pie
  const renderGenderLabel = ({ percent, name }: { percent: number; name: string }) =>
    `${name}: ${(percent * 100).toFixed(0)}%`;

  return (
    <div className="h-full bg-gray-100">
      {/* Cover Photo & Avatar same as before */}
      <div className="h-48 bg-gray-300 relative fixed w-full">
        {coverUrl && <img src={coverUrl} className="w-full h-full object-cover" />}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 border-4 border-white rounded-full w-24 h-24 overflow-hidden bg-white">
          {avatarUrl ? (
            <img src={avatarUrl} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
              <UserPlus size={32} />
            </div>
          )}
        </div>
      </div>
      <div className="px-4 pt-16 pb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">{name}</h1>
        <p className="text-lg text-gray-600">
          {category} • {platform}
        </p>

        <div className="mt-4 flex justify-center items-center space-x-8">
          <Button
            size="lg"
            onClick={() => router.push(`/brand/hire-influencer?id=${influencerId}`)}
            className="cursor-pointer bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white px-8 py-4 text-xl"
          >
            Hire
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/brand/messages")}
            className="bg-white cursor-pointer border-gray-300 text-gray-700 flex items-center space-x-2 px-8 py-4"
          >
            <MessageCircle size={32} />
            <span className="text-xl">Message</span>
          </Button>
        </div>
      </div>


      {/* Stats Row */}
      <div className="mx-auto flex w-1/2 justify-center space-x-12 rounded-md bg-white py-4 shadow">
        <Stat label="Audience Size" value={audienceSize} />
        <Stat label="Audience Age" value={ageGroups[0]?.label ?? "—"} />
      </div>

      {/* Updated Charts Section */}
      <div className="mx-auto mt-8 w-8/10 space-y-8">
        <Card className="rounded-xl bg-white shadow-md">
          <CardContent className="space-y-6 p-6">
            <Detail
              label="Email"
              value={
                <a
                  href={`mailto:${email}`}
                  className="text-[#FF7236] hover:underline"
                >
                  {email}
                </a>
              }
            />
            <Detail label="Phone" value={phone} />
            <Detail label="Country" value={country} />
            <Detail label="Gender" value={gender} />
            {/* Profile Link */}
            <Detail
              label="Profile Link"
              value={
                <a
                  href={profileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF7236] hover:underline"
                >
                  {socialMedia}
                </a>
              }
            />

            {/* Chart Titles */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Gender Distribution
                </h3>
                <motion.div
                  className="w-full flex justify-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <ResponsiveContainer width={300} height={300}>
                    <PieChart>
                      <Pie
                        data={genderData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        label={renderGenderLabel}
                        labelLine={false}
                      >
                        {genderData.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Age Distribution (0–100)
                </h3>
                <motion.div
                  className="w-full flex justify-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <ResponsiveContainer width={300} height={300}>
                    <PieChart>
                      <Pie
                        data={ageRangeData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={-270}
                        labelLine={false}
                        label={({ index }) =>
                          index === 1 ? ageGroups[0]?.label : ""
                        }
                      >
                        {ageRangeData.map((_, idx) => (
                          <Cell key={idx} fill={ageRangeColors[idx]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </div>
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Age Distribution (0–100)
                </h3>
                <motion.div
                  className="w-full flex justify-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <ResponsiveContainer width={300} height={300}>
                    <PieChart>
                      <Pie
                        data={ageRangeData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={-270}
                        labelLine={false}
                        label={({ index }) =>
                          index === 1 ? ageGroups[0]?.label : ""
                        }
                      >
                        {ageRangeData.map((_, idx) => (
                          <Cell key={idx} fill={ageRangeColors[idx]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
          </CardContent>
        </Card>
      </div>
      <div className="mx-auto mt-8 w-8/10 space-y-8">

        {/* Previous Campaign Section */}
        {previousCampaign && (
          <Card className="rounded-xl bg-white shadow-md">
            <CardContent className="space-y-4 p-6">
              <h3 className="text-xl font-semibold text-gray-700">
                Previous Campaign
              </h3>
              <Detail label="Name" value={previousCampaign.name} />
              <Detail
                label="Duration"
                value={`${previousCampaign.startDate} – ${previousCampaign.endDate}`}
              />
              <Detail
                label="Performance"
                value={`${previousCampaign.performance}%`}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  router.push(`/campaign/details?id=${previousCampaign.id}`)
                }
              >
                View Campaign
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

const Stat: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="text-center">
    <div className="text-lg font-bold text-gray-800">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between">
    <span className="font-medium text-gray-500">{label}:</span>
    <span className="text-gray-800">{value}</span>
  </div>
);