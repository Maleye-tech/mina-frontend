export type ChatParticipant = {
  id: number;
  name: string | null;
  pseudonym: string | null;
  role: string;
  role_label?: string;
};

export type ChatMessage = {
  id: number;
  conversation_id: number;
  sender_id?: number;
  sender_pseudonym?: string;
  is_mine?: boolean;
  body: string;
  is_crisis?: boolean;
  crisis_keywords?: string[] | null;
  read_at?: string | null;
  created_at: string;
  /** Champs utilisés par les messages optimistes créés localement. */
  sender_name?: string;
  is_me?: boolean;
};

export type Conversation = {
  id: number;
  participant?: ChatParticipant;
  last_message?: ChatMessage | string | null;
  last_message_at?: string | null;
  is_with_ambassador?: boolean;
  crisis_flagged_at?: string | null;
  status?: string;
  unread_count?: number;
  created_at?: string;
  /** Champs optionnels utilisés localement (création de conversation). */
  title?: string;
  type?: "care" | "coach" | "peer" | "general" | string;
  recipient_id?: number;
  recipient_name?: string;
  recipient_role?: string;
  messages?: ChatMessage[];
};

export type RequestAmbassadorInput = {
  topic?: string;
  study_field?: string;
  notes?: string;
};

/** Texte d'un dernier message (l'API renvoie un objet Message, pas une chaîne). */
export function lastMessageText(conv: Conversation): string | null {
  const last = conv.last_message;
  if (!last) return null;
  if (typeof last === "string") return last;
  return last.body ?? null;
}
