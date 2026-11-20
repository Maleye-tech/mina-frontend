export type TaxRef = { id: number; name: string; slug: string };

export type Difficulty = "easy" | "medium" | "hard";

export type QcmQuestionSummary = {
  id: number;
  question: string;
  question_type: "single" | "multiple";
  difficulty: Difficulty;
  subject: TaxRef;
  level: TaxRef;
  created_at: string;
};

export type QcmOption = { id: number; label: string; sort_order: number };

export type QcmQuestionDetail = QcmQuestionSummary & { options: QcmOption[] };

export type QcmAttemptQuestion = {
  question: QcmQuestionDetail;
  answered: boolean;
  selected_option_ids?: number[];
  is_correct?: boolean;
  correct_option_ids?: number[];
  explanation?: string | null;
};

export type QcmAttempt = {
  id: number;
  status: "in_progress" | "completed";
  score: number | null;
  correct_count: number;
  total_questions: number;
  time_spent_seconds: number | null;
  subject?: TaxRef | null;
  level?: TaxRef | null;
  /** Présente sur show/start/finish ; absente de la liste des sessions. */
  questions?: QcmAttemptQuestion[];
  created_at: string;
  completed_at: string | null;
};

export type QcmAnswerQuestion = {
  id: number;
  question: string;
  question_type: "single" | "multiple";
  difficulty?: Difficulty;
  options: QcmOption[];
};

export type QcmAnswerResult = {
  question: QcmAnswerQuestion;
  answered: boolean;
  selected_option_ids: number[];
  is_correct: boolean;
  correct_option_ids: number[];
  explanation: string | null;
};

export type QcmImportStatus = "pending" | "processing" | "completed" | "failed";

export type QcmImport = {
  id: number;
  filename: string;
  status: QcmImportStatus;
  dry_run: boolean;
  total_rows: number;
  imported_count: number;
  duplicate_count: number;
  failed_count: number;
  errors: string[] | { row: number; errors: string[] }[];
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  user: { id: number; name: string; email: string };
};

export type FlashcardState = {
  easiness_factor: number;
  interval_days: number;
  repetitions: number;
  lapses: number;
  last_quality: number;
  due_at: string | null;
  last_reviewed_at: string | null;
};

export type FlashcardDeck = {
  id: number;
  name: string;
  description: string | null;
  status: string;
  subject: TaxRef;
  level: TaxRef;
  cards_count: number;
  created_at: string;
};

export type FlashcardCard = {
  id: number;
  front: string;
  back: string;
  hint: string | null;
  deck?: { id: number; name: string };
  state: FlashcardState | null;
  due_at?: string | null;
};

export type FlashcardDeckDetail = FlashcardDeck & { cards: FlashcardCard[] };

export type ClinicalCase = {
  id: number;
  title: string;
  presentation: string | null;
  difficulty: Difficulty;
  duration_minutes: number | null;
  learning_goals: string | null;
  subject: TaxRef;
  level: TaxRef;
  steps_count: number;
  created_at: string;
};

export type ClinicalCaseStep = {
  id: number;
  sort_order: number;
  prompt: string | null;
  question: string | null;
  answer: string | null;
  expected_answer: string | null;
  answered: boolean;
  answered_at: string | null;
};

export type ClinicalCaseAttemptCase = {
  id: number;
  title: string;
  difficulty: Difficulty;
  duration_minutes: number | null;
};

export type ClinicalCaseAttempt = {
  id: number;
  status: "in_progress" | "completed";
  clinical_case?: ClinicalCaseAttemptCase | null;
  total_steps?: number;
  steps?: ClinicalCaseStep[];
  remaining_steps?: number;
  created_at: string;
  completed_at: string | null;
};
