export type DeviceType = "Schalter" | "Dimmer" | "Thermostat" | "Sensor" | "Jalousie";

export const deviceTypes: DeviceType[] = [
  "Schalter",
  "Dimmer",
  "Thermostat",
  "Sensor",
  "Jalousie",
];

export interface DeviceState {
  on?: boolean;
  brightness?: number;
  temperature?: number;
  value?: string | number;
  position?: 'offen' | 'geschlossen' | 'stop';
}

export type Device = {
  id: string;
  room_id: string;
  name: string;
  type: DeviceType;
  energy_consumption?: number | null;
  state?: DeviceState;
};

export type Room = {
  id: string;
  name: string;
  created_at?: string | null;
};