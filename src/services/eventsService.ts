import { listOf, qs, request } from "../lib/api";
import type { CareEvent, EventRegistration } from "../types/event";

export const eventsService = {
  async list(
    params: { type?: string; timeframe?: "upcoming" | "past"; per_page?: number; page?: number } = {}
  ): Promise<CareEvent[]> {
    const res = await request<CareEvent[] | { data: CareEvent[] }>(
      `/v1/events${qs(params)}`
    );
    return listOf(res);
  },

  async get(id: number | string): Promise<CareEvent> {
    const res = await request<{ data: CareEvent } | CareEvent>(`/v1/events/${id}`);
    return "data" in res ? (res.data as CareEvent) : res;
  },

  async myRegistrations(): Promise<EventRegistration[]> {
    const res = await request<EventRegistration[] | { data: EventRegistration[] }>(
      "/v1/events/my/registrations"
    );
    return listOf(res);
  },

  async register(id: number | string): Promise<{ message: string; registration?: EventRegistration }> {
    return request<{ message: string; registration?: EventRegistration }>(
      `/v1/events/${id}/register`,
      { method: "POST" }
    );
  },

  async unregister(id: number | string): Promise<{ message: string }> {
    return request<{ message: string }>(`/v1/events/${id}/register`, {
      method: "DELETE",
    });
  },
};
