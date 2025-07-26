"use client";

import { Input } from "@/components/ui/input";
import React, { useCallback, useRef, useState } from "react";
import { HiOutlineSearch, HiX } from "react-icons/hi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";

export default function InfluencerDashboard() {

  // --- Search state ---
  const [searchOpen, setSearchOpen] = useState(false); // mobile only
  const [searchQuery, setSearchQuery] = useState("");
  const searchFormRef = useRef<HTMLFormElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const q = searchQuery.trim();
      // if (!q) return;
      // // Adjust destination route as needed. Using /brand/search for now.
      // router.push(`/brand/search?query=${encodeURIComponent(q)}`);
      setSearchOpen(false);
    },
    [searchQuery]
  );


  return (
    <div className="flex h-screen">
      <div className="flex-1 bg-[#F5E1A4]/20 p-6 overflow-y-auto">
        
      </div>
    </div >
  );
}
