"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css";

import {
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlinePlus,
  HiOutlinePhotograph,
} from "react-icons/hi";
import dynamic from "next/dynamic";
import { get, post } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

// shadcn/ui components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// floating-label text input
import { FloatingLabelInput } from "@/components/common/FloatingLabelInput";

// dynamic react-select for interests
const ReactSelect = dynamic(() => import("react-select"), { ssr: false });

type GenderOption = "Male" | "Female" | "All";
const GENDER_OPTIONS: GenderOption[] = ["Male", "Female", "All"];

interface InterestOption {
  _id: string;
  name: string;
}

// payload returned when editing
interface CampaignEditPayload {
  productOrServiceName: string;
  description: string;
  images: string[];  // array of image URLs
  targetAudience: {
    age: { MinAge: number; MaxAge: number };
    gender: 0 | 1 | 2;
    location: string;
  };
  interestId: { _id: string; name: string }[];
  goal: string;
  budget: number;
  timeline: { startDate: string; endDate: string };
  creativeBriefText: string;
  additionalNotes: string;
}

export default function CampaignFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("id");
  const isEditMode = Boolean(campaignId);

  // ── state ─────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [ageRange, setAgeRange] = useState<{ min: number | ""; max: number | "" }>({ min: "", max: "" });
  const [selectedGender, setSelectedGender] = useState<GenderOption | "">("");
  const [location, setLocation] = useState("");
  const [interestOptions, setInterestOptions] = useState<InterestOption[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<{ value: string; label: string }[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [budget, setBudget] = useState<number | "">("");
  const [timeline, setTimeline] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [creativeBriefText, setCreativeBriefText] = useState("");
  const [creativeBriefFiles, setCreativeBriefFiles] = useState<File[]>([]);
  const [useFileUploadForBrief, setUseFileUploadForBrief] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── fetch interest options ─────────────────────────────────
  useEffect(() => {
    get<InterestOption[]>("/interest/getlist")
      .then((opts) => setInterestOptions(opts))
      .catch(console.error);
  }, []);

  // ── fetch campaign data if editing ─────────────────────────
  useEffect(() => {
    if (!isEditMode || !campaignId || interestOptions.length === 0) return;
    setIsLoading(true);

    get<CampaignEditPayload>(`/campaign/id?id=${campaignId}`)
      .then((data) => {
        // 1. Basic fields
        setProductName(data.productOrServiceName);
        setDescription(data.description);
        setAdditionalNotes(data.additionalNotes);
        setCreativeBriefText(data.creativeBriefText);

        // 2. Existing images
        setExistingImages(data.images || []);

        // 3. Audience
        setAgeRange({
          min: data.targetAudience.age.MinAge,
          max: data.targetAudience.age.MaxAge,
        });
        setSelectedGender(
          data.targetAudience.gender === 0
            ? "Male"
            : data.targetAudience.gender === 1
              ? "Female"
              : "All"
        );
        setLocation(data.targetAudience.location);

        // 4. Interests → ReactSelect options
        setSelectedInterests(
          data.interestId.map((i) => ({ value: i._id, label: i.name }))
        );

        // 5. Goal & Budget
        setSelectedGoal(data.goal);
        setBudget(data.budget);

        // 6. Timeline (YYYY-MM-DD)
        setTimeline({
          start: data.timeline.startDate.split("T")[0],
          end: data.timeline.endDate.split("T")[0],
        });
      })
      .catch((err) => console.error("Failed to load campaign for editing", err))
      .finally(() => setIsLoading(false));
  }, [isEditMode, campaignId, interestOptions]);

  // ── toast helper with gradient icon ─────────────────────────
  const toast = (opts: {
    icon: "success" | "error" | "warning" | "info";
    title: string;
    text?: string;
  }) =>
    Swal.fire({
      ...opts,
      showConfirmButton: false,
      timer: 1200,
      timerProgressBar: true,
      background: "white",
      customClass: {
        icon: `
          bg-gradient-to-r from-[#FFA135] to-[#FF7236]
          bg-clip-text text-transparent
        `,
        popup: "rounded-lg border border-gray-200",
      },
    });

  // ── handlers & reset ───────────────────────────────────────
  const handleProductImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setProductImages(Array.from(e.target.files));
  };
  const handleCreativeBriefFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setCreativeBriefFiles(Array.from(e.target.files));
  };
  const resetForm = () => {
    setProductName("");
    setDescription("");
    setExistingImages([]);
    setProductImages([]);
    setAgeRange({ min: "", max: "" });
    setSelectedGender("");
    setLocation("");
    setSelectedInterests([]);
    setSelectedGoal("");
    setBudget("");
    setTimeline({ start: "", end: "" });
    setCreativeBriefText("");
    setCreativeBriefFiles([]);
    setUseFileUploadForBrief(false);
    setAdditionalNotes("");
  };

  // ── submit ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // validation...
    if (
      !productName.trim() ||
      !description.trim() ||
      ageRange.min === "" ||
      ageRange.max === "" ||
      !selectedGender ||
      !location.trim() ||
      !selectedInterests.length ||
      !selectedGoal ||
      budget === "" ||
      !timeline.start ||
      !timeline.end ||
      (!creativeBriefText.trim() && !useFileUploadForBrief)
    ) {
      return toast({ icon: "error", title: "Missing Fields", text: "Complete all required fields." });
    }
    if (Number(ageRange.min) > Number(ageRange.max)) {
      return toast({ icon: "error", title: "Invalid Age Range", text: "Min Age cannot exceed Max Age." });
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("productOrServiceName", productName.trim());
      formData.append("description", description.trim());
      formData.append(
        "targetAudience",
        JSON.stringify({
          age: { MinAge: ageRange.min, MaxAge: ageRange.max },
          gender:
            selectedGender === "Male" ? 0 : selectedGender === "Female" ? 1 : 2,
          location: location.trim(),
        })
      );
      formData.append("interestId", JSON.stringify(selectedInterests.map((i) => i.value)));
      formData.append("additionalNotes", additionalNotes.trim());
      formData.append("brandId", localStorage.getItem("brandId") || "");
      formData.append("goal", selectedGoal);
      formData.append("budget", String(budget));
      formData.append(
        "timeline",
        JSON.stringify({ startDate: timeline.start, endDate: timeline.end })
      );

      // only append new uploads; existingImages remain untouched
      productImages.forEach((f) => formData.append("image", f));
      if (useFileUploadForBrief) {
        creativeBriefFiles.forEach((f) => formData.append("creativeBrief", f));
      } else {
        formData.append("creativeBriefText", creativeBriefText.trim());
      }

      if (isEditMode && campaignId) {
        await post(`/campaign/update?id=${campaignId}`, formData);
        toast({ icon: "success", title: "Campaign Updated" });
      } else {
        await post("/campaign/create", formData);
        toast({ icon: "success", title: "Campaign Created" });
      }

      router.push("/brand/created-campaign");
      resetForm();
    } catch (err: any) {
      toast({ icon: "error", title: "Error", text: err?.response?.data?.message || "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── react-select styles ────────────────────────────────────
  const selectStyles = {
    control: (base: any) => ({ ...base, minHeight: 40, borderColor: "#E2E8F0", boxShadow: "none" }),
    option: (base: any, { isFocused }: any) => ({ ...base, background: isFocused ? "#F1F5F9" : "white" }),
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-20">Loading campaign data...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">
        {isEditMode ? "Edit Campaign" : "Create New Campaign"}
      </h1>

      <div
        className="space-y-10 bg-white p-8 rounded-lg shadow-sm border border-gray-200"
      >
        {/* Section 1: Product / Service Info */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900">
              Product / Service Info
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-8">
            <FloatingLabelInput
              id="productName"
              label="Product / Service Name"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />

            <div>
              <Label htmlFor="description" className="text-sm text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Briefly describe your product or service"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid w-full max-w-sm gap-3">
              <Label htmlFor="productImages">Upload Product Images</Label>
              <Input
                id="productImages"
                type="file"
                accept="image/*"
                multiple
                onChange={handleProductImages}
              />

              {/* show existing images */}
              {existingImages.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-4">
                  {existingImages.map((url, idx) => (
                    <img
                      key={`existing-${idx}`}
                      src={url}
                      alt={`Existing image ${idx + 1}`}
                      className="h-24 w-full object-cover rounded-md border"
                    />
                  ))}
                </div>
              )}

              {/* show newly picked files */}
              {productImages.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-4">
                  {productImages.map((file, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-24 w-full object-cover rounded-md border"
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Target Audience */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900">
              Target Audience
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-8">
            <FloatingLabelInput
              id="ageMin"
              label="Min Age"
              type="number"
              value={ageRange.min}
              onChange={e =>
                setAgeRange({ ...ageRange, min: e.target.value === "" ? "" : +e.target.value })
              }
              required
            />
            <FloatingLabelInput
              id="ageMax"
              label="Max Age"
              type="number"
              value={ageRange.max}
              onChange={e =>
                setAgeRange({ ...ageRange, max: e.target.value === "" ? "" : +e.target.value })
              }
              required
            />

            <div className="grid w-full max-w-sm gap-3">
              <select
                value={selectedGender}
                onChange={e => setSelectedGender(e.target.value as GenderOption)}
                required
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#FFA135]"
              >
                <option value="" disabled>
                  Select gender
                </option>
                {GENDER_OPTIONS.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <FloatingLabelInput
              id="location"
              label="Location"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
            />

            <div className="sm:col-span-2">
              <Label className="text-sm text-gray-700">Interests & Categories</Label>
              <ReactSelect
                isMulti
                styles={selectStyles}
                options={interestOptions.map(o => ({ value: o._id, label: o.name }))}
                value={selectedInterests}
                onChange={v => setSelectedInterests(v as any[])}
                placeholder="Select one or more..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Campaign Details */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900">
              Campaign Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-8">
            <div>
              <Label className="text-sm text-gray-700">Goal</Label>
              <select
                value={selectedGoal}
                onChange={e => setSelectedGoal(e.target.value)}
                required
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#FFA135]"
              >
                <option value="" disabled>
                  Pick a goal
                </option>
                {["Brand Awareness", "Sales", "Engagement"].map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-sm text-gray-700">Budget (USD)</Label>
              <div className="mt-1 flex rounded-md border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-[#FFA135]">
                <span className="inline-flex items-center bg-gray-100 px-3 text-gray-600">
                  <HiOutlineCurrencyDollar />
                </span>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 5000"
                  value={budget}
                  onChange={e => setBudget(e.target.value === "" ? "" : +e.target.value)}
                  className="w-full border-none py-2 px-3 focus:outline-none text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-sm text-gray-700">Start Date</Label>
              <div className="mt-1 relative focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-[#FFA135] rounded-md overflow-hidden">
                <HiOutlineCalendar className="absolute left-3 top-2 text-gray-400" />
                <input
                  type="date"
                  value={timeline.start}
                  onChange={e => setTimeline({ ...timeline, start: e.target.value })}
                  className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-3 text-gray-900 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-sm text-gray-700">End Date</Label>
              <div className="mt-1 relative focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-[#FFA135] rounded-md overflow-hidden">
                <HiOutlineCalendar className="absolute left-3 top-2 text-gray-400" />
                <input
                  type="date"
                  value={timeline.end}
                  onChange={e => setTimeline({ ...timeline, end: e.target.value })}
                  className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-3 text-gray-900 focus:outline-none"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Creative Brief & Notes */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900">
              Creative Brief & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex space-x-4">
              <Button
                size="sm"
                variant={useFileUploadForBrief ? "outline" : "default"}
                onClick={() => setUseFileUploadForBrief(false)}
              >
                <HiOutlinePlus className="mr-2" /> Write Brief
              </Button>
              <Button
                size="sm"
                variant={useFileUploadForBrief ? "default" : "outline"}
                onClick={() => setUseFileUploadForBrief(true)}
              >
                <HiOutlinePhotograph className="mr-2" /> Upload Files
              </Button>
            </div>

            {useFileUploadForBrief ? (
              <div className="grid w-full max-w-sm gap-3">
                <Label htmlFor="creativeBriefFiles">Upload Creative Brief</Label>
                <Input
                  id="creativeBriefFiles"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  onChange={handleCreativeBriefFiles}
                />
                {creativeBriefFiles.length > 0 && (
                  <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                    {creativeBriefFiles.map((file, idx) => (
                      <li key={idx}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div>
                <Label htmlFor="briefText" className="text-sm text-gray-700">
                  Creative Brief
                </Label>
                <Textarea
                  id="briefText"
                  rows={4}
                  placeholder="Outline key messaging"
                  value={creativeBriefText}
                  onChange={e => setCreativeBriefText(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="additionalNotes" className="text-sm text-gray-700">
                Additional Notes
              </Label>
              <Textarea
                id="additionalNotes"
                rows={3}
                placeholder="Any extra comments"
                value={additionalNotes}
                onChange={e => setAdditionalNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between space-x-4 pt-4">
          <div className="flex justify-start space-x-4 pt-4">
            <Button className="bg-gray-200" size="lg" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Back
            </Button>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <Button size="lg" variant="outline" onClick={resetForm} disabled={isSubmitting}>
              Reset
            </Button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`
              inline-flex items-center justify-center
              bg-gradient-to-r from-[#FFA135] to-[#FF7236]
              text-white font-semibold
              px-6 py-2 rounded-lg
              transition-transform duration-200
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              `}
            >
              {isSubmitting ? 'Submitting…' : isEditMode ? 'Update Campaign' : 'Create Campaign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
