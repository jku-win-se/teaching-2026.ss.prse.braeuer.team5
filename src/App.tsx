import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import { Sidebar } from "./components/sidebar/Sidebar";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Devices from "./pages/Devices";
import Notifications from "./pages/Notifications";
import Simulator from "./pages/Simulator";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ActivityLogPage from "./pages/ActivityLog";
import SchedulesPage from "./pages/SchedulesPage";
import RulesPage from "./pages/RulesPage";
import ScenesPage from "./pages/ScenesPage";
import SettingsPage from "./pages/SettingsPage";
import { useAuth } from "./hooks/useAuth";
import { useAutomation } from "./hooks/useAutomation";
import type { JSX } from "react/jsx-dev-runtime";
import { RuleActionOverlay } from "./components/rules/RuleActionOverlay";

export default function App(): JSX.Element {
  const { session, loading } = useAuth();
  useAutomation(session);

  if (loading) {
    return <div className="loading-screen">Lade App...</div>;
  }

  return (
    <>
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
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/simulator" element={<Simulator />} />
                  <Route path="/logs" element={<ActivityLogPage />} />
                  <Route path="/schedules" element={<SchedulesPage />} />
                  <Route path="/rules" element={<RulesPage />} />
                  <Route path="/scenes" element={<ScenesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/vacation" element={<Navigate to="/settings" replace />} />
                  <Route path="/mqtt" element={<Navigate to="/settings?tab=mqtt" replace />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          }
        />
      )}
    </Routes>

    <RuleActionOverlay/>
    </>
  );
}