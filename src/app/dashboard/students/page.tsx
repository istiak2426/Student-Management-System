"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import StudentForm from "@/components/students/StudentForm";

type Student = {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  programme: string;
  enrolmentStatus: string;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    id: "",
    programme: "",
    status: "",
  });
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const fetchStudents = async () => {
    const params = new URLSearchParams();
    if (filters.name) params.append("name", filters.name);
    if (filters.id) params.append("id", filters.id);
    if (filters.programme) params.append("programme", filters.programme);
    if (filters.status) params.append("status", filters.status);

    const res = await fetch(`/api/students?${params.toString()}`);
    const data = await res.json();
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Students</h1>
        <Button onClick={() => setShowForm(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      {/* Search Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by name..."
          value={filters.name}
          onChange={(e) => handleFilterChange("name", e.target.value)}
          className="w-48"
        />
        <Input
          placeholder="Student ID..."
          value={filters.id}
          onChange={(e) => handleFilterChange("id", e.target.value)}
          className="w-40"
        />
        <Input
          placeholder="Programme..."
          value={filters.programme}
          onChange={(e) => handleFilterChange("programme", e.target.value)}
          className="w-48"
        />
        <Select
          value={filters.status}
          onValueChange={(val) => handleFilterChange("status", val)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="ENROLLED">Enrolled</SelectItem>
            <SelectItem value="DEFERRED">Deferred</SelectItem>
            <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setFilters({ name: "", id: "", programme: "", status: "" })}>
          Clear
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Programme</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.studentId}</TableCell>
              <TableCell>{student.fullName}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.programme}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    student.enrolmentStatus === "ENROLLED"
                      ? "default"
                      : student.enrolmentStatus === "COMPLETED"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {student.enrolmentStatus}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/students/${student.id}`)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showForm && (
        <StudentForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchStudents();
          }}
        />
      )}
    </div>
  );
}