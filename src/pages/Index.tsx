import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, Users, TrendingUp, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { RecentJobsByCity } from "@/components/RecentJobsByCity";

const Index = () => {
  return (
    <MainLayout>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 mt-0 pt-0">
        <div className="container px-4 py-16 md:py-28">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Encontre sua próxima{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                oportunidade
              </span>{" "}
              na Bahia
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground">
              Conectamos talentos baianos com as melhores empresas da região
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Cargo, palavra-chave ou empresa" 
                  className="pl-10 h-12"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Cidade ou região" 
                  className="pl-10 h-12"
                />
              </div>
              <Link to="/vagas">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8">
                  Buscar Vagas
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-3xl font-bold">1.000+</h3>
              <p className="text-muted-foreground">Vagas Ativas</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="p-3 bg-accent/10 rounded-full">
                  <Users className="h-8 w-8 text-accent" />
                </div>
              </div>
              <h3 className="text-3xl font-bold">500+</h3>
              <p className="text-muted-foreground">Empresas Parceiras</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-3xl font-bold">10.000+</h3>
              <p className="text-muted-foreground">Candidatos Ativos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Jobs by City */}
      <RecentJobsByCity />

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground space-y-4">
                <h3 className="text-2xl font-bold">Para Candidatos</h3>
                <p className="text-primary-foreground/90">
                  Cadastre-se gratuitamente e tenha acesso a milhares de oportunidades de emprego na Bahia
                </p>
                <Link to="/auth">
                  <Button variant="secondary" size="lg" className="w-full">
                    Criar Conta Grátis
                  </Button>
                </Link>
              </div>
              
              <div className="p-8 rounded-2xl bg-gradient-to-br from-accent to-accent/80 text-accent-foreground space-y-4">
                <h3 className="text-2xl font-bold">Para Empresas</h3>
                <p className="text-accent-foreground/90">
                  Encontre os melhores profissionais para sua equipe e publique vagas em minutos
                </p>
                <Link to="/empresas">
                  <Button variant="secondary" size="lg" className="w-full">
                    Anunciar Vagas
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Spacer for mobile ad banner */}
      <div className="h-24 xl:hidden" />
    </MainLayout>
  );
};

export default Index;
