import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Briefcase, Building2, Users, Download, Trash2, Plus, RefreshCw, AlertTriangle } from "lucide-react";
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
  const { importJobs, isImporting } = useImportJobs();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState({ jobs: 0, companies: 0, applications: 0, candidates: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [searchQueries, setSearchQueries] = useState("emprego, vaga, trabalho");
  const [maxJobs, setMaxJobs] = useState("50");

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
    const queries = searchQueries.split(",").map(q => q.trim()).filter(Boolean);
    const max = parseInt(maxJobs) || 50;
    
    await importJobs({ searchQueries: queries, maxJobs: max });
    setImportDialogOpen(false);
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
          </div>

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
              <TabsTrigger value="import">Importar Vagas</TabsTrigger>
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

            <TabsContent value="import" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Importar Vagas da Bahia
                  </CardTitle>
                  <CardDescription>
                    Importe vagas reais de APIs externas (JSearch/RapidAPI)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="searchQueries">Termos de busca (separados por vírgula)</Label>
                    <Textarea
                      id="searchQueries"
                      value={searchQueries}
                      onChange={(e) => setSearchQueries(e.target.value)}
                      placeholder="emprego, vaga, trabalho, desenvolvedor..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxJobs">Número máximo de vagas</Label>
                    <Input
                      id="maxJobs"
                      type="number"
                      value={maxJobs}
                      onChange={(e) => setMaxJobs(e.target.value)}
                      min="1"
                      max="100"
                    />
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">Atenção</p>
                      <p>A importação busca vagas em cidades da Bahia e pode demorar alguns segundos. As vagas importadas terão link para o site original.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleImportJobs} 
                    disabled={isImporting}
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
                        Importar Vagas
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Admin;
