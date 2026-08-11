import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for grade entry
const markSchema = z.object({
  studentId: z.string().min(1),
  assessmentId: z.string().min(1),
  grade: z.number().min(0).max(100),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, assessmentId, grade } = markSchema.parse(body);

    // Check if the student and assessment exist
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Determine classification
    let classification: string | null = null;
    if (grade >= 70) classification = 'Distinction';
    else if (grade >= 60) classification = 'Merit';
    else if (grade >= 40) classification = 'Pass';

    // Upsert mark
    const mark = await prisma.mark.upsert({
      where: {
        studentId_assessmentId: { studentId, assessmentId },
      },
      update: {
        grade,
        classification,
        // isPublished remains as is (default false, but we can allow setting via another endpoint)
      },
      create: {
        studentId,
        assessmentId,
        grade,
        classification,
        isPublished: false, // default withheld
      },
    });

    return NextResponse.json(mark, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating/updating mark:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}