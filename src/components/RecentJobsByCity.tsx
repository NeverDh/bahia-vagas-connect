import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const CITIES = [
  { name: "Salvador", slug: "salvador" },
  { name: "Feira de Santana", slug: "feira-de-santana" },
  { name: "Lauro de Freitas", slug: "lauro-de-freitas" },
] as const;

interface CityJob {
  id: string;
  title: string;
  created_at: string;
  company: { name: string } | null;
}

const useCityJobs = (cityName: string) =>
  useQuery({
    queryKey: ["recent-jobs", cityName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, created_at, company:companies(name)")
        .eq("status", "active")
        .ilike("location", `%${cityName}%`)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as unknown as CityJob[];
    },
  });

const CityBlock = ({ name, slug }: { name: string; slug: string }) => {
  const { data: jobs = [], isLoading } = useCityJobs(name);

  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3 flex-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-muted-foreground flex-1">
          Nenhuma vaga recente encontrada.
        </p>
      ) : (
        <ul className="space-y-3 flex-1">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                to={`/vaga/${job.id}`}
                className="block rounded-lg p-3 hover:bg-muted/60 transition-colors"
              >
                <p className="font-medium text-sm text-foreground leading-snug">
                  {job.title}
                </p>
                <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                  <span>{job.company?.name ?? "Empresa"}</span>
                  <span>
                    {formatDistanceToNow(new Date(job.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link to={`/vagas-${slug}`} className="mt-4">
        <Button variant="outline" className="w-full group">
          Ver todas as vagas em {name}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  );
};

export const RecentJobsByCity = () => {
  return (
    <section className="py-16">
      <div className="container px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-foreground">
          Vagas Recentes por Cidade
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {CITIES.map((city) => (
            <CityBlock key={city.slug} name={city.name} slug={city.slug} />
          ))}
        </div>
      </div>
    </section>
  );
};
