// src/app/api/assessments/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const assessments = await prisma.assessment.findMany({
      include: {
        submissions: true,
        marks: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}