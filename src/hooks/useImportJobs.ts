import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  total_found: number;
}

export function useImportJobs() {
  const [isImporting, setIsImporting] = useState(false);
  const [lastResult, setLastResult] = useState<ImportResult | null>(null);

  const importJobs = async (options?: { 
    searchQueries?: string[]; 
    maxJobs?: number;
  }) => {
    setIsImporting(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("import-jobs", {
        body: {
          searchQueries: options?.searchQueries || ["emprego", "vaga", "trabalho"],
          maxJobs: options?.maxJobs || 50,
        },
      });

      if (error) {
        throw new Error(error.message || "Erro ao importar vagas");
      }

      if (!data.success) {
        throw new Error(data.error || "Falha na importação");
      }

      setLastResult(data);
      toast.success("Importação concluída!", {
        description: data.message,
      });

      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro na importação", {
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importJobs,
    isImporting,
    lastResult,
  };
}
