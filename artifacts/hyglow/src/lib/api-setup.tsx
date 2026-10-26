import { useEffect } from "react";
import { useLocation } from "wouter";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";

export function ApiSetup({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("hyglow_token"));
    // Not setting base URL as it implies same origin usually, or we could if needed.
  }, []);

  return <>{children}</>;
}
