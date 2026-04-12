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
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import { bahiaMunicipios } from "./lib/bahia-municipios";
import { seoJobPages } from "./lib/seo-job-pages";
import { useMetaTags } from "./hooks/useMetaTags";
import JobsByCategory from "./pages/JobsByCategory";
import ProgrammaticSeoPage from "./pages/ProgrammaticSeoPage";
import { getAllProgrammaticPages } from "./lib/seo-programmatic";
import { CookieConsent } from "./components/CookieConsent";
import { CookieGuard } from "./components/CookieGuard";
import { AuthProvider } from "./hooks/useAuth";
import Analytics from "./pages/Analytics";
import { useAnalyticsTracker } from "./hooks/useAnalyticsTracker";
import { ApiGlobalLoadingBar } from "./components/ApiGlobalLoadingBar";

const MetaTagsProvider = ({ children }: { children: React.ReactNode }) => {
  useMetaTags();
  useAnalyticsTracker();
  return <>{children}</>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ApiGlobalLoadingBar />
        <BrowserRouter>
          <AuthProvider>
            <CookieConsent />
            <CookieGuard>
              <MetaTagsProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/vagas" element={<Jobs />} />
                  {seoJobPages.map((page) => (
                    <Route key={page.slug} path={`/vagas-${page.slug}`} element={<JobsByCategory page={page} />} />
                  ))}
                  {getAllProgrammaticPages().map((page) => (
                    <Route key={page.slug} path={page.fullPath} element={<ProgrammaticSeoPage page={page} />} />
                  ))}
                  {Object.entries(bahiaMunicipios).map(([slug, name]) => (
                    <Route key={slug} path={`/vagas-${slug}`} element={<JobsByCity cityName={name} />} />
                  ))}
                  <Route path="/vaga/:id" element={<JobDetails />} />
                  <Route path="/empresas" element={<Companies />} />
                  <Route path="/perfil" element={<Profile />} />
                  <Route path="/empresa/dashboard" element={<CompanyDashboard />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/analytics" element={<Analytics />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/urls" element={<SiteUrls />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/privacidade" element={<PrivacyPolicy />} />
                  <Route path="/cookies-necessarios" element={<CookiesNecessarios />} />
                  <Route path="/termos-de-uso" element={<TermosDeUso />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MetaTagsProvider>
            </CookieGuard>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
