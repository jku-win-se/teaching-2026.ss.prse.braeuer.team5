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
  const initAuth = async () => {
    if (!supabase) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const { data: { session: initialSession } } = await supabase.auth.getSession();

    setSession(initialSession);
    setLoading(false);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
      } else {
        setSession(currentSession);
      }
      setLoading(false);
    });

    return subscription;
  };

  const authPromise = initAuth();

  return () => {
    authPromise.then(sub => sub?.unsubscribe()); 
  };
}, []);

  console.log("DEBUG - Session Status:", session);
  console.log("DEBUG - Ist Session vorhanden?:", !!session);
  if (loading) {
    return <div className="loading-screen">Lade App...</div>;
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
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
  );
}
