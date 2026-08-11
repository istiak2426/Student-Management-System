# Student Management System - Registry Module

A focused web application built for the PEN Group technical assessment, simulating the core Registry functions of a student management system.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Core Features & Workflows](#core-features--workflows)
  - [1. Student Enrollment](#1-student-enrollment)
  - [2. Fees & Payments](#2-fees--payments)
  - [3. Assessment Submission](#3-assessment-submission)
  - [4. Marksheet & Results](#4-marksheet--results)
- [Key Design Decisions & Edge Cases](#key-design-decisions--edge-cases)
- [Database Schema Overview](#database-schema-overview)
- [Demo Data](#demo-data)
- [Role Separation](#role-separation)
- [How I Used AI](#how-i-used-ai)
- [Screenshots](#screenshots)

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14+ (App Router) |
| Database | PostgreSQL |
| ORM | Prisma |
| Styling | Tailwind CSS & Shadcn UI |
| Language | TypeScript |
| File Uploads | `multer` / server-side handling |

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- **Node.js** v18 or later
- **PostgreSQL** (local instance or cloud provider like [Neon](https://neon.tech/) or [Supabase](https://supabase.com/))
- A code editor (VS Code recommended)
- **Git** (for cloning the repository)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [YOUR_REPOSITORY_URL]
   cd [YOUR_PROJECT_DIRECTORY]