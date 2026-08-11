import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        fees: {
          include: { payments: true },
        },
        submissions: {
          include: { assessment: true },
          orderBy: { submittedAt: 'desc' },
        },
        marks: {
          include: { assessment: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}