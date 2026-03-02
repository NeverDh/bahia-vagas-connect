import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Set noindex for 404 pages
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");
    document.title = "Página não encontrada | Bahia Vagas";

    return () => {
      if (robots) robots.remove();
    };
  }, [location.pathname]);

  return (
    <MainLayout>
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <p className="text-xl text-muted-foreground">
            Página não encontrada
          </p>
          <p className="text-muted-foreground max-w-md mx-auto">
            A página que você procura não existe ou foi removida. Confira nossas vagas disponíveis.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                Página Inicial
              </Button>
            </Link>
            <Link to="/vagas">
              <Button variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                Ver Vagas
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </MainLayout>
  );
};

export default NotFound;
