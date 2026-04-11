import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { JobCard } from "@/components/JobCard";
import { Pagination } from "@/components/Pagination";
import { AdBanner } from "@/components/AdBanner";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchAppliedJobIds,
  fetchJobsList,
} from "@/lib/jobs-api";
import { JobCarouselSection } from "@/components/JobCarouselSection";
import {
  ProgrammaticPage,
  seoCities,
  seoProfessions,
  seoJobTypes,
} from "@/lib/seo-programmatic";

interface Props {
  page: ProgrammaticPage;
}

const ProgrammaticSeoPage = ({ page }: Props) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const { user, userRole } = useAuth();

  // SEO meta tags
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
    canonical.setAttribute("href", `https://bahiavagas.com${page.fullPath}`);

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

      const isRemote = page.jobType?.filterType === "remote";
      const cityName = page.city.name;
      const keywords = page.keywords;

      if (isRemote) {
        let res = await fetchJobsList({
          page: currentPage,
          limit: itemsPerPage,
          remoteOnly: true,
          location: cityName,
          sortOrder: "newest",
        });

        if (!res.data.length && !res.total) {
          res = await fetchJobsList({
            page: currentPage,
            limit: itemsPerPage,
            remoteOnly: true,
            sortOrder: "newest",
          });
        }

        setTotalJobs(res.total);
        setJobs(res.data as any[]);
      } else {
        let res = await fetchJobsList({
          page: currentPage,
          limit: itemsPerPage,
          titleKeywords: keywords,
          location: cityName,
          sortOrder: "newest",
        });

        if (!res.total) {
          res = await fetchJobsList({
            page: currentPage,
            limit: itemsPerPage,
            titleKeywords: keywords,
            sortOrder: "newest",
          });
        }

        setTotalJobs(res.total);
        setJobs(res.data as any[]);
      }
    } catch (error) {
      console.error("Erro ao carregar vagas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    if (!user) return;
    try {
      const ids = await fetchAppliedJobIds();
      setAppliedJobIds(new Set(ids));
    } catch {
      setAppliedJobIds(new Set());
    }
  };

  // Related links: other cities for same profession/type, and other professions for same city
  const otherCities = seoCities.filter((c) => c.slug !== page.city.slug);
  const currentProfessionOrType = page.profession?.slug || page.jobType?.slug || "";

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
              Nenhuma vaga encontrada no momento. Veja outras oportunidades disponíveis.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/vagas" className="text-primary hover:underline font-medium">
                Ver todas as vagas
              </Link>
              <Link to={`/vagas-${page.city.slug}`} className="text-primary hover:underline font-medium">
                Vagas em {page.city.name}
              </Link>
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

        {/* Internal links: same profession/type in other cities */}
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-xl font-semibold mb-4">
            {page.profession
              ? `Vagas de ${page.profession.name} em Outras Cidades`
              : `${page.jobType?.name} em Outras Cidades`}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {otherCities.map((city) => (
              <Link
                key={city.slug}
                to={`/vagas-${currentProfessionOrType}-${city.slug}`}
                className="p-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium text-foreground text-center"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Internal links: other professions in same city */}
        <div className="mt-8 border-t border-border pt-8">
          <h2 className="text-xl font-semibold mb-4">
            Outras Vagas em {page.city.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {seoProfessions
              .filter((p) => p.slug !== page.profession?.slug)
              .slice(0, 10)
              .map((prof) => (
                <Link
                  key={prof.slug}
                  to={`/vagas-${prof.slug}-${page.city.slug}`}
                  className="p-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium text-foreground text-center"
                >
                  {prof.name}
                </Link>
              ))}
          </div>
        </div>

        {/* Internal links: job types in same city */}
        <div className="mt-8 border-t border-border pt-8">
          <h2 className="text-xl font-semibold mb-4">
            Tipos de Vagas em {page.city.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {seoJobTypes
              .filter((jt) => jt.slug !== page.jobType?.slug)
              .map((jt) => (
                <Link
                  key={jt.slug}
                  to={`/vagas-${jt.slug}-${page.city.slug}`}
                  className="p-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium text-foreground text-center"
                >
                  {jt.name}
                </Link>
              ))}
            <Link
              to={`/vagas-${page.city.slug}`}
              className="p-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium text-primary text-center"
            >
              Todas as Vagas em {page.city.name}
            </Link>
            <Link
              to="/vagas"
              className="p-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium text-primary text-center"
            >
              Todas as Vagas
            </Link>
          </div>
        </div>

        {/* Job Carousels */}
        <JobCarouselSection />

        <div className="h-24 xl:hidden" />
      </div>
    </MainLayout>
  );
};

export default ProgrammaticSeoPage;
