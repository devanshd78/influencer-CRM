import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 font-lexend">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Purple blob */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full opacity-20 blur-3xl"></div>
        {/* Pink blob */}
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-gradient-to-br from-pink-400 to-[#ef2f5b] opacity-15 rounded-full blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Share Smarter,
              <br />
              <span className="text-gray-900">
                Grow Faster: Content
              </span>
              <br />
              <span className="text-gray-900">
                Distribution &
              </span>
              <br />
              <span className="text-gray-900">
                Monetization
              </span>
              <br />
              <span className="text-gray-900">
                Platform
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-xl leading-relaxed">
              Transform your content into powerful revenue streams with Collabglam's 
              intelligent sharing platform. Join thousands of creators earning more 
              through strategic content distribution.
            </p>

            <button className="group inline-flex items-center px-8 py-4 bg-[#ef2f5b] text-white font-semibold rounded-lg text-lg hover:bg-portal-dark transition-all transform hover:scale-105 shadow-lg">
              START YOUR PROJECT
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right Content - Device Mockups */}
          <div className="relative">
            {/* Desktop Monitor */}
            <div className="relative z-20">
              <div className="bg-gray-800 rounded-t-2xl p-2 shadow-2xl">
                <div className="bg-gray-900 rounded-t-xl p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 h-64">
                    <img
                      src="https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=800"
                      alt="Content creation interface"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-300 h-8 w-full rounded-b-2xl"></div>
              <div className="bg-gray-400 h-16 w-32 mx-auto rounded-b-lg"></div>
            </div>

            {/* Laptop */}
            <div className="absolute -bottom-8 -left-8 z-10">
              <div className="bg-gray-800 rounded-t-xl p-2 shadow-xl transform rotate-12">
                <div className="bg-gray-900 rounded-t-lg p-3">
                  <div className="bg-gray-700 rounded-md p-3 h-32 w-48">
                    <div className="grid grid-cols-3 gap-2 h-full">
                      <div className="bg-[#ef2f5b] rounded opacity-80"></div>
                      <div className="bg-purple-500 rounded opacity-80"></div>
                      <div className="bg-blue-500 rounded opacity-80"></div>
                      <div className="bg-green-500 rounded opacity-80"></div>
                      <div className="bg-yellow-500 rounded opacity-80"></div>
                      <div className="bg-pink-500 rounded opacity-80"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-300 h-4 w-full rounded-b-xl transform rotate-12"></div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-16 mt-16 border-t border-gray-200">
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">50K+</div>
            <div className="text-gray-600 font-medium">Active Creators</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">$2M+</div>
            <div className="text-gray-600 font-medium">Revenue Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">150+</div>
            <div className="text-gray-600 font-medium">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">99.9%</div>
            <div className="text-gray-600 font-medium">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;