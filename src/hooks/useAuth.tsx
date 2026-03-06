import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "candidate" | "company";

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
  };

  for (const [key, value] of Object.entries(translations)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return message;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (data && !error && data.length > 0) {
      // Prioritize: admin > company > candidate
      const roles = data.map(d => d.role as string);
      if (roles.includes("admin")) {
        // Check for company or candidate role as the "functional" role
        const functionalRole = roles.find(r => r === "company" || r === "candidate");
        setUserRole((functionalRole || "candidate") as UserRole);
      } else {
        setUserRole(data[0].role as UserRole);
      }
    }
  };

  const signUp = async (email: string, password: string, role: UserRole, profileData: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
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

    if (data.user) {
      // Create profile based on role
      if (role === "candidate") {
        const { error: profileError } = await supabase
          .from("candidate_profiles")
          .insert({
            user_id: data.user.id,
            full_name: profileData.full_name,
            phone: profileData.phone,
          });

        if (profileError) {
          toast({
            title: "Erro ao criar perfil",
            description: translateError(profileError.message),
            variant: "destructive",
          });
          return { error: profileError };
        }
      } else if (role === "company") {
        const { error: companyError } = await supabase
          .from("companies")
          .insert({
            user_id: data.user.id,
            name: profileData.name,
            location: profileData.location,
          });

        if (companyError) {
          toast({
            title: "Erro ao criar empresa",
            description: translateError(companyError.message),
            variant: "destructive",
          });
          return { error: companyError };
        }
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer login.",
      });
    }

    return { data, error: null };
  };

  const signIn = async (email: string, password: string) => {
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

    toast({
      title: "Login realizado!",
      description: "Bem-vindo de volta.",
    });

    navigate("/");
    return { data, error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: translateError(error.message),
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });

    navigate("/");
    return { error: null };
  };

  return {
    user,
    session,
    loading,
    userRole,
    signUp,
    signIn,
    signOut,
  };
};
