export type Role =
  | "student"
  | "ambassador"
  | "professional"
  | "partner"
  | "partner_admin"
  | "super_admin"
  | "admin";

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

export type StudentRoleProfile = {
  type: "student";
  education_level?: string | null;
  study_field?: string | null;
  university_id?: number | null;
  university?: string | null;
  faculty_id?: number | null;
  faculty?: string | null;
  onboarding_completed: boolean;
};

export type AmbassadorRoleProfile = {
  type: "ambassador";
  university_id?: number | null;
  university?: string | null;
  faculty_id?: number | null;
  faculty?: string | null;
  is_verified?: boolean;
  training_date?: string | null;
  onboarding_completed: boolean;
};

export type ProfessionalRoleProfile = {
  type: "professional";
  title?: string;
  bio?: string | null;
  phone?: string | null;
  is_available?: boolean;
  onboarding_completed: boolean;
};

export type PartnerRoleProfile = {
  type: "partner";
  institution_id?: number | null;
  institution_name?: string | null;
  institution_type?: string | null;
  position?: string | null;
  onboarding_completed: boolean;
};

export type RoleProfile =
  | StudentRoleProfile
  | AmbassadorRoleProfile
  | ProfessionalRoleProfile
  | PartnerRoleProfile;

export type User = {
  id?: number;
  name: string;
  email: string;
  role: Role;
  roleLabel?: string;
  roleProfile?: RoleProfile | null;
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
