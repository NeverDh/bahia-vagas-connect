import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, X, Plus } from "lucide-react";
import { useImportJobs } from "@/hooks/useImportJobs";

interface ImportJobsButtonProps {
  onImportComplete?: () => void;
}

export function ImportJobsButton({ onImportComplete }: ImportJobsButtonProps) {
  const { importJobs, isImporting, lastResult } = useImportJobs();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQueries, setSearchQueries] = useState<string[]>(["desenvolvedor", "vendedor", "auxiliar"]);
  const [newQuery, setNewQuery] = useState("");
  const [maxJobs, setMaxJobs] = useState(50);

  const handleAddQuery = () => {
    if (newQuery.trim() && !searchQueries.includes(newQuery.trim())) {
      setSearchQueries([...searchQueries, newQuery.trim()]);
      setNewQuery("");
    }
  };

  const handleRemoveQuery = (query: string) => {
    setSearchQueries(searchQueries.filter(q => q !== query));
  };

  const handleImport = async () => {
    try {
      await importJobs({ searchQueries, maxJobs });
      onImportComplete?.();
    } catch {
      // Error is already handled in the hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Importar Vagas da Bahia
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Vagas</DialogTitle>
          <DialogDescription>
            Importe vagas de APIs públicas para popular o banco de dados. As vagas serão filtradas para a Bahia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Termos de busca</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {searchQueries.map((query) => (
                <Badge key={query} variant="secondary" className="gap-1">
                  {query}
                  <button
                    onClick={() => handleRemoveQuery(query)}
                    className="ml-1 hover:text-destructive"
                    disabled={isImporting}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar termo..."
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddQuery()}
                disabled={isImporting}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddQuery}
                disabled={isImporting || !newQuery.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxJobs">Máximo de vagas</Label>
            <Input
              id="maxJobs"
              type="number"
              min={1}
              max={100}
              value={maxJobs}
              onChange={(e) => setMaxJobs(Number(e.target.value))}
              disabled={isImporting}
            />
          </div>

          {lastResult && (
            <div className="p-3 rounded-lg bg-muted text-sm">
              <p className="font-medium">Última importação:</p>
              <p className="text-muted-foreground">{lastResult.message}</p>
              <p className="text-muted-foreground">
                {lastResult.total_found} encontradas, {lastResult.imported} importadas
              </p>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleImport}
            disabled={isImporting || searchQueries.length === 0}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Iniciar Importação
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
