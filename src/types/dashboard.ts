export type DashboardStat = {
  label: string;
  value: string | number;
  change?: string;
  tone?: "teal" | "amber" | "violet" | "red" | "slate";
  icon?: string;
};

export type DashboardActivity = {
  id: number | string;
  title: string;
  type?: string;
  date?: string;
  score?: number | string;
  status?: string;
};

export type StudentDashboardData = {
  streak_days?: number;
  total_study_time?: number; // minutes
  qcms_answered?: number;
  flashcards_reviewed?: number;
  cases_completed?: number;
  success_rate?: number;
  next_reviews_count?: number;
  recommended_contents?: {
    id: number;
    title: string;
    subject: string;
    type: string;
  }[];
  recent_activities?: DashboardActivity[];
  stats?: Record<string, unknown> | DashboardStat[];
  [key: string]: unknown;
};

export type RoleDashboardData = {
  active_users_count?: number;
  pending_demands_count?: number;
  appointments_count?: number;
  validations_count?: number;
  stats?: Record<string, unknown> | DashboardStat[];
  recent_activities?: DashboardActivity[];
  [key: string]: unknown;
};
