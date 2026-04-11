import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { MapPin, Building2, ArrowRight } from "lucide-react";
import api from "@/services/api";
import type { JobCarouselPayload } from "@/lib/jobs-api";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

type JobCard = {
  id: string;
  title: string;
  location: string;
  company_name: string | null;
};

function JobCarousel({ jobs, label }: { jobs: JobCard[]; label: string }) {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      breakpoints: {
        "(min-width: 1024px)": { slidesToScroll: 2 },
      },
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  if (!jobs.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg md:text-xl font-bold">
        <span className="text-primary">{label.split(" ")[0]} </span>
        <span className="text-accent">{label.split(" ").slice(1).join(" ")}</span>
      </h3>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="min-w-0 shrink-0 grow-0 pl-3 basis-full sm:basis-1/2 lg:basis-1/4"
            >
              <div className="group rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {job.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  {job.company_name && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3 shrink-0" />
                      <span className="truncate">{job.company_name}</span>
                    </div>
                  )}
                </div>
                <Link
                  to={`/vaga/${job.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mt-auto"
                >
                  Ver vaga <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function useJobCarouselData() {
  const [recentJobs, setRecentJobs] = useState<JobCard[]>([]);
  const [popularJobs, setPopularJobs] = useState<JobCard[]>([]);

  const fetchJobs = useCallback(async () => {
    try {
      const payload = await api.get<JobCarouselPayload>(
        "/api/jobs/featured/carousel",
      );
      setRecentJobs(payload.recent);
      setPopularJobs(payload.popular);
    } catch {
      setRecentJobs([]);
      setPopularJobs([]);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { recentJobs, popularJobs };
}

export { JobCarousel };

export function JobCarouselSection() {
  const { recentJobs, popularJobs } = useJobCarouselData();

  if (!recentJobs.length && !popularJobs.length) return null;

  return (
    <section className="py-12 bg-muted/20">
      <div className="container px-4 space-y-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center">
          <span className="text-primary">Oportunidades </span>
          <span className="text-accent">em Destaque</span>
        </h2>
        <JobCarousel jobs={recentJobs} label="Vagas Recentes" />
        <JobCarousel jobs={popularJobs} label="Vagas Mais Pesquisadas" />
      </div>
    </section>
  );
}
