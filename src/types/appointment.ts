export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rescheduled";

export type Professional = {
  id: number;
  user_id?: number;
  name: string | null;
  title?: string | null;
  bio?: string | null;
  consultation_duration_minutes?: number;
  is_available?: boolean;
  avatar_url?: string | null;
  rating?: number;
};

export type TimeSlot = {
  id: number;
  professional_id: number;
  starts_at: string;
  ends_at: string;
  is_booked: boolean;
};

export type AppointmentStudent = {
  id: number;
  pseudonym: string | null;
  name: string | null;
};

export type Appointment = {
  id: number;
  status: AppointmentStatus;
  status_label?: string;
  scheduled_at: string;
  duration_minutes: number;
  consultation_type: string;
  meeting_link: string | null;
  cancellation_reason: string | null;
  student_notes: string | null;
  confidential_notes?: string | null;
  professional?: { id: number; name: string | null; title: string | null } | null;
  student?: AppointmentStudent | null;
  created_at?: string;
  updated_at?: string;
};

export type BookAppointmentInput = {
  professional_id: number;
  slot_id: number;
  consultation_type?: string;
  student_notes?: string;
};

export type RescheduleAppointmentInput = {
  new_slot_id: number;
};

export type Availability = {
  id: number;
  weekday: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export type AvailabilityInput = {
  weekday: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export type AvailabilityPatch = {
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
};

export type ConsultationRequestStatus = "pending" | "accepted" | "declined";

export type ConsultationRequest = {
  id: number;
  student_id: number;
  professional_id: number;
  topic: string | null;
  priority: string;
  status: ConsultationRequestStatus;
  requested_at: string | null;
  scheduled_for: string | null;
  reason: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PrivateNote = {
  id: number;
  appointment_id: number | null;
  conversation_id: number | null;
  body: string;
  created_at: string;
  updated_at: string;
};

export type AlertStatus = "open" | "acknowledged" | "resolved";

export type Alert = {
  id: number;
  type: string;
  severity: string;
  title: string;
  message: string;
  status: AlertStatus;
  subject: { type: string; id: number } | null;
  created_at: string;
};
