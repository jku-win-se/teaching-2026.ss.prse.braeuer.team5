/**
 * Mögliche Gerätetypen im Smart-Home-System.
 * Bestimmt, welche Zustandsfelder ({@link DeviceState}) relevant sind.
 */
export type DeviceType = "Schalter" | "Dimmer" | "Thermostat" | "Sensor" | "Jalousie";

/**
 * Rolle eines Nutzers innerhalb eines Raums.
 * - `owner` – darf Geräte, Regeln und Mitglieder verwalten
 * - `member` – darf Gerätezustände lesen und ändern
 */
export type RoomRole = "owner" | "member";

/** Alle verfügbaren {@link DeviceType}-Werte als konstantes Array. */
export const deviceTypes: DeviceType[] = [
  "Schalter",
  "Dimmer",
  "Thermostat",
  "Sensor",
  "Jalousie",
];


/**
 * Aktueller Zustand eines Geräts.
 * Welche Felder befüllt sind, hängt vom {@link DeviceType} ab:
 * - Schalter: `on`
 * - Dimmer: `on`, `brightness`
 * - Thermostat: `temperature`
 * - Sensor: `value`
 * - Jalousie: `position`
 */
export interface DeviceState {
  /** Gerät ein- (`true`) oder ausgeschaltet (`false`). */
  on?: boolean;
  /** Helligkeit in Prozent (0–100). Nur für Dimmer. */
  brightness?: number;
  /** Solltemperatur in °C. Nur für Thermostat. */
  temperature?: number;
  /** Messwert des Sensors (numerisch oder Freitext). */
  value?: string | number;
  /** Jalousie-Position: Prozentwert oder Freitext-Zustand. */
  position?: number | 'offen' | 'geschlossen' | 'stop';
}

/**
 * Repräsentiert ein Smart-Home-Gerät in der Datenbank.
 */
export type Device = {
  /** Eindeutige UUID des Geräts. */
  id: string;
  /** UUID des Raums, dem das Gerät zugeordnet ist. */
  room_id: string;
  /** Anzeigename des Geräts. */
  name: string;
  /** Kategorie des Geräts – bestimmt verfügbare Steuerungsoptionen. */
  type: DeviceType;
  /** Leistungsaufnahme in Watt (optional, für Energiemonitoring). */
  energy_consumption?: number | null;
  /** Aktueller Betriebszustand des Geräts. */
  state?: DeviceState;
};

/**
 * Gerät mit optionaler Rauminformation (für raumübergreifende Abfragen).
 */
export type DeviceWithRoom = Device & {
  /** Verknüpfte Raumdaten (Name), sofern per JOIN geladen. */
  rooms?: { name: string };
};

/**
 * Repräsentiert einen Smart-Home-Raum.
 */
export type Room = {
  /** Eindeutige UUID des Raums. */
  id: string;
  /** Anzeigename des Raums. */
  name: string;
  /** ISO-Zeitstempel der Erstellung (von Supabase gesetzt). */
  created_at?: string | null;
  /** Rolle des aktuellen Nutzers in diesem Raum (clientseitig befüllt). */
  role?: RoomRole;
};

/**
 * Mitgliedschaft eines Nutzers in einem Raum (Datenbankeintrag).
 */
export type RoomMembership = {
  /** UUID des Raums. */
  room_id: string;
  /** Rolle des Nutzers in diesem Raum. */
  role: RoomRole;
  /** UUID des Nutzers. */
  user_id: string;
};

/**
 * Mitglied eines Raums mit E-Mail-Adresse (für die UI).
 */
export type RoomMember = {
  /** UUID des Nutzers (Supabase Auth). */
  user_id: string;
  /** Rolle des Mitglieds im Raum. */
  role: RoomRole;
  /** E-Mail-Adresse des Mitglieds (aus Auth-Tabelle). */
  email: string;
};

/**
 * Einladung in einen Raum.
 */
