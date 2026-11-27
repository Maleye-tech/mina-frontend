import { create } from "zustand";
import { ApiError } from "../lib/api";
import { clearToken, getToken, setToken } from "../lib/tokenStore";
import { authService, type LoginResult, type RegisterPayload } from "../services/authService";
import type { User } from "../types";

export type RegisterInput = RegisterPayload;

type AuthState = {
  user: User | null;
  hydrated: boolean;
  challengeToken: string | null;
  challengeRequiresSetup: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (input: RegisterInput) => Promise<User>;
  completeTwoFactor: (code: string) => Promise<User>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshMe: () => Promise<void>;
  setUser: (user: User) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  hydrated: false,
  challengeToken: null,
  challengeRequiresSetup: false,

  initialize: async () => {
    if (get().hydrated) return;
    localStorage.removeItem("mina-session");
    const token = getToken();
    if (!token) {
      set({ user: null, hydrated: true });
      return;
    }
    try {
      const user = await authService.me();
      set({ user, hydrated: true });
    } catch {
      clearToken();
      set({ user: null, hydrated: true });
    }
  },

  login: async (email, password) => {
    const result = await authService.login(email, password);
    if (result.type === "authenticated") {
      setToken(result.token);
      set({
        user: result.user,
        challengeToken: null,
        challengeRequiresSetup: false,
      });
    } else {
      set({
        challengeToken: result.challengeToken,
        challengeRequiresSetup: result.requiresTwoFactorSetup,
      });
    }
    return result;
  },

  register: async (input) => {
    const res = await authService.register(input);
    setToken(res.token);
    set({ user: res.user });
    return res.user;
  },

  completeTwoFactor: async (code) => {
    const { challengeToken, challengeRequiresSetup } = get();
    if (!challengeToken) {
      throw new ApiError(400, "Session de vérification expirée. reconnecte-toi.");
    }
    const token = challengeRequiresSetup
      ? await authService.twoFactorConfirmSetup(challengeToken, code)
      : await authService.twoFactorChallenge(challengeToken, code);
    setToken(token);
    const user = await authService.me();
    set({ user, challengeToken: null, challengeRequiresSetup: false });
    return user;
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // la session locale est purgée même si l'API échoue
    }
    clearToken();
    set({ user: null, challengeToken: null, challengeRequiresSetup: false });
  },

  logoutAll: async () => {
    try {
      await authService.logoutAll();
    } catch {
      // la session locale est purgée même si l'API échoue
    }
    clearToken();
    set({ user: null, challengeToken: null, challengeRequiresSetup: false });
  },

  refreshMe: async () => {
    const user = await authService.me();
    set({ user });
  },

  setUser: (user) => set({ user }),

  clearSession: () => {
    clearToken();
    set({ user: null, challengeToken: null, challengeRequiresSetup: false });
  },
}));
