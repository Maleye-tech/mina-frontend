import { listOf, qs, request } from "../lib/api";
import type { ProgressItem, ProgressOverview, ProgressStats, WeakPoint } from "../types/progress";

export const progressService = {
  async list(params: { subject_id?: number; per_page?: number; page?: number } = {}): Promise<ProgressItem[]> {
    const res = await request<ProgressItem[] | { data: ProgressItem[] }>(
      `/v1/progress${qs(params)}`
    );
    return listOf(res);
  },

  async getOverview(): Promise<ProgressOverview> {
    const res = await request<ProgressOverview | { data: ProgressOverview }>("/v1/progress");
    if (res && typeof res === "object" && "data" in res && !Array.isArray(res.data)) {
      return res.data as ProgressOverview;
    }
    if (Array.isArray(res)) {
      return {
        total_sessions: res.length,
        average_score: 0,
        total_study_time: 0,
        history: res as ProgressItem[],
      };
    }
    return (res as ProgressOverview) ?? {
      total_sessions: 0,
      average_score: 0,
      total_study_time: 0,
    };
  },

  async getStats(): Promise<ProgressStats> {
    const res = await request<ProgressStats | { data: ProgressStats }>("/v1/progress/stats");
    return "data" in res && !Array.isArray(res.data) ? (res.data as ProgressStats) : (res as ProgressStats);
  },

  async getHistory(params: { per_page?: number; page?: number } = {}): Promise<ProgressItem[]> {
    const res = await request<ProgressItem[] | { data: ProgressItem[] }>(
      `/v1/progress/history${qs(params)}`
    );
    return listOf(res);
  },

  async getWeakPoints(): Promise<WeakPoint[]> {
    const res = await request<WeakPoint[] | { data: WeakPoint[] }>("/v1/progress/weak-points");
    return listOf(res);
  },
};
