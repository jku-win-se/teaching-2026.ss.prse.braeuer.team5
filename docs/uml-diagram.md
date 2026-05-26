# Smart Home Orchestrator — UML Diagrams

## 1. Component Tree

```mermaid
graph TD
    main["main.tsx (BrowserRouter)"]
    App["App.tsx (useAuth · useScheduleExecution)"]

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

        DeviceTypeSidebar["DeviceTypeSidebar (Drawer)"]
        DeviceCard["DeviceCard"]
        RoomMembers["RoomMembers"]
        AddModalDevice["AddModalDevice"]
        DeleteModalDevices["DeleteModal (Gerät löschen)"]
        DeleteModalRooms["DeleteModal (Raum löschen)"]
        Schedules["Schedules"]
        Rules["Rules"]
        RuleList["RuleList"]
        RuleFormModal["RuleFormModal"]
        RuleActionOverlay["RuleActionOverlay (Overlay)"]
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

    Rooms --> RoomRow
    Rooms --> DeleteModalRooms

    Devices --> DeviceTypeSidebar
    Devices --> DeviceCard
    Devices --> RoomMembers
    Devices --> AddModalDevice
    Devices --> DeleteModalDevices

    SchedulesPage --> Schedules
    RulesPage --> Rules
    Rules --> RuleList
    Rules --> RuleFormModal
    Rules --> RuleActionOverlay
```

---

## 2. Service & Data Flow

```mermaid
graph LR
    subgraph Frontend["Frontend"]
        Pages["Pages & Components\n(React)"]
        Hooks["Hooks\nuseAuth · useDevices · useRoomRole · useRooms · useRules · useSchedules"]
        AppHook["useScheduleExecution\n(Interval + first run)"]
        Services["Services\n(scheduleService · logService · conflictService)"]
        SupabaseClient["Supabase Client\n(Auth · DB)"]
        EventBus["EventBus / AppEventEmitter"]
    end

    subgraph Backend["Backend (Supabase)"]
        EdgeFns["Edge Functions\nroom-invites · create-room-with-member"]
        DB[("DB")]
    end

    Pages --> Hooks
    Hooks --> Services
    AppHook --> Services
    Services --> SupabaseClient
    Services --> EventBus
    EventBus --> Services
    SupabaseClient <-->|"REST"| DB
    EdgeFns -->|"service role / invocations"| DB
```

---

## 3. Datenbankschema (Supabase)

```mermaid
erDiagram
    ROOMS {
        uuid id PK
        text name
        timestamptz created_at
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

    AUTH_USERS ||--|{ ROOM_MEMBERS : "has"
    AUTH_USERS ||--|{ ROOM_INVITES : "sends"
    AUTH_USERS ||--o{ ACTIVITY_LOGS : "triggers"
    ROOMS ||--|{ ROOM_MEMBERS : "has"
    ROOMS ||--|{ DEVICES : "contains"
    ROOMS ||--|{ ROOM_INVITES : "has"
    ROOMS ||--o{ RULES : "has"
    ROOMS ||--|{ SCHEDULES : "has"
    ROOMS ||--o{ ACTIVITY_LOGS : "logs"
    DEVICES ||--o{ RULES : "has"
    DEVICES ||--|{ SCHEDULES : "has"
    DEVICES ||--o{ ACTIVITY_LOGS : "logs"
    DEVICES ||--|{ ENERGY_LOGS : "logs"
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
    RoomMembership --> RoomRole : role
    Device --> DeviceType : type
    Device --> DeviceState : state
    Rule --> RuleCondition : condition
    Rule --> RuleAction : action
    RuleAction --> DeviceState : state
    RuleCondition --> TriggerOperator : operator
    Schedule --> DeviceState : action_value
```





