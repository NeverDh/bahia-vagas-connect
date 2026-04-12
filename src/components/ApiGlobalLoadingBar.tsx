import { useEffect, useState } from "react";
import { subscribeApiLoading } from "@/services/api-loading-bus";
import { cn } from "@/lib/utils";

/**
 * Barra no topo durante chamadas ao backend (`api.ts`).
 * Visível assim que há requisição em voo (sem atraso — login rápido em localhost ainda mostra feedback).
 */
export function ApiGlobalLoadingBar() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    return subscribeApiLoading((count) => {
      setActive(count > 0);
    });
  }, []);

  useEffect(() => {
    document.body.toggleAttribute("data-api-loading", active);
  }, [active]);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[100000] h-1 overflow-hidden shadow-sm transition-opacity duration-100",
        active ? "opacity-100" : "opacity-0",
      )}
      aria-busy={active}
      aria-label={active ? "Carregando" : undefined}
    >
      <div className="h-full w-full bg-muted/80">
        <div
          className={cn(
            "h-full w-2/5 rounded-r-md bg-primary shadow-[0_0_12px_hsl(var(--primary))]",
            active && "animate-api-bar-indeterminate",
          )}
        />
      </div>
    </div>
  );
}
