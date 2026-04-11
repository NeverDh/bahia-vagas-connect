import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fetchMetaTagsForPath } from "@/lib/meta-tags-api";

export const useMetaTags = () => {
  const location = useLocation();

  useEffect(() => {
    const applyMetaTags = async () => {
      const data = await fetchMetaTagsForPath(location.pathname);

      if (!data) return;

      const setMeta = (name: string, content: string, attr = "name") => {
        if (!content) return;
        let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
        if (!el) {
          el = document.createElement("meta");
          el.setAttribute(attr, name);
          document.head.appendChild(el);
        }
        el.setAttribute("content", content);
      };

      if (data.title) document.title = data.title;
      if (data.description) setMeta("description", data.description);
      if (data.keywords) setMeta("keywords", data.keywords);
      if (data.og_title) setMeta("og:title", data.og_title, "property");
      if (data.og_description) setMeta("og:description", data.og_description, "property");
      if (data.og_image) setMeta("og:image", data.og_image, "property");
      setMeta("og:type", "website", "property");

      // Canonical tag
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", `https://bahiavagas.com${location.pathname}`);
    };

    // Always set canonical, even without meta_tags data
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `https://bahiavagas.com${location.pathname}`);

    applyMetaTags();
  }, [location.pathname]);
};
