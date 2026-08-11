import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id },
    });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // For students, only return published marks; for staff, we could return all.
    // We'll return only published marks to enforce the rule.
    // If staff wants all, they can use another endpoint or add a query param.
    const marks = await prisma.mark.findMany({
      where: {
        studentId: id,
        isPublished: true,
      },
      include: {
        assessment: true,
      },
      orderBy: {
        assessment: {
          title: 'asc',
        },
      },
    });

    return NextResponse.json(marks);
  } catch (error) {
    console.error('Error fetching marks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}