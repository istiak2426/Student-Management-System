import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const publishSchema = z.object({
  markId: z.string().min(1),
  isPublished: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { markId, isPublished } = publishSchema.parse(body);

    const mark = await prisma.mark.findUnique({
      where: { id: markId },
    });
    if (!mark) {
      return NextResponse.json({ error: 'Mark not found' }, { status: 404 });
    }

    const updated = await prisma.mark.update({
      where: { id: markId },
      data: { isPublished },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating publication status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}