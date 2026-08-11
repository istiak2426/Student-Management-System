"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const studentSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  dateOfBirth: z.string().min(1, "Date of birth required"),
  programme: z.string().min(1, "Programme required"),
  academicYear: z.string().min(1, "Academic year required"),
  enrolmentStatus: z.enum(["ENROLLED", "DEFERRED", "WITHDRAWN", "COMPLETED"]),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function StudentForm({ onClose, onSuccess }: StudentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      enrolmentStatus: "ENROLLED",
    },
  });

  const onSubmit = async (data: StudentFormData) => {
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create student");
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Error creating student");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input {...register("fullName")} />
            {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
          </div>
          <div>
            <Label>Email</Label>
            <Input {...register("email")} type="email" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <Label>Date of Birth</Label>
            <Input {...register("dateOfBirth")} type="date" />
            {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth.message}</p>}
          </div>
          <div>
            <Label>Programme</Label>
            <Input {...register("programme")} />
            {errors.programme && <p className="text-red-500 text-sm">{errors.programme.message}</p>}
          </div>
          <div>
            <Label>Academic Year</Label>
            <Input {...register("academicYear")} placeholder="e.g., 2024/2025" />
            {errors.academicYear && <p className="text-red-500 text-sm">{errors.academicYear.message}</p>}
          </div>
          <div>
            <Label>Enrolment Status</Label>
            <Select
              value={watch("enrolmentStatus")}
              onValueChange={(val) => setValue("enrolmentStatus", val as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENROLLED">Enrolled</SelectItem>
                <SelectItem value="DEFERRED">Deferred</SelectItem>
                <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
            {errors.enrolmentStatus && <p className="text-red-500 text-sm">{errors.enrolmentStatus.message}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}