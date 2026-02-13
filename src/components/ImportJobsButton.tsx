import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useImportJobs } from "@/hooks/useImportJobs";

interface ImportJobsButtonProps {
  onImportComplete?: () => void;
}

export function ImportJobsButton({ onImportComplete }: ImportJobsButtonProps) {
  const { importJobs, isImporting, lastResult, quotaExceeded } = useImportJobs();

  const handleImport = async () => {
    try {
      await importJobs();
      onImportComplete?.();
    } catch {
      // Error is already handled in the hook
    }
  };

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={handleImport}
      disabled={isImporting || quotaExceeded}
    >
      {isImporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Importando...
        </>
      ) : quotaExceeded ? (
        <>Limite de API atingido</>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Importar Vagas
        </>
      )}
    </Button>
  );
}
