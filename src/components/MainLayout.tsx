import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AdBanner } from "./AdBanner";

interface MainLayoutProps {
  children: ReactNode;
  showAds?: boolean;
}

export const MainLayout = ({ children, showAds = true }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Header Ad Banner - exibido em todas as páginas abaixo do cabeçalho */}
      {showAds && (
        <div className="w-full border-b border-border bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 py-2">
            <p className="text-[10px] text-muted-foreground text-center mb-1">Anúncio</p>
            <AdBanner variant="horizontal" slot="auto" />
          </div>
        </div>
      )}

      <div className="flex justify-center flex-1">
        {/* Left Ad Sidebar - Hidden on mobile/tablet */}
        {showAds && (
          <aside className="hidden xl:block w-[200px] flex-shrink-0 p-4 sticky top-20 h-fit">
            <p className="text-xs text-muted-foreground text-center mb-3">Anúncios</p>
            <AdBanner variant="vertical" slot="auto" />
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 max-w-6xl min-w-0">
          {children}
        </main>

        {/* Right Ad Sidebar - Hidden on mobile/tablet */}
        {showAds && (
          <aside className="hidden xl:block w-[200px] flex-shrink-0 p-4 sticky top-20 h-fit">
            <p className="text-xs text-muted-foreground text-center mb-3">Anúncios</p>
            <AdBanner variant="vertical" slot="auto" />
          </aside>
        )}
      </div>

      <Footer />

      {/* Mobile Ad Banner - Only on mobile */}
      {showAds && (
        <div className="xl:hidden fixed bottom-0 left-0 right-0 p-2 bg-background/95 backdrop-blur border-t border-border z-40">
          <AdBanner variant="horizontal" slot="auto" />
        </div>
      )}
    </div>
  );
};
