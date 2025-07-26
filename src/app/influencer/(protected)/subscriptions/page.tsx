"use client";

import React, { useState, useEffect } from "react";
import { get, post } from "@/lib/api";
import {
  HiCheckCircle,
  HiXCircle,
  HiCreditCard,
  HiCheck,
} from "react-icons/hi";

interface Feature {
  key: string;
  value: number;
}
interface Plan {
  planId: string;
  name: string;
  monthlyCost: number;
  features: Feature[];
  featured?: boolean;
}

interface InfluencerData {
  subscription: {
    planName: string;
    expiresAt: string;
  };
}

type PaymentStatus = "idle" | "processing" | "success" | "failed";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const prettifyKey = (key: string) =>
  key
    .split("_")
    .map((k) => capitalize(k))
    .join(" ");

function loadScript(src: string): Promise<boolean> {
  return new Promise((res) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => res(true);
    script.onerror = () => res(false);
    document.body.appendChild(script);
  });
}

export default function InfluencerSubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>("idle");
  const [paymentMessage, setPaymentMessage] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const { plans: fetched } = await post<{ plans: Plan[] }>(
          "/subscription/list",
          { role: "Influencer" }
        );
        setPlans(fetched);

        const influencerId = localStorage.getItem("influencerId");
        if (influencerId) {
          const { subscription } = await get<InfluencerData>(
            `/influencer/getbyid?id=${influencerId}`
          );
          setCurrentPlan(subscription.planName);
          setExpiresAt(subscription.expiresAt);
        }
      } catch (e) {
        console.error("Failed to load subscription info", e);
        setPaymentStatus("failed");
        setPaymentMessage("Unable to load subscription info.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (paymentStatus === "success") {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  const handleSelect = async (plan: Plan) => {
    if (processing || plan.name === currentPlan) return;
    setProcessing(plan.name);
    setPaymentStatus("processing");
    setPaymentMessage("");

    const sdkLoaded = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!sdkLoaded) {
      setPaymentStatus("failed");
      setPaymentMessage(
        "Payment SDK failed to load. Check your connection."
      );
      setProcessing(null);
      return;
    }

    const influencerId = localStorage.getItem("influencerId");
    try {
      const { order } = await post<any>("/payment/Order", {
        planId: plan.planId,
        amount: plan.monthlyCost,
        userId: influencerId,
        role: "Influencer",
      });
      const { id: orderId, amount, currency } = order;

      const options = {
        key: "rzp_test_2oIQzZ7i0uQ6sn",
        amount,
        currency,
        name: "Your Company",
        description: `${capitalize(plan.name)} Plan`,
        order_id: orderId,
        handler: async (resp: any) => {
          try {
            await post("/payment/verify", {
              ...resp,
              planId: plan.planId,
              userId: influencerId,
            });
            await post("/subscription/assign", {
              userType: "Influencer",
              userId: influencerId,
              planId: plan.planId,
            });
            setCurrentPlan(plan.name);
            const newExpiry = new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString();
            setExpiresAt(newExpiry);
            setPaymentStatus("success");
            setPaymentMessage("Subscription updated successfully!");
          } catch (err) {
            console.error("Subscription assignment failed", err);
            setPaymentStatus("failed");
            setPaymentMessage(
              "Payment verified but failed to assign subscription."
            );
          }
        },
        prefill: { name: "", email: "", contact: "" },
        theme: { color: "#FFBF00" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (failure: any) => {
        console.error("Payment failure:", failure.error);
        setPaymentStatus("failed");
        setPaymentMessage(
          `Payment Failed: ${failure.error.description}`
        );
      });
      rzp.open();
    } catch (err) {
      console.error("Order creation failed:", err);
      setPaymentStatus("failed");
      setPaymentMessage("Failed to initiate payment. Try again later.");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <HiCreditCard className="animate-spin text-4xl bg-clip-text text-transparent bg-gradient-to-r from-[#FFBF00] to-[#FFDB58]" />
        <span className="ml-3">Loading plans…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-4">
          Choose Your Influencer Plan
        </h2>

        {currentPlan && expiresAt && (
          <div className="text-center mb-8">
            <span className="font-medium text-gray-700">
              Current plan:
            </span>{" "}
            <span className="font-semibold text-gray-900">
              {capitalize(currentPlan)}
            </span>{" "}
            <span className="text-gray-500">
              (expires on{" "}
              {new Date(expiresAt).toLocaleDateString()})
            </span>
          </div>
        )}

        {/* {paymentStatus !== "idle" && (
          <div
            className={`max-w-md mx-auto mb-6 p-4 rounded-lg text-center flex items-center justify-center space-x-2 ${
              paymentStatus === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {paymentStatus === "success" ? (
              <HiCheckCircle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#FFBF00] to-[#FFDB58]" />
            ) : (
              <HiXCircle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#FFBF00] to-[#FFDB58]" />
            )}
            <p className="font-medium">{paymentMessage}</p>
          </div>
        )} */}

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isActive = plan.name === currentPlan;
            const isProcessing = processing === plan.name;

            return (
              <div
                key={plan.planId}
                className={`relative bg-white rounded-2xl shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-2 ${
                  plan.featured ? "ring-4 ring-[#FFBF00]" : ""
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 flex items-center space-x-1 bg-[#FFBF00] text-white text-xs font-semibold py-1 px-2 uppercase">
                    <HiCheck className="w-3 h-3 bg-clip-text text-transparent bg-gradient-to-r from-[#FFBF00] to-[#FFDB58]" />
                    <span>Current</span>
                  </div>
                )}

                <div className="p-8 flex flex-col h-full">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    {capitalize(plan.name)}
                  </h3>
                  <p className="text-5xl font-bold text-gray-900 mb-6">
                    ${plan.monthlyCost}
                    <span className="text-xl font-light">/mo</span>
                  </p>
                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((f) => (
                      <li
                        key={f.key}
                        className="flex items-start text-gray-700"
                      >
                        <HiCheckCircle className="w-5 h-5 mt-1 mr-3 bg-clip-text text-[#FFBF00]" />
                        <span>
                          {prettifyKey(f.key)}:{" "}
                          {f.value === Infinity ? "Unlimited" : f.value}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelect(plan)}
                    disabled={isActive || isProcessing}
                    className={`w-full py-3 text-lg font-semibold rounded-lg flex items-center justify-center space-x-2 transition focus:outline-none ${
                      isActive
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#FFBF00] to-[#FFDB58] text-gray-800 hover:opacity-90 cursor-pointer"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <HiCheckCircle className="w-5 h-5 text-gray-800" />
                        <span>Current</span>
                      </>
                    ) : isProcessing ? (
                      <>
                        <HiCreditCard className="animate-spin w-5 h-5 bg-clip-text text-transparent bg-gradient-to-r from-[#FFBF00] to-[#FFDB58]" />
                        <span>Processing…</span>
                      </>
                    ) : (
                      <>
                        <HiCreditCard className="w-5 h-5 bg-clip-text text-gray-800" />
                        <span>Select Plan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
