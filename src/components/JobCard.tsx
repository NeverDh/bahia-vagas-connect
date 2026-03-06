import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Briefcase, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    location: string;
    contract_type: string;
    experience_level: string;
    salary_min?: number;
    salary_max?: number;
    remote_option: boolean;
    created_at: string;
    category: string;
    companies?: {
      name: string;
      logo_url?: string;
    };
  };
  hasApplied?: boolean;
}

const contractTypeLabels: Record<string, string> = {
  clt: "CLT",
  pj: "PJ",
  temporary: "Temporário",
  intern: "Estágio",
  freelance: "Freelance"
};

const experienceLevelLabels: Record<string, string> = {
  jovem_aprendiz: "Jovem Aprendiz",
  auxiliar: "Auxiliar",
  assistente: "Assistente",
  intern: "Estágio",
  freelancer: "Freelancer",
  junior: "Júnior",
  mid: "Pleno",
  senior: "Sênior",
  specialist: "Especialista"
};

export const JobCard = ({ job, hasApplied = false }: JobCardProps) => {
  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return "A combinar";
    if (job.salary_min && job.salary_max) {
      return `R$ ${job.salary_min.toLocaleString()} - R$ ${job.salary_max.toLocaleString()}`;
    }
    return job.salary_min ? `A partir de R$ ${job.salary_min.toLocaleString()}` : "A combinar";
  };

  return (
    <Link to={`/vaga/${job.id}`}>
      <Card className="p-6 hover:shadow-[var(--shadow-hover)] transition-all duration-300 cursor-pointer border border-border bg-card">
        <div className="flex items-start gap-4">
          {job.companies?.logo_url && (
            <img 
              src={job.companies.logo_url} 
              alt={job.companies.name} 
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg text-foreground hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground">{job.companies?.name}</p>
              </div>
              {hasApplied && (
                <Badge variant="default" className="gap-1 bg-primary text-primary-foreground">
                  <CheckCircle2 className="h-3 w-3" />
                  Candidatado
                </Badge>
              )}
            </div>

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
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                {formatSalary()}
              </span>
              
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: ptBR })}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
