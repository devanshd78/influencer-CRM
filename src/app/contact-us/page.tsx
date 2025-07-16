"use client";

import React, { useState } from "react";
import Link from "next/link";
import Footer from "@/components/common/Footer";
import { FloatingLabelInput } from "@/components/common/FloatingLabelInput";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { post } from "@/lib/api";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await post<{ message: string }>("/contact/send", form);
      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.error ||
        "Something went wrong. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Pink & Yellow theme
  const PRIMARY = '#ef2f5b';

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'rgba(239,47,91,0.05)' }}>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
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
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16" aria-hidden />

      {/* Title Section */}
      <section className="bg-white text-center px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold" style={{ color: PRIMARY }}>
            Contact Us
          </h1>
          <p className="mt-1" style={{ color: 'rgba(239,47,91,0.5)' }}>
            We’d love to hear from you—drop us a line below.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 overflow-auto px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow p-6 space-y-6"
          >
            <h2 className="text-2xl font-semibold" style={{ color: PRIMARY }}>
              Send Us a Message
            </h2>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertTitle>Sent!</AlertTitle>
                <AlertDescription>
                  Thank you for reaching out. We’ll be in touch soon.
                </AlertDescription>
              </Alert>
            )}

            <FloatingLabelInput
              id="name"
              name="name"
              type="text"
              label="Name"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <FloatingLabelInput
              id="email"
              name="email"
              type="email"
              label="Email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <FloatingLabelInput
              id="subject"
              name="subject"
              type="text"
              label="Subject"
              value={form.subject}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <div>
              <label htmlFor="message" className="block text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                placeholder=" "
                value={form.message}
                onChange={handleChange}
                disabled={loading}
                className="peer block w-full border-2 rounded-md bg-white px-3 py-2 text-gray-900 focus:border-pink-600 focus:outline-none focus:ring-0 transition"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded bg-[#ef2f5b] text-white font-medium transition hover:bg-[#d92a54] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffd166] disabled:opacity-50 cursor-pointer rounded-md"
            >
              {loading ? "Sending…" : "Send Message"}
            </Button>
          </form>

          {/* Contact Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: PRIMARY }}>
              Get in Touch
            </h2>
            <p className="mb-2">
              <strong>Email:</strong>{" "}
              <a
                href="mailto:care@collabglam.com"
                style={{ color: PRIMARY }}
                className="hover:underline"
              >
                care@collabglam.com
              </a>
            </p>
            <p className="mb-2">
              <strong>Phone:</strong> +1 (904) 219-4648
            </p>
            <p>
              <strong>Address: </strong>
              8825 PERIMETER PARK BLVD STE 501
              <br />
              JACKSONVILLE, FL 32216-1123
              <br />
              USA
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
