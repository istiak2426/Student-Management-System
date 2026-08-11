// src/app/api/students/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  const id = searchParams.get('id')
  const programme = searchParams.get('programme')
  const status = searchParams.get('status')

  const where: any = {}
  if (name) where.fullName = { contains: name, mode: 'insensitive' }
  if (id) where.studentId = { contains: id }
  if (programme) where.programme = { contains: programme, mode: 'insensitive' }
  if (status) where.enrolmentStatus = status

  const students = await prisma.student.findMany({
    where,
    include: {
      fees: { include: { payments: true } },
      marks: { where: { isPublished: true } },
    },
  })

  return NextResponse.json(students)
}

// POST create student
export async function POST(request: Request) {
  const body = await request.json()
  const { fullName, email, dateOfBirth, programme, academicYear, enrolmentStatus } = body

  // Generate student ID (e.g., SMS-2025-0001)
  const lastStudent = await prisma.student.findFirst({
    orderBy: { studentId: 'desc' },
  })
  let nextNum = 1
  if (lastStudent) {
    const match = lastStudent.studentId.match(/SMS-(\d{4})-(\d{4})/)
    if (match) {
      nextNum = parseInt(match[2]) + 1
    }
  }
  const studentId = `SMS-2025-${String(nextNum).padStart(4, '0')}`

  const student = await prisma.student.create({
    data: {
      studentId,
      fullName,
      email,
      dateOfBirth: new Date(dateOfBirth),
      programme,
      academicYear,
      enrolmentStatus,
    },
  })

  // Optionally create a fee record automatically (maybe default)
  // We'll create fee separately or via a trigger

  return NextResponse.json(student, { status: 201 })
}