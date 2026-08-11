// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const role = request.cookies.get('role')?.value || 'staff'
  const path = request.nextUrl.pathname

  // Protect marksheet – only student can view
  if (path.startsWith('/dashboard/marksheet') && role !== 'student') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect staff routes – only staff
  if (path.startsWith('/dashboard/students') && role !== 'staff') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ... other protections
}