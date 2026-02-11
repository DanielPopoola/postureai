import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { supabase } from "@/integrations/supabase/client";

async function consumeOAuthHashTokens() {
  const hash = window.location.hash;
  if (!hash || hash.length < 2) return;

  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");

  // Only handle implicit-flow style callbacks that contain tokens in the hash.
  if (!access_token || !refresh_token) return;

  try {
    await supabase.auth.setSession({ access_token, refresh_token });
  } finally {
    // Always remove sensitive tokens from the URL fragment.
    const cleanUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, "", cleanUrl);
  }
}

consumeOAuthHashTokens().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
