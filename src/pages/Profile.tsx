import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Pagination } from "@/components/Pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Pencil, Save, X, FileText, Clock, Building2, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CandidateProfile {
  id: string;
  full_name: string;
  phone: string | null;
  bio: string | null;
  skills: string[] | null;
  linkedin_url: string | null;
  resume_url: string | null;
}

interface Application {
  id: string;
  status: string;
  created_at: string;
  cover_letter: string | null;
  jobs: {
    id: string;
    title: string;
    location: string;
    companies: {
      name: string;
      logo_url: string | null;
    } | null;
  } | null;
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  reviewing: "Em análise",
  accepted: "Aceita",
  rejected: "Rejeitada",
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editedProfile, setEditedProfile] = useState<Partial<CandidateProfile>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error("Você precisa fazer login");
      navigate("/auth");
      return;
    }

    if (userRole && userRole !== "candidate") {
      toast.error("Esta página é apenas para candidatos");
      navigate("/");
      return;
    }

    if (userRole === "candidate") {
      fetchProfile();
      fetchApplications();
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (user && userRole === "candidate") {
      fetchApplications();
    }
  }, [currentPage, itemsPerPage, user, userRole]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      toast.error("Erro ao carregar perfil");
      console.error(error);
    } else if (data) {
      setProfile(data);
      setEditedProfile(data);
    }

    setLoading(false);
  };

  const fetchApplications = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profileData) return;

    // Get total count
    const { count, error: countError } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("candidate_id", profileData.id);

    if (countError) {
      toast.error("Erro ao carregar candidaturas");
      console.error(countError);
      return;
    }

    setTotalApplications(count || 0);

    // Get paginated data
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        created_at,
        cover_letter,
        jobs (
          id,
          title,
          location,
          companies (
            name,
            logo_url
          )
        )
      `)
      .eq("candidate_id", profileData.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      toast.error("Erro ao carregar candidaturas");
      console.error(error);
    } else {
      setApplications(data as Application[]);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    const { error } = await supabase
      .from("candidate_profiles")
      .update({
        full_name: editedProfile.full_name || profile.full_name,
        phone: editedProfile.phone,
        bio: editedProfile.bio,
        linkedin_url: editedProfile.linkedin_url,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Erro ao atualizar perfil");
      console.error(error);
    } else {
      toast.success("Perfil atualizado com sucesso!");
      setProfile({ ...profile, ...editedProfile });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setIsEditing(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Perfil não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                <Pencil className="h-4 w-4" />
                Editar Perfil
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
                <Button onClick={handleCancel} variant="outline" className="gap-2">
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Suas informações de candidato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    value={editedProfile.full_name || ""}
                    onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                  />
                ) : (
                  <p className="text-foreground">{profile.full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editedProfile.phone || ""}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                ) : (
                  <p className="text-foreground">{profile.phone || "Não informado"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                {isEditing ? (
                  <Input
                    id="linkedin_url"
                    value={editedProfile.linkedin_url || ""}
                    onChange={(e) => setEditedProfile({ ...editedProfile, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/seu-perfil"
                  />
                ) : (
                  <p className="text-foreground">{profile.linkedin_url || "Não informado"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Sobre Mim</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={editedProfile.bio || ""}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    placeholder="Conte um pouco sobre você e sua experiência..."
                    rows={4}
                  />
                ) : (
                  <p className="text-foreground whitespace-pre-line">{profile.bio || "Não informado"}</p>
                )}
              </div>

              {profile.resume_url && (
                <div className="space-y-2">
                  <Label>Currículo</Label>
                  <a
                    href={profile.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    Ver currículo
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Minhas Candidaturas</CardTitle>
              <CardDescription>
                {totalApplications === 0
                  ? "Você ainda não se candidatou a nenhuma vaga"
                  : `${totalApplications} candidatura${totalApplications > 1 ? "s" : ""}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Nenhuma candidatura ainda</p>
                  <Button onClick={() => navigate("/vagas")}>
                    Ver Vagas Disponíveis
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div key={application.id}>
                        <div
                          className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/vaga/${application.jobs?.id}`)}
                        >
                          {application.jobs?.companies?.logo_url && (
                            <img
                              src={application.jobs.companies.logo_url}
                              alt={application.jobs.companies.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-1">
                              {application.jobs?.title || "Vaga não encontrada"}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {application.jobs?.companies?.name || "Empresa"}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {application.jobs?.location || "Localização"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  application.status === "accepted"
                                    ? "default"
                                    : application.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {statusLabels[application.status] || application.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(application.created_at), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalItems={totalApplications}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
