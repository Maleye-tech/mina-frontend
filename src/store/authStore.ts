import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";
import { demoUsers } from "../data/mocks";

type AuthState = {
  user: User | null;
  login: (email: string, password?: string) => Promise<User>;
  quickLogin: (email: string) => User;
  register: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email, password) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const found = demoUsers.find((item) => item.email === email && item.password === password);
        if (!found) throw new Error("Email ou mot de passe incorrect.");
        const { password: _, ...user } = found;
        set({ user });
        return user;
      },
      quickLogin: (email) => {
        const found = demoUsers.find((item) => item.email === email)!;
        const { password: _, ...user } = found;
        set({ user });
        return user;
      },
      register: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "mina-session" },
  ),
);
