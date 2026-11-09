export type Role = "student" | "ambassador" | "professional" | "partner_admin" | "super_admin";

export type User = {
  name: string;
  email: string;
  role: Role;
  status?: "active" | "pending";
  university?: string;
};

export type NavItem = { label: string; icon: string; path: string };
