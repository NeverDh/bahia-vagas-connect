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

      {showAds && <AdBanner variant="horizontal" slot="auto" className="max-w-6xl mx-auto" />}

      <div className="flex justify-center flex-1 border-0">
        {showAds && (
          <aside className="hidden xl:block w-[200px] flex-shrink-0 p-4 sticky top-20 h-fit">
            <AdBanner variant="vertical" slot="auto" />
          </aside>
        )}

        <main className="flex-1 max-w-6xl min-w-0">
          {children}
        </main>

        {showAds && (
          <aside className="hidden xl:block w-[200px] flex-shrink-0 p-4 sticky top-20 h-fit">
            <AdBanner variant="vertical" slot="auto" />
          </aside>
        )}
      </div>

      {showAds && <AdBanner variant="horizontal" slot="auto" className="max-w-6xl mx-auto px-4 py-4" />}

      {showAds && (
        <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
          <AdBanner variant="horizontal" slot="auto" />
        </div>
      )}

      <Footer />
    </div>
  );
};
