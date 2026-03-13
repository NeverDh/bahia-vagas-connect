import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { JobCard } from "@/components/JobCard";
import { Pagination } from "@/components/Pagination";
import { AdBanner } from "@/components/AdBanner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SeoJobPage, seoJobPages } from "@/lib/seo-job-pages";
import { JobCarouselSection } from "@/components/JobCarouselSection";

interface JobsByCategoryProps {
  page: SeoJobPage;
}

const JobsByCategory = ({ page }: JobsByCategoryProps) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const { user, userRole } = useAuth();

  useEffect(() => {
    document.title = page.title;

    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", page.metaDescription);
    setMeta("og:title", page.title, "property");
    setMeta("og:description", page.metaDescription, "property");
    setMeta("og:type", "website", "property");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `https://bahiavagas.com/vagas-${page.slug}`);

    return () => {
      document.title = "BahiaVagas";
    };
  }, [page]);

  useEffect(() => {
    setCurrentPage(1);
  }, [page.slug]);

  useEffect(() => {
    fetchJobs();
    if (user && userRole === "candidate") {
      fetchAppliedJobs();
    }
  }, [page.slug, currentPage, itemsPerPage, user, userRole]);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      if (page.filterType === "remote") {
        // For home office: filter by remote_option = true
        const { count } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
          .eq("remote_option", true);

        setTotalJobs(count || 0);

        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        const { data } = await supabase
          .from("jobs")
          .select("*, companies(name, logo_url)")
          .eq("status", "active")
          .eq("remote_option", true)
          .order("created_at", { ascending: false })
          .range(from, to);

        setJobs(data || []);
      } else {
        // For keyword-based search: use OR conditions on title
        const orConditions = page.keywords
          .map((kw) => `title.ilike.%${kw}%`)
          .join(",");

        const { count } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
          .or(orConditions);

        setTotalJobs(count || 0);

        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        const { data } = await supabase
          .from("jobs")
          .select("*, companies(name, logo_url)")
          .eq("status", "active")
          .or(orConditions)
          .order("created_at", { ascending: false })
          .range(from, to);

        setJobs(data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar vagas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    if (!user) return;
    const { data: profileData } = await supabase
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!profileData) return;
    const { data: applications } = await supabase
      .from("applications")
      .select("job_id")
      .eq("candidate_id", profileData.id);
    if (applications) {
      setAppliedJobIds(new Set(applications.map((app) => app.job_id)));
    }
  };

  const relatedPages = seoJobPages.filter((p) =>
    page.relatedPages.includes(p.slug)
  );

  return (
    <MainLayout>
      <div className="px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">{page.h1}</h1>

        <div className="prose prose-lg max-w-none mb-8 text-muted-foreground">
          <p>{page.introText}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {totalJobs} {totalJobs === 1 ? "vaga encontrada" : "vagas encontradas"}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando vagas...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground text-lg">
              Nenhuma vaga encontrada no momento. Veja outras vagas disponíveis.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/vagas"
                className="text-primary hover:underline font-medium"
              >
                Ver todas as vagas
              </Link>
              {relatedPages.map((rp) => (
                <Link
                  key={rp.slug}
                  to={`/vagas-${rp.slug}`}
                  className="text-primary hover:underline font-medium"
                >
                  {rp.h1}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {jobs.map((job, index) => (
                <div key={job.id}>
                  <JobCard job={job} hasApplied={appliedJobIds.has(job.id)} />
                  {(index + 1) % 3 === 0 && index < jobs.length - 1 && (
                    <div className="mt-4">
                      <AdBanner variant="horizontal" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={totalJobs}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </>
        )}

        {/* Internal links section */}
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-xl font-semibold mb-4">Veja também</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {relatedPages.map((rp) => (
              <Link
                key={rp.slug}
                to={`/vagas-${rp.slug}`}
                className="p-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium text-foreground"
              >
                {rp.h1}
              </Link>
            ))}
            <Link
              to="/vagas"
              className="p-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium text-foreground"
            >
              Todas as Vagas
            </Link>
          </div>
        </div>

        <div className="h-24 xl:hidden" />
      </div>
    </MainLayout>
  );
};

export default JobsByCategory;
