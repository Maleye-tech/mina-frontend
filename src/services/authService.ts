import { request } from "../lib/api";
import type {
  ApiProfile,
  ApiRole,
  OnboardingData,
  OnboardingQuestion,
  TwoFactorSetup,
} from "../types/api";
import type { Role, User } from "../types";

export function mapRole(role: ApiRole): Role {
  return role === "admin" ? "super_admin" : role;
}

export function mapProfile(profile: ApiProfile): User {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: mapRole(profile.role),
    roleLabel: profile.role_label,
    roleProfile: profile.role_profile ?? null,
    status: profile.email_verified ? "active" : "pending",
    emailVerified: profile.email_verified,
    pseudonym: profile.pseudonym,
    preferences: {
      language: profile.preferences?.language ?? "fr",
      notificationsEnabled: profile.preferences?.notifications_enabled ?? true,
    },
    consents: {
      personal_data: profile.consents?.personal_data
        ? {
            granted: profile.consents.personal_data.granted,
            version: profile.consents.personal_data.version,
            recordedAt: profile.consents.personal_data.recorded_at,
            currentVersion: profile.consents.personal_data.current_version,
          }
        : undefined,
      mental_health_data: profile.consents?.mental_health_data
        ? {
            granted: profile.consents.mental_health_data.granted,
            version: profile.consents.mental_health_data.version,
            recordedAt: profile.consents.mental_health_data.recorded_at,
            currentVersion: profile.consents.mental_health_data.current_version,
          }
        : undefined,
    },
    studentProfile: profile.student_profile
      ? {
          educationLevel: profile.student_profile.education_level,
          studyField: profile.student_profile.study_field,
          universityId: profile.student_profile.university_id,
          university: profile.student_profile.university,
          facultyId: profile.student_profile.faculty_id,
          faculty: profile.student_profile.faculty,
          onboardingCompleted: profile.student_profile.onboarding_completed,
        }
      : null,
    university:
      profile.student_profile?.university ??
      (profile.role_profile && "university" in profile.role_profile
        ? (profile.role_profile.university as string)
        : undefined),
  };
}

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  role?: "student" | "ambassador" | "partner";
  pseudonym?: string;
  university_id?: number | null;
  faculty_id?: number | null;
  study_field?: string | null;
  education_level?: string | null;
  partner_institution_id?: number | null;
  partner_position?: string | null;
};

export type LoginResult =
  | { type: "authenticated"; user: User; token: string }
  | {
      type: "two_factor";
      requiresTwoFactor: boolean;
      requiresTwoFactorSetup: boolean;
      challengeToken: string;
    };

type RegisterResponse = { message: string; user: ApiProfile; token: string };
type AuthResponse = { message: string; user: ApiProfile; token: string };
type TwoFactorLoginResponse = {
  requires_two_factor: boolean;
  requires_two_factor_setup: boolean;
  challenge_token: string;
};
type MessageResponse = { message: string };
type UserResponse = { message: string; user: ApiProfile };

