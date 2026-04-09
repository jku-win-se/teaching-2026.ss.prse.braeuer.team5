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
  const [loading, setLoading] = useState(!supabase);

  useEffect(() => {
    // 1. Initiale Session abfragen
    if (!supabase) {
      console.error("Supabase client is not initialized");
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setLoading(false);
  }).catch(() => {
    setLoading(false);
  });

    // 2. Auth-Änderungen
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
    setLoading(false);
  });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-screen">Lade App...</div>;
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/simulator" element={<Simulator />} />
        </Routes> 
      </main> 
    </div>
  );
}
