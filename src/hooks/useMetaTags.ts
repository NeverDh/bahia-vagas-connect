import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useMetaTags = () => {
  const location = useLocation();

  useEffect(() => {
    const applyMetaTags = async () => {
      const { data } = await supabase
        .from("meta_tags")
        .select("*")
        .eq("page_path", location.pathname)
        .maybeSingle();

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
    };

    applyMetaTags();
  }, [location.pathname]);
};
