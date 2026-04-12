import { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { supabase } from "./config/supabaseClient";
import "./App.css";
import { Sidebar } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import Simulator from "./pages/Simulator";
import Register from "./pages/Register";
import type { JSX } from "react/jsx-dev-runtime";
import type { Session } from "@supabase/supabase-js";

export default function App(): JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setLoading(false);

      const { data } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        setSession(currentSession);
        setLoading(false);
      });
      authSubscription = data.subscription;
    };

    initAuth();
    return () => { authSubscription?.unsubscribe(); };
  }, []);

  if (loading) return <div className="loading-screen">Lade App...</div>;

  return (
    <Routes>
      <Route 
        path="/register" 
        element={!session ? <Register /> : <Navigate to="/" replace />} 
      />

      <Route
        path="/"
        element={
          session ? (
            <div className="app-shell">
              <Sidebar />
              <main className="app-main">
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="devices" element={<Devices />} />
                  <Route path="simulator" element={<Simulator />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Navigate to="/register" replace />
          )
        }
      >
        <Route path="*" element={null} /> 
      </Route>
    </Routes>
  );
}