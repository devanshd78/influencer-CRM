"use client"

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface Campaign {
  id: string;
  name: string;
  appliedDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function InfluencerCampaignsPage() {
  const params = useSearchParams();
  const influencerId = params.get('influencerId');

  // Early return if influencerId is missing
  if (!influencerId) {
    return (
      <div className="p-6">
        <p className="text-red-600">Error: Missing influencer ID in the URL.</p>
      </div>
    );
  }

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filter, setFilter] = useState<'all' | 'approved'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/influencers/${influencerId}/campaigns`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data: Campaign[]) => {
        setCampaigns(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [influencerId]);

  // Apply status filter
  const filtered = campaigns.filter((c) =>
    filter === 'all' ? true : c.status === 'approved'
  );

  if (loading) {
    return <p className="p-6">Loading campaigns...</p>;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">Error loading campaigns: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Campaigns for Influencer {influencerId}
      </h1>

      <div className="mb-4 flex items-center space-x-2">
        <span>Show:</span>
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p>No campaigns to display.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>
                  {new Date(c.appliedDate).toLocaleDateString()}
                </TableCell>
                <TableCell
                  className={`font-medium ${
                    {
                      approved: 'text-green-600',
                      pending: 'text-yellow-600',
                      rejected: 'text-red-600',
                    }[c.status] || 'text-gray-600'
                  }`}
                >
                  {c.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
