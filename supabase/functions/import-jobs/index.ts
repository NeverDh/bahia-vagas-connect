import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdzunaJob {
  id: string;
  title: string;
  description?: string;
  created?: string;
  redirect_url?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  contract_type?: string;
  contract_time?: string;
  location?: {
    display_name?: string;
    area?: string[];
  };
  company?: {
    display_name?: string;
  };
}

interface AdzunaResponse {
  count?: number;
  results?: AdzunaJob[];
}

function isBahiaJob(job: AdzunaJob): boolean {
  const area = job.location?.area ?? [];
  return area.some((part) => (part || "").toLowerCase() === "bahia");
}

function mapContractType(job: AdzunaJob): string {
  const title = (job.title || "").toLowerCase();
  const desc = (job.description || "").toLowerCase();
  const text = `${title} ${desc}`;

  if (/est[áa]gi/.test(text) || /\bintern/.test(text)) return "intern";
  if (/freelanc/.test(text)) return "freelance";

  switch ((job.contract_type || "").toLowerCase()) {
    case "permanent":
      return "clt";
    case "contract":
      return "pj";
    case "temporary":
      return "temporary";
    default:
      return "clt";
  }
}

function mapExperienceLevel(title: string): string {
  const t = title.toLowerCase();
  if (/est[áa]gi|trainee|aprendiz/.test(t)) return "intern";
  if (/\bj[úu]nior|\bjr\b|\bi\b/.test(t)) return "junior";
  if (/\bs[êe]nior|\bsr\b|\biii\b/.test(t)) return "senior";
  if (/especialista|specialist|principal|lead|coordenador|gerente|manager/.test(t)) return "specialist";
  if (/\bpleno|\bpl\b|\bii\b|mid/.test(t)) return "mid";
  return "mid";
}

function isRemote(job: AdzunaJob): boolean {
  const text = `${job.title || ""} ${job.description || ""}`.toLowerCase();
  return /remoto|remote|home\s*office|tele\s*trabalho/.test(text);
}

