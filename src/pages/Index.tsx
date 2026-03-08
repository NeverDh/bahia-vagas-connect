import { useMemo, useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, Users, TrendingUp, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { RecentJobsByCity } from "@/components/RecentJobsByCity";
import { AdBanner } from "@/components/AdBanner";

const TYPEWRITER_WORDS = [
  "oportunidade",
  "vaga",
  "chance profissional",
  "posição",
  "colocação",
  "experiência profissional",
  "etapa profissional",
  "jornada profissional",
  "conquista profissional",
  "evolução profissional",
];

const TYPING_SPEED = 80;
const DELETING_SPEED = 50;
const PAUSE_AFTER_TYPING = 2000;
const PAUSE_AFTER_DELETING = 300;

function useTypewriter(words: string[]) {
  const [display, setDisplay] = useState(words[0]);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(words[0].length);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];

    if (!isDeleting && charIndex === currentWord.length) {
      // Pause after finishing typing
      const timeout = setTimeout(() => setIsDeleting(true), PAUSE_AFTER_TYPING);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && charIndex === 0) {
      // Move to next word after deleting
      const nextIndex = (wordIndex + 1) % words.length;
      setWordIndex(nextIndex);
      setIsDeleting(false);
      const timeout = setTimeout(() => {}, PAUSE_AFTER_DELETING);
      return () => clearTimeout(timeout);
    }

    const speed = isDeleting ? DELETING_SPEED : TYPING_SPEED;
    const timeout = setTimeout(() => {
      const newCharIndex = isDeleting ? charIndex - 1 : charIndex + 1;
      setCharIndex(newCharIndex);
      setDisplay(words[isDeleting ? wordIndex : wordIndex].slice(0, newCharIndex));
    }, speed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex, words]);

  return display;
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const navigate = useNavigate();
  const typedWord = useTypewriter(TYPEWRITER_WORDS);

  const searchUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    if (locationTerm.trim()) params.set("location", locationTerm.trim());
    return params.toString() ? `/vagas?${params.toString()}` : "/vagas";
  }, [searchTerm, locationTerm]);

  const handleSubmitSearch = () => {
    navigate(searchUrl);
  };

  return (
    <MainLayout>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 mt-0 pt-0">
        <div className="container px-4 py-16 md:py-28 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Encontre sua próxima{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {typedWord}
              </span>
              <span className="inline-block w-[3px] h-[0.9em] bg-primary align-middle ml-0.5 animate-[blink_1s_step-end_infinite]" />
              {" "}na Bahia
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground">
              Conectamos talentos baianos com as melhores empresas da região
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input 
                  placeholder="Cargo, palavra-chave ou empresa" 
                  className="pl-10 h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmitSearch();
                    }
                  }}
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input 
                  placeholder="Cidade ou região" 
                  className="pl-10 h-12"
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmitSearch();
                    }
                  }}
                />
              </div>
              <Button type="button" size="lg" className="w-full sm:w-auto h-12 px-8" onClick={handleSubmitSearch}>
                Buscar Vagas
              </Button>
            </div>

            <Link to="/vagas" className="mt-6 inline-block">
              <Button
                size="lg"
                className="group bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wide rounded-lg px-10 h-12 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                VEJA AGORA TODAS AS VAGAS
                <span className="inline-block ml-2 animate-bounce-x">→</span>
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Ad between hero and stats - all devices */}
      <div className="container px-4 py-4">
        <AdBanner variant="horizontal" slot="auto" className="max-w-4xl mx-auto" />
      </div>

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

      {/* Ad between jobs and CTA - visible on all devices */}
      <div className="container px-4 py-4">
        <AdBanner variant="horizontal" slot="auto" className="max-w-4xl mx-auto" />
      </div>

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
