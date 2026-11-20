export type WellbeingCategory = "stress" | "burnout" | "sleep";

export type WellbeingArticle = {
  id: number;
  title: string;
  slug: string;
  category: WellbeingCategory;
  category_label: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type WellbeingTestType = "anxiety" | "stress" | "wellbeing";

export type WellbeingTest = {
  id: number;
  title: string;
  description: string | null;
  type: WellbeingTestType;
  type_label: string;
  questions_count: number;
  disclaimer: string | null;
  created_at: string;
};

export type WellbeingTestQuestion = {
  id: number;
  question_text: string;
  options: { key: string; label: string }[];
};

export type WellbeingTestDetail = {
  id: number;
  title: string;
  description: string | null;
  type: WellbeingTestType;
  type_label: string;
  questions: WellbeingTestQuestion[];
  disclaimer: string | null;
  created_at: string;
};

export type WellbeingResultAnswer = {
  question_id: number;
  question_text: string;
  option_key: string;
  option_label: string;
  points: number;
};

export type WellbeingResult = {
  id: number;
  score: number;
  max_score: number;
  percentage: number;
  level: string;
  feedback: string;
  disclaimer: string | null;
  answers: WellbeingResultAnswer[];
  test: { id: number; title: string; type: WellbeingTestType; type_label: string };
  created_at: string;
  user?: { id: number; name: string };
};

export type EmergencyContact = {
  id: number;
  name: string;
  role_or_description: string | null;
  phone_number: string;
  address: string | null;
  availability: string | null;
  is_active: boolean;
};
