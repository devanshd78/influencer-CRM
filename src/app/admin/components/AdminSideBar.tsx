"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  List,
  Menu,
  X,
  DollarSign,
  MessageCircleIcon,
  MailCheckIcon,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const navItems = [
  { label: "Brands", href: "/admin/brands", icon: Home },
  { label: "Influencers", href: "/admin/influencers", icon: Users },
  { label: "All Campaigns", href: "/admin/campaigns", icon: List },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: DollarSign },
  { label: "Messages", href: "/admin/messages", icon: MessageCircleIcon },
  { label: "E-Mails", href: "/admin/emails", icon: MailCheckIcon },
];

const documentLinks = [
  { label: "Contact", href: "/admin/documents/contact-us" },
  { label: "FAQs", href: "/admin/documents/faqs" },
  { label: "Privacy Policy", href: "/admin/documents/privacy-policy" },
  { label: "Terms of Service", href: "/admin/documents/terms-of-service" },
  { label: "Cookie Policy", href: "/admin/documents/cookie-policy" },
  { label: "Shipping & Delivery Policy", href: "/admin/documents/shipping-delivery" },
  { label: "Returns Policy", href: "/admin/documents/return-policy" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);

  // Prevent scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
  }, [drawerOpen]);

  const drawerVariants = {
    hidden: { x: "-100%" },
    visible: { x: "0%" },
  };

  const renderLink = ({ label, href, icon: Icon }: any, onClick?: () => void) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        key={href}
        href={href}
        onClick={onClick}
        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none ${
          active
            ? "bg-blue-50 text-blue-600"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        {Icon && (
          <Icon
            className={`mr-3 h-5 w-5 transition-colors ${
              active ? "text-blue-600" : "text-gray-400 hover:text-gray-500"
            }`}
          />
        )}
        <span className="whitespace-nowrap flex-1">{label}</span>
      </Link>
    );
  };

  const renderDocuments = (isMobile = false) => (
    <div>
      <button
        onClick={() => setDocsOpen(prev => !prev)}
        className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none"
      >
        <FileText className="mr-3 h-5 w-5 text-gray-400 hover:text-gray-500" />
        <span className="flex-1 text-left">Documents</span>
        {docsOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {docsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-6 mt-2 space-y-1 overflow-hidden"
          >
            {documentLinks.map(({ label, href }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => {
                    if (isMobile) setDrawerOpen(false);
                  }}
                  className={`block px-3 py-1 text-sm rounded-lg transition-colors focus:outline-none ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Mobile Topbar */}
      <header className="md:hidden fixed inset-x-0 top-0 z-50 h-12 bg-white border-b flex items-center px-4 shadow-sm">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
        <Link href="/admin" className="flex items-center space-x-2 ml-4">
          <img src="/logo.png" alt="CollabGlam logo" className="h-8 w-auto" />
          <span className="text-lg font-semibold">CollabGlam</span>
        </Link>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:flex-col w-64 bg-white border-r transition-all duration-200 lg:w-72">
        <Link
          href="/admin"
          className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-100"
        >
          <img src="/logo.png" alt="CollabGlam logo" className="h-8 w-auto" />
          <span className="text-xl font-semibold">CollabGlam</span>
        </Link>
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {navItems.map(item => renderLink(item))}
          {renderDocuments(false)}
        </nav>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={drawerVariants}
              transition={{ type: "tween", duration: 0.2 }}
            >
              <div className="h-12 flex items-center justify-between px-4 border-b">
                <Link href="/admin" className="flex items-center space-x-2">
                  <img src="/logo.png" alt="CollabGlam logo" className="h-8 w-auto" />
                  <span className="text-lg font-semibold">CollabGlam</span>
                </Link>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <X className="h-6 w-6 text-gray-700" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                {navItems.map(item => renderLink(item, () => setDrawerOpen(false)))}
                {renderDocuments(true)}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
