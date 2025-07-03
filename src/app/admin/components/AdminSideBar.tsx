// File: app/admin/components/AdminSidebar.tsx
"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

const navItems = [
  { label: "Brands", href: "/admin/brands", icon: Home },
  { label: "Influencers", href: "/admin/influencers", icon: Users },
  { label: "All Campaigns", href: "/admin/campaigns", icon: List },
  { label: "Subscriptions", href: '/admin/subscriptions', icon: DollarSign },
  { label: "Messages", href: '/admin/messages', icon: MessageCircleIcon }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const drawerVariants = {
    hidden: { x: "-100%" },
    visible: { x: "0%" },
  };

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden fixed inset-x-0 top-0 z-40 h-12 bg-white border-b flex items-center px-4 shadow-sm">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
        <span className="ml-4 text-lg font-semibold">Admin</span>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 h-screen bg-white border-r">
          <div className="h-16 flex items-center justify-center border-b">
            <span className="text-xl font-semibold">Admin</span>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 transition-colors ${active
                        ? "text-blue-600"
                        : "text-gray-400 hover:text-gray-500"
                      }`}
                  />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 backdrop-blur-sm bg-black/30 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Sliding Drawer */}
            <motion.aside
              className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r flex flex-col"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={drawerVariants}
              transition={{ type: "tween", duration: 0.2 }}
            >
              <div className="h-12 flex items-center justify-between px-4 border-b">
                <span className="text-lg font-semibold">Admin</span>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-md hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6 text-gray-700" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                {navItems.map(({ label, href, icon: Icon }) => {
                  const active =
                    pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      onClick={() => setOpen(false)}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 transition-colors ${active
                            ? "text-blue-600"
                            : "text-gray-400 hover:text-gray-500"
                          }`}
                      />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
