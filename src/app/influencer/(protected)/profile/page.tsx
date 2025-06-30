"use client";

import React, { useState, useEffect } from "react";
import { get, post } from "@/lib/api";
import {
  HiUser,
  HiPhone,
  HiGlobe,
  HiMail,
  HiCheck,
  HiX,
} from "react-icons/hi";

interface SubscriptionFeature {
  key: string;
  limit: number;
  used: number;
}

interface InfluencerData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  socialMedia: string;
  county: string;
  callingcode: string;
  subscription: {
    planName: string;
    expiresAt: string;
    features: SubscriptionFeature[];
  };
  subscriptionExpired: boolean;
}

export default function InfluencerProfilePage() {
  const [influencer, setInfluencer] = useState<InfluencerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<Partial<InfluencerData>>({});

  useEffect(() => {
    const influencerId = localStorage.getItem("influencerId");
    if (!influencerId) {
      setError("Missing influencerId in localStorage");
      setLoading(false);
      return;
    }

    get<InfluencerData>(`/influencer/getbyid?id=${influencerId}`)
      .then((data) => {
        setInfluencer(data);
        setFormState({
          name: data.name,
          email: data.email,
          phone: data.phone,
          county: data.county,
        });
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to load influencer profile.");
      })
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    if (!influencer) return;
    try {
      const updated = await post<InfluencerData>(
        `/influencer?id=${localStorage.getItem("influencerId")}`,
        {
          name: formState.name,
          email: formState.email,
          phone: formState.phone,
          county: formState.county,
        }
      );
      setInfluencer(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile.");
    }
  };

  if (loading) return <Loader />;
  if (error) return <Error message={error} />;
  if (!influencer) return null;  // now TS knows influencer is non-null below

  const { name, email, phone, county, callingcode, subscription } = influencer;
  const formattedExpiry = new Date(subscription.expiresAt).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", year: "numeric" }
  );

  return (
    <section className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            Influencer Profile
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center bg-[#ef2f5b] text-white px-4 py-2 rounded-lg shadow hover:bg-pink-600 transition"
            >
              <HiUser className="mr-2" /> Edit Profile
            </button>
          )}
        </div>

        {/* Name */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-[#ef2f5b] text-white rounded-full p-3">
            <HiUser size={32} />
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input
                className="w-full text-2xl font-bold border-b-2 border-[#ef2f5b] focus:outline-none"
                value={formState.name ?? name}
                onChange={(e) =>
                  setFormState({ ...formState, name: e.target.value })
                }
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-800">{name}</h1>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Phone */}
          <div className="flex items-center bg-gray-50 p-4 rounded-lg">
            <HiPhone className="text-gray-500 mr-3" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Phone</p>
              {isEditing ? (
                <input
                  className="w-full text-gray-700 font-medium border-b-2 border-[#ef2f5b] focus:outline-none"
                  value={formState.phone ?? phone}
                  onChange={(e) =>
                    setFormState({ ...formState, phone: e.target.value })
                  }
                />
              ) : (
                <p className="text-gray-700 font-medium">
                  {callingcode}
                  {phone}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center bg-gray-50 p-4 rounded-lg">
            <HiMail className="text-gray-500 mr-3" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Email</p>
              {isEditing ? (
                <input
                  className="w-full text-gray-700 font-medium border-b-2 border-[#ef2f5b] focus:outline-none"
                  value={formState.email ?? email}
                  onChange={(e) =>
                    setFormState({ ...formState, email: e.target.value })
                  }
                />
              ) : (
                <p className="text-gray-700 font-medium">{email}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div className="flex items-center bg-gray-50 p-4 rounded-lg">
            <HiGlobe className="text-gray-500 mr-3" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Country</p>
              {isEditing ? (
                <input
                  className="w-full text-gray-700 font-medium border-b-2 border-[#ef2f5b] focus:outline-none"
                  value={formState.county ?? county}
                  onChange={(e) =>
                    setFormState({ ...formState, county: e.target.value })
                  }
                />
              ) : (
                <p className="text-gray-700 font-medium">{county}</p>
              )}
            </div>
          </div>
        </div>

        {/* Subscription */}
        {!isEditing && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Subscription Details
              </h3>
              <p className="text-sm text-gray-500">Expires {formattedExpiry}</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Plan</span>
                <span className="font-medium text-gray-700">
                  {subscription.planName}
                </span>
              </div>
              <div className="space-y-2">
                {subscription.features.map((feat) => {
                  const pct = (feat.used / feat.limit) * 100;
                  return (
                    <div key={feat.key}>
                      <div className="flex justify-between text-sm">
                        <span className="capitalize text-gray-700">
                          {feat.key.replace(/_/g, " ")}
                        </span>
                        <span className="text-gray-600">
                          {feat.used}/{feat.limit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#ef2f5b] h-2 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-end space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                <HiX className="mr-1" /> Cancel
              </button>
              <button
                onClick={saveProfile}
                className="flex items-center px-4 py-2 bg-[#ef2f5b] text-white rounded-lg hover:bg-pink-600 transition"
              >
                <HiCheck className="mr-1" /> Save Changes
              </button>
            </>
          ) : (
            <>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                Upgrade Subscription
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                Cancel Subscription
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center h-full py-20">
      <span className="text-gray-500">Loading profile…</span>
    </div>
  );
}

function Error({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full py-20">
      <span className="text-red-500">{message}</span>
    </div>
  );
}
