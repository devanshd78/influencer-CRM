// components/BrandSidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HiHome,
  HiPlusCircle,
  HiClipboardList,
  HiUsers,
  HiCog,
  HiLogout,
  HiMenu,
  HiX,
  HiCheckCircle
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
  { name: "Settings", href: "/brand/settings", icon: HiCog },
];

interface BrandSidebarProps {
  isOpen: boolean; // controls mobile overlay
  onClose: () => void;
}

export default function BrandSidebar({ isOpen, onClose }: BrandSidebarProps) {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  // Refined color palette:
  // - bg-gray-800 (charcoal) for the sidebar background
  // - text-gray-200 for icons/text
  // - hover: bg-pink-50 (pink ish) + text-pink-600
  // - active: bg-pink-100 + text-pink-600
  // - collapse/close icons: use text-gray-200, hover:bg-pink-50

  const sidebarContent = (
    <div
      className={`
        flex flex-col h-full bg-gray-800 text-gray-200
        ${collapsed ? "w-16" : "w-64"}
        transition-width duration-300 ease-in-out
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        {!collapsed && <div className="text-xl font-semibold tracking-wide">Brand Portal</div>}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="p-2 rounded-md hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-600"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <HiMenu size={20} className="text-gray-200" />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto mt-4">
        <ul className="flex flex-col space-y-1 px-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} className="group">
                <Link
                  href={item.href}
                  className={`
                    flex items-center py-3 px-3 rounded-md
                    transition-colors duration-200
                    ${isActive
                      ? "bg-pink-100 text-pink-600"
                      : "text-gray-300 hover:bg-pink-50 hover:text-pink-600"
                    }
                  `}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon
                    size={20}
                    className={`flex-shrink-0 ${isActive
                      ? "text-pink-600"
                      : "text-gray-400 group-hover:text-pink-600"
                      }`}
                  />
                  {!collapsed && <span className="ml-3 text-sm font-medium">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center py-2 px-3 rounded-md
            text-gray-300 hover:bg-pink-50 hover:text-pink-600
            transition-colors duration-200
          `}
          title={collapsed ? "Logout" : undefined}
        >
          <HiLogout size={20} className="flex-shrink-0" />
          {!collapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop (md+): always visible */}
      <div className="hidden md:flex">{sidebarContent}</div>

      {/* Mobile (<md): show overlay when isOpen */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Blurred Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sliding sidebar panel */}
          <div className="relative flex flex-col h-full bg-gray-800 text-gray-200 w-64">
            {/* Close Button */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
              <div className="text-xl font-semibold tracking-wide">Brand Portal</div>
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-600"
                title="Close Sidebar"
              >
                <HiX size={24} className="text-gray-200" />
              </button>
            </div>

            {/* Mobile Menu Items */}
            <nav className="flex-1 overflow-y-auto mt-4">
              <ul className="flex flex-col space-y-1 px-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href} className="group">
                      <Link
                        href={item.href}
                        className={`
                          flex items-center py-3 px-3 rounded-md
                          transition-colors duration-200
                          ${isActive
                            ? "bg-pink-100 text-pink-600"
                            : "text-gray-300 hover:bg-pink-50 hover:text-pink-600"
                          }
                        `}
                        onClick={onClose}
                      >
                        <item.icon
                          size={20}
                          className={`flex-shrink-0 ${isActive
                            ? "text-pink-600"
                            : "text-gray-400 group-hover:text-pink-600"
                            }`}
                        />
                        <span className="ml-3 text-sm font-medium">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Mobile Logout */}
            <div className="border-t border-gray-700 p-4">
              <button
                onClick={() => {
                  handleLogout();
                  onClose();
                }}
                className="w-full flex items-center py-2 px-3 rounded-md text-gray-300 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
              >
                <HiLogout size={20} className="flex-shrink-0" />
                <span className="ml-3 text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
