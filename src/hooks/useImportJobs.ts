import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  total_found: number;
  city_searched?: string;
  error?: string;
}

export function useImportJobs() {
  const [isImporting, setIsImporting] = useState(false);
  const [lastResult, setLastResult] = useState<ImportResult | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const importJobs = async () => {
    setIsImporting(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("import-jobs", {
        body: {},
      });

      if (error) {
        throw new Error(error.message || "Erro ao importar vagas");
      }

      if (data?.error === 'QUOTA_EXCEEDED') {
        setQuotaExceeded(true);
        setLastResult(data);
        toast.error("Limite de API atingido", {
          description: data.message,
        });
        return data;
      }

      if (!data.success) {
        throw new Error(data.error || "Falha na importação");
      }

      setQuotaExceeded(false);
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
    quotaExceeded,
  };
}
