import { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { supabase } from "./config/supabaseClient";
import "./App.css";
import { Sidebar } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Devices from "./pages/Devices";
import Simulator from "./pages/Simulator";
import Register from "./pages/Register";
import Login from "./pages/Login";
import type { JSX } from "react/jsx-dev-runtime";
import type { Session } from "@supabase/supabase-js";

export default function App(): JSX.Element {
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
        
        if (event === 'SIGNED_OUT') {
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

  if (loading) {
    return <div className="loading-screen">Lade App...</div>;
  }

  return (
    <Routes>
      {!session ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <Route
          path="*"
          element={
            <div className="app-shell">
              <Sidebar />
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/rooms" element={<Rooms />} />
                  <Route path="/rooms/:roomId" element={<Devices />} />
                  <Route path="/simulator" element={<Simulator />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          }
        />
      )}
    </Routes>
  );
}