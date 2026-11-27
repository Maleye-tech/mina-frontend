import { listOf, qs, request } from "../lib/api";
import type { Coach } from "../types/coach";

export const coachesService = {
  async list(params: { specialty?: string; per_page?: number; page?: number } = {}): Promise<Coach[]> {
    const res = await request<Coach[] | { data: Coach[] }>(
      `/v1/coaches${qs(params)}`
    );
    return listOf(res);
  },

  async get(id: number | string): Promise<Coach> {
    const res = await request<{ data: Coach } | Coach>(`/v1/coaches/${id}`);
    return "data" in res ? (res.data as Coach) : (res as Coach);
  },
};
