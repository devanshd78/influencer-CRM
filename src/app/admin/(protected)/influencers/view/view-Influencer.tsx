"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { get } from "@/lib/api";
import {
  HiChevronLeft,
  HiCheckCircle,
  HiXCircle,
  HiOutlineMail,
  HiPhone,
  HiOutlineUser,
  HiOutlineGlobeAlt,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscriptionFeature {
  key: string;
  limit: number;
  used: number;
}

interface InfluencerDetail {
  influencerId: string;
  name: string;
  email: string;
  callingcode?: string;
  phone?: string;
  socialMedia: string;
  categoryName: string;
  audienceRange: string;
  bio?: string;
  createdAt: string;
  updatedAt?: string;
  subscription: {
    planName: string;
    startedAt: string;
    expiresAt: string;
    features: SubscriptionFeature[];
  };
  subscriptionExpired: boolean;
}

export default function ViewInfluencerPage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("influencerId");

  const [influencer, setInfluencer] = useState<InfluencerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfluencer = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const resp = await get<{ influencer: InfluencerDetail }>(
          "/admin/influencer/getById",
          { id }
        );
        setInfluencer(resp.influencer);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load influencer.");
      } finally {
        setLoading(false);
      }
    };
    fetchInfluencer();
  }, [id]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
      >
        <HiChevronLeft className="h-5 w-5" />
        <span>Back to Influencers</span>
      </Button>

      {/* Loading/Error */}
      {loading ? (
        <Card className="p-6 animate-pulse space-y-4">
          <Skeleton className="h-8 w-2/5" />
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-6 w-full" />
        </Card>
      ) : error ? (
        <Card className="p-6 text-red-600">Error: {error}</Card>
      ) : influencer ? (
        <>
          {/* Profile Section */}
          <Card className="p-6 bg-white shadow-md rounded-lg grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex justify-center md:justify-start">
              <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl text-gray-500">
                <HiOutlineUser />
              </div>
            </div>
            <div className="md:col-span-2 space-y-3">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                {influencer.name}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    influencer.subscriptionExpired
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {influencer.subscriptionExpired ? "Expired" : "Active"}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 text-gray-700">
                  <p className="flex items-center gap-2">
                    <HiOutlineMail className="h-5 w-5" />
                    {influencer.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <HiPhone className="h-5 w-5" />
                    {influencer.callingcode} {influencer.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <HiOutlineGlobeAlt className="h-5 w-5" />
                    {influencer.socialMedia}
                  </p>
                </div>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Category:</strong> {influencer.categoryName}</p>
                  <p><strong>Audience:</strong> {influencer.audienceRange}</p>
                  <p><strong>Joined:</strong> {formatDate(influencer.createdAt)}</p>
                  {influencer.updatedAt && (
                    <p><strong>Updated:</strong> {formatDate(influencer.updatedAt)}</p>
                  )}
                </div>
              </div>
              {influencer.bio && (
                <p className="mt-4 text-gray-700 italic">"{influencer.bio}"</p>
              )}
            </div>
          </Card>

          {/* Subscription Section */}
          <Card className="p-6 bg-white shadow-md rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-gray-900">Subscription</h3>
              <span className="px-4 py-1 bg-blue-50 text-blue-800 rounded-full font-medium">
                {influencer.subscription.planName}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 mb-6">
              <p><strong>Started:</strong> {formatDate(influencer.subscription.startedAt)}</p>
              <p><strong>Expires:</strong> {formatDate(influencer.subscription.expiresAt)}</p>
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
                {influencer.subscription.features.map((f, idx) => (
                  <TableRow key={f.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <TableCell className="capitalize py-2 text-gray-800">
                      {f.key.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell className="py-2 text-gray-800">{f.limit}</TableCell>
                    <TableCell className="py-2 text-gray-800">{f.used}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      ) : null}
    </div>
  );
}