import { useState, useEffect, createContext, useContext, useCallback, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";


export type UserRole = "candidate" | "company";

type ProfileData = {
  full_name?: string;
  phone?: string;
  name?: string;
  location?: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null;
  signUp: (email: string, password: string, role: UserRole, profileData: ProfileData) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const translateError = (message: string): string => {
  const translations: Record<string, string> = {
    "Invalid login credentials": "Email ou senha incorretos.",
    "Email not confirmed": "Seu email ainda não foi confirmado. Verifique sua caixa de entrada.",
    "User already registered": "Este email já está cadastrado.",
    "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres.",
    "Signup requires a valid password": "É necessário informar uma senha válida.",
    "Unable to validate email address: invalid format": "Formato de email inválido.",
    "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    "For security purposes, you can only request this once every 60 seconds": "Por segurança, aguarde 60 segundos antes de tentar novamente.",
    "New password should be different from the old password.": "A nova senha deve ser diferente da senha atual.",
    "Auth session missing!": "Sessão expirada. Faça login novamente.",
    "Token has expired or is invalid": "O link expirou ou é inválido. Solicite um novo.",
    "new row violates row-level security policy": "Permissão negada para salvar perfil. Entre na conta confirmada e tente novamente.",
  };

  for (const [key, value] of Object.entries(translations)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return message;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const profileCheckedRef = useRef<string | null>(null);

  const ensureUserProfile = useCallback(async (authUser: User) => {
    // Skip if we already checked this user
    if (profileCheckedRef.current === authUser.id) return;
    profileCheckedRef.current = authUser.id;

    const metadata = (authUser.user_metadata || {}) as ProfileData & { role?: UserRole };
    const role = metadata.role;

    if (!role) return;

    if (role === "candidate") {
      const { data: existingProfile } = await supabase
        .from("candidate_profiles")
        .select("id")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (!existingProfile) {
        const { error } = await supabase.from("candidate_profiles").insert({
          user_id: authUser.id,
          full_name: metadata.full_name || authUser.email?.split("@")[0] || "Candidato",
          phone: metadata.phone || null,
        });

        if (error) {
          toast({
            title: "Erro ao criar perfil",
            description: translateError(error.message),
            variant: "destructive",
          });
        }
      }
    }

    if (role === "company") {
      const { data: existingCompany } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (!existingCompany) {
        const { error } = await supabase.from("companies").insert({
          user_id: authUser.id,
          name: metadata.name || "Empresa",
          location: metadata.location || null,
        });

        if (error) {
          toast({
            title: "Erro ao criar empresa",
            description: translateError(error.message),
            variant: "destructive",
          });
        }
      }
    }
  }, [toast]);

  const fetchUserRole = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (data && !error && data.length > 0) {
      const roles = data.map((d) => d.role as string);
      if (roles.includes("admin")) {
        const functionalRole = roles.find((r) => r === "company" || r === "candidate");
        setUserRole((functionalRole || "candidate") as UserRole);
      } else {
        setUserRole(data[0].role as UserRole);
      }
      return;
    }

    const { data: candidateProfile } = await supabase
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (candidateProfile) {
      setUserRole("candidate");
      return;
    }

    const { data: companyProfile } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (companyProfile) {
      setUserRole("company");
      return;
    }

    setUserRole(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            if (!mounted) return;
            await ensureUserProfile(currentSession.user);
            await fetchUserRole(currentSession.user.id);
          }, 0);
        } else {
          setUserRole(null);
          profileCheckedRef.current = null;
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await ensureUserProfile(currentSession.user);
        await fetchUserRole(currentSession.user.id);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [ensureUserProfile, fetchUserRole]);

  const value = {
    user,
    session,
    loading,
    userRole,
    signUp: async (email: string, password: string, role: UserRole, profileData: ProfileData) => {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role,
            ...profileData,
          },
        },
      });

      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: translateError(error.message),
          variant: "destructive",
        });
        return { error };
      }

      if (data.user && !data.session && data.user.identities?.length === 0) {
        toast({
          title: "Erro ao criar conta",
          description: "Este email já está cadastrado. Faça login ou use outro email.",
          variant: "destructive",
        });
        return { error: { message: "User already registered" } };
      }

      if (data.user) {
        if (data.session) {
          profileCheckedRef.current = null;
          await ensureUserProfile(data.user);
        }

        toast({
          title: "Conta criada com sucesso!",
          description: data.session
            ? "Você já pode usar sua conta."
            : "Confirme seu email e faça login para concluir a criação do perfil.",
        });
      }

      return { data, error: null };
    },
    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: translateError(error.message),
          variant: "destructive",
        });
        return { error };
      }

      if (data.user) {
        profileCheckedRef.current = null;
        await ensureUserProfile(data.user);
        await fetchUserRole(data.user.id);
      }

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta.",
      });

      return { data, error: null };
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Erro ao sair",
          description: translateError(error.message),
          variant: "destructive",
        });
        return { error };
      }

      profileCheckedRef.current = null;

      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });

      return { error: null };
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
