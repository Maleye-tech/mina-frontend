import { listOf, qs, request } from "../lib/api";
import type { StudentDashboardData, RoleDashboardData } from "../types/dashboard";

export const dashboardService = {
  async getStudentDashboard(): Promise<StudentDashboardData> {
    const res = await request<StudentDashboardData | { data: StudentDashboardData }>("/v1/dashboards");
    if (res && typeof res === "object" && "data" in res && !Array.isArray(res.data)) {
      return res.data as StudentDashboardData;
    }
    if (Array.isArray(res)) {
      return { stats: res };
    }
    return (res as StudentDashboardData) ?? {};
  },

  async getRoleDashboard(role?: string): Promise<RoleDashboardData> {
    const res = await request<RoleDashboardData | { data: RoleDashboardData }>(
      `/v1/dashboards${qs({ role })}`
    );
    if (res && typeof res === "object" && "data" in res && !Array.isArray(res.data)) {
      return res.data as RoleDashboardData;
    }
    if (Array.isArray(res)) {
      return { stats: res };
    }
    return (res as RoleDashboardData) ?? {};
  },

  async list(): Promise<unknown[]> {
    const res = await request<unknown[] | { data: unknown[] }>("/v1/dashboards");
    return listOf(res);
  },

  async get(id: number | string): Promise<unknown> {
    return request<unknown>(`/v1/dashboards/${id}`);
  },
};
