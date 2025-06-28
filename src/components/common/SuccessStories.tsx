import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Quote } from 'lucide-react';

const SuccessStories = () => {
  const [currentStory, setCurrentStory] = useState(0);

  const stories = [
    {
      name: "Sarah Johnson",
      role: "Fitness Influencer",
      image: "https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400",
      revenue: "$45K",
      growth: "300%",
      timeframe: "6 months",
      quote: "Collabglam transformed my fitness content into a thriving business. The analytics helped me understand my audience better and optimize my content strategy.",
      results: [
        "Increased monthly revenue from $2K to $45K",
        "Grew subscriber base by 300% in 6 months",
        "Launched successful online fitness program"
      ]
    },
    {
      name: "Marcus Chen",
      role: "Tech Educator",
      image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400",
      revenue: "$120K",
      growth: "500%",
      timeframe: "8 months",
      quote: "The multi-platform integration saved me hours of manual work. Now I can focus on creating quality content while Collabglam handles the distribution.",
      results: [
        "Built a tech education empire worth $120K annually",
        "Automated content distribution to 12 platforms",
        "Created passive income streams through course sales"
      ]
    },
    {
      name: "Emma Rodriguez",
      role: "Digital Artist",
      image: "https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=400",
      revenue: "$30K",
      growth: "250%",
      timeframe: "4 months",
      quote: "As an artist, I never thought I could make this much from my digital art. Collabglam's platform made monetization simple and effective.",
      results: [
        "Sold digital art worth $30K in 4 months",
        "Built a community of 50K+ art enthusiasts",
        "Launched exclusive NFT collections"
      ]
    }
  ];

  const nextStory = () => {
    setCurrentStory((prev) => (prev + 1) % stories.length);
  };

  const prevStory = () => {
    setCurrentStory((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const currentStoryData = stories[currentStory];

  return (
    <section id="success-stories" className="py-20 bg-gray-900 font-lexend">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Success Stories
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real creators, real results. See how Collabglam is transforming lives and businesses.
          </p>
        </div>

        {/* Main Story Display */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-2xl mb-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Story Content */}
            <div>
              <div className="flex items-center mb-6">
                <img
                  src={currentStoryData.image}
                  alt={currentStoryData.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {currentStoryData.name}
                  </h3>
                  <p className="text-[#ef2f5b] font-semibold">
                    {currentStoryData.role}
                  </p>
                </div>
              </div>

              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 h-8 w-8 text-[#ef2f5b] opacity-30" />
                <blockquote className="text-lg text-gray-700 italic pl-6">
                  "{currentStoryData.quote}"
                </blockquote>
              </div>

              {/* Key Results */}
              <div className="space-y-3 mb-6">
                {currentStoryData.results.map((result, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-[#ef2f5b] rounded-full mr-3"></div>
                    <span className="text-gray-700">{result}</span>
                  </div>
                ))}
              </div>

              <button className="group inline-flex items-center text-[#ef2f5b] font-semibold hover:text-[#c21f4f] transition-colors">
                Read full story
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {currentStoryData.revenue}
                </div>
                <div className="text-gray-600 font-medium">Monthly Revenue</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {currentStoryData.growth}
                </div>
                <div className="text-gray-600 font-medium">Growth Rate</div>
              </div>
              
              <div className="col-span-2 text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {currentStoryData.timeframe}
                </div>
                <div className="text-gray-600 font-medium">Time to Success</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStory}
            className="flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </button>

          {/* Dots Indicator */}
          <div className="flex space-x-2">
            {stories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStory(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentStory ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStory}
            className="flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all"
          >
            Next
            <ChevronRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;