"use client";

import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { role, toggleRole } = useRole();
  const pathname = usePathname();

  const isStaff = role === "staff";

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            SMS Registry
          </Link>
          <div className="flex gap-4">
            {isStaff ? (
              <>
                <Link
                  href="/dashboard/students"
                  className={pathname.startsWith("/dashboard/students") ? "underline" : ""}
                >
                  Students
                </Link>
                <Link
                  href="/dashboard/fees"
                  className={pathname.startsWith("/dashboard/fees") ? "underline" : ""}
                >
                  Fees
                </Link>
                <Link
                  href="/dashboard/assessments"
                  className={pathname.startsWith("/dashboard/assessments") ? "underline" : ""}
                >
                  Assessments
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard/marksheet"
                className={pathname.startsWith("/dashboard/marksheet") ? "underline" : ""}
              >
                My Marksheet
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm capitalize">{role}</span>
          <Button variant="outline" size="sm" onClick={toggleRole}>
            Switch to {isStaff ? "Student" : "Staff"}
          </Button>
        </div>
      </div>
    </nav>
  );
}