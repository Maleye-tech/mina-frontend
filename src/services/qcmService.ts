import { qs, request } from "../lib/api";
import type { Paginated } from "../types/api";
import type {
  Difficulty,
  QcmAnswerResult,
  QcmAttempt,
  QcmImport,
  QcmImportStatus,
  QcmQuestionDetail,
  QcmQuestionSummary,
} from "../types/assessment";

export type QcmQuestionParams = {
  subject_id?: number;
  level_id?: number;
  difficulty?: Difficulty;
  per_page?: number;
  page?: number;
};

export type QcmSessionInput = {
  subject_id?: number;
  level_id?: number;
  difficulty?: Difficulty;
  question_count?: number;
};

export type QcmImportParams = {
  status?: QcmImportStatus;
  per_page?: number;
  page?: number;
};

export const qcmService = {
  listQuestions(params: QcmQuestionParams = {}): Promise<Paginated<QcmQuestionSummary>> {
    return request<Paginated<QcmQuestionSummary>>(
      `/v1/qcm/questions${qs({
        subject_id: params.subject_id,
        level_id: params.level_id,
        difficulty: params.difficulty,
        per_page: params.per_page,
        page: params.page,
      })}`,
    );
  },

  getQuestion(id: number): Promise<{ question: QcmQuestionDetail }> {
    return request<{ question: QcmQuestionDetail }>(`/v1/qcm/questions/${id}`);
  },

  listSessions(per_page = 15, page = 1): Promise<Paginated<QcmAttempt>> {
    return request<Paginated<QcmAttempt>>(`/v1/qcm/sessions${qs({ per_page, page })}`);
  },

  createSession(input: QcmSessionInput): Promise<{ message: string; attempt: QcmAttempt }> {
    return request<{ message: string; attempt: QcmAttempt }>("/v1/qcm/sessions", {
      method: "POST",
      body: input,
    });
  },

  getSession(attemptId: number): Promise<{ attempt: QcmAttempt }> {
    return request<{ attempt: QcmAttempt }>(`/v1/qcm/sessions/${attemptId}`);
  },

  answer(
    attemptId: number,
    input: { question_id: number; option_ids: number[] },
  ): Promise<{ message: string; answer: QcmAnswerResult }> {
    return request<{ message: string; answer: QcmAnswerResult }>(
      `/v1/qcm/sessions/${attemptId}/answers`,
      { method: "POST", body: input },
    );
  },

  finish(attemptId: number): Promise<{ message: string; attempt: QcmAttempt }> {
    return request<{ message: string; attempt: QcmAttempt }>(
      `/v1/qcm/sessions/${attemptId}/finish`,
      { method: "POST" },
    );
  },

  listImports(params: QcmImportParams = {}): Promise<Paginated<QcmImport>> {
    return request<Paginated<QcmImport>>(
      `/v1/qcm/imports${qs({
        status: params.status,
        per_page: params.per_page,
        page: params.page,
      })}`,
    );
  },

  async getImport(id: number): Promise<QcmImport> {
    const res = await request<{ import: QcmImport }>(`/v1/qcm/imports/${id}`);
    return res.import;
  },

  createImport(data: FormData): Promise<{ message: string; import: QcmImport }> {
    return request<{ message: string; import: QcmImport }>("/v1/qcm/imports", {
      method: "POST",
      body: data,
    });
  },
};
