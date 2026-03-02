import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border mt-12">
      <div className="bg-primary px-4 py-12 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Links Úteis */}
              <div>
                <h4 className="font-bold mb-4 text-orange-400">Links Úteis</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/vagas" className="text-white/80 hover:text-white transition-colors">
                      Buscar Vagas
                    </Link>
                  </li>
                  <li>
                    <Link to="/empresas" className="text-white/80 hover:text-white transition-colors">
                      Empresas
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Para Empresas */}
              <div>
                <h4 className="font-bold mb-4 text-orange-400">Para Empresas</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/auth" className="text-white/80 hover:text-white transition-colors">
                      Anunciar Vagas
                    </Link>
                  </li>
                  <li>
                    <Link to="/empresas" className="text-white/80 hover:text-white transition-colors">
                      Soluções para Empresas
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contato */}
              <div>
                <h4 className="font-bold mb-4 text-orange-400">Contato</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2 text-white/80">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-orange-400" />
                    <span>Av. Tancredo Neves, 1632 - Salvador, BA</span>
                  </li>
                  <li className="flex items-center gap-2 text-white/80">
                    <Phone className="h-4 w-4 flex-shrink-0 text-orange-400" />
                    <span>(71) 3333-4444</span>
                  </li>
                  <li className="flex items-center gap-2 text-white/80">
                    <Mail className="h-4 w-4 flex-shrink-0 text-orange-400" />
                    <span>contato@bahiavagas.com</span>
                  </li>
                </ul>
                <div className="flex gap-3 mt-4">
                  <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/80">
              <p>© {new Date().getFullYear()} Bahia Vagas. Todos os direitos reservados.</p>
              <div className="flex gap-6">
                <Link to="/termos-de-uso" className="hover:text-white transition-colors">Termos de Uso</Link>
                <Link to="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
                <Link to="/cookies-necessarios" className="hover:text-white transition-colors">Cookies</Link>
              </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
