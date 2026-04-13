export type DeviceType = "Schalter" | "Dimmer" | "Thermostat" | "Sensor" | "Jalousie";
export type RoomRole = "owner" | "member";

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
  role?: RoomRole;
};

export type RoomMembership = {
  room_id: string;
  role: RoomRole;
  user_id: string;
};
