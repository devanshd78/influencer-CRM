'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Play,
  Shield,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import Footer from '@/components/common/Footer';

export default function AboutPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const clientId = localStorage.getItem('clientId');
    setIsLoggedIn(!!token && !!clientId);
  }, []);

  // Pink & Yellow theme
  const PRIMARY = '#ef2f5b';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'rgba(239,47,91,0.05)' }}>
      {/* Site Header */}
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Collabglam Logo"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-gray-800">
              Collabglam
            </span>
          </Link>
          {!isLoggedIn && (
            <Link href="/login">
              <Button
                size="sm"
                className="px-4 py-2 bg-[#ef2f5b] hover:bg-[#ffd166] text-white transition rounded-md"
              >
                Login
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Page Header */}
      <header className="py-8 bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 text-center">
          <h1
            className="text-4xl font-extrabold"
            style={{ color: PRIMARY }}
          >
            About CollabGlam
          </h1>
          <p className="mt-2 text-gray-700">
            Easiest way to connect brand and influencer
          </p>
        </div>
      </header>

      {/* Mission & Vision */}
      <section className="flex-grow container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Mission */}
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 leading-relaxed">
              To connect brand and influencer seamless, influencer, find perfect brand and brand, find perfect influencers for their product review, unboxing, and promotion. Our goal is to get brand and influencer grow.
            </p>
          </div>
          {/* Vision */}
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Our Vision
            </h2>
            <p className="text-gray-600 leading-relaxed">
              A platform where every brand finds it perfect influencer, and every influencer has the tool to turn passion into propose
            </p>
          </div>
        </div>

        {/* Values Cards */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Our Core Values
          </h3>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { Icon: Play, title: 'Creativity', desc: 'Bold ideas and innovative campaigns that spark real impact.' },
              { Icon: Users, title: 'Collaboration', desc: 'Working hand-in-hand with influencers and brands for shared success.' },
              { Icon: TrendingUp, title: 'Excellence', desc: 'Setting industry standards through top-tier service and insights.' },
            ].map(({ Icon, title, desc }) => (
              <Card
                key={title}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-lg bg-white shadow-lg p-6 space-y-4 cursor-pointer"
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                    <Icon className="h-8 w-8" style={{ color: PRIMARY }} />
                  </div>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link href={isLoggedIn ? '/dashboard' : '/login'}>
            <Button
              className="px-8 py-4 text-lg cursor-pointer transition bg-[#ef2f5b] hover:bg-[#ffd166] text-white rounded-md"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
