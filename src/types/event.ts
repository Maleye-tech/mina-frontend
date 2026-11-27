export type CareEvent = {
  id: number;
  title: string;
  slug?: string;
  type?: "webinar" | "workshop" | "mental_health" | "coaching" | "group" | string;
  type_label?: string;
  description?: string | null;
  presenter_name?: string | null;
  starts_at: string;
  ends_at: string;
  location_or_link?: string | null;
  max_participants?: number | null;
  current_participants?: number;
  is_full?: boolean;
  replay_url?: string | null;
  is_registered?: boolean;
  is_published?: boolean;
  created_at?: string;
};

export type EventRegistration = {
  id: number;
  status: "confirmed" | "cancelled";
  registered_at: string;
  event?: CareEvent;
};
