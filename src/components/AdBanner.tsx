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
  const [adStatus, setAdStatus] = useState<"pending" | "loaded" | "empty">("pending");

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense não carregado ainda
    }

    const timer = setTimeout(() => {
      if (adRef.current) {
        const ins = adRef.current.querySelector("ins.adsbygoogle");
        if (ins && (ins as HTMLElement).offsetHeight > 0) {
          setAdStatus("loaded");
        } else {
          setAdStatus("empty");
        }
      } else {
        setAdStatus("empty");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Ad confirmed empty — render nothing at all
  if (adStatus === "empty") {
    return null;
  }

  return (
    <div
      ref={adRef}
      className={`w-full overflow-hidden ${adStatus === "pending" ? "" : className}`}
      style={adStatus === "pending" ? { height: 0, overflow: "hidden", margin: 0, padding: 0 } : undefined}
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
