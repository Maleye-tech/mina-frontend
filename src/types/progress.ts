export type SubjectProgress = {
  subject_id: number;
  subject_name: string;
  total_questions?: number;
  answered_questions?: number;
  success_rate: number;
  mastery_percentage: number;
  level_name?: string;
};

export type ProgressItem = {
  id: number;
  user_id?: number;
  subject_id?: number;
  subject_name?: string;
  category?: string;
  score?: number;
  max_score?: number;
  percentage?: number;
  time_spent?: number; // seconds
  date?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type ProgressStats = {
  total_study_time?: number; // in hours/minutes
  total_sessions?: number;
  average_score?: number;
  streak_days?: number;
  qcms_completed?: number;
  flashcards_reviewed?: number;
  cases_solved?: number;
  completion_rate?: number;
  weekly_activity?: { day: string; minutes: number }[];
  [key: string]: unknown;
};

export type WeakPoint = {
  id?: number;
  subject_id?: number;
  subject_name: string;
  topic?: string;
  difficulty?: string;
  success_rate: number;
  total_attempts?: number;
  recommendation?: string;
  suggested_action?: string;
};

export type ProgressOverview = {
  total_sessions: number;
  average_score: number;
  total_study_time: number;
  subjects_progress?: SubjectProgress[];
  history?: ProgressItem[];
  recent_scores?: { date: string; score: number }[];
  [key: string]: unknown;
};