export const authService = {
  async register(input: RegisterPayload): Promise<{ message: string; user: User; token: string }> {
    const body: Record<string, unknown> = {
      name: input.name,
      email: input.email,
      password: input.password,
      password_confirmation: input.passwordConfirmation,
    };
    if (input.role) body.role = input.role;
    if (input.pseudonym) body.pseudonym = input.pseudonym;
    if (input.university_id) body.university_id = input.university_id;
    if (input.faculty_id) body.faculty_id = input.faculty_id;
    if (input.study_field) body.study_field = input.study_field;
    if (input.education_level) body.education_level = input.education_level;
    if (input.partner_institution_id) body.partner_institution_id = input.partner_institution_id;
    if (input.partner_position) body.partner_position = input.partner_position;

    const res = await request<RegisterResponse>("/auth/register", {
      method: "POST",
      token: null,
      body,
    });
    return { message: res.message, user: mapProfile(res.user), token: res.token };
  },

  async login(email: string, password: string): Promise<LoginResult> {
    const res = await request<AuthResponse | TwoFactorLoginResponse>("/auth/login", {
      method: "POST",
      token: null,
      body: { email, password },
    });
    if ("challenge_token" in res) {
      return {
        type: "two_factor",
        requiresTwoFactor: res.requires_two_factor,
        requiresTwoFactorSetup: res.requires_two_factor_setup,
        challengeToken: res.challenge_token,
      };
    }
    return { type: "authenticated", user: mapProfile(res.user), token: res.token };
  },

  async logout(): Promise<void> {
    await request<MessageResponse>("/auth/logout", { method: "POST" });
  },

  async logoutAll(): Promise<void> {
    await request<MessageResponse>("/auth/logout-all", { method: "POST" });
  },

  async me(): Promise<User> {
    const res = await request<{ user: ApiProfile }>("/auth/me");
    return mapProfile(res.user);
  },

  async updateSettings(input: {
    pseudonym?: string;
    preferredLanguage?: string;
    notificationsEnabled?: boolean;
    consents?: { personal_data?: boolean; mental_health_data?: boolean };
  }): Promise<User> {
    const body: Record<string, unknown> = {};
    if (input.pseudonym !== undefined) body.pseudonym = input.pseudonym;
    if (input.preferredLanguage !== undefined) body.preferred_language = input.preferredLanguage;
    if (input.notificationsEnabled !== undefined)
      body.notifications_enabled = input.notificationsEnabled;
    if (input.consents !== undefined) body.consents = input.consents;
    const res = await request<UserResponse>("/auth/settings", { method: "PATCH", body });
    return mapProfile(res.user);
  },

  async changePassword(
    currentPassword: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<string> {
    const res = await request<MessageResponse>("/auth/password", {
      method: "PATCH",
      body: {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      },
    });
    return res.message;
  },

  async deleteAccount(currentPassword: string): Promise<string> {
    const res = await request<MessageResponse>("/auth/account", {
      method: "DELETE",
      body: { current_password: currentPassword },
    });
    return res.message;
  },

  async forgotPassword(email: string): Promise<string> {
    const res = await request<MessageResponse>("/auth/forgot-password", {
      method: "POST",
      token: null,
      body: { email },
    });
    return res.message;
  },

  async resetPassword(input: {
    token: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }): Promise<string> {
    const res = await request<MessageResponse>("/auth/reset-password", {
      method: "POST",
      token: null,
      body: {
        token: input.token,
        email: input.email,
        password: input.password,
        password_confirmation: input.passwordConfirmation,
      },
    });
    return res.message;
  },

  async verifyEmail(id: string, hash: string, queryString = ""): Promise<string> {
    const res = await request<MessageResponse>(
      `/auth/verify-email/${encodeURIComponent(id)}/${encodeURIComponent(hash)}${queryString}`,
      { token: null },
    );
    return res.message;
  },

  async resendVerification(): Promise<string> {
    const res = await request<MessageResponse>("/auth/email/verification-notification", {
      method: "POST",
    });
    return res.message;
  },

  async twoFactorSetup(challengeToken: string): Promise<TwoFactorSetup> {
    return request<TwoFactorSetup>("/auth/two-factor/setup", {
      method: "POST",
      token: challengeToken,
    });
  },

  async twoFactorConfirmSetup(challengeToken: string, code: string): Promise<string> {
    const res = await request<AuthResponse>("/auth/two-factor/confirm-setup", {
      method: "POST",
      token: challengeToken,
      body: { code },
    });
    return res.token;
  },

  async twoFactorChallenge(challengeToken: string, code: string): Promise<string> {
    const res = await request<AuthResponse>("/auth/two-factor/challenge", {
      method: "POST",
      token: challengeToken,
      body: { code },
    });
    return res.token;
  },

  async getOnboarding(): Promise<OnboardingData> {
    return request<OnboardingData>("/auth/onboarding");
  },

  async submitOnboarding(data: Record<string, unknown>): Promise<User> {
    const res = await request<UserResponse>("/auth/onboarding", { method: "POST", body: data });
    return mapProfile(res.user);
  },

  async updateStudentProfile(data: Record<string, unknown>): Promise<User> {
    const res = await request<UserResponse>("/auth/student-profile", {
      method: "PATCH",
      body: data,
    });
    return mapProfile(res.user);
  },

  async getQuestions(): Promise<{ questions: OnboardingQuestion[] }> {
    return request<{ questions: OnboardingQuestion[] }>("/auth/onboarding/questions");
  },

  async updateQuestion(
    key: string,
    data: Partial<Pick<OnboardingQuestion, "label" | "is_required" | "is_active" | "sort_order">>,
  ): Promise<OnboardingQuestion> {
    const res = await request<{ question: OnboardingQuestion }>(
      `/auth/onboarding/questions/${encodeURIComponent(key)}`,
      { method: "PATCH", body: data },
    );
    return res.question;
  },
};
