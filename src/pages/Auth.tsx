import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Loader2, User } from "lucide-react";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>("candidate");
  const [submitting, setSubmitting] = useState(false);
  const { signUp, signIn, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    setSubmitting(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const profileData =
          role === "candidate"
            ? {
                full_name: formData.get("full_name") as string,
                phone: formData.get("phone") as string,
              }
            : {
                name: formData.get("company_name") as string,
                location: formData.get("location") as string,
              };

        await signUp(email, password, role, profileData);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="px-4 py-16 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <main className="px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {isLogin ? "Entrar" : "Criar Conta"}
              </CardTitle>
              <CardDescription>
                {isLogin 
                  ? "Entre com suas credenciais" 
                  : "Preencha os dados para começar"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isLogin && (
                <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="mb-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="candidate" className="gap-2">
                      <User className="h-4 w-4" />
                      Candidato
                    </TabsTrigger>
                    <TabsTrigger value="company" className="gap-2">
                      <Briefcase className="h-4 w-4" />
                      Empresa
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" aria-busy={submitting}>
                {!isLogin && (
                  <>
                    {role === "candidate" ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Nome Completo</Label>
                          <Input
                            id="full_name"
                            name="full_name"
                            type="text"
                            required
                            placeholder="Seu nome"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            placeholder="(XX) XXXXX-XXXX"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="company_name">Nome da Empresa</Label>
                          <Input
                            id="company_name"
                            name="company_name"
                            type="text"
                            required
                            placeholder="Nome da empresa"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Localização</Label>
                          <Input
                            id="location"
                            name="location"
                            type="text"
                            required
                            placeholder="Cidade, Estado"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isLogin ? "Entrando…" : "Criando conta…"}
                    </>
                  ) : isLogin ? (
                    "Entrar"
                  ) : (
                    "Criar Conta"
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  {isLogin 
                    ? "Não tem conta? Cadastre-se" 
                    : "Já tem conta? Faça login"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Spacer for mobile ad banner */}
        <div className="h-24 xl:hidden" />
      </main>
    </MainLayout>
  );
};

export default Auth;
