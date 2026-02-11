import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles OAuth callbacks that return tokens in the URL hash.
 * - Sets the session from #access_token / #refresh_token
 * - Cleans the hash from the URL to avoid leaking tokens via copy/paste
 */
export default function AuthHashHandler() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) return;

    // Fire and forget: auth state listener will pick up the new session.
    supabase.auth
      .setSession({ access_token, refresh_token })
      .catch(() => {
        // If setting session fails, we still want to clear the hash to avoid leaving tokens in the URL.
      })
      .finally(() => {
        // Remove hash tokens from URL (fragment isn't sent to servers, but it IS visible/shareable).
        const cleanUrl = `${window.location.pathname}${window.location.search}`;
        window.history.replaceState(null, "", cleanUrl);
      });
  }, []);

  return null;
}
