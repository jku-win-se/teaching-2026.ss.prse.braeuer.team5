export type DeviceType = "Schalter" | "Dimmer" | "Thermostat" | "Sensor" | "Jalousie";

export const deviceTypes: DeviceType[] = [
  "Schalter",
  "Dimmer",
  "Thermostat",
  "Sensor",
  "Jalousie",
];

export type Device = {
  id: string;
  room_id: string;
  name: string;
  type: DeviceType;
  energy_consumption?: number | null;
  state?: Record<string, unknown> | null;
};

export type Room = {
  id: string;
  name: string;
  created_at?: string | null;
};
