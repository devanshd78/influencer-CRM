import React from 'react';
import { TrendingUp, Users, DollarSign, Globe, Star, Zap } from 'lucide-react';

const SocialProof = () => {
  const metrics = [
    {
      icon: Users,
      value: "50,000+",
      label: "Active Creators",
      color: "from-[#ef2f5b] to-[#c21f4f]"
    },
    {
      icon: DollarSign,
      value: "$2.5M+",
      label: "Revenue Generated",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Globe,
      value: "150+",
      label: "Countries Served",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: TrendingUp,
      value: "300%",
      label: "Average Growth",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "User Rating",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Zap,
      value: "99.9%",
      label: "Uptime SLA",
      color: "from-pink-500 to-red-500"
    }
  ];

  return (
    <section className="py-16 bg-white font-lexend">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Creators Worldwide
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join the growing community of successful content creators who are scaling their businesses with Collabglam
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
            >
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${metric.color} flex items-center justify-center`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
              
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                {metric.value}
              </div>
              
              <div className="text-sm text-gray-600 font-medium">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Social Proof */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-8">Featured in</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">TechCrunch</div>
            <div className="text-2xl font-bold text-gray-400">Forbes</div>
            <div className="text-2xl font-bold text-gray-400">Mashable</div>
            <div className="text-2xl font-bold text-gray-400">VentureBeat</div>
            <div className="text-2xl font-bold text-gray-400">Wired</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;