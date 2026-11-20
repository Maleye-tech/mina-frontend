import { listOf, qs, request } from "../lib/api";
import type { Paginated } from "../types/api";
import type {
  EmergencyContact,
  WellbeingArticle,
  WellbeingCategory,
  WellbeingResult,
  WellbeingTest,
  WellbeingTestDetail,
  WellbeingTestType,
} from "../types/wellbeing";

export type ArticleParams = { category?: WellbeingCategory; per_page?: number; page?: number };
export type TestParams = { type?: WellbeingTestType; per_page?: number; page?: number };
export type ResultParams = { test_id?: number; per_page?: number; page?: number };

export const wellbeingService = {
  listArticles(params: ArticleParams = {}): Promise<Paginated<WellbeingArticle>> {
    return request<Paginated<WellbeingArticle>>(
      `/v1/wellbeing/articles${qs({
        category: params.category,
        per_page: params.per_page,
        page: params.page,
      })}`,
    );
  },

  async getArticle(slug: string): Promise<WellbeingArticle> {
    const res = await request<{ data: WellbeingArticle }>(
      `/v1/wellbeing/articles/${encodeURIComponent(slug)}`,
    );
    return res.data;
  },

  listTests(params: TestParams = {}): Promise<Paginated<WellbeingTest>> {
    return request<Paginated<WellbeingTest>>(
      `/v1/wellbeing/tests${qs({ type: params.type, per_page: params.per_page, page: params.page })}`,
    );
  },

  async getTest(id: number): Promise<WellbeingTestDetail> {
    const res = await request<{ test: WellbeingTestDetail }>(`/v1/wellbeing/tests/${id}`);
    return res.test;
  },

  submitResults(
    testId: number,
    answers: { question_id: number; option_key: string }[],
  ): Promise<{ message: string; result: WellbeingResult; disclaimer: string | null }> {
    return request<{ message: string; result: WellbeingResult; disclaimer: string | null }>(
      `/v1/wellbeing/tests/${testId}/results`,
      { method: "POST", body: { answers } },
    );
  },

  listResults(params: ResultParams = {}): Promise<Paginated<WellbeingResult>> {
    return request<Paginated<WellbeingResult>>(
      `/v1/wellbeing/results${qs({
        test_id: params.test_id,
        per_page: params.per_page,
        page: params.page,
      })}`,
    );
  },

  async getResult(id: number): Promise<WellbeingResult> {
    const res = await request<{ data: WellbeingResult }>(`/v1/wellbeing/results/${id}`);
    return res.data;
  },

  async emergencyContacts(): Promise<EmergencyContact[]> {
    const res = await request<EmergencyContact[] | { data: EmergencyContact[] }>(
      "/v1/wellbeing/emergency-contacts",
    );
    return listOf(res);
  },
};
