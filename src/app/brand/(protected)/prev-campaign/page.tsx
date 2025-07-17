"use client";

import React, { useEffect, useState } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import {
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineChevronDown,
} from "react-icons/hi";
import { get } from "@/lib/api";

interface CampaignData {
  _id: string;
  brandName: string;
  productOrServiceName: string;
  description: string;
  images: string[];
  targetAudience: {
    age: { MinAge: number; MaxAge: number };
    gender: number;
    location: string;
    _id: string;
  };
  interestId: { _id: string; name: string }[];
  goal: string;
  budget: number;
  timeline: { startDate: string; endDate: string };
  creativeBriefText?: string;
  creativeBrief: string[];
  additionalNotes?: string;
  isActive: number;
  campaignsId: string;
  createdAt: string;
}

export default function PrevCampaignPage() {
  const [brandId, setBrandId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load brandId
  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("brandId") : null;
    if (!stored) {
      setError("No brandId found in localStorage.");
      setLoading(false);
    } else {
      setBrandId(stored);
    }
  }, []);

  // Fetch previous campaigns
  useEffect(() => {
    if (!brandId) return;
    (async () => {
      try {
        const data: CampaignData[] = await get("/campaign/previous", {
          brandId,
        });
        const arr = Array.isArray(data) ? data : [];
        setCampaigns(
          arr
            .filter((c) => c.isActive === 0)
            .sort(
              (a, b) =>
                new Date(b.timeline.endDate).getTime() -
                new Date(a.timeline.endDate).getTime()
            )
        );
      } catch (e) {
        console.error(e);
        setError("Failed to load previous campaigns.");
      } finally {
        setLoading(false);
      }
    })();
  }, [brandId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse rounded-lg bg-gray-200 p-6 text-gray-500">
          Loading previous campaigns…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="rounded-lg bg-red-100 p-6 text-red-600">{error}</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-700 text-2xl">No Previous Campaigns</p>
      </div>
    );
  }

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 sm:mb-8 lg:mb-10 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Previous Campaigns
        </h1>
        <p className="mt-1 text-sm sm:text-base text-gray-600">
          A timeline of all completed or paused campaigns.
        </p>
      </header>

      <div className="relative border-l-2 border-gray-200">
        {campaigns.map((c, idx) => (
          <TimelineItem
            key={c._id}
            campaign={c}
            isLast={idx === campaigns.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function TimelineItem({
  campaign: c,
  isLast,
}: {
  campaign: CampaignData;
  isLast: boolean;
}) {
  const interests = c.interestId.map((i) => i.name).join(", ");
  const shortDesc =
    c.description.length > 60
      ? c.description.slice(0, 60) + "…"
      : c.description;

  return (
    <Disclosure as="div" className="mb-6 sm:mb-8 ml-4 sm:ml-8 lg:ml-12">
      {({ open }) => (
        <>
          {/* Dot marker */}
          <span
            className={`absolute ${
              open ? "animate-pulse" : ""
            } -left-4 sm:-left-5 lg:-left-6 bg-indigo-500 h-4 w-4 rounded-full`}
          />

          {/* Header */}
          <Disclosure.Button className="flex flex-col sm:flex-row sm:justify-between sm:items-start w-full bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <div className="space-y-1 flex-1">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                {c.productOrServiceName}{" "}
                <span className="text-xs sm:text-sm text-gray-500 font-normal">
                  ({new Date(c.timeline.endDate).toLocaleDateString()})
                </span>
              </h3>
              <p className="text-sm text-gray-600">{shortDesc}</p>
              <p className="text-xs text-gray-500">
                Interests: {interests || "—"}
              </p>
              <p className="text-xs text-gray-500">Goal: {c.goal}</p>
            </div>
            <HiOutlineChevronDown
              className={`mt-2 sm:mt-0 sm:ml-4 h-5 w-5 text-indigo-500 transform transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </Disclosure.Button>

          {/* Detail panel */}
          <Transition
            enter="transition duration-200 ease-out"
            enterFrom="opacity-0 max-h-0"
            enterTo="opacity-100 max-h-screen"
            leave="transition duration-150 ease-in"
            leaveFrom="opacity-100 max-h-screen"
            leaveTo="opacity-0 max-h-0"
          >
            <Disclosure.Panel className="mt-4 pl-4 sm:pl-6 lg:pl-8 border-l border-gray-200 space-y-6">
              {/* Dates & Budget Section */}
              <section>
                <h4 className="text-sm sm:text-base font-semibold text-gray-700 uppercase mb-2">
                  Dates & Budget
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <HiOutlineCalendar className="h-5 w-5" />
                    <span>
                      {new Date(c.timeline.startDate).toLocaleDateString()} —{" "}
                      {new Date(c.timeline.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiOutlineCurrencyDollar className="h-5 w-5" />
                    <span>${c.budget.toLocaleString()}</span>
                  </div>
                </div>
                <hr className="border-gray-200 my-4" />
              </section>

              {/* Description Section */}
              <section>
                <h4 className="text-sm sm:text-base font-semibold text-gray-700 uppercase mb-2">
                  Description
                </h4>
                <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap">
                  {c.description}
                </p>
                <hr className="border-gray-200 my-4" />
              </section>

              {/* Creative Brief Text Section */}
              {c.creativeBriefText && (
                <section>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-700 uppercase mb-2">
                    Brief Text
                  </h4>
                  <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap">
                    {c.creativeBriefText}
                  </p>
                  <hr className="border-gray-200 my-4" />
                </section>
              )}

              {/* Creative Files Section */}
              {c.creativeBrief.length > 0 && (
                <section>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-700 uppercase mb-2">
                    Brief Files
                  </h4>
                  <ul className="list-disc list-inside text-sm sm:text-base text-indigo-600 space-y-1">
                    {c.creativeBrief.map((url, i) => (
                      <li key={i}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {url.split("/").pop()}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <hr className="border-gray-200 my-4" />
                </section>
              )}

              {/* Additional Notes Section */}
              {c.additionalNotes && (
                <section>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-700 uppercase mb-2">
                    Notes
                  </h4>
                  <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap">
                    {c.additionalNotes}
                  </p>
                </section>
              )}
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}
