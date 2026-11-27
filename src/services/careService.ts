import { ApiError, listOf, qs, request } from "../lib/api";
import type {
  CareAppointment,
  CareAppointmentParams,
  CareAvailabilityInput,
  CareAvailabilitySlot,
  CareMessage,
  CareProfessional,
  CareProfessionalProfileInput,
  CareSessionNote,
  CareUrgentAlert,
  CareAlertParams,
} from "../types/care";

type CareMessageResult = { message: string };
type CareAppointmentResult = { message: string; appointment: CareAppointment };
type CareProfileResult = { message?: string; profile: CareProfessional };
type CareSlotResult = { message: string; slot: CareAvailabilitySlot };
type CareNoteResult = { message?: string; note: CareSessionNote | null };
type CareAlertResult = { message: string; alert: CareUrgentAlert };
type CareRole = "student" | "professional";

function appointmentPath(role: CareRole, id: number | string): string {
  return role === "professional" ? `/pro/appointments/${id}` : `/appointments/${id}`;
}

function requireProfessional(
  professionals: CareProfessional[],
  id: number | string,
): CareProfessional {
  const professional = professionals.find((item) => item.id === Number(id));
  if (!professional) {
    throw new ApiError(404, "Ce professionnel n’est pas disponible.");
  }
  return professional;
}

