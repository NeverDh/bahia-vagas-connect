import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAdmin } from "./useAdmin";

export const useAnalyticsTracker = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const sessionIdRef = useRef<string | null>(null);
  const lastPageRef = useRef<string>("");
  const pageStartRef = useRef<number>(Date.now());

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === lastPageRef.current) return;

    // Update duration of previous page
    if (lastPageRef.current && sessionIdRef.current) {
      const duration = Math.round((Date.now() - pageStartRef.current) / 1000);
      // Fire and forget - update duration
      supabase.functions.invoke("track-visit", {
        body: {
          page_url: currentPath,
          page_title: document.title,
          session_id: sessionIdRef.current,
          referrer: document.referrer || null,
          is_admin: isAdmin,
        },
      }).then((res) => {
        if (res.data?.session_id) {
          sessionIdRef.current = res.data.session_id;
        }
      }).catch(() => {});
    } else {
      // First page view
      supabase.functions.invoke("track-visit", {
        body: {
          page_url: currentPath,
          page_title: document.title,
          session_id: sessionIdRef.current,
          referrer: document.referrer || null,
          is_admin: isAdmin,
        },
      }).then((res) => {
        if (res.data?.session_id) {
          sessionIdRef.current = res.data.session_id;
        }
      }).catch(() => {});
    }

    lastPageRef.current = currentPath;
    pageStartRef.current = Date.now();
  }, [location.pathname, isAdmin]);
};
