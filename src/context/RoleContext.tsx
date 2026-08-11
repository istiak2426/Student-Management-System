// context/RoleContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Role = "staff" | "student";

// Add a user type
type User = {
  id: string;
  role: Role;
  // ... other fields you might have (name, email, etc.)
};

interface RoleContextType {
  user: User | null;          // <-- add user object
  setUser: (user: User) => void; // optional setter
  toggleRole: () => void;     // keep toggling role if needed
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  // Simulate a logged‑in student (replace with real login later)
  const [user, setUser] = useState<User | null>({
    id: "your-student-id-here",   // ⚠️ replace with actual student ID
    role: "student",
  });

  // Toggle role (for demo purposes) – you might want to toggle user.role directly
  const toggleRole = () => {
    if (!user) return;
    const newRole = user.role === "staff" ? "student" : "staff";
    setUser({ ...user, role: newRole });
  };

  return (
    <RoleContext.Provider value={{ user, setUser, toggleRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within RoleProvider");
  return context;
}