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

function mapExperienceLevel(experienceMonths: number | undefined): string {
  if (!experienceMonths || experienceMonths < 6) return 'intern';
  if (experienceMonths < 24) return 'junior';
  if (experienceMonths < 48) return 'mid';
  if (experienceMonths < 84) return 'senior';
  return 'specialist';
}

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

// All municipalities/cities of Bahia
const bahiaCities = [
  'Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna',
  'Juazeiro', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas',
  'Alagoinhas', 'Barreiras', 'Porto Seguro', 'Simões Filho', 'Paulo Afonso',
  'Eunápolis', 'Santo Antônio de Jesus', 'Valença', 'Candeias', 'Guanambi',
  'Jacobina', 'Serrinha', 'Senhor do Bonfim', 'Dias d\'Ávila', 'Campo Formoso',
  'Luís Eduardo Magalhães', 'Cruz das Almas', 'Brumado', 'Irecê', 'Itapetinga',
  'Conceição do Coité', 'Mucuri', 'Santo Amaro', 'Itamaraju', 'Ribeira do Pombal',
  'Bom Jesus da Lapa', 'Casa Nova', 'Madre de Deus', 'Catu', 'Tucano',
  'Euclides da Cunha', 'Ipiaú', 'Itaberaba', 'Mata de São João', 'Cachoeira',
  'São Sebastião do Passé', 'Conceição do Jacuípe', 'Entre Rios', 'Vera Cruz',
  'Amélia Rodrigues'
];

serve(async (req) => {
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

    // Pick a random city for this execution to spread across all cities over time
    const cityIndex = Math.floor(Math.random() * bahiaCities.length);
    const city = bahiaCities[cityIndex];

    console.log(`Buscando vagas em: ${city}, Bahia`);

    const allJobs: JSearchJob[] = [];

    try {
      const searchUrl = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent('vagas ' + city + ' Bahia Brasil')}&page=1&num_pages=3&country=br`;
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
      });

      if (!response.ok) {
        const statusCode = response.status;
        const statusText = response.statusText;
        console.error(`Erro na API JSearch: ${statusCode} - ${statusText}`);
        
        // Check for quota exceeded (429 or 403)
        if (statusCode === 429 || statusCode === 403) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'QUOTA_EXCEEDED',
              message: 'Limite de buscas da API atingido. Aguarde até o próximo ciclo de renovação do plano (mensal).'
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`API retornou status ${statusCode}`);
      }

      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        // Filter to ensure jobs are in Bahia
        const bahiaJobs = data.data.filter((job: JSearchJob) => {
          const state = job.job_state?.toLowerCase() || '';
          const jobCity = job.job_city?.toLowerCase() || '';
          return state.includes('bahia') || state === 'ba' || 
                 bahiaCities.some(c => jobCity.includes(c.toLowerCase()));
        });
        
        allJobs.push(...bahiaJobs);
      }
    } catch (error) {
      console.error(`Erro ao buscar vagas em ${city}:`, error);
      throw error;
    }

    console.log(`Total de vagas encontradas: ${allJobs.length}`);

    // Remove duplicates by job_id
    const uniqueJobs = allJobs.reduce((acc: JSearchJob[], job: JSearchJob) => {
      if (!acc.find(j => j.job_id === job.job_id)) {
        acc.push(job);
      }
      return acc;
    }, []);

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

    // Transform ALL jobs (no limit)
    const jobsToInsert = uniqueJobs.map((job: JSearchJob) => ({
      title: job.job_title,
      description: job.job_description || 'Descrição não disponível',
      location: `${job.job_city || city}, ${job.job_state || 'Bahia'}`,
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
          message: `Nenhuma vaga encontrada em ${city}`,
          imported: 0,
          city_searched: city,
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

    // Also check by title + location
    const { data: existingByTitle } = await supabase
      .from('jobs')
      .select('title, location');

    const existingTitleLocations = new Set(
      (existingByTitle || []).map((j: { title: string; location: string }) => `${j.title}|${j.location}`)
    );

    const newJobs = jobsToInsert.filter((job: { external_url: string | null; title: string; location: string }) => {
      if (job.external_url && existingUrls.has(job.external_url)) return false;
      if (existingTitleLocations.has(`${job.title}|${job.location}`)) return false;
      return true;
    });

    const skippedCount = jobsToInsert.length - newJobs.length;

    if (newJobs.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Nenhuma vaga nova em ${city} (${skippedCount} já existiam)`,
          imported: 0,
          skipped: skippedCount,
          city_searched: city,
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
        message: `${insertedJobs?.length || 0} vagas importadas de ${city}${skippedCount > 0 ? ` (${skippedCount} ignoradas)` : ''}`,
        imported: insertedJobs?.length || 0,
        skipped: skippedCount,
        total_found: uniqueJobs.length,
        city_searched: city,
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
