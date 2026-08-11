"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const assessmentSchema = z.object({
  title: z.string().min(1),
  module: z.string().min(1),
  deadline: z.string().min(1),
});

type Assessment = {
  id: string;
  title: string;
  module: string;
  deadline: string;
};

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(assessmentSchema),
  });

  const fetchAssessments = async () => {
    const res = await fetch("/api/assessments");
    const data = await res.json();
    setAssessments(data);
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const onSubmit = async (data: any) => {
    const res = await fetch("/api/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      reset();
      setShowCreate(false);
      fetchAssessments();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Assessments</h1>
        <Button onClick={() => setShowCreate(true)}>Create Assessment</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Module</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((ass) => (
            <TableRow key={ass.id}>
              <TableCell>{ass.title}</TableCell>
              <TableCell>{ass.module}</TableCell>
              <TableCell>{new Date(ass.deadline).toLocaleString()}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/assessments/${ass.id}`)}
                >
                  View Submissions
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Assessment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input {...register("title")} />
            </div>
            <div>
              <Label>Module</Label>
              <Input {...register("module")} />
            </div>
            <div>
              <Label>Deadline</Label>
              <Input {...register("deadline")} type="datetime-local" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}