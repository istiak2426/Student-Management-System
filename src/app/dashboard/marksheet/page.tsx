"use client";

import { useEffect, useState } from "react";
import { useRole } from "@/context/RoleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

type Mark = {
  id: string;
  grade: number;
  classification: string;
  isPublished: boolean;
  assessment: { title: string; module: string };
};

// In a real app, we would have a logged-in student; here we simulate by picking a random student or using a fixed one.
// For demo, we'll use a student ID from the seed (e.g., the first student).
export default function MarksheetPage() {
  const { role } = useRole();
  const router = useRouter();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "student") {
      router.push("/dashboard");
      return;
    }

    // For demo, fetch the first student's marks (or we could allow a student selector)
    const fetchMarks = async () => {
      try {
        // Get all students, pick the first one
        const studentsRes = await fetch("/api/students");
        const students = await studentsRes.json();
        if (students.length === 0) return;
        const studentId = students[0].id;
        setStudentName(students[0].fullName);
        const marksRes = await fetch(`/api/students/${studentId}/marks`);
        const marksData = await marksRes.json();
        setMarks(marksData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, [role, router]);

  if (loading) return <div>Loading marks...</div>;

  const publishedMarks = marks.filter((m) => m.isPublished);
  const withheld = marks.filter((m) => !m.isPublished);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Marksheet</h1>
      <p className="mb-4">Student: {studentName}</p>

      {publishedMarks.length === 0 && withheld.length === 0 && (
        <p>No marks available.</p>
      )}

      {publishedMarks.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Published Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Classification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publishedMarks.map((mark) => (
                  <TableRow key={mark.id}>
                    <TableCell>{mark.assessment.title}</TableCell>
                    <TableCell>{mark.assessment.module}</TableCell>
                    <TableCell>{mark.grade}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{mark.classification}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {withheld.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Withheld Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The following assessments have not been published yet:
            </p>
            <ul className="list-disc list-inside">
              {withheld.map((mark) => (
                <li key={mark.id}>{mark.assessment.title} – {mark.assessment.module}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}