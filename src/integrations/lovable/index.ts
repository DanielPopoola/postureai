// This file previously used @lovable.dev/cloud-auth-js which is a Lovable-platform
// specific OAuth wrapper. It has been removed. Google OAuth is now handled directly
// via supabase.auth.signInWithOAuth() in Auth.tsx.
export const lovable = {
  auth: {
    signInWithOAuth: async () => {
      throw new Error("Use supabase.auth.signInWithOAuth() directly instead.");
    },
  },
};