import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { JobCard } from "@/components/JobCard";
import { JobFilters } from "@/components/JobFilters";
import { Pagination } from "@/components/Pagination";
import { AdBanner } from "@/components/AdBanner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getSlugByMunicipio } from "@/lib/bahia-municipios";

interface JobsProps {
  initialLocation?: string;
}

const Jobs = ({ initialLocation }: JobsProps = {}) => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<any[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [mobileSearchTerm, setMobileSearchTerm] = useState(searchParams.get("q") || "");
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    contractTypes: [] as string[],
    experienceLevels: [] as string[],
    remoteOnly: false,
    location: initialLocation || searchParams.get("location") || "",
    sortOrder: "newest" as "newest" | "oldest"
  });

  const activeFiltersCount = 
    filters.contractTypes.length + 
    filters.experienceLevels.length + 
    (filters.remoteOnly ? 1 : 0) +
    (filters.location ? 1 : 0);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  // Update URL when location filter changes
  useEffect(() => {
    if (filters.location) {
      const slug = getSlugByMunicipio(filters.location);
      if (slug) {
        navigate(`/vagas-${slug}`, { replace: true });
      }
    } else if (!initialLocation) {
      navigate("/vagas", { replace: true });
    }
  }, [filters.location, navigate, initialLocation]);

  useEffect(() => {
    fetchJobs();
    if (user && userRole === "candidate") {
      fetchAppliedJobs();
    }
  }, [filters, searchTerm, user, userRole, currentPage, itemsPerPage]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const normalizedSearch = searchTerm.trim().replace(/,/g, " ");
      
      // Use RPC search function for accent-insensitive, partial-word search
      let searchJobIds: string[] | null = null;
      if (normalizedSearch) {
        const { data: searchResults, error: searchError } = await supabase
          .rpc("search_jobs", { search_text: normalizedSearch });
        
        if (searchError) throw searchError;
        searchJobIds = (searchResults as string[]) || [];
        
        // If search returned no results, short-circuit
        if (searchJobIds.length === 0) {
          setJobs([]);
          setTotalJobs(0);
          setLoading(false);
          return;
        }
      }

      // Build base query for counting
      let countQuery = supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      if (searchJobIds) {
        countQuery = countQuery.in("id", searchJobIds);
      }

      if (filters.remoteOnly) {
        countQuery = countQuery.eq("remote_option", true);
      }

      if (filters.contractTypes.length > 0) {
        countQuery = countQuery.in("contract_type", filters.contractTypes as any);
      }

      if (filters.experienceLevels.length > 0) {
        const titleKeywords: Record<string, string[]> = {
          auxiliar: ["auxiliar"],
          assistente: ["assistente"],
          intern: ["estágio", "estagiário", "estagiario"],
        };

        const orConditions: string[] = [];
        const levelsForDb = filters.experienceLevels;
        
        orConditions.push(`experience_level.in.(${levelsForDb.join(",")})`);
        
        for (const level of levelsForDb) {
          const keywords = titleKeywords[level];
          if (keywords) {
            for (const kw of keywords) {
              orConditions.push(`title.ilike.%${kw}%`);
            }
          }
        }

        countQuery = countQuery.or(orConditions.join(","));
      }

      if (filters.location) {
        countQuery = countQuery.ilike("location", `%${filters.location}%`);
      }

      // Get total count
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      setTotalJobs(count || 0);

      // Build data query with pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let dataQuery = supabase
        .from("jobs")
        .select(`
          *,
          companies (
            name,
            logo_url
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: filters.sortOrder === "oldest" })
        .range(from, to);

      if (searchJobIds) {
        dataQuery = dataQuery.in("id", searchJobIds);
      }

      if (filters.remoteOnly) {
        dataQuery = dataQuery.eq("remote_option", true);
      }

      if (filters.contractTypes.length > 0) {
        dataQuery = dataQuery.in("contract_type", filters.contractTypes as any);
      }

      if (filters.experienceLevels.length > 0) {
        const titleKeywords: Record<string, string[]> = {
          auxiliar: ["auxiliar"],
          assistente: ["assistente"],
          intern: ["estágio", "estagiário", "estagiario"],
        };

        const orConditions: string[] = [];
        const levelsForDb = filters.experienceLevels;
        
        orConditions.push(`experience_level.in.(${levelsForDb.join(",")})`);
        
        for (const level of levelsForDb) {
          const keywords = titleKeywords[level];
          if (keywords) {
            for (const kw of keywords) {
              orConditions.push(`title.ilike.%${kw}%`);
            }
          }
        }

        dataQuery = dataQuery.or(orConditions.join(","));
      }

      if (filters.location) {
        dataQuery = dataQuery.ilike("location", `%${filters.location}%`);
      }

      const { data, error } = await dataQuery;

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar vagas",
        description: error.message,
        variant: "destructive"
      });
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
      const jobIds = new Set(applications.map(app => app.job_id));
      setAppliedJobIds(jobIds);
    }
  };

  const handleApplyMobileFilters = () => {
    setSearchTerm(mobileSearchTerm);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({
      contractTypes: [],
      experienceLevels: [],
      remoteOnly: false,
      location: "",
      sortOrder: "newest"
    });
    setMobileSearchTerm("");
    setSearchTerm("");
  };

  const handleOpenFilterSheet = () => {
    setMobileSearchTerm(searchTerm);
    setIsFilterOpen(true);
  };

  return (
    <MainLayout>
      <div className="px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Vagas Disponíveis</h1>
          
          {/* Desktop Search */}
          <div className="hidden lg:block relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por cargo ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={handleOpenFilterSheet}
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Buscar e Filtrar
                  </span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
                <SheetHeader className="mb-4">
                  <div className="flex items-center justify-between">
                    <SheetTitle>Buscar e Filtrar</SheetTitle>
                    {(activeFiltersCount > 0 || mobileSearchTerm) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Limpar
                      </Button>
                    )}
                  </div>
                </SheetHeader>

                <div className="space-y-6 overflow-y-auto max-h-[calc(85vh-180px)]">
                  {/* Mobile Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por cargo ou categoria..."
                      value={mobileSearchTerm}
                      onChange={(e) => setMobileSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filters */}
                  <JobFilters 
                    filters={filters} 
                    onFilterChange={setFilters} 
                    variant="mobile"
                  />
                </div>

                {/* Apply Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleApplyMobileFilters}
                  >
                    Aplicar Filtros
                    {totalJobs > 0 && ` (${totalJobs} vagas)`}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Desktop Filters */}
          <div className="hidden lg:block lg:col-span-1">
            <JobFilters filters={filters} onFilterChange={setFilters} />
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando vagas...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma vaga encontrada</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {jobs.map((job, index) => (
                    <div key={job.id}>
                      <JobCard 
                        job={job} 
                        hasApplied={appliedJobIds.has(job.id)}
                      />
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
          </div>
        </div>
        
        {/* Spacer for mobile ad banner */}
        <div className="h-24 xl:hidden" />
      </div>
    </MainLayout>
  );
};

export default Jobs;
