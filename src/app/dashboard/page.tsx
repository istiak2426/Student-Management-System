"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/context/RoleContext";

export default function Dashboard() {
  const { role } = useRole();
  const [stats, setStats] = useState({
    totalStudents: 0,
    overdueStudents: 0,
    totalAssessments: 0,
    totalPayments: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all three endpoints in parallel
        const [studentsRes, feesRes, assessmentsRes] = await Promise.all([
          fetch("/api/students"),
          fetch("/api/fees"),
          fetch("/api/assessments"),
        ]);

        // Parse JSON – if any fails, it will throw
        const students = await studentsRes.json();
        const fees = await feesRes.json();
        const assessments = await assessmentsRes.json();

        // Ensure they are arrays
        const studentsArray = Array.isArray(students) ? students : [];
        const feesArray = Array.isArray(fees) ? fees : [];
        const assessmentsArray = Array.isArray(assessments) ? assessments : [];

        // Compute overdue: fees that have outstanding > 0
        const overdue = feesArray.filter((f: any) => f.outstanding > 0).length;

        // Compute total payments: sum of payments.length from each fee
        const totalPayments = feesArray.reduce(
          (acc: number, f: any) => acc + (f.payments?.length || 0),
          0
        );

        setStats({
          totalStudents: studentsArray.length,
          overdueStudents: overdue,
          totalAssessments: assessmentsArray.length,
          totalPayments,
        });
        setError(null);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setError("Unable to load dashboard data. Check API endpoints.");
        // Set all to 0 on error (they already are)
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overdue Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{stats.overdueStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalAssessments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payments Recorded</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalPayments}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}