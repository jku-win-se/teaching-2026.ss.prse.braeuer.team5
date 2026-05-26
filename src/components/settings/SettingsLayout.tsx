import { useState } from "react";
import { VacationMode } from "../vacation/VacationMode";
import "./SettingsLayout.css";

type Tab = { id: string; label: string };

const TABS: Tab[] = [
  { id: "vacation", label: "Urlaubsmodus" },
];

export function SettingsLayout() {
  const [activeTab, setActiveTab] = useState("vacation");

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Einstellungen</h1>
      </div>

      <div className="settings-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`settings-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="settings-tab-content">
        {activeTab === "vacation" && <VacationMode embedded />}
      </div>
    </div>
  );
}
