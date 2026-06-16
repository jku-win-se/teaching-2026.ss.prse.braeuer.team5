# Smart Home Orchestrator — UML-Diagramme zur Systemarchitektur

Diese Seite enthaelt ergaenzende UML-Diagramme zur Systemarchitektur. Zur narrativen Uebersicht siehe [Systemarchitektur](./system-architecture.md).

## 1. Component Tree

```mermaid
graph TD
    main["main.tsx (BrowserRouter)"]
    App["App.tsx (useAuth · useAutomation)"]

    subgraph Unauthenticated
        Login["Login /login"]
        Register["Register /register"]
    end

    subgraph Authenticated
        Sidebar["Sidebar (NavLinks · useLocation)"]
        Dashboard["Dashboard / (EnergyDashboard)"]
        Rooms["Rooms /rooms (useRooms)"]
        RoomRow["RoomRow (useDeviceCount)"]
        Devices["Devices /room/:id (useDevices · useRoomRole)"]
        Notifications["Notifications /notifications"]
        Simulator["Simulator /simulator"]
        ActivityLog["ActivityLog /logs"]
        SchedulesPage["SchedulesPage /schedules"]
        RulesPage["RulesPage /rules"]
        ScenesPage["ScenesPage /scenes"]
        SettingsPage["SettingsPage /settings"]
        VacationModePage["VacationModePage /vacation"]

        DeviceTypeSidebar["DeviceTypeSidebar (Drawer)"]
        DeviceCard["DeviceCard"]
        RoomMembers["RoomMembers"]
        AddModalDevice["AddModalDevice"]
        DeleteModalDevice["DeleteModal (Gerät löschen)"]
        DeleteModalRooms["DeleteModal (Raum löschen)"]
        Schedules["Schedules (useSchedules · useRules · useRooms)"]
        Rules["Rules (useRules · useRooms)"]
        RuleList["RuleList"]
        RuleFormModal["RuleFormModal"]
        RuleActionOverlay["RuleActionOverlay (Overlay)"]
        Scenes["Scenes (useScenes · useRooms)"]
        VacationMode["VacationMode (useVacationMode · useRooms)"]
        SettingsLayout["SettingsLayout"]
        MqttSettings["MqttSettings (useMqtt)"]
    end

    main --> App
    App --> Login
    App --> Register
    App --> Authenticated

    Sidebar --> Dashboard
    Sidebar --> Rooms
    Sidebar --> Devices
    Sidebar --> Notifications
    Sidebar --> Simulator
    Sidebar --> ActivityLog
    Sidebar --> SchedulesPage
    Sidebar --> RulesPage
    Sidebar --> ScenesPage
    Sidebar --> VacationModePage
    Sidebar --> SettingsPage

    Rooms --> RoomRow
    Rooms --> DeleteModalRooms

    Devices --> DeviceTypeSidebar
    Devices --> DeviceCard
    Devices --> RoomMembers
    Devices --> AddModalDevice
    Devices --> DeleteModalDevice

    SchedulesPage --> Schedules
    RulesPage --> Rules
    Rules --> RuleList
    Rules --> RuleFormModal
    Rules --> RuleActionOverlay
    ScenesPage --> Scenes
    VacationModePage --> VacationMode
    SettingsPage --> SettingsLayout
    SettingsLayout --> MqttSettings
```

---

## 2. Service & Data Flow

