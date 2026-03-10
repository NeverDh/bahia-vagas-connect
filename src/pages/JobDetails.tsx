import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Briefcase, DollarSign, Clock, Building2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { ApplicationForm } from "@/components/ApplicationForm";
import { AdBanner } from "@/components/AdBanner";
import { markJobAsViewed } from "@/hooks/useViewedJobs";

const contractTypeLabels: Record<string, string> = {
  clt: "CLT",
  pj: "PJ",
  temporary: "Temporário",
  intern: "Estágio",
  freelance: "Freelance"
};

const experienceLevelLabels: Record<string, string> = {
  intern: "Estágio",
  junior: "Júnior",
  mid: "Pleno",
  senior: "Sênior",
  specialist: "Especialista"
};

interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  location: string;
  contract_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  remote_option: boolean;
  created_at: string;
  category: string;
  external_url?: string;
  companies?: {
    name: string;
    logo_url?: string;
    description?: string;
    website?: string;
    location?: string;
  };
}

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const { user, userRole } = useAuth();

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("jobs")
          .select(`
            *,
            companies (
              name,
              logo_url,
              description,
              website,
              location
            )
          `)
          .eq("id", id)
          .eq("status", "active")
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast.error("Vaga não encontrada");
          navigate("/vagas");
          return;
        }

        setJob(data as Job);
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Erro ao carregar vaga");
        navigate("/vagas");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
    
    if (user && userRole === "candidate") {
      fetchCandidateProfile();
      checkIfAlreadyApplied();
    } else {
      setCheckingApplication(false);
    }
  }, [id, navigate, user, userRole]);

  const fetchCandidateProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data && !error) {
      setCandidateProfile(data);
    }
  };

  const checkIfAlreadyApplied = async () => {
    if (!user || !id) {
      setCheckingApplication(false);
      return;
    }
    
    const { data: profileData } = await supabase
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profileData) {
      setCheckingApplication(false);
      return;
    }

    const { data, error } = await supabase
      .from("applications")
      .select("id")
      .eq("candidate_id", profileData.id)
      .eq("job_id", id)
      .maybeSingle();

    if (!error && data) {
      setHasApplied(true);
    }
    
    setCheckingApplication(false);
  };

  const formatSalary = () => {
    if (!job?.salary_min && !job?.salary_max) return "A combinar";
    if (job.salary_min && job.salary_max) {
      return `R$ ${job.salary_min.toLocaleString()} - R$ ${job.salary_max.toLocaleString()}`;
    }
    return job.salary_min ? `A partir de R$ ${job.salary_min.toLocaleString()}` : "A combinar";
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <MainLayout>
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/vagas")}
            className="mb-4"
          >
            ← Voltar para vagas
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                {job.companies?.logo_url && (
                  <img
                    src={job.companies.logo_url}
                    alt={job.companies.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                  <CardDescription className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {job.companies?.name}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </Badge>
                
                {job.remote_option && (
                  <Badge variant="outline">Remoto</Badge>
                )}
                
                <Badge variant="outline" className="gap-1">
                  <Briefcase className="h-3 w-3" />
                  {contractTypeLabels[job.contract_type] || job.contract_type}
                </Badge>
                
                <Badge variant="outline">
                  {experienceLevelLabels[job.experience_level] || job.experience_level}
                </Badge>

                <Badge variant="outline">{job.category}</Badge>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatSalary()}
                </span>
                
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Publicada {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">Descrição da Vaga</h3>
                <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
              </div>

              {job.requirements && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Requisitos</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{job.requirements}</p>
                  </div>
                </>
              )}

              {job.benefits && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Benefícios</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{job.benefits}</p>
                  </div>
                </>
              )}

              {job.companies?.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Sobre a Empresa</h3>
                    <p className="text-muted-foreground">{job.companies.description}</p>
                    {job.companies.website && (
                      <a
                        href={job.companies.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 mt-2"
                      >
                        Visitar site da empresa
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </>
              )}

              <Separator />

              <div className="flex gap-4">
                {job.external_url ? (
                  <Button 
                    size="lg" 
                    className="flex-1"
                    onClick={() => window.open(job.external_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Candidatar-se no site original
                  </Button>
                ) : userRole === "company" ? (
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Empresas não podem se candidatar a vagas
                    </p>
                  </div>
                ) : hasApplied ? (
                  <div className="flex-1">
                    <Button 
                      size="lg" 
                      className="w-full"
                      disabled
                      variant="secondary"
                    >
                      Você já se candidatou a esta vaga
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Acompanhe o status no seu perfil
                    </p>
                  </div>
                ) : (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="lg" 
                        className="flex-1"
                        disabled={checkingApplication}
                        onClick={() => {
                          if (!user) {
                            toast.error("Login necessário", {
                              description: "Você precisa fazer login como candidato para se candidatar"
                            });
                            navigate("/auth");
                            return;
                          }

                          if (userRole !== "candidate") {
                            toast.error("Apenas candidatos", {
                              description: "Apenas candidatos podem se candidatar às vagas"
                            });
                            return;
                          }

                          setIsDialogOpen(true);
                        }}
                      >
                        Candidatar-se
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Candidatar-se para {job.title}</DialogTitle>
                      <DialogDescription>
                        Preencha o formulário abaixo para enviar sua candidatura
                      </DialogDescription>
                    </DialogHeader>
                    {candidateProfile && (
                      <ApplicationForm
                        jobId={id!}
                        candidateId={candidateProfile.id}
                        onSuccess={() => {
                          setIsDialogOpen(false);
                          setHasApplied(true);
                          toast.success("Candidatura enviada com sucesso!");
                        }}
                      />
                    )}
                  </DialogContent>
                </Dialog>
                )}
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copiado!");
                  }}
                >
                  Compartilhar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ad after job details - visible on all devices */}
          <div className="py-4">
            <AdBanner variant="horizontal" slot="auto" />
          </div>
          
          {/* Spacer for mobile ad banner */}
          <div className="h-24 xl:hidden" />
        </div>
      </div>
    </MainLayout>
  );
};

export default JobDetails;
