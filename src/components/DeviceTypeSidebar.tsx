import { Power, Sun, Thermometer, Eye, ChevronUp, Plus } from "lucide-react";
import type { DeviceType } from "../types";
import "./DeviceTypeSidebar.css";
// Die Daten bleiben hier, da sie spezifisch für diese Sidebar sind
const BAUTEILE = [
  { type: "Schalter", icon: <Power size={18} /> },
  { type: "Dimmer", icon: <Sun size={18} /> },
  { type: "Thermostat", icon: <Thermometer size={18} /> },
  { type: "Sensor", icon: <Eye size={18} /> },
  { type: "Jalousie", icon: <ChevronUp size={18} /> },
];

interface DeviceTypeSidebarProps {
  onSelectType: (type: DeviceType) => void;
}

export function DeviceTypeSidebar({ onSelectType }: DeviceTypeSidebarProps) {
  return (
    <aside className="bauteile-sidebar">
      <h3 className="bauteile-title">BAUTEILE</h3>
      <div className="bauteile-list">
        {BAUTEILE.map(({ type, icon }) => (
          <button 
            key={type} 
            className="bauteil-btn"
            onClick={() => onSelectType(type as DeviceType)}
          >
            <div className="bauteil-left">
              <span className="bauteil-icon">{icon}</span>
              <span>{type}</span>
            </div>
            <Plus size={16} className="bauteil-plus" />
          </button>
        ))}
      </div>
    </aside>
  );
}