import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Plus, Briefcase, Users, MapPin, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Pagination } from "@/components/Pagination";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const contractTypeOptions = [
  { value: "clt", label: "CLT" },
  { value: "pj", label: "PJ" },
  { value: "temporary", label: "Temporário" },
  { value: "intern", label: "Estágio" },
  { value: "freelance", label: "Freelance" },
];

const experienceLevelOptions = [
  { value: "intern", label: "Estágio" },
  { value: "junior", label: "Júnior" },
  { value: "mid", label: "Pleno" },
  { value: "senior", label: "Sênior" },
  { value: "specialist", label: "Especialista" },
];

const statusLabels: Record<string, string> = {
  active: "Ativa",
  closed: "Fechada",
  draft: "Rascunho",
};

interface Job {
  id: string;
  title: string;
  location: string;
  contract_type: string;
  experience_level: string;
  status: string;
  created_at: string;
  _count?: { applications: number };
}

interface Company {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  website: string | null;
  logo_url: string | null;
}

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalJobs, setTotalJobs] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    benefits: "",
    location: "",
    category: "",
    contract_type: "clt" as "clt" | "pj" | "temporary" | "intern" | "freelance",
    experience_level: "junior" as "intern" | "junior" | "mid" | "senior" | "specialist",
    salary_min: "",
    salary_max: "",
    remote_option: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!authLoading && userRole && userRole !== "company") {
      toast.error("Acesso restrito", {
        description: "Esta página é apenas para empresas"
      });
      navigate("/");
      return;
    }

    if (user && userRole === "company") {
      fetchCompanyData();
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (company) {
      fetchJobs();
    }
  }, [company, currentPage, itemsPerPage]);

  const fetchCompanyData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching company:", error);
      toast.error("Erro ao carregar dados da empresa");
      return;
    }

    setCompany(data);
  };

  const fetchJobs = async () => {
    if (!company) return;

    setLoading(true);
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, error, count } = await supabase
      .from("jobs")
      .select("*", { count: "exact" })
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Erro ao carregar vagas");
      return;
    }

    setJobs(data || []);
    setTotalJobs(count || 0);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      requirements: "",
      benefits: "",
      location: "",
      category: "",
      contract_type: "clt",
      experience_level: "junior",
      salary_min: "",
      salary_max: "",
      remote_option: false,
    });
  };

  const handleCreateJob = async () => {
    if (!company) return;

    if (!formData.title || !formData.description || !formData.location || !formData.category) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const { error } = await supabase.from("jobs").insert({
      company_id: company.id,
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements || null,
      benefits: formData.benefits || null,
      location: formData.location,
      category: formData.category,
      contract_type: formData.contract_type,
      experience_level: formData.experience_level,
      salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
      salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
      remote_option: formData.remote_option,
      status: "active",
    });

    if (error) {
      console.error("Error creating job:", error);
      toast.error("Erro ao criar vaga");
      return;
    }

    toast.success("Vaga criada com sucesso!");
    setIsCreateDialogOpen(false);
    resetForm();
    fetchJobs();
  };

  const handleEditJob = async () => {
    if (!editingJob) return;

    const { error } = await supabase
      .from("jobs")
      .update({
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements || null,
        benefits: formData.benefits || null,
        location: formData.location,
        category: formData.category,
        contract_type: formData.contract_type,
        experience_level: formData.experience_level,
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
        remote_option: formData.remote_option,
      })
      .eq("id", editingJob.id);

    if (error) {
      console.error("Error updating job:", error);
      toast.error("Erro ao atualizar vaga");
      return;
    }

    toast.success("Vaga atualizada com sucesso!");
    setIsEditDialogOpen(false);
    setEditingJob(null);
    resetForm();
    fetchJobs();
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta vaga?")) return;

    const { error } = await supabase.from("jobs").delete().eq("id", jobId);

    if (error) {
      console.error("Error deleting job:", error);
      toast.error("Erro ao excluir vaga");
      return;
    }

    toast.success("Vaga excluída com sucesso!");
    fetchJobs();
  };

  const handleToggleStatus = async (job: Job) => {
    const newStatus = job.status === "active" ? "closed" : "active";

    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", job.id);

    if (error) {
      console.error("Error updating status:", error);
      toast.error("Erro ao atualizar status");
      return;
    }

    toast.success(`Vaga ${newStatus === "active" ? "ativada" : "fechada"} com sucesso!`);
    fetchJobs();
  };

  const openEditDialog = async (job: Job) => {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", job.id)
      .single();

    if (data) {
      setFormData({
        title: data.title,
        description: data.description,
        requirements: data.requirements || "",
        benefits: data.benefits || "",
        location: data.location,
        category: data.category,
        contract_type: data.contract_type,
        experience_level: data.experience_level,
        salary_min: data.salary_min?.toString() || "",
        salary_max: data.salary_max?.toString() || "",
        remote_option: data.remote_option,
      });
      setEditingJob(job);
      setIsEditDialogOpen(true);
    }
  };

  const totalPages = Math.ceil(totalJobs / itemsPerPage);

  if (authLoading || (user && !userRole)) {
    return (
      <MainLayout>
        <div className="px-4 py-8">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </div>
      </MainLayout>
    );
  }

  const JobForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="title">Título da Vaga *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: Desenvolvedor Full Stack"
          />
        </div>

        <div>
          <Label htmlFor="category">Categoria *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Ex: Tecnologia"
          />
        </div>

        <div>
          <Label htmlFor="location">Localização *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Ex: Salvador, BA"
          />
        </div>

        <div>
          <Label htmlFor="contract_type">Tipo de Contrato</Label>
          <Select
            value={formData.contract_type}
            onValueChange={(value) => setFormData({ ...formData, contract_type: value as typeof formData.contract_type })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {contractTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="experience_level">Nível de Experiência</Label>
          <Select
            value={formData.experience_level}
            onValueChange={(value) => setFormData({ ...formData, experience_level: value as typeof formData.experience_level })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {experienceLevelOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="salary_min">Salário Mínimo</Label>
          <Input
            id="salary_min"
            type="number"
            value={formData.salary_min}
            onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
            placeholder="Ex: 3000"
          />
        </div>

        <div>
          <Label htmlFor="salary_max">Salário Máximo</Label>
          <Input
            id="salary_max"
            type="number"
            value={formData.salary_max}
            onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
            placeholder="Ex: 5000"
          />
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <Switch
            id="remote_option"
            checked={formData.remote_option}
            onCheckedChange={(checked) => setFormData({ ...formData, remote_option: checked })}
          />
          <Label htmlFor="remote_option">Permite trabalho remoto</Label>
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Descrição da Vaga *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva as responsabilidades e atividades da vaga..."
            rows={4}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="requirements">Requisitos</Label>
          <Textarea
            id="requirements"
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            placeholder="Liste os requisitos necessários..."
            rows={3}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="benefits">Benefícios</Label>
          <Textarea
            id="benefits"
            value={formData.benefits}
            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
            placeholder="Liste os benefícios oferecidos..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }}>
          Cancelar
        </Button>
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Painel da Empresa</h1>
              <p className="text-muted-foreground">{company?.name}</p>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Vaga
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Vaga</DialogTitle>
                  <DialogDescription>
                    Preencha as informações da vaga que deseja publicar
                  </DialogDescription>
                </DialogHeader>
                <JobForm onSubmit={handleCreateJob} submitLabel="Publicar Vaga" />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Vagas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{totalJobs}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Vagas Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">
                    {jobs.filter(j => j.status === "active").length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg">{company?.location || "Não informada"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Minhas Vagas</CardTitle>
              <CardDescription>
                {totalJobs} {totalJobs === 1 ? "vaga cadastrada" : "vagas cadastradas"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Carregando...</p>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Você ainda não publicou nenhuma vaga
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    Publicar Primeira Vaga
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{job.title}</h3>
                          <Badge
                            variant={job.status === "active" ? "default" : "secondary"}
                          >
                            {statusLabels[job.status] || job.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                          <span>
                            {formatDistanceToNow(new Date(job.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/vaga/${job.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(job)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(job)}
                        >
                          {job.status === "active" ? "Fechar" : "Ativar"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      totalItems={totalJobs}
                      onPageChange={setCurrentPage}
                      onItemsPerPageChange={(value) => {
                        setItemsPerPage(value);
                        setCurrentPage(1);
                      }}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setEditingJob(null);
              resetForm();
            }
          }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar Vaga</DialogTitle>
                <DialogDescription>
                  Atualize as informações da vaga
                </DialogDescription>
              </DialogHeader>
              <JobForm onSubmit={handleEditJob} submitLabel="Salvar Alterações" />
              </DialogContent>
          </Dialog>
          
          {/* Spacer for mobile ad banner */}
          <div className="h-24 xl:hidden" />
        </div>
      </div>
    </MainLayout>
  );
};

export default CompanyDashboard;
