import { useState } from "react";
import api, { ApiRequestError } from "@/services/api";
import { toast } from "sonner";

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  total_found?: number;
  city_searched?: string;
  skipped?: number;
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
      const data = await api.post<ImportResult>("/api/admin/jobs/import", {});

      if (!data.success) {
        throw new Error(data.error || "Falha na importação");
      }

      setQuotaExceeded(false);
      setLastResult({
        ...data,
        total_found: data.total_found ?? data.imported,
      });
      toast.success("Importação concluída!", {
        description: data.message,
      });

      return data;
    } catch (error: unknown) {
      if (error instanceof ApiRequestError && error.statusCode === 429) {
        const ed = error.errorData;
        if (ed.error === "QUOTA_EXCEEDED") {
          const desc =
            typeof ed.message === "string"
              ? ed.message
              : Array.isArray(ed.message)
                ? ed.message.join(", ")
                : "Limite de buscas atingido.";
          setQuotaExceeded(true);
          setLastResult({
            success: false,
            message: desc,
            imported: 0,
            total_found: 0,
            error: "QUOTA_EXCEEDED",
          });
          toast.error("Limite de API atingido", { description: desc });
          return {
            success: false,
            message: desc,
            imported: 0,
            total_found: 0,
            error: "QUOTA_EXCEEDED" as const,
          };
        }
      }
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