```mermaid
graph LR
    subgraph Frontend
        Pages["Pages & Components\n(React)"]

        subgraph Hooks
            DataHooks["useAuth · useDevices · useRoomRole\nuseRooms · useRules · useSchedules\nuseScenes · useVacationMode"]
            AutoHook["useAutomation\n(Interval + isMounted guard)"]
            MqttHook["useMqtt\n(status · connect · disconnect)"]
        end

        subgraph Services
            ScheduleSvc["scheduleService\n(CRUD + checkAndExecuteSchedules)"]
            VacationSvc["vacationModeService\n(CRUD + checkAndExecuteVacationMode\n+ getActiveVacationRoomIds)"]
            SceneSvc["sceneService\n(CRUD + activateScene)"]
            RuleSvc["ruleService"]
            DeviceSvc["deviceService"]
            RoomSvc["roomService"]
            LogSvc["logService\n(insert + fetch activity_logs)"]
            EnergySvc["energyService"]
            SimSvc["simulationService"]
            ConflictSvc["conflictService\n(detectScheduleConflicts)"]
            InviteSvc["inviteService"]
            MqttSvc["mqttService\n(WebSocket · pub/sub · singleton)"]
        end

        SupabaseClient["Supabase Client\n(Auth · DB · REST)"]
    end

    subgraph Backend["Backend (Supabase)"]
        EdgeFns["Edge Functions\nroom-invites · create-room-with-member"]
        DB[("PostgreSQL DB\n(RLS enabled)")]
        MqttBroker["MQTT Broker\n(WebSocket)"]
    end

    Pages --> DataHooks
    Pages --> MqttHook
    DataHooks --> ScheduleSvc
    DataHooks --> VacationSvc
    DataHooks --> SceneSvc
    DataHooks --> RuleSvc
    DataHooks --> DeviceSvc
    DataHooks --> RoomSvc
    DataHooks --> EnergySvc
    AutoHook --> VacationSvc
    AutoHook --> ScheduleSvc
    MqttHook --> MqttSvc
    ScheduleSvc --> VacationSvc
    ScheduleSvc --> LogSvc
    VacationSvc --> SceneSvc
    VacationSvc --> LogSvc
    SceneSvc --> LogSvc
    InviteSvc --> EdgeFns

    ScheduleSvc --> SupabaseClient
    VacationSvc --> SupabaseClient
    SceneSvc --> SupabaseClient
    RuleSvc --> SupabaseClient
    DeviceSvc --> SupabaseClient
    RoomSvc --> SupabaseClient
    LogSvc --> SupabaseClient
    EnergySvc --> SupabaseClient
    SimSvc --> SupabaseClient
    ConflictSvc --> ScheduleSvc

    SupabaseClient <-->|"REST / RLS"| DB
    EdgeFns -->|"service_role"| DB
    MqttSvc <-->|"WebSocket ws://"| MqttBroker
    MqttSvc --> DeviceSvc
```

---

## 3. Datenbankschema (Supabase)

```mermaid
erDiagram
    ROOMS {
        uuid id PK
        text name
        timestamptz created_at
        uuid vacation_mode_id FK
    }

    ROOM_MEMBERS {
        uuid user_id PK,FK
        uuid room_id PK,FK
        text role
    }

    DEVICES {
        uuid id PK
        uuid room_id FK
        text name
        text type
        jsonb state
        int energy_consumption
    }

    RULES {
        uuid id PK
        uuid room_id FK
        uuid device_id FK
        text name
        jsonb condition
        jsonb action
        boolean is_active
        timestamptz created_at
        timestamptz last_triggered_at
        int cool_down_ms
    }

    SCHEDULES {
        uuid id PK
        uuid room_id FK
        uuid device_id FK
        text name
        time time
        integer[] days
        jsonb action_value
        boolean is_active
        timestamptz created_at
    }

    ROOM_INVITES {
        uuid id PK
        uuid room_id FK
        uuid invited_by FK
        text email
        text role
        text status
        timestamptz expires_at
        timestamptz accepted_at
        timestamptz created_at
    }

    ACTIVITY_LOGS {
        uuid id PK
        timestamptz created_at
        uuid room_id FK
        uuid device_id FK
        uuid user_id FK
        text actor_type
        text action
        text new_value
    }

    ENERGY_LOGS {
        uuid id PK
        timestamptz created_at
        uuid device_id FK
        int consumption_watt
    }

    AUTH_USERS {
        uuid id PK
    }

    SCENES {
        uuid id PK
        uuid room_id FK
        text name
        text description
        jsonb device_states
        timestamptz created_at
    }

    SCENE_ROOMS {
        uuid scene_id PK,FK
        uuid room_id PK,FK
    }

    VACATION_MODE {
        uuid id PK
        text name
        uuid scene_id FK
        date start_date
        date end_date
        time daily_time
        boolean is_active
        timestamptz created_at
    }

    AUTH_USERS ||--|{ ROOM_MEMBERS : "has"
    AUTH_USERS ||--|{ ROOM_INVITES : "sends"
    AUTH_USERS ||--o{ ACTIVITY_LOGS : "triggers"
    ROOMS ||--|{ ROOM_MEMBERS : "has"
    ROOMS ||--|{ DEVICES : "contains"
    ROOMS ||--|{ ROOM_INVITES : "has"
    ROOMS ||--o{ RULES : "has"
    ROOMS ||--|{ SCHEDULES : "has"
    ROOMS ||--o{ ACTIVITY_LOGS : "logs"
    ROOMS ||--o{ SCENE_ROOMS : "in"
    ROOMS }o--o| VACATION_MODE : "assigned to"
    DEVICES ||--o{ RULES : "has"
    DEVICES ||--|{ SCHEDULES : "has"
    DEVICES ||--o{ ACTIVITY_LOGS : "logs"
    DEVICES ||--|{ ENERGY_LOGS : "logs"
    SCENES ||--o{ SCENE_ROOMS : "has"
    SCENES ||--o{ VACATION_MODE : "used by"
```

---

## 4. Data Model

