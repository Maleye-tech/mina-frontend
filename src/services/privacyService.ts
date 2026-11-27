import { request } from "../lib/api";
import type { PrivacyExportData } from "../types/privacy";

export const privacyService = {
  async exportData(): Promise<PrivacyExportData> {
    return request<PrivacyExportData>("/v1/privacy/export");
  },

  async deleteAccount(password?: string): Promise<{ message: string }> {
    return request<{ message: string }>("/v1/privacy/delete-account", {
      method: "DELETE",
      body: { password },
    });
  },
};
