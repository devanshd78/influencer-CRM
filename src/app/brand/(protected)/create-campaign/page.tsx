// app/brand/dashboard/create/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css";

import {
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlinePlus,
  HiOutlinePhotograph,
  HiOutlineDocument,
} from "react-icons/hi";
import dynamic from "next/dynamic";
import { StylesConfig } from "react-select";
import { get, post } from "@/lib/api";

// shadcn/ui components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// floating-label text input
import { FloatingLabelInput } from "@/components/common/FloatingLabelInput";
import { useRouter } from "next/navigation";

// dynamic react-select for interests
const ReactSelect = dynamic(() => import("react-select"), { ssr: false });

type GenderOption = "Male" | "Female" | "All";
const GENDER_OPTIONS: GenderOption[] = ["Male", "Female", "All"];
const GOAL_OPTIONS = ["Brand Awareness", "Sales", "Engagement"];

interface InterestOption { _id: string; name: string; }

export default function CreateCampaignPage() {
  const router = useRouter();
  // ─── state ─────────────────────────────────────────────────
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [productImages, setProductImages] = useState<File[]>([]);
  const [ageRange, setAgeRange] = useState<{ min: number | ""; max: number | "" }>({ min: "", max: "" });
  const [selectedGender, setSelectedGender] = useState<GenderOption | "">("");
  const [location, setLocation] = useState("");
  const [interestOptions, setInterestOptions] = useState<InterestOption[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<any[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [budget, setBudget] = useState<number | "">("");
  const [timeline, setTimeline] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [creativeBriefText, setCreativeBriefText] = useState("");
  const [creativeBriefFiles, setCreativeBriefFiles] = useState<File[]>([]);
  const [useFileUploadForBrief, setUseFileUploadForBrief] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── fetch interest options ─────────────────────────────────
  useEffect(() => {
    get<InterestOption[]>("/interest/getlist")
      .then(setInterestOptions)
      .catch(console.error);
  }, []);

  // ─── handlers & reset ───────────────────────────────────────
  const handleProductImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setProductImages(Array.from(e.target.files));
  };
  const handleCreativeBriefFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setCreativeBriefFiles(Array.from(e.target.files));
  };
  const resetForm = () => {
    setProductName("");
    setDescription("");
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

  // ─── submit ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // validation
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
      return Swal.fire({
        icon: "error",
        title: "Missing Fields",
        text: "Please complete all required fields.",
      });
    }
    if (Number(ageRange.min) > Number(ageRange.max)) {
      return Swal.fire({
        icon: "error",
        title: "Invalid Age Range",
        text: "Min Age cannot exceed Max Age.",
      });
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
          gender: selectedGender,
          location: location.trim(),
        })
      );
      formData.append("interestId", JSON.stringify(selectedInterests.map(i => i.value)));
      formData.append("additionalNotes", additionalNotes.trim());
      formData.append("brandId", localStorage.getItem("brandId") || "");
      formData.append("goal", selectedGoal);
      formData.append("budget", String(budget));
      formData.append("timeline", JSON.stringify({ startDate: timeline.start, endDate: timeline.end }));
      productImages.forEach(f => formData.append("image", f));
      if (useFileUploadForBrief) {
        creativeBriefFiles.forEach(f => formData.append("creativeBrief", f));
      } else {
        formData.append("creativeBriefText", creativeBriefText.trim());
      }

      await post("/campaign/create", formData);
      await Swal.fire({ icon: "success", title: "Campaign Created", text: "Successfully created." });
      router.push("/brand/active-campaign");
      resetForm();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err.message || "Try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── react-select styles ────────────────────────────────────
  const selectStyles: StylesConfig<any, boolean> = {
    control: base => ({ ...base, minHeight: 40, borderColor: "#E2E8F0", boxShadow: "none" }),
    option: (base, { isFocused }) => ({ ...base, background: isFocused ? "#F1F5F9" : "white" }),
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-medium text-gray-900 mb-8">Create New Campaign</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-10 bg-white p-6 rounded-lg border border-gray-200"
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
              onChange={e => setProductName(e.target.value)}
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
                onChange={e => setDescription(e.target.value)}
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
              {productImages.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-4">
                  {productImages.map((file, idx) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <img
                        key={idx}
                        src={url}
                        alt={file.name}
                        className="h-24 w-full object-cover rounded-md border"
                      />
                    );
                  })}
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
                id="gender"
                value={selectedGender}
                onChange={e => setSelectedGender(e.target.value as GenderOption)}
                required
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
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
            <div className="grid w-full max-w-sm gap-3">
              <Label htmlFor="goal">Goal</Label>
              <select
                id="goal"
                value={selectedGoal}
                onChange={e => setSelectedGoal(e.target.value)}
                required
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Pick a goal
                </option>
                {GOAL_OPTIONS.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="budget" className="text-sm text-gray-700">
                Budget (USD)
              </Label>
              <div className="mt-1 flex rounded-md border border-gray-300 overflow-hidden">
                <span className="inline-flex items-center bg-gray-100 px-3 text-gray-600">
                  <HiOutlineCurrencyDollar />
                </span>
                <input
                  id="budget"
                  type="number"
                  min={0}
                  placeholder="e.g. 5000"
                  value={budget}
                  onChange={e => setBudget(e.target.value === "" ? "" : +e.target.value)}
                  className="w-full border-none py-2 px-3 focus:ring-0 text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-sm text-gray-700">Start Date</Label>
              <div className="mt-1 relative">
                <HiOutlineCalendar className="absolute left-3 top-2 text-gray-400" />
                <input
                  type="date"
                  value={timeline.start}
                  onChange={e => setTimeline({ ...timeline, start: e.target.value })}
                  className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-sm text-gray-700">End Date</Label>
              <div className="mt-1 relative">
                <HiOutlineCalendar className="absolute left-3 top-2 text-gray-400" />
                <input
                  type="date"
                  value={timeline.end}
                  onChange={e => setTimeline({ ...timeline, end: e.target.value })}
                  className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
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
        <div className="flex justify-end space-x-4 pt-4">
          <Button size="sm" variant="outline" onClick={resetForm} disabled={isSubmitting}>
            Reset
          </Button>
          <Button
            size="sm"
            type="submit"
            disabled={isSubmitting}
            className="
      bg-[#EF2F5B] text-white
      hover:bg-[#D32D53]
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EF2F5B]
      transition
    "
          >
            {isSubmitting ? "Submitting…" : "Create Campaign"}
          </Button>
        </div>

      </form>
    </div>
  );
}
