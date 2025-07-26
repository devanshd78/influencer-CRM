// app/brand/dashboard/layout.tsx
"use client";

import React, { useState } from "react";
import InfluencerSidebar from "@/components/common/infSidebar";
import InfluencerTopbar from "@/components/common/infTopbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (desktop always visible, mobile toggled) */}
      <InfluencerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area: Topbar + content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <InfluencerTopbar
          onSidebarOpen={() => setSidebarOpen(true)}
        />

        {/* Apply background only to the children wrapper */}
       <main className="flex-1 overflow-y-auto bg-gradient-to-r from-[#FFDB58]/10 to-[#FFBF00]/5">
          {children}
        </main>
      </div>
    </div>
  );
}
