// src/components/InfluencerSidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HiChatAlt2,
  HiLogout,
  HiX,
  HiHome,
  HiPlusCircle,
  HiClipboardList,
  HiCreditCard,
} from "react-icons/hi";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  badgeCount?: number;
}

const menuSections: { title: string; items: MenuItem[] }[] = [
{
    title: "Main",
    items: [
      {
        name: "Dashboard",
        href: "/influencer/dashboard",
        icon: HiHome,
      },
      {
        name: "New Collab",
        href: "/influencer/new-collab",
        icon: HiPlusCircle,
      },
      {
        name: "My Campaigns",
        href: "/influencer/my-campaign",
        icon: HiClipboardList,
      },
      {
        name: "Messages",
        href: "/influencer/messages",
        icon: HiChatAlt2,
        badgeCount: 3,
      },
      {
        name: "Subscriptions",
        href: "/influencer/subscriptions",
        icon: HiCreditCard,
      },
    ],
  },
];

interface InfluencerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfluencerSidebar({ isOpen, onClose }: InfluencerSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const filteredSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    ),
  }));

  const sidebar = (
    <div className={`flex flex-col h-full bg-[#F5E1A4] text-black ${collapsed ? 'w-20' : 'w-72'} transition-width duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        {/* Logo linking to dashboard */}
        <Link href="/influencer/dashboard" className="flex items-center">
          <img src="/logo.png" alt="Collabglam logo" className="h-8 w-auto mr-2" />
          {!collapsed && <h2 className="text-lg font-bold">Influencer Hub</h2>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto mt-4">
        {filteredSections.map(section => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <span className="px-4 text-xs uppercase text-gray-600">
                {section.title}
              </span>
            )}
            <ul className="mt-2">
              {section.items.map(item => {
                const active = pathname === item.href;
                const isNew = item.name === "New Collab"; 
                return (
                  <li key={item.href} className="group">
                    <Link
                      href={item.href}
                      className={`
                        flex items-center py-2 px-4 rounded-md transition-colors duration-200
                        ${active ? 'bg-[#FF8C00] text-black' : 'text-black hover:bg-[#FF8C00] hover:text-white'}
                        ${isNew ? 'font-bold bg-gradient-to-r from-[#FF8C00] to-[#FFC85C] text-black shadow-md animate-bounce' : ''}
                      `}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon size={20} />
                      {!collapsed && (
                        <span className="ml-3 flex-1 text-sm font-medium">
                          {item.name}
                        </span>
                      )}
                      {!collapsed && item.badgeCount && (
                        <span className="ml-auto inline-block bg-red-500 text-white text-xs rounded-full px-2">
                          {item.badgeCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center py-2 px-4 rounded-md text-black hover:bg-[#FF8C00] hover:text-white transition-colors duration-200"
        >
          <HiLogout size={20} />
          <span className="ml-3 text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex">{sidebar}</div>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* sidebar panel */}
          <div className="relative flex flex-col h-full bg-[#F5E1A4] text-black w-64">
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
              <Link href="/influencer/dashboard" className="flex items-center">
                <img src="/logo.png" alt="Collabglam logo" className="h-8 w-auto mr-2" />
                <h2 className="text-lg font-bold">Influencer Hub</h2>
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-[#FFD96A]"
              >
                <HiX size={24} />
              </button>
            </div>


            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto mt-4">
              {filteredSections.map(section => (
                <div key={section.title} className="mb-4">
                  <span className="px-4 text-xs uppercase text-gray-600">
                    {section.title}
                  </span>
                  <ul className="mt-2">
                    {section.items.map(item => {
                      const active = pathname === item.href;
                      const isNew = item.name === "New Collab";
                      return (
                        <li key={item.href} className="group">
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className={`
                              flex items-center py-2 px-4 rounded-md transition-colors duration-200
                              ${active ? 'bg-[#FF8C00] text-black' : 'text-black hover:bg-[#FF8C00] hover:text-white'}
                              ${isNew ? 'font-bold bg-gradient-to-r from-[#FF8C00] to-[#FFC85C] text-black shadow-md animate-bounce' : ''}
                            `}
                          >
                            <item.icon size={20} />
                            <span className="ml-3 text-md font-medium">{item.name}</span>
                            {item.badgeCount && (
                              <span className="ml-auto inline-block bg-red-500 text-white text-xs rounded-full px-2">
                                {item.badgeCount}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                    </ul>
                </div>
              ))}
            </nav>

            {/* Logout */}
            <div className="border-t border-gray-700 p-4">
              <button
                onClick={() => {
                  handleLogout();
                  onClose();
                }}
                className="w-full flex items-center py-2 px-4 rounded-md text-black hover:bg-[#FF8C00] hover:text-white transition-colors duration-200"
              >
                <HiLogout size={20} />
                <span className="ml-3 text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}