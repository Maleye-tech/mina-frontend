export type Role = "student" | "ambassador" | "professional" | "partner_admin" | "super_admin";

export type UserPreferences = {
  language: string;
  notificationsEnabled: boolean;
};

export type UserConsent = {
  granted: boolean;
  version: string | null;
  recordedAt: string | null;
  currentVersion: string | null;
};

export type StudentProfile = {
  educationLevel: string | null;
  studyField: string | null;
  universityId: number | null;
  university: string | null;
  facultyId: number | null;
  faculty: string | null;
  onboardingCompleted: boolean;
};

export type User = {
  id?: number;
  name: string;
  email: string;
  role: Role;
  roleLabel?: string;
  status?: "active" | "pending";
  emailVerified?: boolean;
  pseudonym?: string | null;
  preferences?: UserPreferences;
  consents?: {
    personal_data?: UserConsent;
    mental_health_data?: UserConsent;
  };
  studentProfile?: StudentProfile | null;
  university?: string;
  isActive?: boolean;
  createdAt?: string;
};

export type NavItem = { label: string; icon: string; path: string };
