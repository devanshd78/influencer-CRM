"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiCurrencyDollar,
  HiChatAlt2,
  HiBell,
  HiCog,
  HiLogout,
  HiMenu,
  HiX,
  HiSearch
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
      { name: "New Collab", href: "/influencer/new-collab", icon: HiOutlineClipboardList },
      { name: "My Campaigns", href: "/influencer/my-campaign", icon: HiOutlineChartBar },
      { name: "Earnings", href: "/influencer/earnings", icon: HiCurrencyDollar },
      { name: "Messages", href: "/influencer/messages", icon: HiChatAlt2, badgeCount: 3 },
      { name: "Notifications", href: "/influencer/notifications", icon: HiBell, badgeCount: 5 },
    ],
  },
  {
    title: "Settings",
    items: [
      { name: "Preferences", href: "/influencer/settings/preferences", icon: HiCog },
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
    )
  }));

  const sidebar = (
    <div className={`flex flex-col h-full bg-gray-900 text-gray-100 ${collapsed ? 'w-20' : 'w-72'} transition-width duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        {!collapsed && <h2 className="text-lg font-bold">Influencer Hub</h2>}
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="p-2 rounded-md hover:bg-teal-700 focus:outline-none"
          title={collapsed ? "Expand" : "Collapse"}
        >
          <HiMenu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto mt-4">
        {filteredSections.map(section => (
          <div key={section.title} className="mb-4">
            {!collapsed && <span className="px-4 text-xs uppercase text-gray-500">{section.title}</span>}
            <ul className="mt-2">
              {section.items.map(item => {
                const active = pathname === item.href;
                return (
                  <li key={item.href} className="group">
                    <Link
                      href={item.href}
                      className={`
        flex items-center py-2 px-4 rounded-md transition-colors duration-200
        ${active ? 'bg-teal-700 text-white' : 'text-gray-300 hover:bg-teal-800 hover:text-white'}
        ${item.name === 'New Collab' ? 'font-bold bg-indigo-600 text-white animate-pulse' : ''}
      `}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon size={20} />
                      {!collapsed && <span className="ml-3 flex-1 text-sm font-medium">{item.name}</span>}
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
          className="w-full flex items-center py-2 px-4 rounded-md text-gray-300 hover:bg-teal-800 hover:text-white transition-colors duration-200"
          title={collapsed ? "Logout" : undefined}
        >
          <HiLogout size={20} />
          {!collapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
          <div className="relative flex flex-col h-full bg-gray-900 text-gray-100 w-64">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
              <h2 className="text-lg font-bold">Influencer Hub</h2>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-teal-700">
                <HiX size={24} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto mt-2">
              {filteredSections.map(section => (
                <div key={section.title} className="mb-4">
                  <span className="px-4 text-xs uppercase text-gray-500">{section.title}</span>
                  <ul className="mt-2">
                    {section.items.map(item => {
                      const active = pathname === item.href;
                      return (
                        <li key={item.href} className="group">
                          <Link
                            href={item.href}
                            className={`flex items-center py-2 px-4 rounded-md transition-colors duration-200 ${active ? 'bg-teal-700 text-white' : 'text-gray-300 hover:bg-teal-800 hover:text-white'
                              }`}
                            onClick={onClose}
                          >
                            <item.icon size={20} />
                            <span className="ml-3 text-sm font-medium">{item.name}</span>
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
            <div className="border-t border-gray-700 p-4">
              <button
                onClick={() => { handleLogout(); onClose(); }}
                className="w-full flex items-center py-2 px-4 rounded-md text-gray-300 hover:bg-teal-800 hover:text-white transition-colors duration-200"
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
