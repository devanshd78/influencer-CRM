// components/BrandSidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HiHome,
  HiPlusCircle,
  HiCheckCircle,
  HiClipboardList,
  HiUsers,
  HiCog,
  HiLogout,
  HiMenu,
  HiX,
} from "react-icons/hi";
import { SendIcon } from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
}

const menuItems: MenuItem[] = [
  { name: "Dashboard", href: "/brand/dashboard", icon: HiHome },
  { name: "Create New Campaign", href: "/brand/create-campaign", icon: HiPlusCircle },
  { name: "Active Campaign", href: "/brand/active-campaign", icon: HiCheckCircle },
  { name: "Previous Campaigns", href: "/brand/prev-campaign", icon: HiClipboardList },
  { name: "Browse Influencers", href: "/brand/browse-influencers", icon: HiUsers },
  { name: "Messages", href: "/brand/messages", icon: SendIcon },
  { name: "My Subscriptions", href: "/brand/subscriptions", icon: HiClipboardList },
];

interface BrandSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BrandSidebar({ isOpen, onClose }: BrandSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const renderLinks = () =>
    menuItems.map((item) => {
      const isActive = pathname === item.href;
      const isNew = item.name === "Create New Campaign";

      const baseClasses = "flex items-center py-3 px-3 rounded-md transition-colors duration-200";
      const activeClasses = isActive
        ? "bg-pink-100 text-pink-600"
        : "text-gray-800 hover:bg-pink-50 hover:text-pink-600";
      const newClasses = isNew
        ? "font-bold bg-[#EF2F5B]/80 text-white shadow-md"
        : "";

      return (
        <li key={item.href} className="group">
          <Link
            href={item.href}
            className={`${baseClasses} ${activeClasses} ${newClasses}`}
            title={collapsed ? item.name : undefined}
            onClick={onClose}
          >
            <item.icon
              size={20}
              className={`flex-shrink-0 ${isActive ? "text-pink-600" : "text-gray-400 group-hover:text-pink-600"
                }`}
            />
            {!collapsed && <span className="ml-3 text-md font-medium">{item.name}</span>}
          </Link>
        </li>
      );
    });

  const sidebarContent = (
    <div
      className={`flex flex-col h-full bg-white text-gray-800 ${collapsed ? "w-16" : "w-64"
        } transition-width duration-300 ease-in-out`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <Link href="/brand/dashboard" className="flex items-center space-x-2">
          <img src="/logo.png" alt="Collabglam logo" className="h-8 w-auto" />
          {!collapsed && <span className="text-xl font-semibold">Brand Portal</span>}
        </Link>
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="p-2 rounded-md hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-600"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <HiMenu size={20} className="text-gray-800" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto mt-4">
        <ul className="flex flex-col space-y-1 px-1">{renderLinks()}</ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center py-2 px-3 rounded-md text-gray-800 hover:bg-pink-50 hover:text-pink-800 transition-colors duration-200"
          title={collapsed ? "Logout" : undefined}
        >
          <HiLogout size={20} className="flex-shrink-0" />
          {!collapsed && <span className="ml-3 text-md font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex">{sidebarContent}</div>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar panel */}
          <div className="relative flex flex-col h-full bg-white text-gray-800 w-64">
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <Link href="/brand/dashboard" className="flex items-center space-x-2">
                <img src="/logo.png" alt="Collabglam logo" className="h-8 w-auto" />
                <span className="text-xl font-semibold">Brand Portal</span>
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-600"
                title="Close Sidebar"
              >
                <HiX size={24} className="text-gray-800" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto mt-4">
              <ul className="flex flex-col space-y-1 px-1">{renderLinks()}</ul>
            </nav>

            {/* Logout */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={() => {
                  handleLogout();
                  onClose();
                }}
                className="w-full flex items-center py-2 px-3 rounded-md text-gray-800 hover:bg-pink-50 hover:text-pink-800 transition-colors duration-200"
              >
                <HiLogout size={20} className="flex-shrink-0" />
                <span className="ml-3 text-md font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
