export type PrivacyExportData = {
  user: Record<string, unknown>;
  progress?: unknown[];
  qcm_sessions?: unknown[];
  appointments?: unknown[];
  conversations?: unknown[];
  consents?: Record<string, unknown>;
  exported_at: string;
};
