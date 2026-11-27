export type CareAppointmentStatus =
  | "requested"
  | "pending"
  | "proposed"
  | "confirmed"
  | "declined"
  | "cancelled"
  | "completed";

export type CareSpecialty = "psychologue" | "psychiatre" | "conseiller";
export type CareSlotMode = "visio" | "chat";
export type CareAlertStatus = "open" | "handled";

export type CareProfessional = {
  id: number;
  profile_id: number;
  user_id: number;
  display_name: string;
  specialty: CareSpecialty;
  specialty_label: string;
  languages: string[];
  bio: string | null;
  photo_path: string | null;
  is_verified: boolean;
  has_accepted_charter: boolean;
  charter_accepted_at: string | null;
  created_at: string | null;
};

export type CareAvailabilitySlot = {
  id: number;
  professional_id: number;
  starts_at: string;
  ends_at: string;
  mode: CareSlotMode;
  mode_label: string;
  is_booked: boolean;
  created_at: string | null;
};

export type AnonymousCareStudent = {
  id: string;
  pseudonym: string;
};

export type CareAppointment = {
  id: number;
  status: CareAppointmentStatus;
  status_label: string;
  scheduled_at: string | null;
  duration_minutes: number;
  consultation_type: CareSlotMode | string;
  reason: string | null;
  meeting_url: string | null;
  responded_at: string | null;
  student: AnonymousCareStudent | null;
  professional: {
    id: number;
    display_name: string;
    specialty: CareSpecialty;
    specialty_label: string;
    photo_path: string | null;
  };
  slot: CareAvailabilitySlot | null;
  has_private_note: boolean;
  can_chat: boolean;
  can_send_messages: boolean;
  created_at: string | null;
};

export type CareMessage = {
  id: number;
  conversation_id: number;
  is_me: boolean;
  body: string;
  read_at: string | null;
  created_at: string | null;
};

export type CareSessionNote = {
  id: number;
  appointment_id: number;
  body: string;
  created_at: string | null;
  updated_at: string | null;
};

export type CareUrgentAlert = {
  id: number;
  appointment_id: number | null;
  message: string | null;
  status: CareAlertStatus;
  status_label: string;
  student: AnonymousCareStudent | null;
  handled_by: string | null;
  handled_at: string | null;
  created_at: string | null;
};

export type CareProfessionalProfileInput = {
  display_name: string;
  specialty: CareSpecialty;
  languages: string[];
  bio?: string | null;
  photo_path?: string | null;
};

export type CareAvailabilityInput = {
  starts_at: string;
  ends_at: string;
  mode: CareSlotMode;
};

export type CareAppointmentParams = {
  status?: CareAppointmentStatus;
  per_page?: number;
  page?: number;
};

export type CareAlertParams = {
  status?: CareAlertStatus;
  per_page?: number;
  page?: number;
};
