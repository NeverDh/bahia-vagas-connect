import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, TrendingUp, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

const Companies = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Encontre os Melhores Talentos da Bahia
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Publique suas vagas e conecte-se com milhares de profissionais qualificados
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              <Building2 className="h-5 w-5" />
              Criar Conta Empresarial
            </Button>
          </Link>
        </section>

        {/* Benefits Section */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Acesso a Talentos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Milhares de candidatos qualificados procurando oportunidades na Bahia
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Visibilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Suas vagas ganham destaque para o público certo
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Briefcase className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Gestão Simples</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Painel intuitivo para gerenciar vagas e candidaturas
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Building2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Fortalecimento Regional</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Contribua para o desenvolvimento econômico da Bahia
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        {/* How it Works Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Como Funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Crie sua Conta</h3>
              <p className="text-muted-foreground">
                Cadastre sua empresa e complete o perfil
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Publique Vagas</h3>
              <p className="text-muted-foreground">
                Descreva as oportunidades e requisitos
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Receba Candidaturas</h3>
              <p className="text-muted-foreground">
                Analise perfis e selecione os melhores candidatos
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary to-accent rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para Contratar os Melhores Talentos?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Comece hoje mesmo e fortaleça sua equipe
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="gap-2">
              <Building2 className="h-5 w-5" />
              Começar Agora
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Companies;
