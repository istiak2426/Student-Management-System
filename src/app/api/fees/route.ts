import { NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        fees: {
          include: {
            payments: true,
          },
        },
      },
    });

    const result = students.map((student) => {
      const fee = student.fees[0]; // assume one fee record per student
      if (!fee) {
        return {
          studentId: student.id,
          studentIdRef: student.id,
          fullName: student.fullName,
          programme: student.programme,
          totalFee: 0,
          paid: 0,
          outstanding: 0,
          isOverdue: false,
          payments: [], // ✅ ensures dashboard sees an array
        };
      }
      const totalPaid = fee.payments.reduce((sum, p) => sum + p.amount, 0);
      const outstanding = fee.amount - totalPaid;
      return {
        studentId: student.id,
        studentIdRef: student.id,
        fullName: student.fullName,
        programme: student.programme,
        totalFee: fee.amount,
        paid: totalPaid,
        outstanding,
        isOverdue: outstanding > 0,
        payments: fee.payments, // ✅ now the full payment records are sent
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching fees:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}