import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Briefcase, Building2, Users, Download, Trash2, RefreshCw, AlertTriangle, XCircle, FileText, BarChart3 } from "lucide-react";
import { AdminMetaTags } from "@/components/AdminMetaTags";
import { AdminBlogManager } from "@/components/blog/AdminBlogManager";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useImportJobs } from "@/hooks/useImportJobs";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Job {
  id: string;
  title: string;
  location: string;
  status: string;
  created_at: string;
  companies?: { name: string };
}

interface Company {
  id: string;
  name: string;
  location: string | null;
  is_verified: boolean;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { importJobs, isImporting, lastResult, quotaExceeded } = useImportJobs();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState({ jobs: 0, companies: 0, applications: 0, candidates: 0 });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!adminLoading && !isAdmin && user) {
      toast.error("Acesso negado", { description: "Você não tem permissão de administrador" });
      navigate("/");
      return;
    }

    if (isAdmin) {
      fetchData();
    }
  }, [user, authLoading, isAdmin, adminLoading, navigate]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [jobsRes, companiesRes, applicationsRes, candidatesRes] = await Promise.all([
        supabase.from("jobs").select("*, companies(name)").order("created_at", { ascending: false }).limit(50),
        supabase.from("companies").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("applications").select("id", { count: "exact", head: true }),
        supabase.from("candidate_profiles").select("id", { count: "exact", head: true }),
      ]);

      if (jobsRes.data) setJobs(jobsRes.data);
      if (companiesRes.data) setCompanies(companiesRes.data);
      
      setStats({
        jobs: jobsRes.data?.length || 0,
        companies: companiesRes.data?.length || 0,
        applications: applicationsRes.count || 0,
        candidates: candidatesRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoadingData(false);
    }
  };

  const handleImportJobs = async () => {
    await importJobs();
    fetchData();
  };

  const handleDeleteJob = async (jobId: string) => {
    const { error } = await supabase.from("jobs").delete().eq("id", jobId);
    if (error) {
      toast.error("Erro ao deletar vaga");
    } else {
      toast.success("Vaga deletada");
      setJobs(jobs.filter(j => j.id !== jobId));
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    const { error } = await supabase.from("companies").delete().eq("id", companyId);
    if (error) {
      toast.error("Erro ao deletar empresa", { description: error.message });
    } else {
      toast.success("Empresa deletada");
      setCompanies(companies.filter(c => c.id !== companyId));
    }
  };

  const handleVerifyCompany = async (companyId: string, verified: boolean) => {
    const { error } = await supabase.from("companies").update({ is_verified: verified }).eq("id", companyId);
    if (error) {
      toast.error("Erro ao atualizar empresa");
    } else {
      toast.success(verified ? "Empresa verificada" : "Verificação removida");
      setCompanies(companies.map(c => c.id === companyId ? { ...c, is_verified: verified } : c));
    }
  };

  if (authLoading || adminLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <MainLayout>
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Painel Administrativo</h1>
                <p className="text-muted-foreground">Gerencie vagas, empresas e usuários</p>
              </div>
            </div>
            <Button variant="outline" onClick={fetchData} disabled={loadingData}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button onClick={() => navigate("/admin/analytics")} className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
          </div>

          {/* Quota Exceeded Alert */}
          {quotaExceeded && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Limite de buscas atingido</AlertTitle>
              <AlertDescription>
                O limite mensal de 250 buscas da API foi atingido. A importação automática está pausada até a renovação do plano. 
                As vagas existentes continuam disponíveis normalmente.
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Vagas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{stats.jobs}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Empresas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{stats.companies}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Candidaturas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{stats.applications}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Candidatos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{stats.candidates}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="jobs" className="space-y-4">
            <TabsList>
              <TabsTrigger value="jobs">Vagas</TabsTrigger>
              <TabsTrigger value="companies">Empresas</TabsTrigger>
              <TabsTrigger value="blog">Blog</TabsTrigger>
              <TabsTrigger value="import">Importar Vagas</TabsTrigger>
              <TabsTrigger value="metatags">Meta Tags</TabsTrigger>
            </TabsList>

            <TabsContent value="jobs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Todas as Vagas</CardTitle>
                  <CardDescription>Gerencie todas as vagas cadastradas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criada</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>{job.companies?.name || "—"}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>
                            <Badge variant={job.status === "active" ? "default" : "secondary"}>
                              {job.status === "active" ? "Ativa" : job.status === "closed" ? "Fechada" : "Rascunho"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="companies" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Todas as Empresas</CardTitle>
                  <CardDescription>Gerencie empresas e verificações</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Verificada</TableHead>
                        <TableHead>Criada</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell className="font-medium">{company.name}</TableCell>
                          <TableCell>{company.location || "—"}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={company.is_verified ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => handleVerifyCompany(company.id, !company.is_verified)}
                            >
                              {company.is_verified ? "Verificada" : "Não verificada"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDistanceToNow(new Date(company.created_at), { addSuffix: true, locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCompany(company.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="blog">
              <AdminBlogManager />
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Importar Vagas da Bahia
                  </CardTitle>
                  <CardDescription>
                    Importação automática 8x ao dia. Cada execução busca vagas de uma cidade aleatória da Bahia.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quotaExceeded && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Limite mensal atingido</AlertTitle>
                      <AlertDescription>
                        As 250 buscas mensais da API foram esgotadas. A importação será retomada automaticamente quando o plano renovar.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <p className="font-medium text-sm">Configuração atual:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <strong>Frequência:</strong> 8 vezes por dia (a cada 3 horas)</li>
                      <li>• <strong>Cobertura:</strong> Todas as cidades da Bahia (50+ municípios)</li>
                      <li>• <strong>Limite mensal:</strong> 250 buscas/mês</li>
                      <li>• <strong>Sem filtro de cargo:</strong> Busca genérica "vagas [cidade] Bahia"</li>
                      <li>• <strong>Sem limite de vagas:</strong> Importa todas as vagas encontradas</li>
                    </ul>
                  </div>

                  {lastResult && (
                    <div className="p-3 rounded-lg bg-muted text-sm">
                      <p className="font-medium">Última importação:</p>
                      <p className="text-muted-foreground">{lastResult.message}</p>
                      {lastResult.city_searched && (
                        <p className="text-muted-foreground">Cidade buscada: {lastResult.city_searched}</p>
                      )}
                    </div>
                  )}

                  <Button 
                    onClick={handleImportJobs} 
                    disabled={isImporting || quotaExceeded}
                    className="w-full"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Importar Vagas Manualmente
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metatags">
              <AdminMetaTags />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Admin;
