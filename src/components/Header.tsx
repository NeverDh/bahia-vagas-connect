import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Briefcase, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { user, userRole, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Bahia Vagas
          </span>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link to="/vagas">
            <Button variant="ghost">Vagas</Button>
          </Link>
          <Link to="/empresas">
            <Button variant="ghost">Para Empresas</Button>
          </Link>
          {user ? (
            <>
              {userRole === "candidate" && (
                <Link to="/perfil">
                  <Button variant="ghost">Meu Perfil</Button>
                </Link>
              )}
              <span className="text-sm text-muted-foreground hidden md:inline">
                {userRole === "candidate" ? "Candidato" : "Empresa"}
              </span>
              <Button variant="outline" className="gap-2" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" className="gap-2">
                <User className="h-4 w-4" />
                Entrar
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