```mermaid
classDiagram
    class Room {
        +String id
        +String name
        +String? created_at
        +RoomRole? role
    }

    class Device {
        +String id
        +String room_id
        +String name
        +DeviceType type
        +Number? energy_consumption
        +DeviceState? state
    }

    class DeviceType {
        <<enumeration>>
        Schalter
        Dimmer
        Thermostat
        Sensor
        Jalousie
    }

    class DeviceState {
        +Boolean? on
        +Number? brightness
        +Number? temperature
        +String|Number? value
        +Number|String? position
    }

    class RoomRole {
        <<enumeration>>
        owner
        member
    }

    class RoomMembership {
        +String room_id
        +String user_id
        +RoomRole role
    }

    class RoomInvite {
        +String id
        +String room_id
        +String invited_by
        +String email
        +String role
        +String status
        +String? expires_at
        +String? accepted_at
        +String created_at
    }

    class ActivityLog {
        +String id
        +String created_at
        +String? device_id
        +String? room_id
        +String? user_id
        +String actor_type
        +String action
        +String? new_value
    }

    class EnergyLog {
        +String created_at
        +Number? consumption_watt
    }

    class TriggerOperator {
        <<enumeration>>
        ==
        !=
        gt
        gte
        lt
        lte
    }

    class RuleCondition {
        +String field
        +TriggerOperator operator
        +Boolean|Number|String value
    }

    class RuleAction {
        +String device_id
        +DeviceState state
    }

    class Rule {
        +String id
        +String? created_at
        +String? room_id
        +String device_id
        +String name
        +RuleCondition condition
        +RuleAction action
        +Boolean is_active
        +String? last_triggered_at
        +Number cool_down_ms
    }

    class Schedule {
        +String id
        +String name
        +String room_id
        +String device_id
        +String time
        +Number[] days
        +DeviceState action_value
        +Boolean is_active
        +String? created_at
    }

    class SceneDeviceEntry {
        +String device_id
        +DeviceState target_state
    }

    class Scene {
        +String id
        +String? room_id
        +String name
        +String? description
        +SceneDeviceEntry[] device_states
        +String? created_at
    }

    class VacationMode {
        +String id
        +String name
        +String? scene_id
        +String start_date
        +String end_date
        +String daily_time
        +Boolean is_active
        +String? created_at
    }

    class Conflict {
        +String type
        +String message
        +String conflictingItemName
    }

    Room "1" --> "0..*" Device : contains
    Room "1" --> "0..*" RoomMembership : has
    Room "1" --> "0..*" RoomInvite : has
    Room "1" --> "0..*" Rule : has
    Room "1" --> "0..*" Schedule : has
    Room "1" --> "0..*" Scene : in
    Room "0..*" --> "0..1" VacationMode : assigned to
    RoomMembership --> RoomRole : role
    Device --> DeviceType : type
    Device --> DeviceState : state
    Device "1" --> "0..*" EnergyLog : logs
    Rule --> RuleCondition : condition
    Rule --> RuleAction : action
    RuleAction --> DeviceState : state
    RuleCondition --> TriggerOperator : operator
    Schedule --> DeviceState : action_value
    Scene "1" --> "0..*" SceneDeviceEntry : device_states
    SceneDeviceEntry --> DeviceState : target_state
    VacationMode --> Scene : uses
```

---

## 5. Automations-Ablauf

```mermaid
sequenceDiagram
    participant App as App.tsx
    participant Auto as useAutomation
    participant VS as vacationModeService
    participant SS as scheduleService
    participant DB as Supabase DB

    App->>Auto: mount (session vorhanden)
    Auto->>Auto: setTimeout(run, 0) + setInterval(run, 60s)

    loop Jede Minute
        Auto->>VS: checkAndExecuteVacationMode()
        VS->>DB: SELECT vacation_mode WHERE is_active + Datumsbereich
        DB-->>VS: aktive Modi
        VS->>DB: UPDATE devices (Szene aktivieren)
        VS->>DB: INSERT activity_logs (actor_type=automation)

        Auto->>SS: checkAndExecuteSchedules()
        SS->>VS: getActiveVacationRoomIds()
        VS->>DB: SELECT vacation_mode rooms
        DB-->>SS: vacation room_ids (Set)
        SS->>DB: SELECT schedules WHERE is_active=true
        DB-->>SS: aktive Zeitpläne
        SS->>SS: Zeitvergleich (HH:MM) + Wochentag
        SS->>DB: UPDATE devices.state
        SS->>DB: INSERT activity_logs (actor_type=automation)
    end

    App->>Auto: unmount → cleanup
    Auto->>Auto: isMounted=false, clearTimeout, clearInterval
```

---

## 6. Projektstruktur & SQL-Migrationen

