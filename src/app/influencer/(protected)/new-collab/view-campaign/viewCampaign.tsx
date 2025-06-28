"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  HiOutlinePhotograph,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineDocument,
} from "react-icons/hi";
import { post } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import Swal from "sweetalert2";

interface CampaignData {
  _id: string;
  productOrServiceName: string;
  description: string;
  images: string[];
  targetAudience: {
    age: { MinAge: number; MaxAge: number };
    gender: number;
    location: string;
  };
  interestId: { _id: string; name: string }[];
  goal: string;
  budget: number;
  timeline: { startDate: string; endDate: string };
  creativeBriefText?: string;
  creativeBrief: string[];
  additionalNotes?: string;
  isActive: number;
  createdAt: string;
  campaignsId: string;
  isApplied: number;
}

export default function ViewCampaignPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No campaign ID provided.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await post<CampaignData>(`/campaign/checkApplied`, { campaignId: id, influencerId: localStorage.getItem('influencerId') });
        setCampaign(data);
      } catch (e) {
        console.error(e);
        setError("Failed to load campaign details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleApply = async () => {
    const influencerId = localStorage.getItem('influencerId');
    if (!influencerId) {
      return Swal.fire({ icon: 'warning', title: 'Not Logged In', text: 'Please log in to apply for this campaign.' });
    }

    try {
      // Use our axios-backed helper to send JSON data
      const result = await post<{ success: boolean; message: string }>(
        '/apply/campaign',
        {
          campaignId: campaign?.campaignsId,
          influencerId,
        }
      );

      if (result.message === "Application recorded") {
        Swal.fire({ icon: 'success', title: 'Success', text: result.message });
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: err.response.data.message || 'Failed to apply. Please try again later.' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="animate-pulse rounded-lg bg-gray-200 p-6 text-gray-500">Loading…</div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p className="rounded-lg bg-red-100 p-6 text-red-600">{error || "Campaign not found."}</p>
      </div>
    );
  }

  const c = campaign;
  const interests = c.interestId.map(i => i.name).join(", ");

  return (
    <div className="min-h-full p-8 bg-gray-50 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">Campaign Details</h1>
        <p className="mt-1 text-gray-600">
          Detailed view of <span className="font-medium">{c.productOrServiceName}</span>.
        </p>
{c.isApplied === 1 ? (
  <div className="flex justify-end">
    <span
      className="inline-block px-4 py-2 rounded-md border-2 border-[#ef2f5b] text-[#ef2f5b] bg-white cursor-default"
    >
      Already Applied
    </span>
  </div>
) : (
  <div className="flex justify-end">
    <Button
      onClick={handleApply}
      className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md"
    >
      Apply for Work
    </Button>
  </div>
)}

      </header>

      {/* Product Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <HiOutlinePhotograph className="h-6 w-6 text-indigo-500" /> Product Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Name</p>
              <p className="mt-1 text-gray-800">{c.productOrServiceName}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <p className="text-sm font-medium text-gray-600">Description</p>
              <p className="mt-1 whitespace-pre-wrap text-gray-800">{c.description}</p>
            </div>
            {c.images?.length > 0 && (
              <div className="md:col-span-3">
                <p className="text-sm font-medium text-gray-600">Images</p>
                <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {c.images.map((url, i) => (
                    <div key={i} className="relative h-36 rounded-lg overflow-hidden border">
                      <img src={url} alt={`img-${i}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <HiOutlineCalendar className="h-6 w-6 text-indigo-500" /> Target Audience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Age</p>
              <p className="mt-1 text-gray-800">
                {c.targetAudience.age.MinAge}–{c.targetAudience.age.MaxAge}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Gender</p>
              <p className="mt-1 text-gray-800">
                {c.targetAudience.gender === 0 ? "Female" : c.targetAudience.gender === 1 ? "Male" : "All"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Location</p>
              <p className="mt-1 text-gray-800">{c.targetAudience.location}</p>
            </div>
            <div className="md:col-span-3">
              <p className="text-sm font-medium text-gray-600">Interests</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {c.interestId.map(i => (
                  <Badge key={i._id} variant="outline" className="bg-indigo-50 text-indigo-700">
                    {i.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <HiOutlineCurrencyDollar className="h-6 w-6 text-indigo-500" /> Campaign Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Goal</p>
              <p className="mt-1 text-gray-800">{c.goal}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Budget</p>
              <p className="mt-1 text-gray-800">${c.budget.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger>
                  <HiOutlineCalendar className="h-5 w-5 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>Start Date</TooltipContent>
              </Tooltip>
              <p className="text-gray-800">{new Date(c.timeline.startDate).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger>
                  <HiOutlineCalendar className="h-5 w-5 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>End Date</TooltipContent>
              </Tooltip>
              <p className="text-gray-800">{new Date(c.timeline.endDate).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creative Brief & Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <HiOutlineDocument className="h-6 w-6 text-indigo-500" /> Creative Brief & Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {c.creativeBriefText && (
            <div>
              <p className="text-sm font-medium text-gray-600">Brief Text</p>
              <p className="whitespace-pre-wrap text-gray-800">{c.creativeBriefText}</p>
            </div>
          )}
          {c.creativeBrief.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600">Files</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {c.creativeBrief.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border bg-indigo-50 p-2 hover:bg-indigo-100"
                  >
                    <HiOutlineDocument className="h-5 w-5 text-indigo-600" />
                    <span className="truncate text-sm font-medium text-indigo-700">
                      {url.split("/").pop()}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
          <hr className="border-1" />
          {c.additionalNotes && (
            <div>
              <p className="text-xl font-medium text-gray-600">Additional Notes</p>
              <p className="whitespace-pre-wrap text-gray-800">{c.additionalNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}