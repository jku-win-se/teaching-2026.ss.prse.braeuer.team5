import { Route, Routes } from "react-router-dom";
import "./App.css";
import { Sidebar } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Devices from "./pages/Devices";
import Simulator from "./pages/Simulator";
import type { JSX } from "react/jsx-dev-runtime";

export default function App(): JSX.Element {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:roomId" element={<Devices />} />
          <Route path="/simulator" element={<Simulator />} />
        </Routes> 
      </main> 
    </div>
  );
}
