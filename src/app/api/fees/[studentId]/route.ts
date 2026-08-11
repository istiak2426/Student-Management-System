import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;
    const { amount, reference, paymentDate } = await request.json();

    // Find the fee record for this student – use findFirst because studentId is not unique
    const fee = await prisma.fee.findFirst({
      where: { studentId },
    });

    if (!fee) {
      return NextResponse.json(
        { error: 'Fee record not found for this student' },
        { status: 404 }
      );
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        feeId: fee.id,
        amount,
        reference,
        paymentDate: new Date(paymentDate),
      },
    });

    // Recalculate total paid
    const totalPaid = await prisma.payment.aggregate({
      where: { feeId: fee.id },
      _sum: { amount: true },
    });

    // Update fee's paidAmount
    await prisma.fee.update({
      where: { id: fee.id },
      data: {
        paidAmount: totalPaid._sum.amount || 0,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}