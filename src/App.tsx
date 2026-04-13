import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import { Sidebar } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Devices from "./pages/Devices";
import Simulator from "./pages/Simulator";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { useAuth } from "./hooks/useAuth";
import type { JSX } from "react/jsx-dev-runtime";

export default function App(): JSX.Element {
  const { session, loading } = useAuth();

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
                  <Route path="/room/:id" element={<Devices />} />
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