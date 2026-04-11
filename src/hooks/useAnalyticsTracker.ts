import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackVisit } from "@/lib/analytics-api";
import { useAdmin } from "./useAdmin";

export const useAnalyticsTracker = () => {
  const location = useLocation();
  const { isAdmin } = useAdmin();
  const sessionIdRef = useRef<string | null>(null);
  const lastPageRef = useRef<string>("");
  const pageStartRef = useRef<number>(Date.now());

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === lastPageRef.current) return;

    // Update duration of previous page
    void (async () => {
      try {
        const res = await trackVisit({
          page_url: currentPath,
          page_title: document.title,
          session_id: sessionIdRef.current,
          referrer: document.referrer || null,
          is_admin: isAdmin,
        });
        if (res.session_id) sessionIdRef.current = res.session_id;
      } catch {
        /* ignore */
      }
    })();

    lastPageRef.current = currentPath;
    pageStartRef.current = Date.now();
  }, [location.pathname, isAdmin]);
};
