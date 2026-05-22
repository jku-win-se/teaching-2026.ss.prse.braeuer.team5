import type { DeviceState } from "../../types";
import type { SimDevice } from "../../services/simulationService";

type Props = {
  device: SimDevice;
  simState: DeviceState | undefined;
  isChanged: boolean;
};

function formatState(device: SimDevice, state: DeviceState | undefined): { label: string; className: string } {
  if (!state) return { label: "—", className: "" };

  switch (device.type) {
    case "Schalter":
      return state.on
        ? { label: "Eingeschaltet", className: "state-on" }
        : { label: "Ausgeschaltet", className: "state-off" };
    case "Dimmer": {
      const brightness = state.brightness ?? 0;
      const onLabel = state.on === false ? "Aus" : `${brightness}%`;
      return { label: onLabel, className: state.on === false ? "state-off" : "state-on" };
    }
    case "Thermostat":
      return { label: `${state.temperature ?? "—"} °C`, className: "" };
    case "Jalousie":
      return { label: String(state.position ?? "—"), className: "" };
    case "Sensor":
      return { label: String(state.value ?? "—"), className: "" };
    default:
      return { label: JSON.stringify(state), className: "" };
  }
}

export function SimulatorDeviceCard({ device, simState, isChanged }: Props) {
  const { label, className } = formatState(device, simState);

  return (
    <div className={`sim-device-card${isChanged ? " sim-changed" : ""}`}>
      <div className="sim-device-name" title={device.name}>{device.name}</div>
      <div className="sim-device-type">{device.type}</div>
      <div className={`sim-device-state ${className}`}>{label}</div>
    </div>
  );
}
