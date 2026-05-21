import type { DeviceState } from "../../types";
import type { SimDevice } from "../../services/simulationService";
import { SimulatorDeviceCard } from "./SimulatorDeviceCard";

type Props = {
  roomName: string;
  devices: SimDevice[];
  simStates: Map<string, DeviceState>;
  changedDevices: Set<string>;
};

export function SimulatorRoomGroup({ roomName, devices, simStates, changedDevices }: Props) {
  return (
    <div className="sim-room-group">
      <div className="sim-room-title">{roomName}</div>
      <div className="sim-device-grid">
        {devices.map((device) => (
          <SimulatorDeviceCard
            key={device.id}
            device={device}
            simState={simStates.get(device.id)}
            isChanged={changedDevices.has(device.id)}
          />
        ))}
      </div>
    </div>
  );
}
