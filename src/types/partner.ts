export type PartnerProfileInfo = {
  id: number;
  name: string;
  email: string;
  position?: string | null;
};

export type PartnerInstitutionDetails = {
  id: number;
  name: string;
  code: string;
  type: string;
  subsidy_rate: number;
  covers_mina_care: boolean;
  is_active: boolean;
  max_beneficiaries: number | null;
  current_beneficiaries: number;
  remaining_beneficiaries: number | null;
};

export type PartnerStats = {
  total_access_codes: number;
  used_access_codes: number;
  available_access_codes: number;
  active_students: number;
};

export type PartnerDashboardData = {
  message?: string;
  partner: PartnerProfileInfo;
  institution: PartnerInstitutionDetails | null;
  stats: PartnerStats;
};

export type AccessCodeItem = {
  id: number;
  code: string;
  partner_institution_id: number;
  plan_id?: number | null;
  duration_days: number;
  is_used: boolean;
  expires_at: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  plan?: {
    id: number;
    name: string;
  } | null;
};

export type GenerateAccessCodesInput = {
  count: number;
  duration_days?: number;
  plan_slug?: string;
};

export type GenerateAccessCodesResponse = {
  message: string;
  codes: string[];
  duration_days: number;
  expires_at: string;
};
