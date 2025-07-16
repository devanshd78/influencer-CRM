"use client";

import React, { useState } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { post } from "@/lib/api";
import Swal from "sweetalert2";

export default function FooterWithNewsletter() {
  const footerSections = [
    {
      title: "",
      links: [

      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about-us" },
        { label: "Contact Us", href: "/contact-us" },
        { label: "FAQs", href: "/faqs" },
                { label: "How It Works", href: "#how-it-works" },
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/policy/privacy" },
        { label: "Terms of Service", href: "/policy/terms-of-service" },
        { label: "Cookie Policy", href: "/policy/cookies" },
        { label: "Shipping & Delivery Policy", href: "/policy/shipping-delivery" },
        { label: "Returns Policy", href: "/policy/return" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  const router = useRouter();
  const handleNav = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  // Newsletter form state
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    }

    setLoading(true);
    try {
      await post<{ message: string }>("/contact/newsletter/create", { email });
      Swal.fire({
        icon: "success",
        title: "Subscribed!",
        text: "You’ve been added to our newsletter.",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      setEmail("");
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Subscription Failed",
        text:
          err?.response?.data?.error ||
          "Something went wrong. Please try again later.",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white font-lexend">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="pt-16 pb-12 flex flex-col lg:flex-row lg:items-start lg:justify-between">
          {/* Brand Section */}
          <div className="mb-12 lg:mb-0 lg:flex-shrink-0 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="flex items-center mb-6">
              <img
                src="./logo.png"
                alt="Collabglam Logo"
                width={50}
                height={50}
                className="rounded-lg"
              />
              <span className="ml-3 text-2xl font-bold">CollabGlam</span>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed max-w-sm">
              Connect, create, and drive revenue with CollabGlam’s intelligent
              partnership hub.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-300">
                <Mail className="h-5 w-5 mr-3" />
                <span>care@collabglam.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="h-5 w-5 mr-3" />
                <span>+1 (904) 219-4648</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="h-5 w-5 mr-3" />
                <span>Florida, USA</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 justify-center lg:justify-start">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center md:justify-items-start">
            {footerSections.map((section, index) => (
              <div key={index} className="w-full max-w-xs">
                <h3 className="text-lg font-semibold mb-4 text-center md:text-left">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link, li) => (
                    <li key={li}>
                      <a
                        href={link.href}
                        onClick={(e) => handleNav(link.href, e)}
                        className="text-gray-300 hover:text-white transition-colors block text-center md:text-left cursor-pointer"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Subscription */}
        <form
          onSubmit={handleSubscribe}
          className="py-8 border-t border-gray-800 flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
        >
          <div className="text-center lg:text-left">
            <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
            <p className="text-gray-300 max-w-md">
              Get the latest updates, tips, and exclusive CollabGlam deals
              delivered to your inbox.
            </p>
          </div>

          <div className="flex w-full max-w-lg mx-auto lg:mx-0">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-pink-600"
            />
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-[#FFA135] to-[#FF7236]
    text-white font-bold text-lg text-white font-semibold rounded-r-md hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Subscribing…" : "Subscribe"}
            </button>
          </div>
        </form>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-800">
          <p className="text-center text-gray-400 text-sm">
            © 2025 Collabglam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
