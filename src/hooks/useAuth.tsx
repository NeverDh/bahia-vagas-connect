import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api, {
  ApiRequestError,
  AUTH_REFRESH_TOKEN_KEY,
  AUTH_ACCESS_TOKEN_KEY,
  clearStoredAuthTokens,
  SESSION_INVALID_EVENT,
  setStoredAuthTokens,
} from "@/services/api";

export type UserRole = "candidate" | "company";

/** Usuário autenticado serializado pelo backend (compatível com o antigo `User` do Supabase para `id` / metadata). */
export type AuthUser = {
  id: string;
  aud?: string;
  role?: string;
  email?: string;
  email_confirmed_at?: string;
  phone?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  identities?: unknown[];
  created_at?: string;
  updated_at?: string;
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user: AuthUser;
};

type ProfileData = {
  full_name?: string;
  phone?: string;
  name?: string;
  location?: string;
};

type AuthApiPayload = {
  user: AuthUser;
  session: AuthSession | null;
  userRole: UserRole | null;
  isAdmin: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  userRole: UserRole | null;
  /** Indica role `admin` em `user_roles` (servido pelo backend; substitui `has_role` no Supabase). */
  isAdmin: boolean;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    profileData: ProfileData,
  ) => Promise<{ data?: AuthApiPayload; error: { message: string } | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ data?: AuthApiPayload; error: { message: string } | null }>;
  signOut: () => Promise<{ error: { message: string } | null }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

/** Mensagens do GoTrue/Supabase e da API Nest → PT-BR (mesmas chaves do fluxo legado). */
export function translateError(message: string): string {
  const translations: Record<string, string> = {
    "Invalid login credentials": "Email ou senha incorretos.",
    "Email not confirmed": "Seu email ainda não foi confirmado. Verifique sua caixa de entrada.",
    "User already registered": "Este email já está cadastrado.",
    "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres.",
    "Signup requires a valid password": "É necessário informar uma senha válida.",
    "Unable to validate email address: invalid format": "Formato de email inválido.",
    "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    "For security purposes, you can only request this once every 60 seconds":
      "Por segurança, aguarde 60 segundos antes de tentar novamente.",
    "New password should be different from the old password.":
      "A nova senha deve ser diferente da senha atual.",
    "Auth session missing!": "Sessão expirada. Faça login novamente.",
    "Token has expired or is invalid": "O link expirou ou é inválido. Solicite um novo.",
    "new row violates row-level security policy":
      "Permissão negada para salvar perfil. Entre na conta confirmada e tente novamente.",
  };

  for (const [key, value] of Object.entries(translations)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return message;
}

function apiErrorMessage(err: unknown): string {
  if (err instanceof ApiRequestError) {
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const applyAuthPayload = useCallback((payload: AuthApiPayload) => {
    const storedRefresh = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY) ?? "";
    setUser(payload.user);
    setUserRole(payload.userRole);
    setIsAdmin(Boolean(payload.isAdmin));

    if (payload.session) {
      const merged: AuthSession = {
        ...payload.session,
        refresh_token:
          payload.session.refresh_token || storedRefresh,
        user: payload.user,
      };
      setSession(merged);
      setStoredAuthTokens(
        merged.access_token,
        merged.refresh_token || null,
      );
    } else {
      setSession(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const token = localStorage.getItem(AUTH_ACCESS_TOKEN_KEY);
      if (!token) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const payload = await api.get<AuthApiPayload>("/api/auth/me");
        if (!mounted) return;
        applyAuthPayload(payload);
      } catch (e) {
        if (mounted) {
          clearStoredAuthTokens();
          setUser(null);
          setSession(null);
          setUserRole(null);
          setIsAdmin(false);
        }
        if (import.meta.env.DEV && e instanceof ApiRequestError) {
          console.warn("[auth] /me failed:", e.statusCode, e.message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [applyAuthPayload]);

  useEffect(() => {
    const onSessionInvalid = () => {
      setUser(null);
      setSession(null);
      setUserRole(null);
      setIsAdmin(false);
      toast({
        title: "Sessão expirada ou inválida",
        description: "Faça login novamente.",
        variant: "destructive",
      });
      navigate("/auth", { replace: true });
    };
    window.addEventListener(SESSION_INVALID_EVENT, onSessionInvalid);
    return () =>
      window.removeEventListener(SESSION_INVALID_EVENT, onSessionInvalid);
  }, [navigate, toast]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    userRole,
    isAdmin,
    signUp: async (email, password, role, profileData) => {
      try {
        const payload = await api.post<AuthApiPayload>("/api/auth/signup", {
          email,
          password,
          role,
          full_name: profileData.full_name,
          phone: profileData.phone,
          name: profileData.name,
          location: profileData.location,
        });

        if (payload.session) {
          applyAuthPayload(payload);
          toast({
            title: "Conta criada com sucesso!",
            description: "Você já pode usar sua conta.",
          });
        } else {
          setUser(payload.user);
          setSession(null);
          setUserRole(null);
          setIsAdmin(Boolean(payload.isAdmin));
          toast({
            title: "Conta criada com sucesso!",
            description:
              "Faça login com sua senha para continuar (sessão automática indisponível).",
          });
        }

        return { data: payload, error: null };
      } catch (err) {
        const raw = apiErrorMessage(err);
        const isConflict =
          err instanceof ApiRequestError && err.statusCode === 409;
        const description = translateError(raw);
        toast({
          title: "Erro ao criar conta",
          description: isConflict
            ? "Este email já está cadastrado. Faça login ou use outro email."
            : description,
          variant: "destructive",
        });
        return {
          error: {
            message: isConflict ? "User already registered" : raw,
          },
        };
      }
    },

    signIn: async (email, password) => {
      try {
        const payload = await api.post<AuthApiPayload>("/api/auth/login", {
          email,
          password,
        });

        applyAuthPayload(payload);

        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta.",
        });

        navigate("/");
        return { data: payload, error: null };
      } catch (err) {
        const raw = apiErrorMessage(err);
        toast({
          title: "Erro ao fazer login",
          description: translateError(raw),
          variant: "destructive",
        });
        return { error: { message: raw } };
      }
    },

    signOut: async () => {
      let apiErr: string | null = null;
      try {
        if (localStorage.getItem(AUTH_ACCESS_TOKEN_KEY)) {
          await api.post("/api/auth/logout");
        }
      } catch (err) {
        apiErr = apiErrorMessage(err);
        toast({
          title: "Erro ao sair",
          description: translateError(apiErr),
          variant: "destructive",
        });
      }

      clearStoredAuthTokens();
      setUser(null);
      setSession(null);
      setUserRole(null);
      setIsAdmin(false);

      if (!apiErr) {
        toast({
          title: "Logout realizado",
          description: "Até logo!",
        });
      }

      navigate("/");
      return { error: apiErr ? { message: apiErr } : null };
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
