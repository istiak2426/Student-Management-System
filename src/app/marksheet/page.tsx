// app/marksheet/page.tsx
"use client";
import { useRole } from "@/context/RoleContext";
import { useEffect, useState } from "react";

export default function MarksheetPage() {
  const { user } = useRole();
  const studentId = user?.id; // get the student ID
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId) {
      // If no student ID, maybe the user is staff – handle gracefully
      setError("No student logged in.");
      setLoading(false);
      return;
    }

    fetch(`/api/assessments?studentId=${studentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => setAssessments(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [studentId]);

  // Render loading, error, or the table
  if (loading) return <div>Loading marksheet...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!assessments.length) return <div>No assessments found.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Marksheet</h1>
      <table className="w-full border">
        <thead>
          <tr><th>Subject</th><th>Score</th><th>Grade</th></tr>
        </thead>
        <tbody>
          {assessments.map((a) => (
            <tr key={a.id}>
              <td>{a.subject}</td>
              <td>{a.score}</td>
              <td>{a.grade || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}