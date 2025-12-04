import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { JobCard } from "@/components/JobCard";
import { JobFilters } from "@/components/JobFilters";
import { Pagination } from "@/components/Pagination";
import { AdBanner } from "@/components/AdBanner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Jobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  
  const [filters, setFilters] = useState({
    contractTypes: [] as string[],
    experienceLevels: [] as string[],
    remoteOnly: false
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  useEffect(() => {
    fetchJobs();
    if (user && userRole === "candidate") {
      fetchAppliedJobs();
    }
  }, [filters, searchTerm, user, userRole, currentPage, itemsPerPage]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // Build base query for counting
      let countQuery = supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      if (searchTerm) {
        countQuery = countQuery.or(`title.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }

      if (filters.remoteOnly) {
        countQuery = countQuery.eq("remote_option", true);
      }

      if (filters.contractTypes.length > 0) {
        countQuery = countQuery.in("contract_type", filters.contractTypes as any);
      }

      if (filters.experienceLevels.length > 0) {
        countQuery = countQuery.in("experience_level", filters.experienceLevels as any);
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
        .order("created_at", { ascending: false })
        .range(from, to);

      if (searchTerm) {
        dataQuery = dataQuery.or(`title.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }

      if (filters.remoteOnly) {
        dataQuery = dataQuery.eq("remote_option", true);
      }

      if (filters.contractTypes.length > 0) {
        dataQuery = dataQuery.in("contract_type", filters.contractTypes as any);
      }

      if (filters.experienceLevels.length > 0) {
        dataQuery = dataQuery.in("experience_level", filters.experienceLevels as any);
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

  return (
    <MainLayout>
      <div className="px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Vagas Disponíveis</h1>
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por cargo ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
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
