"use client"

import React, { useEffect, useState, useMemo } from "react";
import { post } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, parseISO } from "date-fns";
import Swal from "sweetalert2";

interface Submission {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

const PAGE_SIZE = 10;

export default function ContactUsAdmin() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const data = await post<Submission[]>("/contact/getlist");
        setSubmissions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError("Failed to load submissions.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRowClick = (sub: Submission) => {
    Swal.fire({
      title: sub.subject,
      html: `
        <p><strong>Name:</strong> ${sub.name}</p>
        <p><strong>Email:</strong> ${sub.email}</p>
        <p><strong>Date:</strong> ${new Date(sub.createdAt).toLocaleString()}</p>
        <hr />
        <p style="white-space: pre-wrap; text-align: left;">${sub.message}</p>
      `,
      width: '600px',
      confirmButtonText: 'Close',
    });
  };

  // Filter & pagination
  const filtered = useMemo(
    () => submissions.filter((sub) =>
      [sub.name, sub.email, sub.subject]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    ),
    [submissions, searchTerm]
  );

  const total = submissions.length;
  const lastSubmission =
    total > 0
      ? submissions.reduce((prev, curr) =>
          new Date(prev.createdAt) > new Date(curr.createdAt) ? prev : curr
        ).createdAt
      : null;

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  if (loading) {
    return <CardContent>Loading submissions…</CardContent>;
  }
  if (error) {
    return <CardContent className="text-red-600">{error}</CardContent>;
  }
  if (total === 0) {
    return <CardContent>No submissions yet.</CardContent>;
  }

  return (
    <div className="flex flex-col p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Contact Us Submissions</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Submissions</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{total}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Last Submission</CardTitle>
          </CardHeader>
          <CardContent>
            {lastSubmission ? (
              <div className="flex items-center space-x-2">
                <span>
                  {formatDistanceToNow(parseISO(lastSubmission), {
                    addSuffix: true,
                  })}
                </span>
                <Badge variant="secondary">
                  {new Date(lastSubmission).toLocaleDateString()}
                </Badge>
              </div>
            ) : (
              <span>No submissions</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search name, email or subject…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((sub) => (
              <TableRow
                key={sub._id}
                className="even:bg-gray-50 hover:bg-gray-50 cursor-pointer transition"
                onClick={() => handleRowClick(sub)}
              >
                <TableCell>{new Date(sub.createdAt).toLocaleString()}</TableCell>
                <TableCell>{sub.name}</TableCell>
                <TableCell>{sub.email}</TableCell>
                <TableCell>{sub.subject}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span>
            Page {page} of {pageCount}
          </span>
          <Button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}