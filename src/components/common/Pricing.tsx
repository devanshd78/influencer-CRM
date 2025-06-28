import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { plans } from '../data/Plan';
import { useRouter } from 'next/navigation';

// Human-friendly labels for each feature key
const FEATURE_LABELS: Record<string, string> = {
  influencer_search_quota:      'Influencer searches / mo',
  live_campaigns_limit:         'Live campaigns',
  email_outreach_credits:       'Email credits',
  dedicated_manager_support:    'Dedicated manager',
  apply_to_campaigns_quota:     'Campaign applications / mo',
  pitch_templates_access:       'Pitch templates',
  dedicated_support_access:     'Priority support',
};

// Converts raw value to readable form based on feature type
const formatFeatureValue = (key: string, v: number): string => {
  // Quotas & limits: 0 means unlimited
  if (key === 'live_campaigns_limit' || key === 'apply_to_campaigns_quota') {
    return v === 0 ? 'Unlimited' : String(v);
  }
  // Boolean-style features: 1 → Yes, 0 → No
  if (
    key === 'dedicated_manager_support' ||
    key === 'pitch_templates_access'    ||
    key === 'dedicated_support_access'
  ) {
    return v === 1 ? 'Yes' : 'No';
  }
  // Numeric credits: 0 → None, otherwise the number
  if (key === 'email_outreach_credits') {
    return v === 0 ? 'None' : String(v);
  }
  // Fallback
  return String(v);
};

const Pricing: React.FC = () => {

  const router = useRouter();

  const roles = ['Brand', 'Influencer'] as const;
  const [activeRole, setActiveRole] = useState<typeof roles[number]>(roles[0]);

  // Filter plans by the selected role
  const rolePlans = plans.filter(p => p.role === activeRole);

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

        {/* Plans grid: each card flex-col and full height */}
        <div className="grid lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {rolePlans.map(plan => (
            <div
              key={plan.name}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
              <div className="p-8 flex-1 flex flex-col">
                {/* Header */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {plan.price === 0 && plan.autoRenew
                    ? 'Forever free'
                    : 'Paid plan'}
                </p>

                {/* Price */}
                <div className="mb-6">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-bold text-gray-900">
                      Free
                    </span>
                  ) : (
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </div>
                  )}
                </div>

                {/* Features list */}
                <div className="space-y-4 mb-8">
                  {Object.entries(plan.features).map(([key, value]) => {
                    const display = formatFeatureValue(key, value!);
                    const isPositive = !['No', 'None'].includes(display);
                    const IconComponent = isPositive ? Check : X;
                    const iconColor = isPositive ? 'text-green-500' : 'text-red-500';

                    return (
                      <div key={key} className="flex items-start">
                        <IconComponent
                          className={`h-5 w-5 ${iconColor} mr-2 mt-0.5 flex-shrink-0`} 
                        />
                        <span className="text-gray-700">
                          {FEATURE_LABELS[key]}:{' '}
                          <strong>{display}</strong>
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Push button to bottom */}
                <div className="mt-auto">
                  <button
                    className="w-full py-4 px-6 bg-[#ef2f5b] text-white font-bold text-lg rounded-lg hover:bg-[#c21f4f] transition-all hover:scale-105 cursor-pointer"
                    onClick={() =>
                      router.push('/login')
                    }
                  >
                    {plan.price === 0 ? 'Start Free' : 'Choose Plan'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legal footnote */}
        <p className="text-center text-gray-500 text-sm mt-12">
          All paid plans include a 14-day free trial • No setup fees • Cancel any time
        </p>
      </div>
    </section>
  );
};

export default Pricing;
