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

      {/* Header Ad Banner */}
      {showAds && (
        <div className="w-full border-b border-border bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 py-1">
            <AdBanner variant="horizontal" slot="auto" />
          </div>
        </div>
      )}

      <div className="flex justify-center flex-1">
        {/* Left Ad Sidebar - Hidden on mobile/tablet */}
        {showAds && (
          <aside className="hidden xl:block w-[200px] flex-shrink-0 p-4 sticky top-20 h-fit">
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
            <AdBanner variant="vertical" slot="auto" />
          </aside>
        )}
      </div>

      <Footer />
    </div>
  );
};
