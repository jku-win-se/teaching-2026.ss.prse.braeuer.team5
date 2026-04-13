import { useEffect, useState } from "react";
import { supabase } from "../config/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export function useAuth(): { session: Session | null; loading: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      if (!supabase) {
        console.error("Supabase client not found");
        setLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
      } catch (error) {
        console.error("Fehler beim Session-Check:", error);
      } finally {
        setLoading(false);
      }

      const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
        console.log("Auth Event:", event);

        if (event === "SIGNED_OUT") {
          setSession(null);
        } else {
          setSession(currentSession);
        }
        setLoading(false);
      });

      authSubscription = data.subscription;
    };

    initAuth();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  return { session, loading };
}
