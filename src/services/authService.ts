// Boundary ready to be replaced by a REST/Supabase adapter without changing the UI.
export const authService = {
  async requestPasswordReset(identifier: string) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, identifier };
  },
};
