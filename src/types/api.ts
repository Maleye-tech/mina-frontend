export type ApiRole = "student" | "ambassador" | "professional" | "admin";

export type ApiConsent = {
  granted: boolean;
  version: string;
  recorded_at: string | null;
  current_version: string | null;
};

export type ApiPreferences = {
  language: string;
  notifications_enabled: boolean;
};

export type ApiStudentProfile = {
  education_level: string | null;
  study_field: string | null;
  university_id: number | null;
  university: string | null;
  faculty_id: number | null;
  faculty: string | null;
  onboarding_completed: boolean;
};

export type ApiProfile = {
  id: number;
  name: string;
  email: string;
  email_verified: boolean;
  role: ApiRole;
  role_label: string;
  pseudonym: string | null;
  preferences: ApiPreferences;
  consents: {
    personal_data: ApiConsent;
    mental_health_data: ApiConsent;
  };
  student_profile: ApiStudentProfile | null;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: ApiRole;
  role_label: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
};

export type PaginationLinks = {
  first?: string | null;
  last?: string | null;
  prev: string | null;
  next: string | null;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type Paginated<T> = {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
};

export type OnboardingQuestion = {
  key: string;
  label: string;
  input_type: string;
  is_required: boolean;
  sort_order: number;
  is_active?: boolean;
};

export type Faculty = {
  id: number;
  university_id: number;
  name: string;
};

export type University = {
  id: number;
  name: string;
  city: string;
  type: string;
  website_url: string | null;
  faculties: Faculty[];
};

export type OnboardingData = {
  questions: OnboardingQuestion[];
  universities: University[];
  student_profile: ApiStudentProfile | null;
};

export type TwoFactorSetup = {
  secret: string;
  otpauth_url: string;
};
