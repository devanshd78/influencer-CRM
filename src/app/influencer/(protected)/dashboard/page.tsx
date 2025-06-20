"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";

const campaignData = [
  { month: "Jan", campaigns: 4 },
  { month: "Feb", campaigns: 6 },
  { month: "Mar", campaigns: 5 },
  { month: "Apr", campaigns: 7 },
  { month: "May", campaigns: 8 },
  { month: "Jun", campaigns: 6 },
];

const earningsData = [
  { month: "Jan", earnings: 1200 },
  { month: "Feb", earnings: 1500 },
  { month: "Mar", earnings: 1400 },
  { month: "Apr", earnings: 1800 },
  { month: "May", earnings: 2000 },
  { month: "Jun", earnings: 2200 },
];

export default function InfluencerDashboard() {
  return (
    <div className="flex h-screen">
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Total Campaigns</h3>
            <p className="text-3xl font-bold">24</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Total Earnings</h3>
            <p className="text-3xl font-bold">$12,450</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">New Messages</h3>
            <p className="text-3xl font-bold">8</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Campaigns Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={campaignData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="campaigns" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Earnings Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="earnings" stroke="#4ADE80" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
