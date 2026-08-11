"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type FeeRow = {
  studentId: string;
  studentIdRef: string;
  fullName: string;
  programme: string;
  totalFee: number;
  paid: number;
  outstanding: number;
  isOverdue: boolean;
};

export default function FeesPage() {
  const [fees, setFees] = useState<FeeRow[]>([]);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await fetch("/api/fees");
        if (!res.ok) throw new Error("Failed to fetch fees");
        const data = await res.json();
        setFees(data);
      } catch (error) {
        console.error("Error fetching fees:", error);
      }
    };
    fetchFees();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Fees & Payments</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Programme</TableHead>
            <TableHead>Total Fee</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Outstanding</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fees.map((fee) => (
            <TableRow key={fee.studentId}>
              <TableCell>{fee.fullName}</TableCell>
              <TableCell>{fee.programme}</TableCell>
              <TableCell>${fee.totalFee.toFixed(2)}</TableCell>
              <TableCell>${fee.paid.toFixed(2)}</TableCell>
              <TableCell>${fee.outstanding.toFixed(2)}</TableCell>
              <TableCell>
                {fee.isOverdue ? (
                  <Badge variant="destructive">Overdue</Badge>
                ) : (
                  <Badge variant="secondary">Paid</Badge>
                )}
              </TableCell>
              <TableCell>
                <Link href={`/dashboard/students/${fee.studentIdRef}`}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}