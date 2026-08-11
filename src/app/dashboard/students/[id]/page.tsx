"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// ---------- Inline Payment Dialog ----------
const paymentSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .transform((val, ctx) => {
      const cleaned = val.replace(/,/g, "").trim();
      const num = parseFloat(cleaned);
      if (isNaN(num)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please enter a valid number" });
        return z.NEVER;
      }
      if (num <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Amount must be greater than 0" });
        return z.NEVER;
      }
      return num;
    }),
  reference: z.string().min(1, "Reference is required"),
  paymentDate: z.string().min(1, "Date is required"),
});

type PaymentFormInput = z.input<typeof paymentSchema>;
type PaymentFormOutput = z.output<typeof paymentSchema>;

function PaymentDialogInline({
  studentId,
  onClose,
  onSuccess,
}: {
  studentId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormInput, unknown, PaymentFormOutput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: "",
      reference: "",
      paymentDate: new Date().toISOString().split("T")[0],
    },
  });

  // DEBUG: watch live field values
  const watched = watch();
  useEffect(() => {
    console.log("🔍 LIVE FORM VALUES:", watched);
  }, [watched.amount, watched.reference, watched.paymentDate]);

  // DEBUG: log full error objects on failed validation
  const onError = (formErrors: any) => {
    console.log("❌ RAW VALIDATION ERRORS:", JSON.stringify(formErrors, null, 2));
  };

  const onSubmit = async (data: PaymentFormOutput) => {
    console.log("✅ VALIDATION PASSED, submitting:", data);

    let isoDate = data.paymentDate;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.paymentDate)) {
      const parsed = new Date(data.paymentDate);
      if (!isNaN(parsed.getTime())) {
        isoDate = parsed.toISOString().split("T")[0];
      } else {
        alert("Invalid date format. Please use MM/DD/YYYY or YYYY-MM-DD.");
        return;
      }
    }

    const payload = { amount: data.amount, reference: data.reference, paymentDate: isoDate };
    console.log("Submitting payment:", payload);

    try {
      const res = await fetch(`/api/fees/${studentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to record payment");
      }
      onSuccess();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error recording payment");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
          <div>
            <Label>Amount</Label>
            <Input {...register("amount")} type="text" placeholder="0.00" inputMode="decimal" />
            {errors.amount && <p className="text-red-500 text-sm">DEBUG:{errors.amount.message}</p>}
          </div>
          <div>
            <Label>Reference</Label>
            <Input {...register("reference")} placeholder="e.g., PAY-001" />
            {errors.reference && <p className="text-red-500 text-sm">DEBUG:{errors.reference.message}</p>}
          </div>
          <div>
            <Label>Payment Date</Label>
            <Input {...register("paymentDate")} type="text" placeholder="MM/DD/YYYY or YYYY-MM-DD" />
            {errors.paymentDate && <p className="text-red-500 text-sm">DEBUG:{errors.paymentDate.message}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Enter as MM/DD/YYYY (e.g., 08/04/2026) or YYYY-MM-DD (e.g., 2026-08-04).
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
// ---------- End inline dialog ----------

// Types
type StudentDetail = {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  programme: string;
  academicYear: string;
  enrolmentStatus: string;
  fees: {
    id: string;
    amount: number;
    paidAmount: number;
    payments: { id: string; amount: number; paymentDate: string; reference: string }[];
  }[];
  submissions: {
    id: string;
    assessment: { title: string; module: string; deadline: string };
    fileUrl: string;
    submittedAt: string;
    isLate: boolean;
  }[];
  marks: {
    id: string;
    grade: number;
    classification: string;
    isPublished: boolean;
    assessment: { title: string; module: string };
  }[];
};

export default function StudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  const fetchStudent = async () => {
    try {
      const res = await fetch(`/api/students/${id}`);
      if (!res.ok) throw new Error("Student not found");
      const data = await res.json();
      setStudent(data);
    } catch (error) {
      console.error("Error fetching student:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!student) return <div>Student not found</div>;

  const fee = student.fees[0];
  const outstanding = fee ? fee.amount - fee.paidAmount : 0;
  const isOverdue = outstanding > 0;

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold">{student.fullName}</h1>
          <p className="text-muted-foreground">{student.studentId}</p>
        </div>
        <Badge>{student.enrolmentStatus}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Email:</strong> {student.email}</p>
            <p><strong>Date of Birth:</strong> {new Date(student.dateOfBirth).toLocaleDateString()}</p>
            <p><strong>Programme:</strong> {student.programme}</p>
            <p><strong>Academic Year:</strong> {student.academicYear}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fees & Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {fee ? (
              <>
                <p><strong>Total Fee:</strong> ${fee.amount.toFixed(2)}</p>
                <p><strong>Paid:</strong> ${fee.paidAmount.toFixed(2)}</p>
                <p><strong>Outstanding:</strong> ${outstanding.toFixed(2)}</p>
                {isOverdue && <p className="text-red-600 font-semibold">⚠️ Overdue</p>}
                <Button onClick={() => setShowPayment(true)} className="mt-2">
                  Record Payment
                </Button>
              </>
            ) : (
              <p>No fee record. Please contact administration.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="submissions">
        <TabsList>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="marks">Marks</TabsTrigger>
        </TabsList>
        <TabsContent value="submissions">
          {student.submissions.length === 0 ? (
            <p>No submissions.</p>
          ) : (
            <ul className="space-y-2">
              {student.submissions.map((sub) => (
                <li key={sub.id} className="border p-2 rounded flex justify-between">
                  <div>
                    <p className="font-medium">{sub.assessment.title}</p>
                    <p className="text-sm text-muted-foreground">{sub.assessment.module}</p>
                    <p className="text-sm">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    {sub.isLate && <Badge variant="destructive">Late</Badge>}
                    <a href={sub.fileUrl} target="_blank" className="text-blue-600 underline ml-2">
                      View File
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
        <TabsContent value="marks">
          {student.marks.length === 0 ? (
            <p>No marks available.</p>
          ) : (
            <ul className="space-y-2">
              {student.marks.map((mark) => (
                <li key={mark.id} className="border p-2 rounded flex justify-between">
                  <div>
                    <p className="font-medium">{mark.assessment.title}</p>
                    <p className="text-sm text-muted-foreground">{mark.assessment.module}</p>
                  </div>
                  <div>
                    {mark.isPublished ? (
                      <span>
                        <span className="font-bold">{mark.grade}</span> – {mark.classification}
                      </span>
                    ) : (
                      <Badge variant="outline">Withheld</Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      {showPayment && (
        <PaymentDialogInline
          studentId={student.id}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            fetchStudent();
          }}
        />
      )}
    </div>
  );
}