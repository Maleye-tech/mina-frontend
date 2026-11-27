import { qs, request } from "../lib/api";
import type { Paginated } from "../types/api";
import type {
  AccessCodeItem,
  GenerateAccessCodesInput,
  GenerateAccessCodesResponse,
  PartnerDashboardData,
} from "../types/partner";

export const partnerService = {
  async getDashboard(): Promise<PartnerDashboardData> {
    const res = await request<PartnerDashboardData | { data: PartnerDashboardData }>(
      "/v1/partner/dashboard"
    );
    if ("data" in res && res.data && "partner" in res.data) {
      return res.data;
    }
    return res as PartnerDashboardData;
  },

  async getAccessCodes(params: {
    status?: "all" | "used" | "available";
    per_page?: number;
    page?: number;
  } = {}): Promise<Paginated<AccessCodeItem>> {
    return request<Paginated<AccessCodeItem>>(`/v1/partner/access-codes${qs(params)}`);
  },

  async generateAccessCodes(
    input: GenerateAccessCodesInput
  ): Promise<GenerateAccessCodesResponse> {
    return request<GenerateAccessCodesResponse>("/v1/partner/access-codes", {
      method: "POST",
      body: input,
    });
  },
};
