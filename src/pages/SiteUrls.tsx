import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Search, Globe, MapPin, Building2, FileText } from "lucide-react";
import { bahiaMunicipios } from "@/lib/bahia-municipios";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

interface SiteUrl {
  path: string;
  label: string;
  category: "principal" | "municipio" | "institucional";
}

const SiteUrls = () => {
  const [search, setSearch] = useState("");

  const allUrls = useMemo<SiteUrl[]>(() => {
    const urls: SiteUrl[] = [
      { path: "/", label: "Página Inicial", category: "principal" },
      { path: "/vagas", label: "Vagas de Emprego", category: "principal" },
      { path: "/empresas", label: "Empresas", category: "principal" },
      { path: "/auth", label: "Login / Cadastro", category: "principal" },
      { path: "/privacidade", label: "Política de Privacidade", category: "institucional" },
      { path: "/urls", label: "Mapa do Site", category: "institucional" },
    ];

    Object.entries(bahiaMunicipios).forEach(([slug, name]) => {
      urls.push({
        path: `/vagas-${slug}`,
        label: `Vagas em ${name}`,
        category: "municipio",
      });
    });

    return urls;
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return allUrls;
    const q = search.toLowerCase();
    return allUrls.filter(
      (u) =>
        u.label.toLowerCase().includes(q) ||
        u.path.toLowerCase().includes(q)
    );
  }, [search, allUrls]);

  const grouped = useMemo(() => ({
    principal: filtered.filter((u) => u.category === "principal"),
    institucional: filtered.filter((u) => u.category === "institucional"),
    municipio: filtered.filter((u) => u.category === "municipio"),
  }), [filtered]);

  const categoryIcon = {
    principal: <Globe className="h-5 w-5" />,
    institucional: <FileText className="h-5 w-5" />,
    municipio: <MapPin className="h-5 w-5" />,
  };

  const categoryLabel = {
    principal: "Páginas Principais",
    institucional: "Institucional",
    municipio: `Municípios da Bahia (${grouped.municipio.length})`,
  };

  return (
    <MainLayout>
      <main className="px-4 py-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mapa do Site
          </h1>
          <p className="text-muted-foreground">
            Todas as {allUrls.length} URLs disponíveis no BahiaVagas
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar URL ou nome da página..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-6">
          {(["principal", "institucional", "municipio"] as const).map((cat) => {
            const items = grouped[cat];
            if (items.length === 0) return null;
            return (
              <Card key={cat}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {categoryIcon[cat]}
                    {categoryLabel[cat]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cat === "municipio" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2" : "space-y-2"}>
                    {items.map((url) => (
                      <Link
                        key={url.path}
                        to={url.path}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors group text-sm"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                        <span className="text-foreground group-hover:text-primary truncate">
                          {url.label}
                        </span>
                        <span className="text-muted-foreground text-xs truncate ml-auto hidden sm:inline">
                          {url.path}
                        </span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma URL encontrada para "{search}"
          </div>
        )}

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Total: {filtered.length} de {allUrls.length} URLs
        </div>

        <div className="h-24 xl:hidden" />
      </main>
    </MainLayout>
  );
};

export default SiteUrls;
