import { Button } from "@/components/ui/button";
import { Cookie, Frown, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const COOKIE_KEY = "bahia-vagas-cookie-consent";

const CookiesNecessarios = () => {
  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_KEY, "all");
    window.location.href = "/";
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem(COOKIE_KEY, "necessary");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <Cookie className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <Frown className="h-5 w-5 text-destructive" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Infelizmente, não podemos continuar 😔
        </h1>

        <p className="text-muted-foreground mb-2 leading-relaxed">
          Para navegar no <strong className="text-foreground">Bahia Vagas</strong>, precisamos do seu
          consentimento para uso de cookies. Eles são essenciais para o funcionamento do site,
          personalização e exibição de anúncios que mantêm nossa plataforma gratuita.
        </p>

        <p className="text-sm text-muted-foreground mb-8">
          Sem aceitar os cookies, não é possível acessar as vagas, criar conta ou usar qualquer
          funcionalidade do site.
        </p>

        {/* What cookies do */}
        <div className="bg-muted/50 rounded-xl p-4 mb-8 text-left space-y-3">
          <p className="text-sm font-semibold text-foreground mb-2">O que os cookies fazem por você:</p>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Mantêm sua sessão ativa enquanto você navega</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Permitem salvar suas preferências e candidaturas</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Exibem anúncios que financiam o site gratuitamente</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleAcceptNecessary}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5"
          >
            Aceitar somente necessários
          </Button>
          <Button
            onClick={handleAcceptAll}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Cookie className="h-4 w-4" />
            Aceitar todos os cookies
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Saiba mais em nossa{" "}
          <Link to="/privacidade" className="text-primary underline underline-offset-2 hover:text-primary/80">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default CookiesNecessarios;
