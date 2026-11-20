import { qs, request } from "../lib/api";
import type { Paginated } from "../types/api";
import type { ClinicalCase, ClinicalCaseAttempt, Difficulty } from "../types/assessment";

export type CaseParams = {
  subject_id?: number;
  level_id?: number;
  difficulty?: Difficulty;
  per_page?: number;
  page?: number;
};

export const clinicalCasesService = {
  list(params: CaseParams = {}): Promise<Paginated<ClinicalCase>> {
    return request<Paginated<ClinicalCase>>(
      `/v1/clinical-cases${qs({
        subject_id: params.subject_id,
        level_id: params.level_id,
        difficulty: params.difficulty,
        per_page: params.per_page,
        page: params.page,
      })}`,
    );
  },

  async get(id: number): Promise<ClinicalCase> {
    const res = await request<{ clinical_case: ClinicalCase }>(`/v1/clinical-cases/${id}`);
    return res.clinical_case;
  },

  listAttempts(per_page = 15, page = 1): Promise<Paginated<ClinicalCaseAttempt>> {
    return request<Paginated<ClinicalCaseAttempt>>(
      `/v1/clinical-cases/attempts${qs({ per_page, page })}`,
    );
  },

  createAttempt(
    clinicalCaseId: number,
  ): Promise<{ message: string; attempt: ClinicalCaseAttempt }> {
    return request<{ message: string; attempt: ClinicalCaseAttempt }>(
      "/v1/clinical-cases/attempts",
      { method: "POST", body: { clinical_case_id: clinicalCaseId } },
    );
  },

  getAttempt(id: number): Promise<{ attempt: ClinicalCaseAttempt }> {
    return request<{ attempt: ClinicalCaseAttempt }>(`/v1/clinical-cases/attempts/${id}`);
  },

  answer(
    attemptId: number,
    input: { step_id: number; answer: string },
  ): Promise<{ message: string; attempt: ClinicalCaseAttempt }> {
    return request<{ message: string; attempt: ClinicalCaseAttempt }>(
      `/v1/clinical-cases/attempts/${attemptId}/answers`,
      { method: "POST", body: input },
    );
  },

  finish(attemptId: number): Promise<{ message: string; attempt: ClinicalCaseAttempt }> {
    return request<{ message: string; attempt: ClinicalCaseAttempt }>(
      `/v1/clinical-cases/attempts/${attemptId}/finish`,
      { method: "POST" },
    );
  },
};
