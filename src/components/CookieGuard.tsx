import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const COOKIE_KEY = "bahia-vagas-cookie-consent";
const BLOCKED_ROUTE = "/cookies-necessarios";

export const CookieGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    const isOnBlockedPage = location.pathname === BLOCKED_ROUTE;

    // If rejected and not already on blocked page → redirect
    if (consent === "rejected" && !isOnBlockedPage) {
      navigate(BLOCKED_ROUTE, { replace: true });
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
};
