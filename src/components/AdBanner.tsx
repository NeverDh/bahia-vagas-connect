import { useEffect, useRef, useState } from "react";

interface AdBannerProps {
  variant?: "vertical" | "horizontal";
  className?: string;
  slot?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export const AdBanner = ({
  variant = "vertical",
  className = "",
  slot = "auto",
}: AdBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense não carregado ainda
    }

    // Check if ad actually rendered content
    const timer = setTimeout(() => {
      if (adRef.current) {
        const ins = adRef.current.querySelector("ins.adsbygoogle");
        if (ins && (ins as HTMLElement).offsetHeight > 0) {
          setAdLoaded(true);
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={adRef}
      className={`w-full overflow-hidden ${!adLoaded ? "h-0 min-h-0" : ""} ${className}`}
      style={{ minHeight: 0 }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-2730201613244052"
        data-ad-slot={slot}
        data-ad-format={variant === "horizontal" ? "horizontal" : "vertical"}
        data-full-width-responsive="true"
      />
    </div>
  );
};