```
src/
├── App.tsx                    # Root: Auth-Guard, Routing, useAutomation
├── main.tsx                   # BrowserRouter, StrictMode
├── types.ts                   # Gemeinsame TypeScript-Typen
├── config/
│   └── supabaseClient.ts      # Supabase-Initialisierung
├── hooks/
│   ├── useAutomation.ts       # Zentraler Automations-Timer (Zeitpläne + Urlaubsmodus)
│   ├── useAuth.ts             # Session & Login-State
│   ├── useDevices.ts          # Geräteliste für einen Raum
│   ├── useMqtt.ts             # MQTT-Verbindungsstatus & Konfiguration
│   ├── useRooms.ts            # Räume + Rollen des eingeloggten Users
│   ├── useRoomRole.ts         # Rolle in einem spezifischen Raum
│   ├── useRules.ts            # Automatisierungsregeln
│   ├── useScenes.ts           # Szenen + verfügbare Geräte
│   ├── useSchedules.ts        # Zeitpläne + verfügbare Geräte
│   └── useVacationMode.ts     # Urlaubsmodi + verfügbare Szenen
├── services/
│   ├── conflictService.ts     # Konflikterkennung (Regel/Zeitplan-Überschneidungen)
│   ├── csvService.ts          # CSV-Export für Energie-Logs
│   ├── deviceService.ts       # Gerät CRUD + State-Update
│   ├── energyService.ts       # Energie-Logs lesen
│   ├── inviteService.ts       # Raum-Einladungen (ruft Edge Functions auf)
│   ├── logService.ts          # Activity-Log schreiben & lesen
│   ├── mqttService.ts         # MQTT WebSocket-Client (Singleton)
│   ├── roomService.ts         # Raum CRUD + Mitglieder
│   ├── ruleService.ts         # Regel CRUD + checkAndExecuteRules
│   ├── sceneService.ts        # Szenen CRUD + activateScene
│   ├── scheduleService.ts     # Zeitplan CRUD + checkAndExecuteSchedules
│   ├── simulationService.ts   # Simulator-Logik
│   └── vacationModeService.ts # Urlaubsmodus CRUD + checkAndExecuteVacationMode
├── pages/                     # Seitenkomponenten (1:1 zu Routen)
└── components/                # Wiederverwendbare UI-Komponenten

sql/
├── db-scheme.txt              # Basis-Schema: rooms, room_members, devices, rules, schedules
├── activitylog.txt            # activity_logs Tabelle + RLS
├── energy-dashboard.txt       # energy_logs Tabelle + RLS
├── room-invites.txt           # room_invites Tabelle + RLS
├── rules.txt                  # Erweiterung rules: room_id, last_triggered_at, cool_down_ms
├── schedules.txt              # Erweiterung schedules: room_id, days[], action_value
├── scenes.txt                 # scenes Tabelle + RLS (FR-17)
├── scenes-multi-room.sql      # Migration: scene_rooms Junction-Tabelle (1:n Räume)
├── vacation-mode.txt          # vacation_mode Tabelle + RLS (FR-21)
├── vacation-mode-v2.txt       # Migration: vacation_mode 1:n Räume via rooms.vacation_mode_id
├── fix-scene-device-states.txt# Datenmigration: device_states mit korrektem "on"-Feld
└── seed-dummy-data.txt        # Testdaten für Entwicklung

supabase/functions/
├── room-invites/              # Edge Function: Einladungs-E-Mail versenden
└── create-room-with-member/   # Edge Function: Raum + Owner-Mitgliedschaft atomisch anlegen
```

### RLS-Zugriffsmatrix

| Tabelle         | SELECT              | INSERT              | UPDATE              | DELETE              |
|-----------------|---------------------|---------------------|---------------------|---------------------|
| rooms           | Mitglieder          | via Edge Function   | Mitglieder          | Owner               |
| room_members    | eigene Zeilen       | via Edge Function   | —                   | —                   |
| devices         | Raum-Mitglieder     | Raum-Mitglieder     | Raum-Mitglieder     | Raum-Mitglieder     |
| rules           | Raum-Mitglieder     | Raum-Mitglieder     | Raum-Mitglieder     | Raum-Mitglieder     |
| schedules       | Raum-Mitglieder     | Raum-Mitglieder     | Raum-Mitglieder     | Raum-Mitglieder     |
| scenes          | Raum-Mitglieder     | Owner               | Owner               | Owner               |
| scene_rooms     | authenticated       | authenticated       | —                   | authenticated       |
| vacation_mode   | authenticated       | authenticated       | Owner des Raums     | Owner des Raums     |
| activity_logs   | Raum-Mitglieder     | authenticated       | —                   | —                   |
| energy_logs     | Raum-Mitglieder     | authenticated       | —                   | —                   |
| room_invites    | Eingeladene/Owner   | Owner               | —                   | —                   |
