import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  job_description: string;
  job_city: string;
  job_state: string;
  job_employment_type: string;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_required_experience?: {
    required_experience_in_months?: number;
  };
  job_is_remote: boolean;
  job_posted_at_datetime_utc: string;
  job_apply_link?: string;
}

// Map JSearch employment type to our contract_type enum
function mapContractType(employmentType: string): string {
  const typeMap: Record<string, string> = {
    'FULLTIME': 'clt',
    'PARTTIME': 'pj',
    'CONTRACTOR': 'pj',
    'TEMPORARY': 'temporary',
    'INTERN': 'intern',
    'FREELANCE': 'freelance',
  };
  return typeMap[employmentType?.toUpperCase()] || 'clt';
}

// Map experience to our experience_level enum
function mapExperienceLevel(experienceMonths: number | undefined): string {
  if (!experienceMonths || experienceMonths < 6) return 'intern';
  if (experienceMonths < 24) return 'junior';
  if (experienceMonths < 48) return 'mid';
  if (experienceMonths < 84) return 'senior';
  return 'specialist';
}

// Extract category from job title
function extractCategory(title: string): string {
  const categories: Record<string, string[]> = {
    'Tecnologia': ['desenvolvedor', 'developer', 'programador', 'software', 'tech', 'ti', 'dados', 'data', 'analista de sistemas', 'devops', 'frontend', 'backend', 'fullstack'],
    'Vendas': ['vendedor', 'vendas', 'sales', 'comercial', 'representante'],
    'Marketing': ['marketing', 'social media', 'publicidade', 'designer', 'criativo'],
    'Administração': ['administrativo', 'administração', 'secretária', 'recepcionista', 'assistente'],
    'Recursos Humanos': ['rh', 'recursos humanos', 'recrutador', 'seleção'],
    'Financeiro': ['financeiro', 'contábil', 'contador', 'fiscal', 'tesouraria'],
    'Saúde': ['enfermeiro', 'médico', 'farmacêutico', 'técnico de enfermagem', 'saúde'],
    'Logística': ['logística', 'motorista', 'entregador', 'estoquista', 'almoxarife'],
    'Construção': ['engenheiro', 'arquiteto', 'construção', 'obra', 'pedreiro'],
    'Atendimento': ['atendimento', 'suporte', 'telemarketing', 'call center', 'sac'],
  };

  const lowerTitle = title.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerTitle.includes(keyword))) {
      return category;
    }
  }
  return 'Outros';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY não configurada');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variáveis do Supabase não configuradas');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request body for options
    let searchQueries = ['emprego', 'vaga', 'trabalho'];
    let maxJobs = 50;
    
    try {
      const body = await req.json();
      if (body.searchQueries) searchQueries = body.searchQueries;
      if (body.maxJobs) maxJobs = body.maxJobs;
    } catch {
      // Use defaults if no body
    }

    console.log(`Buscando vagas na Bahia com queries: ${searchQueries.join(', ')}`);

    // Get or create a default company for imported jobs
    let { data: defaultCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('name', 'Vagas Importadas')
      .maybeSingle();

    if (!defaultCompany) {
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: 'Vagas Importadas',
          description: 'Vagas importadas automaticamente de APIs externas',
          location: 'Bahia, Brasil',
          is_verified: false,
        })
        .select('id')
        .single();

      if (companyError) {
        console.error('Erro ao criar empresa padrão:', companyError);
        throw new Error('Falha ao criar empresa padrão para vagas importadas');
      }
      defaultCompany = newCompany;
    }

    const allJobs: any[] = [];
    const bahiaCities = ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna', 'Juazeiro', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas'];

    // Search for jobs in Bahia cities
    for (const query of searchQueries) {
      for (const city of bahiaCities.slice(0, 3)) { // Limit to top 3 cities to avoid rate limits
        try {
          const searchUrl = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query + ' ' + city + ' Bahia Brasil')}&page=1&num_pages=1&country=br`;
          
          console.log(`Buscando: ${query} em ${city}`);
          
          const response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
            },
          });

          if (!response.ok) {
            console.error(`Erro na API JSearch: ${response.status} - ${response.statusText}`);
            continue;
          }

          const data = await response.json();
          
          if (data.data && Array.isArray(data.data)) {
            // Filter to ensure jobs are in Bahia
            const bahiaJobs = data.data.filter((job: JSearchJob) => {
              const state = job.job_state?.toLowerCase() || '';
              const city = job.job_city?.toLowerCase() || '';
              return state.includes('bahia') || state === 'ba' || 
                     bahiaCities.some(c => city.includes(c.toLowerCase()));
            });
            
            allJobs.push(...bahiaJobs);
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Erro ao buscar ${query} em ${city}:`, error);
        }
      }

      if (allJobs.length >= maxJobs) break;
    }

    console.log(`Total de vagas encontradas: ${allJobs.length}`);

    // Remove duplicates by job_id
    const uniqueJobs = allJobs.reduce((acc: JSearchJob[], job: JSearchJob) => {
      if (!acc.find(j => j.job_id === job.job_id)) {
        acc.push(job);
      }
      return acc;
    }, []);

    // Transform jobs
    const jobsToInsert = uniqueJobs.slice(0, maxJobs).map((job: JSearchJob) => ({
      title: job.job_title,
      description: job.job_description || 'Descrição não disponível',
      location: `${job.job_city || 'Salvador'}, ${job.job_state || 'Bahia'}`,
      company_id: defaultCompany.id,
      contract_type: mapContractType(job.job_employment_type),
      experience_level: mapExperienceLevel(job.job_required_experience?.required_experience_in_months),
      remote_option: job.job_is_remote || false,
      category: extractCategory(job.job_title),
      salary_min: job.job_min_salary || null,
      salary_max: job.job_max_salary || null,
      status: 'active',
      external_url: job.job_apply_link || null,
    }));

    if (jobsToInsert.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhuma vaga encontrada na Bahia',
          imported: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get existing jobs by external_url to avoid duplicates
    const externalUrls: string[] = jobsToInsert
      .map((j: { external_url: string | null }) => j.external_url)
      .filter((url: string | null): url is string => url !== null);

    let existingUrls: Set<string> = new Set();
    
    if (externalUrls.length > 0) {
      const { data: existingJobs } = await supabase
        .from('jobs')
        .select('external_url')
        .in('external_url', externalUrls);
      
      if (existingJobs) {
        existingUrls = new Set(
          existingJobs
            .map((j: { external_url: string | null }) => j.external_url)
            .filter((url: string | null): url is string => url !== null)
        );
      }
    }

    // Also check by title + location to catch duplicates without external_url
    const { data: existingByTitle } = await supabase
      .from('jobs')
      .select('title, location');

    const existingTitleLocations = new Set(
      (existingByTitle || []).map((j: { title: string; location: string }) => `${j.title}|${j.location}`)
    );

    // Filter out jobs that already exist
    const newJobs = jobsToInsert.filter((job: { external_url: string | null; title: string; location: string }) => {
      // Skip if external_url already exists
      if (job.external_url && existingUrls.has(job.external_url)) {
        console.log(`Vaga duplicada (URL): ${job.title}`);
        return false;
      }
      // Skip if title + location already exists
      if (existingTitleLocations.has(`${job.title}|${job.location}`)) {
        console.log(`Vaga duplicada (título/local): ${job.title}`);
        return false;
      }
      return true;
    });

    const skippedCount = jobsToInsert.length - newJobs.length;
    console.log(`Vagas ignoradas (já existem): ${skippedCount}`);

    if (newJobs.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Nenhuma vaga nova para importar (${skippedCount} já existiam)`,
          imported: 0,
          skipped: skippedCount
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: insertedJobs, error: insertError } = await supabase
      .from('jobs')
      .insert(newJobs)
      .select('id');

    if (insertError) {
      console.error('Erro ao inserir vagas:', insertError);
      throw new Error(`Falha ao inserir vagas: ${insertError.message}`);
    }

    console.log(`Vagas inseridas com sucesso: ${insertedJobs?.length || 0}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${insertedJobs?.length || 0} vagas importadas com sucesso${skippedCount > 0 ? ` (${skippedCount} ignoradas por já existirem)` : ''}`,
        imported: insertedJobs?.length || 0,
        skipped: skippedCount,
        total_found: uniqueJobs.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Erro na importação:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