export const careService = {
  async getProfessionalProfile(): Promise<CareProfessional> {
    const response = await request<CareProfileResult>("/pro/profile");
    return response.profile;
  },

  async updateProfessionalProfile(input: CareProfessionalProfileInput): Promise<CareProfessional> {
    const response = await request<CareProfileResult>("/pro/profile", {
      method: "PUT",
      body: input,
    });
    return response.profile;
  },

  async acceptProfessionalCharter(): Promise<CareProfessional> {
    const response = await request<CareProfileResult>("/pro/profile/accept-charter", {
      method: "POST",
      body: { accept: true },
    });
    return response.profile;
  },

  async getProfessionalAvailability(): Promise<CareAvailabilitySlot[]> {
    const response = await request<CareAvailabilitySlot[] | { data: CareAvailabilitySlot[] }>(
      "/pro/availability",
    );
    return listOf(response);
  },

  async createAvailability(input: CareAvailabilityInput): Promise<CareAvailabilitySlot> {
    const response = await request<CareSlotResult>("/pro/availability", {
      method: "POST",
      body: input,
    });
    return response.slot;
  },

  async updateAvailability(
    id: number | string,
    input: Partial<CareAvailabilityInput>,
  ): Promise<CareAvailabilitySlot> {
    const response = await request<CareSlotResult>(`/pro/availability/${id}`, {
      method: "PUT",
      body: input,
    });
    return response.slot;
  },

  async deleteAvailability(id: number | string): Promise<string> {
    const response = await request<CareMessageResult>(`/pro/availability/${id}`, {
      method: "DELETE",
    });
    return response.message;
  },

  async getProfessionalAppointments(
    params: CareAppointmentParams = {},
  ): Promise<CareAppointment[]> {
    const response = await request<CareAppointment[] | { data: CareAppointment[] }>(
      `/pro/appointments${qs(params)}`,
    );
    return listOf(response);
  },

  async getProfessionalAppointment(id: number | string): Promise<CareAppointment> {
    const response = await request<{ data: CareAppointment }>(appointmentPath("professional", id));
    return response.data;
  },

  async confirmAppointment(id: number | string): Promise<CareAppointment> {
    const response = await request<CareAppointmentResult>(
      `${appointmentPath("professional", id)}/confirm`,
      { method: "POST" },
    );
    return response.appointment;
  },

  async declineAppointment(id: number | string): Promise<CareAppointment> {
    const response = await request<CareAppointmentResult>(
      `${appointmentPath("professional", id)}/decline`,
      { method: "POST" },
    );
    return response.appointment;
  },

  async proposeSlot(id: number | string, availabilitySlotId: number): Promise<CareAppointment> {
    const response = await request<CareAppointmentResult>(
      `${appointmentPath("professional", id)}/propose`,
      { method: "POST", body: { availability_slot_id: availabilitySlotId } },
    );
    return response.appointment;
  },

  async completeAppointment(id: number | string): Promise<CareAppointment> {
    const response = await request<CareAppointmentResult>(
      `${appointmentPath("professional", id)}/complete`,
      { method: "POST" },
    );
    return response.appointment;
  },

  async updateMeetingUrl(id: number | string, meetingUrl: string): Promise<CareAppointment> {
    const response = await request<CareAppointmentResult>(appointmentPath("professional", id), {
      method: "PUT",
      body: { meeting_url: meetingUrl },
    });
    return response.appointment;
  },

  async getMessages(role: CareRole, appointmentId: number | string): Promise<CareMessage[]> {
    const response = await request<CareMessage[] | { data: CareMessage[] }>(
      `${appointmentPath(role, appointmentId)}/messages`,
    );
    return listOf(response);
  },

  async sendMessage(
    role: CareRole,
    appointmentId: number | string,
    body: string,
  ): Promise<CareMessage> {
    const response = await request<{ message: string; data: CareMessage }>(
      `${appointmentPath(role, appointmentId)}/messages`,
      { method: "POST", body: { body } },
    );
    return response.data;
  },

  async getSessionNote(appointmentId: number | string): Promise<CareSessionNote | null> {
    const response = await request<CareNoteResult>(
      `${appointmentPath("professional", appointmentId)}/note`,
    );
    return response.note;
  },

  async saveSessionNote(appointmentId: number | string, body: string): Promise<CareSessionNote> {
    const response = await request<CareNoteResult>(
      `${appointmentPath("professional", appointmentId)}/note`,
      { method: "PUT", body: { body } },
    );
    if (!response.note) {
      throw new ApiError(500, "La note n’a pas pu être récupérée. Réessaie.");
    }
    return response.note;
  },

  async getProfessionalAlerts(params: CareAlertParams = {}): Promise<CareUrgentAlert[]> {
    const response = await request<CareUrgentAlert[] | { data: CareUrgentAlert[] }>(
      `/pro/alerts${qs(params)}`,
    );
    return listOf(response);
  },

  async handleAlert(id: number | string): Promise<CareUrgentAlert> {
    const response = await request<CareAlertResult>(`/pro/alerts/${id}/handle`, {
      method: "POST",
    });
    return response.alert;
  },

  async getProfessionals(): Promise<CareProfessional[]> {
    const response = await request<CareProfessional[] | { data: CareProfessional[] }>(
      "/professionals?per_page=50",
    );
    return listOf(response);
  },

  async getProfessional(id: number | string): Promise<CareProfessional> {
    return requireProfessional(await this.getProfessionals(), id);
  },

  async getProfessionalSlots(id: number | string): Promise<CareAvailabilitySlot[]> {
    const response = await request<CareAvailabilitySlot[] | { data: CareAvailabilitySlot[] }>(
      `/professionals/${id}/slots`,
    );
    return listOf(response);
  },

  async getAppointments(params: CareAppointmentParams = {}): Promise<CareAppointment[]> {
    const response = await request<CareAppointment[] | { data: CareAppointment[] }>(
      `/appointments${qs(params)}`,
    );
    return listOf(response);
  },

  async getAppointment(id: number | string): Promise<CareAppointment> {
    const response = await request<{ data: CareAppointment }>(appointmentPath("student", id));
    return response.data;
  },

  async bookAppointment(input: {
    availability_slot_id: number;
    reason?: string;
  }): Promise<CareAppointment> {
    const response = await request<CareAppointmentResult>("/appointments", {
      method: "POST",
      body: input,
    });
    return response.appointment;
  },

  async cancelAppointment(id: number | string, reason?: string): Promise<CareAppointment> {
    const response = await request<CareAppointmentResult>(
      `${appointmentPath("student", id)}/cancel`,
      { method: "POST", body: { reason } },
    );
    return response.appointment;
  },

  async acceptProposal(id: number | string): Promise<CareAppointment> {
    const response = await request<CareAppointmentResult>(
      `${appointmentPath("student", id)}/accept-proposal`,
      { method: "POST" },
    );
    return response.appointment;
  },

  async createAlert(input: {
    appointment_id?: number | null;
    message?: string;
  }): Promise<CareUrgentAlert> {
    const response = await request<CareAlertResult>("/alerts", {
      method: "POST",
      body: input,
    });
    return response.alert;
  },
};
