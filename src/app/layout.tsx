import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SMS Registry",
  description: "Student Management System - Registry Module",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RoleProvider>
          <Navbar />
          <main className="container mx-auto py-6 px-4">{children}</main>
        </RoleProvider>
      </body>
    </html>
  );
}