import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { User, LogOut, Menu, Shield } from "lucide-react";
import logo from "@/assets/logo.png";
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
        <Button variant="ghost" className={`text-white hover:text-white/80 hover:bg-primary/80 ${mobile ? "w-full justify-start text-orange-500 hover:text-orange-600 hover:bg-orange-50" : ""}`}>Vagas</Button>
      </Link>
      <Link to="/blog" onClick={() => mobile && setOpen(false)}>
        <Button variant="ghost" className={`text-white hover:text-white/80 hover:bg-primary/80 ${mobile ? "w-full justify-start text-orange-500 hover:text-orange-600 hover:bg-orange-50" : ""}`}>Blog</Button>
      </Link>
      <Link to="/empresas" onClick={() => mobile && setOpen(false)}>
        <Button variant="ghost" className={`text-white hover:text-white/80 hover:bg-primary/80 ${mobile ? "w-full justify-start text-orange-500 hover:text-orange-600 hover:bg-orange-50" : ""}`}>Para Empresas</Button>
      </Link>
      {user ? (
        <>
          {userRole === "candidate" && (
            <Link to="/perfil" onClick={() => mobile && setOpen(false)}>
              <Button variant="ghost" className={`text-orange-500 hover:text-orange-600 hover:bg-orange-50 ${mobile ? "w-full justify-start" : ""}`}>Meu Perfil</Button>
            </Link>
          )}
          {userRole === "company" && (
            <Link to="/empresa/dashboard" onClick={() => mobile && setOpen(false)}>
              <Button variant="ghost" className={`text-orange-500 hover:text-orange-600 hover:bg-orange-50 ${mobile ? "w-full justify-start" : ""}`}>Painel da Empresa</Button>
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={() => mobile && setOpen(false)}>
              <Button variant="ghost" className={`text-orange-500 hover:text-orange-600 hover:bg-orange-50 ${mobile ? "w-full justify-start gap-2" : "gap-2"}`}>
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
          {mobile && (
            <span className="text-sm text-orange-500 px-4 py-2">
              {userRole === "candidate" ? "Candidato" : "Empresa"}
            </span>
          )}
          <Button 
            variant="outline" 
            className={`border-orange-500 text-orange-500 hover:bg-orange-50 ${mobile ? "w-full justify-start gap-2" : "gap-2"}`} 
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
          <Button className={`bg-orange-500 hover:bg-orange-600 text-white ${mobile ? "w-full gap-2" : "gap-2"}`}>
            <User className="h-4 w-4" />
            Entrar
          </Button>
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border flex">
      {/* Left white area extending to the edge */}
      <div className="bg-background flex items-center h-16 pr-[10px] pl-4 md:pl-6">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Bahia Vagas" className="h-[120px]" />
        </Link>
      </div>
      
      {/* Right blue area */}
      <div className="bg-primary flex-1 flex items-center justify-end h-16 px-4 md:px-6">
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <NavItems />
          {user && (
            <span className="text-sm text-orange-500">
              {userRole === "candidate" ? "Candidato" : "Empresa"}
            </span>
          )}
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-white hover:bg-primary/80">
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
