import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X, ChevronDown, ChevronUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const COOKIE_KEY = "bahia-vagas-cookie-consent";

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      // Small delay to avoid flashing on initial load
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_KEY, "all");
    setVisible(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem(COOKIE_KEY, "necessary");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_KEY, "rejected");
    setVisible(false);
    navigate("/cookies-necessarios", { replace: true });
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4">
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 p-4 pb-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Cookie className="h-4 w-4 text-primary" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm md:text-base">
              Sua privacidade importa para nós 🍪
            </h3>
            <p className="text-muted-foreground text-xs md:text-sm mt-1 leading-relaxed">
              Usamos cookies para melhorar sua experiência, exibir anúncios relevantes e analisar o
              tráfego do site. Ao continuar navegando, você concorda com nossa{" "}
              <Link
                to="/privacidade"
                className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
              >
                Política de Privacidade
              </Link>
              .
            </p>

            {/* Expandable details */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
            >
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              {expanded ? "Menos detalhes" : "Mais detalhes sobre os cookies"}
            </button>

            {expanded && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-muted/50 rounded-lg p-2.5">
                  <p className="font-medium text-foreground mb-1">🔒 Necessários</p>
                  <p className="text-muted-foreground">
                    Essenciais para o funcionamento do site. Não podem ser desativados.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2.5">
                  <p className="font-medium text-foreground mb-1">📊 Analíticos</p>
                  <p className="text-muted-foreground">
                    Ajudam a entender como os visitantes interagem com o site.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2.5">
                  <p className="font-medium text-foreground mb-1">📢 Publicidade</p>
                  <p className="text-muted-foreground">
                    Google AdSense para exibir anúncios relevantes ao seu perfil.
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleReject}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar e rejeitar cookies"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-4 pb-4 pt-1">
          <Button
            onClick={handleReject}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground text-xs order-3 sm:order-1"
          >
            Rejeitar todos
          </Button>
          <Button
            onClick={handleAcceptNecessary}
            variant="outline"
            size="sm"
            className="text-xs order-2"
          >
            Somente necessários
          </Button>
          <Button
            onClick={handleAcceptAll}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs order-1 sm:order-3"
          >
            Aceitar todos
          </Button>
        </div>
      </div>
    </div>
  );
};
