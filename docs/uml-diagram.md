# Smart Home Orchestrator — UML Diagrams

## 1. Component Tree

```mermaid
graph TD
    main["main.tsx (BrowserRouter)"]
    App["App.tsx (useAuth · Route Guard)"]

    subgraph Unauthenticated
        Login["Login /login"]
        Register["Register /register"]
    end

    subgraph Authenticated
        Sidebar["Sidebar (NavLinks · useLocation)"]
        Dashboard["Dashboard /"]
        Rooms["Rooms /rooms (useRooms)"]
        RoomRow["RoomRow (useDeviceCount)"]
        Devices["Devices /room/:id (useDevices · useRoomRole)"]
        Notifications["Notifications /notifications"]
        Simulator["Simulator /simulator"]
        DeviceTypeSidebar["DeviceTypeSidebar (Drawer)"]
        DeviceCard["DeviceCard"]
        ToggleSwitch["ToggleSwitch"]
        AddModalDevice["AddModalDevice (Modal)"]
        DeleteModalDevices["DeleteModal (Geraet loeschen)"]
        DeleteModalRooms["DeleteModal (Raum loeschen)"]
        RoomMembers["RoomMembers (Mitglieder · Einladungen)"]
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

    Rooms --> RoomRow
    Rooms --> DeleteModalRooms

    Devices --> DeviceTypeSidebar
    Devices --> DeviceCard
    Devices --> AddModalDevice
    Devices --> DeleteModalDevices
    Devices --> RoomMembers
    DeviceCard --> ToggleSwitch
```

---

## 2. Service & Data Flow

```mermaid
graph LR
    subgraph Frontend["Frontend"]
        pages["Pages & Components\n(React)"]
        hooks["Hooks"]
        services["Services"]
        supabase["Supabase Client\n(Auth · DB)"]
    end

    subgraph Backend["Backend (Supabase)"]
        edgeFn["Edge Function\nroom-invites"]
        db[("DB")]
    end

    pages -->|"nutzen"| hooks
    hooks -->|"rufen auf"| services
    services -->|"Auth · Rooms · Devices"| supabase
    services -->|"Einladungen · Mitglieder"| edgeFn
    supabase <-->|"REST"| db
    edgeFn -->|"service role"| db
```

---

## 3. Routing

```mermaid
graph LR
    root["/"] --> Dashboard
    rooms["/rooms"] --> Rooms
    roomId["/room/:id"] --> Devices
    notifications["/notifications"] --> Notifications
    sim["/simulator"] --> Simulator
    login["/login"] --> Login
    register["/register"] --> Register
```
---


## 4. Datenbankschema (Supabase)

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
        int energy_consumption
        jsonb state
    }

    RULES {
        uuid id PK
        uuid device_id FK
        text name
        jsonb condition
        jsonb action
        boolean is_active
    }

    SCHEDULES {
        uuid id PK
        uuid device_id FK
        text name
        timestamptz time
        jsonb action
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

    AUTH_USERS {
        uuid id PK
    }

    AUTH_USERS ||--|{ ROOM_MEMBERS : "has"
    AUTH_USERS ||--|{ ROOM_INVITES : "sends"
    ROOMS ||--|{ ROOM_MEMBERS : "has"
    ROOMS ||--|{ DEVICES : "contains"
    ROOMS ||--|{ ROOM_INVITES : "has"
    DEVICES ||--|{ RULES : "has"
    DEVICES ||--|{ SCHEDULES : "has"
```
---

## 5. Data Model

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
        +String? position
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

    class RoomMember {
        +String user_id
        +RoomRole role
        +String email
    }

    class RoomInvite {
        +String id
        +String room_id
        +String room_name
        +String email
        +String role
        +String status
        +String? expires_at
        +String? accepted_at
        +String created_at
    }

    Room "1" --> "0..*" Device : contains
    Room "1" --> "0..*" RoomMembership : has
    Room "1" --> "0..*" RoomInvite : has
    RoomMembership --> RoomRole : role
    RoomMember --> RoomRole : role
    Room --> RoomRole : role
    Device --> DeviceType : type
    Device --> DeviceState : state
```





