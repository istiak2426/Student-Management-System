"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const paymentSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .transform((val, ctx) => {
      const cleaned = val.replace(/,/g, "").trim();
      const num = parseFloat(cleaned);
      if (isNaN(num)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid number",
        });
        return z.NEVER;
      }
      if (num <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Amount must be positive",
        });
        return z.NEVER;
      }
      return num;
    }),
  reference: z.string().min(1, "Reference required"),
  paymentDate: z.string().min(1, "Date required"),
});

type PaymentFormInput = z.input<typeof paymentSchema>;
type PaymentFormOutput = z.output<typeof paymentSchema>;

interface PaymentDialogProps {
  studentId: string;
  feeId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentDialog({ studentId, feeId, onClose, onSuccess }: PaymentDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormInput, unknown, PaymentFormOutput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: "",
      reference: "",
      paymentDate: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: PaymentFormOutput) => {
    try {
      const res = await fetch(`/api/fees/${studentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to record payment");
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Error recording payment");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Amount</Label>
            <Input {...register("amount")} type="text" inputMode="decimal" placeholder="0.00" />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
          </div>
          <div>
            <Label>Reference</Label>
            <Input {...register("reference")} placeholder="e.g., PAY-1234" />
            {errors.reference && <p className="text-red-500 text-sm">{errors.reference.message}</p>}
          </div>
          <div>
            <Label>Payment Date</Label>
            <Input {...register("paymentDate")} type="date" />
            {errors.paymentDate && <p className="text-red-500 text-sm">{errors.paymentDate.message}</p>}
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