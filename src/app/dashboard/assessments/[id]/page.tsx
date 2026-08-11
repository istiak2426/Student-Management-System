"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "@/context/RoleContext";

type Submission = {
  id: string;
  student: { fullName: string; studentId: string };
  fileUrl: string;
  submittedAt: string;
  isLate: boolean;
  isResubmission: boolean;
};

type AssessmentDetail = {
  id: string;
  title: string;
  module: string;
  deadline: string;
  submissions: Submission[];
};

export default function AssessmentDetailPage() {
  const { id } = useParams();
  const { role } = useRole();
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [students, setStudents] = useState<{ id: string; fullName: string }[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAssessment = async () => {
    const res = await fetch(`/api/assessments/${id}`);
    if (res.ok) {
      const data = await res.json();
      setAssessment(data);
    }
    setLoading(false);
  };

  const fetchStudents = async () => {
    const res = await fetch("/api/students");
    const data = await res.json();
    setStudents(data);
  };

  useEffect(() => {
    fetchAssessment();
    fetchStudents();
  }, [id]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedStudent) {
      alert("Select a student and a file");
      return;
    }

    const formData = new FormData();
    formData.append("studentId", selectedStudent);
    formData.append("file", file);

    const res = await fetch(`/api/assessments/${id}/submissions`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      setFile(null);
      setSelectedStudent("");
      fetchAssessment();
    } else {
      const err = await res.json();
      alert(err.error || "Upload failed");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!assessment) return <div>Assessment not found</div>;

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{assessment.title}</h1>
        <p className="text-muted-foreground">{assessment.module}</p>
        <p>Deadline: {new Date(assessment.deadline).toLocaleString()}</p>
      </div>

      {role === "staff" && (
        <form onSubmit={handleUpload} className="mb-6 p-4 border rounded flex flex-wrap gap-4 items-end">
          <div>
            <Label>Student</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>File (PDF/DOCX)</Label>
            <Input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button type="submit">Upload Submission</Button>
        </form>
      )}

      <h2 className="text-xl font-semibold mb-2">Submissions ({assessment.submissions.length})</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Submitted At</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>File</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessment.submissions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell>{sub.student.fullName} ({sub.student.studentId})</TableCell>
              <TableCell>{new Date(sub.submittedAt).toLocaleString()}</TableCell>
              <TableCell>
                {sub.isLate && <Badge variant="destructive">Late</Badge>}
                {sub.isResubmission && <Badge variant="secondary">Resubmitted</Badge>}
                {!sub.isLate && !sub.isResubmission && <Badge variant="default">On Time</Badge>}
              </TableCell>
              <TableCell>
                <a href={sub.fileUrl} target="_blank" className="text-blue-600 underline">
                  View
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}