function extractCategory(title: string): string {
  const categories: Record<string, string[]> = {
    Tecnologia: ["desenvolvedor", "developer", "programador", "software", "tech", " ti ", "dados", "data", "analista de sistemas", "devops", "frontend", "backend", "fullstack", "qa"],
    Vendas: ["vendedor", "vendas", "sales", "comercial", "representante"],
    Marketing: ["marketing", "social media", "publicidade", "designer", "criativo"],
    "Administração": ["administrativo", "administração", "secretária", "recepcionista", "assistente"],
    "Recursos Humanos": ["rh ", "recursos humanos", "recrutador", "seleção"],
    Financeiro: ["financeiro", "contábil", "contador", "fiscal", "tesouraria"],
    "Saúde": ["enfermeiro", "médico", "farmacêutico", "técnico de enfermagem", "saúde"],
    "Logística": ["logística", "motorista", "entregador", "estoquista", "almoxarife"],
    "Construção": ["engenheiro", "arquiteto", "construção", "obra", "pedreiro"],
    Atendimento: ["atendimento", "suporte", "telemarketing", "call center", "sac"],
  };

  const lower = ` ${title.toLowerCase()} `;
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((k) => lower.includes(k))) return category;
  }
  return "Outros";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ADZUNA_APP_ID = Deno.env.get("ADZUNA_APP_ID");
    const ADZUNA_APP_KEY = Deno.env.get("ADZUNA_APP_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const MAX_DAYS_OLD = Deno.env.get("ADZUNA_MAX_DAYS_OLD") || "30";

    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
      throw new Error("ADZUNA_APP_ID/ADZUNA_APP_KEY não configurados");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Variáveis do Supabase não configuradas");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const params = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
      what: "vagas",
      where: "Bahia",
      results_per_page: "50",
      max_days_old: MAX_DAYS_OLD,
      sort_by: "date",
    });

    const url = `https://api.adzuna.com/v1/api/jobs/br/search/1?${params.toString()}`;
    console.log("Buscando vagas na Adzuna (where=Bahia, 50 mais recentes)");

    const response = await fetch(url, { headers: { Accept: "application/json" } });

    if (!response.ok) {
      const status = response.status;
      console.error(`Adzuna respondeu ${status}: ${response.statusText}`);

      if (status === 429 || status === 403) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "QUOTA_EXCEEDED",
            message: "Limite de buscas da Adzuna atingido. Aguarde a renovação do plano mensal.",
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (status === 401) {
        throw new Error("Credenciais Adzuna inválidas (401)");
      }

      throw new Error(`Adzuna retornou status ${status}`);
    }

    const data = (await response.json()) as AdzunaResponse;
    const allResults = data.results ?? [];
    const bahiaJobs = allResults.filter(isBahiaJob);

    console.log(`Adzuna retornou ${allResults.length} vagas, ${bahiaJobs.length} são da Bahia`);

    // Empresa padrão
    let { data: defaultCompany } = await supabase
      .from("companies")
      .select("id")
      .eq("name", "Vagas Importadas")
      .maybeSingle();

    if (!defaultCompany) {
      const { data: newCompany, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: "Vagas Importadas",
          description: "Vagas importadas automaticamente de APIs externas",
          location: "Bahia, Brasil",
          is_verified: false,
        })
        .select("id")
        .single();

      if (companyError) {
        throw new Error(`Falha ao criar empresa padrão: ${companyError.message}`);
      }
      defaultCompany = newCompany;
    }

    const jobsToInsert = bahiaJobs.map((job) => {
      const location = job.location?.display_name || "Bahia, Brasil";
      const companyName = job.company?.display_name || "Empresa não informada";
      const description =
        job.description && job.description.trim().length > 0
          ? job.description
          : `Vaga publicada por ${companyName}.`;

      return {
        title: job.title,
        description,
        location,
        company_id: defaultCompany!.id,
        contract_type: mapContractType(job),
        experience_level: mapExperienceLevel(job.title || ""),
        remote_option: isRemote(job),
        category: extractCategory(job.title || ""),
        salary_min: job.salary_min ?? null,
        salary_max: job.salary_max ?? null,
        status: "active",
        external_url: job.redirect_url ?? null,
      };
    });

    if (jobsToInsert.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Nenhuma vaga da Bahia encontrada nas 50 mais recentes",
          imported: 0,
          skipped: 0,
          total_found: allResults.length,
          region_searched: "Bahia",
          api_requests: 1,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Deduplicação por external_url
    const externalUrls = jobsToInsert
      .map((j) => j.external_url)
      .filter((u): u is string => !!u);

    const existingUrls = new Set<string>();
    if (externalUrls.length > 0) {
      const { data: existing } = await supabase
        .from("jobs")
        .select("external_url")
        .in("external_url", externalUrls);
      for (const row of existing || []) {
        if (row.external_url) existingUrls.add(row.external_url);
      }
    }

    // Deduplicação por title + location (apenas vagas ativas recentes)
    const { data: existingTitles } = await supabase
      .from("jobs")
      .select("title, location")
      .eq("status", "active");

    const existingTitleLocations = new Set(
      (existingTitles || []).map((j: { title: string; location: string }) => `${j.title}|${j.location}`),
    );

    const newJobs = jobsToInsert.filter((job) => {
      if (job.external_url && existingUrls.has(job.external_url)) return false;
      if (existingTitleLocations.has(`${job.title}|${job.location}`)) return false;
      return true;
    });

    const skipped = jobsToInsert.length - newJobs.length;

    if (newJobs.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Nenhuma vaga nova na Bahia (${skipped} já existiam)`,
          imported: 0,
          skipped,
          total_found: jobsToInsert.length,
          region_searched: "Bahia",
          api_requests: 1,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("jobs")
      .insert(newJobs)
      .select("id");

    if (insertError) {
      throw new Error(`Falha ao inserir vagas: ${insertError.message}`);
    }

    const importedCount = inserted?.length ?? 0;
    console.log(`Importadas ${importedCount} vagas novas (${skipped} ignoradas)`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${importedCount} vagas novas importadas da Bahia (das ${jobsToInsert.length} mais recentes, ${skipped} já existiam)`,
        imported: importedCount,
        skipped,
        total_found: jobsToInsert.length,
        region_searched: "Bahia",
        city_searched: "Bahia",
        api_requests: 1,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("Erro na importação Adzuna:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
