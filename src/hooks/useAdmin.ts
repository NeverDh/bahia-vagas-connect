import { useAuth } from "./useAuth";

/**
 * Admin gate — usa `isAdmin` vindo do backend (`user_roles`), preenchido em login, /me e signup.
 * Substitui `supabase.rpc('has_role', …)`.
 */
export const useAdmin = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();

  return {
    isAdmin: Boolean(user && isAdmin),
    loading: authLoading,
  };
};