export type RoomInvite = {
  /** Eindeutige UUID der Einladung. */
  id: string;
  /** UUID des Raums, zu dem eingeladen wird. */
  room_id: string;
  /** Name des Ziel-Raums (für die Anzeige). */
  room_name: string;
  /** E-Mail-Adresse des Eingeladenen. */
  email: string;
  /** Zugewiesene Rolle (aktuell immer `member`). */
  role: "member";
  /** Aktueller Status der Einladung. */
  status: "pending" | "accepted" | "declined";
  /** Ablaufzeitpunkt der Einladung (ISO-String). */
  expires_at?: string | null;
  /** Zeitpunkt der Annahme (ISO-String). */
  accepted_at?: string | null;
  /** Zeitpunkt der Erstellung (ISO-String). */
  created_at: string;
};

/**
 * Aktivitätseintrag im Audit-Log.
 * Wird von allen Services nach zustandsändernden Operationen geschrieben.
 */
export interface ActivityLog {
  /** Eindeutige UUID des Log-Eintrags. */
  id: string;
  /** ISO-Zeitstempel des Ereignisses. */
  created_at: string;
  /** UUID des betroffenen Geräts (optional). */
  device_id?: string;
  /** UUID des betroffenen Raums (optional). */
  room_id?: string;
  /** Beschreibung der ausgeführten Aktion (z. B. `"State Change"`). */
  action: string;
  /** Neuer Wert nach der Aktion (JSON-String oder Freitext). */
  new_value: string | null;
  /** Wer die Aktion ausgelöst hat: Nutzer, Automatisierung oder System. */
  actor_type: 'user' | 'automation' | 'system' | string;
  /** UUID des ausführenden Nutzers (nur bei `actor_type: 'user'`). */
  user_id?: string;
}

/**
 * Vergleichsoperator für Regel-Bedingungen.
 * Wird in {@link RuleCondition} eingesetzt.
 */
export type TriggerOperator = '==' | '!=' | '>' | '>=' | '<' | '<=';

/**
 * Bedingung, die eine Automatisierungsregel auslöst.
 * Vergleicht ein Zustandsfeld des Auslöser-Geräts mit einem Sollwert.
 */
export interface RuleCondition {
  /** Zu prüfendes Zustandsfeld des Geräts. */
  field: keyof DeviceState;
  /** Vergleichsoperator. */
  operator: TriggerOperator;
  /** Sollwert, gegen den `field` verglichen wird. */
  value: boolean | number | string;
}

/**
 * Aktion, die eine Regel ausführt, wenn die Bedingung erfüllt ist.
 */
export interface RuleAction {
  /** UUID des Ziel-Geräts, dessen Zustand geändert wird. */
  device_id: string;
  /** Neuer Zustand, der auf das Ziel-Gerät angewendet wird. */
  state: DeviceState;
}

/**
 * Automatisierungsregel: Wenn ein Gerät eine Bedingung erfüllt,
 * wird eine Aktion auf einem (anderen) Gerät ausgeführt.
 */
export interface Rule {
  /** Eindeutige UUID der Regel. */
  id: string;
  /** ISO-Zeitstempel der Erstellung. */
  created_at?: string;
  /** UUID des zugehörigen Raums (optional). */
  room_id?: string;
  /** UUID des Auslöser-Geräts, dessen Zustand geprüft wird. */
  device_id: string;
  /** Anzeigename der Regel. */
  name: string;
  /** Auslöser-Bedingung. */
  condition: RuleCondition;
  /** Auszuführende Aktion bei erfüllter Bedingung. */
  action: RuleAction;
  /** Ob die Regel aktiv ist. */
  is_active: boolean;
  /** ISO-Zeitstempel der letzten Ausführung (für Cooldown-Berechnung). */
  last_triggered_at?: string | null;
  /** Mindestabstand zwischen zwei Ausführungen in Millisekunden. */
  cool_down_ms: number;
}

/**
 * Zeitgesteuerter Automatisierungsplan.
 * Führt eine Gerätezustandsänderung an bestimmten Wochentagen zur angegebenen Uhrzeit aus.
 */
