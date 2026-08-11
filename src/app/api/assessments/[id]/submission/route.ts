// src/app/api/assessments/[id]/submissions/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const assessmentId = params.id
  const formData = await request.formData()
  const studentId = formData.get('studentId') as string
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  // Check if assessment exists and is open (deadline)
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
  })
  if (!assessment) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
  }

  const now = new Date()
  const isLate = now > assessment.deadline

  // Check existing submission – if exists, allow resubmission only if before deadline
  const existing = await prisma.submission.findFirst({
    where: { studentId, assessmentId },
  })
  if (existing && isLate) {
    return NextResponse.json(
      { error: 'Resubmission not allowed after deadline' },
      { status: 400 }
    )
  }

  // Save file to public/uploads (or cloud storage)
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const uploadDir = path.join(process.cwd(), 'public/uploads')
  await mkdir(uploadDir, { recursive: true })
  const filename = `${studentId}-${assessmentId}-${Date.now()}-${file.name}`
  const filePath = path.join(uploadDir, filename)
  await writeFile(filePath, buffer)

  const fileUrl = `/uploads/${filename}`

  // Create or update submission
  let submission
  if (existing) {
    submission = await prisma.submission.update({
      where: { id: existing.id },
      data: {
        fileUrl,
        submittedAt: now,
        isLate,
        isResubmission: true,
      },
    })
  } else {
    submission = await prisma.submission.create({
      data: {
        studentId,
        assessmentId,
        fileUrl,
        submittedAt: now,
        isLate,
        isResubmission: false,
      },
    })
  }

  return NextResponse.json(submission, { status: 201 })
}