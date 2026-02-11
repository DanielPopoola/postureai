import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION first, so we rely on it
    // as the single source of truth to avoid double-render flicker.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!initialized.current) {
        initialized.current = true;
        setLoading(false);
      }
    });

    // Fallback: if onAuthStateChange hasn't fired within 1s, resolve via getSession
    const timeout = setTimeout(() => {
      if (!initialized.current) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!initialized.current) {
            initialized.current = true;
            setUser(session?.user ?? null);
            setLoading(false);
          }
        });
      }
    }, 1000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signOut };
}
