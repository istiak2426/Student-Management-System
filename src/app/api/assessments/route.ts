// app/api/assessments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const where = studentId ? { studentId } : {};

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        student: true, // optional, to get student details
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}