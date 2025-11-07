import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import { JobFilters } from "@/components/JobFilters";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Jobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const [filters, setFilters] = useState({
    contractTypes: [] as string[],
    experienceLevels: [] as string[],
    remoteOnly: false
  });

  useEffect(() => {
    fetchJobs();
  }, [filters, searchTerm]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("jobs")
        .select(`
          *,
          companies (
            name,
            logo_url
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }

      if (filters.remoteOnly) {
        query = query.eq("remote_option", true);
      }

      if (filters.contractTypes.length > 0) {
        query = query.in("contract_type", filters.contractTypes as any);
      }

      if (filters.experienceLevels.length > 0) {
        query = query.in("experience_level", filters.experienceLevels as any);
      }

      const { data, error } = await query;

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8">
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
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
