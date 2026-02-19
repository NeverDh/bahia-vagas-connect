import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import Auth from "./pages/Auth";
import JobDetails from "./pages/JobDetails";
import Companies from "./pages/Companies";
import Profile from "./pages/Profile";
import CompanyDashboard from "./pages/CompanyDashboard";
import Admin from "./pages/Admin";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import JobsByCity from "./pages/JobsByCity";
import SiteUrls from "./pages/SiteUrls";
import CookiesNecessarios from "./pages/CookiesNecessarios";
import TermosDeUso from "./pages/TermosDeUso";
import { bahiaMunicipios } from "./lib/bahia-municipios";
import { useMetaTags } from "./hooks/useMetaTags";
import { CookieConsent } from "./components/CookieConsent";
import { CookieGuard } from "./components/CookieGuard";

const MetaTagsProvider = ({ children }: { children: React.ReactNode }) => {
  useMetaTags();
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CookieConsent />
          <CookieGuard>
            <MetaTagsProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/vagas" element={<Jobs />} />
                {Object.entries(bahiaMunicipios).map(([slug, name]) => (
                  <Route key={slug} path={`/vagas-${slug}`} element={<JobsByCity cityName={name} />} />
                ))}
                <Route path="/vaga/:id" element={<JobDetails />} />
                <Route path="/empresas" element={<Companies />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/empresa/dashboard" element={<CompanyDashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/urls" element={<SiteUrls />} />
                <Route path="/privacidade" element={<PrivacyPolicy />} />
                <Route path="/cookies-necessarios" element={<CookiesNecessarios />} />
                <Route path="/termos-de-uso" element={<TermosDeUso />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MetaTagsProvider>
          </CookieGuard>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