export interface Schedule {
  /** Eindeutige UUID des Zeitplans. */
  id: string;
  /** Anzeigename des Zeitplans. */
  name: string;
  /** UUID des Raums, zu dem der Zeitplan gehört. */
  room_id: string;
  /** UUID des Ziel-Geräts. */
  device_id: string;
  /** Ausführungszeit im Format `HH:MM` oder `HH:MM:SS`. */
  time: string;
  /** Wochentage als Array von Zahlen (0 = Sonntag … 6 = Samstag). */
  days: number[];
  /** Zielzustand, der zum geplanten Zeitpunkt gesetzt wird. */
  action_value: DeviceState;
  /** Ob der Zeitplan aktiv ist. */
  is_active: boolean;
  /** ISO-Zeitstempel der Erstellung. */
  created_at?: string;
  /** Verknüpfte Gerätedaten (Name, Typ, Raum), per JOIN geladen. */
  devices?: {
    name: string;
    type: DeviceType;
    room_id: string;
    rooms?: { name: string };
  };
}

/**
 * Ein Geräteeintrag innerhalb einer {@link Scene}.
 * Legt fest, welchen Zustand das Gerät bei Szenen-Aktivierung erhalten soll.
 */
export interface SceneDeviceEntry {
  /** UUID des betreffenden Geräts. */
  device_id: string;
  /** Zielzustand, der bei Aktivierung der Szene gesetzt wird. */
  target_state: DeviceState;
}

/**
 * Szene: eine benannte Sammlung von Gerätezuständen, die auf Knopfdruck aktiviert werden kann.
 */
export interface Scene {
  /** Eindeutige UUID der Szene. */
  id: string;
  /** UUID des primären Raums (veraltet, wird durch `scene_rooms` ersetzt). */
  room_id?: string | null;
  /** Anzeigename der Szene. */
  name: string;
  /** Optionale Beschreibung der Szene. */
  description?: string;
  /** Liste der Geräte-Soll-Zustände, die bei Aktivierung angewendet werden. */
  device_states: SceneDeviceEntry[];
  /** ISO-Zeitstempel der Erstellung. */
  created_at?: string;
  /** Primärer Raumname (per JOIN, veraltet). */
  rooms?: { name: string };
  /** Zugeordnete Räume inkl. Raumnamen (n:m über `scene_rooms`). */
  scene_rooms?: { room_id: string; rooms?: { name: string } }[];
}

/**
 * Urlaubsmodus: aktiviert täglich eine Szene innerhalb eines Datumsbereichs.
 * Läuft automatisch via {@link useAutomation} ab.
 */
export interface VacationMode {
  /** Eindeutige UUID des Urlaubsmodus-Eintrags. */
  id: string;
  /** Anzeigename des Urlaubsmodus. */
  name: string;
  /** UUID der zu aktivierenden Szene (null = keine Szene). */
  scene_id: string | null;
  /** Startdatum im Format `YYYY-MM-DD`. */
  start_date: string;
  /** Enddatum im Format `YYYY-MM-DD`. */
  end_date: string;
  /** Tägliche Aktivierungszeit im Format `HH:MM`. */
  daily_time: string;
  /** Ob der Urlaubsmodus aktiv ist. */
  is_active: boolean;
  /** ISO-Zeitstempel der Erstellung. */
  created_at?: string;
  /** Zugeordnete Räume (id + name). */
  rooms?: { id: string; name: string }[];
  /** Verknüpfte Szene (Name), per JOIN geladen. */
  scenes?: { name: string } | null;
}

/**
 * Ergebnis einer Konfliktprüfung zwischen Regeln und/oder Zeitplänen.
 * Wird von {@link detectRuleConflicts} und {@link detectScheduleConflicts} zurückgegeben.
 */
export interface Conflict {
  /** Art des Konflikts. */
  type: 'rule-rule' | 'schedule-schedule' | 'rule-schedule';
  /** Benutzerlesbare Konfliktbeschreibung. */
  message: string;
  /** Name des kollidierenden Eintrags (Regel oder Zeitplan). */
  conflictingItemName: string;
}

/**
 * Eintrag aus dem Energie-Verlaufslog (`energy_logs`-Tabelle).
 */
export interface EnergyLog {
  /** ISO-Zeitstempel der Messung. */
  created_at: string;
  /** Gemessener Verbrauch in Watt. */
  consumption_watt?: number;
  /** Verknüpfte Gerätedaten (Name + Raumname), per JOIN geladen. */
  devices?: {
    name: string;
    rooms?: { name: string };
  };
}
