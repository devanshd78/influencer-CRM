// app/brand/dashboard/layout.tsx
"use client";

import React, { useState } from "react";
import BrandSidebar from "@/components/common/brandSidebar";
import BrandTopbar from "@/components/common/brandTopbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (desktop always visible, mobile toggled) */}
      <BrandSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area: Topbar + content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <BrandTopbar
          onSidebarOpen={() => setSidebarOpen(true)}
        />

        {/* Apply background only to the children wrapper */}
        <main className="flex-1 overflow-y-auto bg-blue-100">
          {children}
        </main>
      </div>
    </div>
  );
}
