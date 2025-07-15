"use client";

import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import Footer from "@/components/common/Footer";
import { post } from "@/lib/api";

interface Policy {
  policyType: string;
  effectiveDate: string;
  content: string;
}

export default function PrivacyPolicy() {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await post<Policy>('/policy/getlist', { policyType: 'Cookie Policy' });
        setPolicy(res);
      } catch (e) {
        console.error(e);
        setError('Failed to load Cookie Policy.');
      }
    })();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          <NextLink href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Collabglam Logo" className="h-8 w-auto" />
            <span className="text-lg font-bold text-gray-800">Collabglam</span>
          </NextLink>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-14" aria-hidden="true" />

      {/* Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-12">
        <h1 className="text-2xl font-semibold mb-2">Cookie Policy</h1>
        {error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : !policy ? (
          <p className="text-center">Loading Cookie Policy…</p>
        ) : (
          <>            
            <p className="mb-4 text-sm text-gray-600">
              Effective Date: {policy.effectiveDate.split('T')[0]}
            </p>
            <article className="prose max-w-none">
              <div style={{ whiteSpace: 'pre-wrap' }}>{policy.content}</div>
            </article>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
