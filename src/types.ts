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

export type RoomMember = {
  user_id: string;
  role: RoomRole;
  email: string;
};

export type RoomInvite = {
  id: string;
  room_id: string;
  room_name: string;
  email: string;
  role: "member";
  status: "pending" | "accepted" | "declined";
  expires_at?: string | null;
  accepted_at?: string | null;
  created_at: string;
};

export interface ActivityLog {
  id: string;
  created_at: string;
  device_id?: string;
  room_id?: string;
  action: string;
  new_value: string | null;
  actor_type: 'user' | 'automation' | 'system' | string;
  user_id?: string;
}

export type TriggerOperator = '==' | '!=' | '>' | '>=' | '<' | '<=';

export interface RuleCondition {
  field: keyof DeviceState;
  operator: TriggerOperator;
  value: boolean | number | string;
}

export interface RuleAction {
  device_id: string;
  state: DeviceState;
}

export interface Rule {
  id: string;
  created_at?: string;
  room_id?: string;
  device_id: string;
  name: string;
  condition: RuleCondition;
  action: RuleAction;
  is_active: boolean;
  cooldown_minutes?: number;
  last_triggered_at?: string | null;
}
