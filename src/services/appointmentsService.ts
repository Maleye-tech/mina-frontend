import { listOf, qs, request } from "../lib/api";
import type {
  Alert,
  AlertStatus,
  Appointment,
  Availability,
  AvailabilityInput,
  AvailabilityPatch,
  BookAppointmentInput,
  ConsultationRequest,
  ConsultationRequestStatus,
  Professional,
  PrivateNote,
  RescheduleAppointmentInput,
  TimeSlot,
} from "../types/appointment";

type MessageResult = { message: string };
type AppointmentResult = { message: string; appointment: Appointment };

export const appointmentsService = {
  async list(params: { status?: string; per_page?: number; page?: number } = {}): Promise<Appointment[]> {
    const res = await request<Appointment[] | { data: Appointment[] }>(
      `/v1/appointments${qs(params)}`
    );
    return listOf(res);
  },

  async get(id: number | string): Promise<Appointment> {
    const res = await request<{ data: Appointment } | Appointment>(`/v1/appointments/${id}`);
    return "data" in res ? (res.data as Appointment) : res;
  },

  async getProfessionals(): Promise<Professional[]> {
    const res = await request<Professional[] | { data: Professional[] }>(
      "/v1/appointments/professionals"
    );
    return listOf(res);
  },

  async getSlots(professionalId: number | string): Promise<TimeSlot[]> {
    const res = await request<TimeSlot[] | { data: TimeSlot[] }>(
      `/v1/appointments/professionals/${professionalId}/slots`
    );
    return listOf(res);
  },

  async book(input: BookAppointmentInput): Promise<AppointmentResult> {
    return request<AppointmentResult>("/v1/appointments", {
      method: "POST",
      body: input,
    });
  },

  async cancel(id: number | string, reason?: string): Promise<AppointmentResult> {
    return request<AppointmentResult>(`/v1/appointments/${id}/cancel`, {
      method: "POST",
      body: { reason },
    });
  },

  async reschedule(
    id: number | string,
    data: RescheduleAppointmentInput
  ): Promise<AppointmentResult> {
    return request<AppointmentResult>(`/v1/appointments/${id}/reschedule`, {
      method: "POST",
      body: data,
    });
  },

  async listAvailability(): Promise<Availability[]> {
    const res = await request<Availability[] | { data: Availability[] }>(
      "/v1/appointments/availability"
    );
    return listOf(res);
  },

  async createAvailability(
    input: AvailabilityInput
  ): Promise<{ message: string; availability: Availability }> {
    return request<{ message: string; availability: Availability }>(
      "/v1/appointments/availability",
      { method: "POST", body: input }
    );
  },

  async updateAvailability(
    id: number | string,
    input: AvailabilityPatch
  ): Promise<{ message: string; availability: Availability }> {
    return request<{ message: string; availability: Availability }>(
      `/v1/appointments/availability/${id}`,
      { method: "PATCH", body: input }
    );
  },

  async deleteAvailability(id: number | string): Promise<MessageResult> {
    return request<MessageResult>(`/v1/appointments/availability/${id}`, {
      method: "DELETE",
    });
  },

  async listConsultationRequests(
    params: { status?: ConsultationRequestStatus; per_page?: number; page?: number } = {}
  ): Promise<ConsultationRequest[]> {
    const res = await request<ConsultationRequest[] | { data: ConsultationRequest[] }>(
      `/v1/appointments/consultation-requests${qs(params)}`
    );
    return listOf(res);
  },

  async acceptConsultationRequest(
    id: number | string,
    input: { date?: string; start_time?: string; reason?: string }
  ): Promise<{ message: string; consultation: ConsultationRequest }> {
    return request<{ message: string; consultation: ConsultationRequest }>(
      `/v1/appointments/consultation-requests/${id}/accept`,
      { method: "POST", body: { status: "accepted", ...input } }
    );
  },

  async declineConsultationRequest(
    id: number | string,
    reason?: string
  ): Promise<{ message: string; consultation: ConsultationRequest }> {
    return request<{ message: string; consultation: ConsultationRequest }>(
      `/v1/appointments/consultation-requests/${id}/decline`,
      { method: "POST", body: { status: "declined", reason } }
    );
  },

  async listPrivateNotes(params: { per_page?: number; page?: number } = {}): Promise<PrivateNote[]> {
    const res = await request<PrivateNote[] | { data: PrivateNote[] }>(
      `/v1/appointments/private-notes${qs(params)}`
    );
    return listOf(res);
  },

  async createPrivateNote(input: {
    appointment_id?: number | null;
    conversation_id?: number | null;
    body: string;
  }): Promise<{ message: string; note: PrivateNote }> {
    return request<{ message: string; note: PrivateNote }>("/v1/appointments/private-notes", {
      method: "POST",
      body: input,
    });
  },

  async updatePrivateNote(
    id: number | string,
    body: string
  ): Promise<{ message: string; note: PrivateNote }> {
    return request<{ message: string; note: PrivateNote }>(
      `/v1/appointments/private-notes/${id}`,
      { method: "PATCH", body: { body } }
    );
  },

  async deletePrivateNote(id: number | string): Promise<MessageResult> {
    return request<MessageResult>(`/v1/appointments/private-notes/${id}`, {
      method: "DELETE",
    });
  },

  async listAlerts(params: { status?: string; per_page?: number; page?: number } = {}): Promise<Alert[]> {
    const res = await request<Alert[] | { data: Alert[] }>(
      `/v1/appointments/alerts${qs(params)}`
    );
    return listOf(res);
  },

  async updateAlert(
    id: number | string,
    status: AlertStatus
  ): Promise<{ message: string; alert: Alert }> {
    return request<{ message: string; alert: Alert }>(`/v1/appointments/alerts/${id}`, {
      method: "PATCH",
      body: { status },
    });
  },
};
