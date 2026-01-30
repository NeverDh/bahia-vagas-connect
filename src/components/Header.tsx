import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Briefcase, User, LogOut, Menu, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  const { user, userRole, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [open, setOpen] = useState(false);

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <Link to="/vagas" onClick={() => mobile && setOpen(false)}>
        <Button variant="ghost" className={mobile ? "w-full justify-start" : ""}>Vagas</Button>
      </Link>
      <Link to="/empresas" onClick={() => mobile && setOpen(false)}>
        <Button variant="ghost" className={mobile ? "w-full justify-start" : ""}>Para Empresas</Button>
      </Link>
      {user ? (
        <>
          {userRole === "candidate" && (
            <Link to="/perfil" onClick={() => mobile && setOpen(false)}>
              <Button variant="ghost" className={mobile ? "w-full justify-start" : ""}>Meu Perfil</Button>
            </Link>
          )}
          {userRole === "company" && (
            <Link to="/empresa/dashboard" onClick={() => mobile && setOpen(false)}>
              <Button variant="ghost" className={mobile ? "w-full justify-start" : ""}>Painel da Empresa</Button>
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={() => mobile && setOpen(false)}>
              <Button variant="ghost" className={mobile ? "w-full justify-start gap-2" : "gap-2"}>
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
          {mobile && (
            <span className="text-sm text-muted-foreground px-4 py-2">
              {userRole === "candidate" ? "Candidato" : "Empresa"}
            </span>
          )}
          <Button 
            variant="outline" 
            className={mobile ? "w-full justify-start gap-2" : "gap-2"} 
            onClick={() => {
              signOut();
              mobile && setOpen(false);
            }}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </>
      ) : (
        <Link to="/auth" onClick={() => mobile && setOpen(false)}>
          <Button variant="default" className={mobile ? "w-full gap-2" : "gap-2"}>
            <User className="h-4 w-4" />
            Entrar
          </Button>
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Bahia Vagas
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <NavItems />
          {user && (
            <span className="text-sm text-muted-foreground">
              {userRole === "candidate" ? "Candidato" : "Empresa"}
            </span>
          )}
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] pt-12">
            <nav className="flex flex-col gap-2">
              <NavItems mobile />
              <div className="flex items-center gap-2 px-4 pt-4 border-t mt-4">
                <span className="text-sm text-muted-foreground">Tema:</span>
                <ThemeToggle />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
