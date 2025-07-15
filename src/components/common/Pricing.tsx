'use client';

import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/api';
import { Button } from '@/components/ui/button';

const FEATURE_LABELS: Record<string, string> = {
  influencer_search_quota:      'Influencer searches / mo',
  live_campaigns_limit:         'Live campaigns',
  email_outreach_credits:       'Email credits',
  dedicated_manager_support:    'Dedicated manager',
  apply_to_campaigns_quota:     'Campaign applications / mo',
  pitch_templates_access:       'Pitch templates',
  dedicated_support_access:     'Priority support',
};

const formatFeatureValue = (key: string, v: number): string => {
  if (key === 'live_campaigns_limit' || key === 'apply_to_campaigns_quota') {
    return v === 0 ? 'Unlimited' : String(v);
  }
  if (
    key === 'dedicated_manager_support' ||
    key === 'pitch_templates_access' ||
    key === 'dedicated_support_access'
  ) {
    return v === 1 ? 'Yes' : 'No';
  }
  if (key === 'email_outreach_credits') {
    return v === 0 ? 'None' : String(v);
  }
  return String(v);
};

interface Plan {
  _id: string;
  role: string;
  name: string;
  monthlyCost: number;
  features: Array<{ key: string; value: number }>;
  planId: string;
}

const Pricing: React.FC = () => {
  const router = useRouter();
  const roles = ['Brand', 'Influencer'] as const;
  const [activeRole, setActiveRole] = useState<typeof roles[number]>(roles[0]);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  // fetch plans whenever role changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    post<{ message: string; plans: Plan[] }>('/subscription/list', {
      role: activeRole,
    })
      .then(res => {
        setPlans(res.plans);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load plans. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeRole]);

  const PRIMARY = '#ef2f5b';

  return (
    <section id="pricing" className="py-20 bg-gray-50 font-lexend">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {activeRole} Plans
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple, transparent pricing. Start free, upgrade as you grow.
          </p>

          {/* Role Switcher */}
          <div className="inline-flex mt-8 bg-gray-200 rounded-lg p-1">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeRole === role
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {role}s
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <p className="text-center text-gray-500">Loading plans…</p>
        )}
        {error && (
          <p className="text-center text-red-600">{error}</p>
        )}

        {/* Plans grid */}
        <div className="grid lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {!loading && plans.map(plan => (
            <div
              key={plan._id}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
              <div className="p-8 flex-1 flex flex-col">
                {/* Header */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}
                </h3>
                <p className="text-gray-600 mb-6">
                  {plan.monthlyCost === 0
                    ? 'Forever free'
                    : 'Paid plan'}
                </p>

                {/* Price */}
                <div className="mb-6">
                  {plan.monthlyCost === 0 ? (
                    <span className="text-4xl font-bold text-gray-900">Free</span>
                  ) : (
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900">
                        ${plan.monthlyCost}
                      </span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map(({ key, value }) => {
                    const display = formatFeatureValue(key, value);
                    const isPositive = !['No', 'None'].includes(display);
                    const IconComponent = isPositive ? Check : X;
                    const iconColor = isPositive ? 'text-green-500' : 'text-red-500';

                    return (
                      <div key={key} className="flex items-start">
                        <IconComponent
                          className={`h-5 w-5 ${iconColor} mr-2 mt-0.5 flex-shrink-0`}
                        />
                        <span className="text-gray-700">
                          {FEATURE_LABELS[key]}: <strong>{display}</strong>
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Action */}
                <div className="mt-auto">
                  <button
                    className="w-full py-4 px-6 bg-[#ef2f5b] text-white font-bold text-lg rounded-lg hover:bg-[#c21f4f] transition-all hover:scale-105"
                    onClick={() => router.push('/login')}
                  >
                    {plan.monthlyCost === 0 ? 'Start Free' : 'Choose Plan'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <p className="text-center text-gray-500 text-sm mt-12">
          All paid plans include a 7-day Money-Back Guarantee • No setup fees • Cancel any time
        </p>
      </div>
    </section>
  );
};

export default Pricing;
