export type Coach = {
  id: number;
  name: string;
  role?: string;
  specialty?: string;
  avatar_url?: string;
  bio?: string;
  is_ai?: boolean;
  rating?: number;
  topics?: string[];
  system_prompt?: string;
};
