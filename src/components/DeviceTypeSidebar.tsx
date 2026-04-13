import { Power, Sun, Thermometer, Eye, ChevronUp, Plus } from "lucide-react";
import type { DeviceType } from "../types";
import "./DeviceTypeSidebar.css";

const BAUTEILE = [
  { type: "Schalter", icon: <Power size={18} /> },
  { type: "Dimmer", icon: <Sun size={18} /> },
  { type: "Thermostat", icon: <Thermometer size={18} /> },
  { type: "Sensor", icon: <Eye size={18} /> },
  { type: "Jalousie", icon: <ChevronUp size={18} /> },
];

interface DeviceTypeSidebarProps {
  onSelectType: (type: DeviceType) => void;
  isOpen: boolean;
  onClose: () => void;
  canManage: boolean;
}

export function DeviceTypeSidebar({ onSelectType, isOpen, onClose, canManage }: DeviceTypeSidebarProps) {
  const handleSelect = (type: DeviceType) => {
    onSelectType(type);
    onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`device-type-sidebar ${isOpen ? "open" : ""}`}>
        <h3 className="bauteile-title">BAUTEILE</h3>
        <div className="mobile-sidebar-cancel">
          <div className="close-menu" onClick={onClose}>x</div>
        </div>

        {canManage ? (
          <div className="bauteile-list">
            {BAUTEILE.map(({ type, icon }) => (
              <button key={type} className="bauteil-btn" onClick={() => handleSelect(type as DeviceType)}>
                <div className="bauteil-left">
                  <span className="bauteil-icon">{icon}</span>
                  <span>{type}</span>
                </div>
                <Plus size={16} />
              </button>
            ))}
          </div>
        ) : (
          <p className="bauteile-hint">Nur Eigentuemer duerfen Geraete hinzufuegen.</p>
        )}
      </aside>
    </>
  );
}
