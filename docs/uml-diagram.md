# Smart Home Orchestrator — UML Diagrams

## 1. Component Tree

```mermaid
graph TD
    main["main.tsx\n(BrowserRouter)"]
    App["App.tsx\n(Routes)"]
    Sidebar["Sidebar\n(NavLinks)"]
    Dashboard["Dashboard\n/"]
    Rooms["Rooms\n/rooms"]
    Devices["Devices\n/rooms/:roomId"]
    Simulator["Simulator\n/simulator"]
    DeviceTypeSidebar["DeviceTypeSidebar\n(Drawer)"]
    DeviceCard["DeviceCard"]
    ToggleSwitch["ToggleSwitch"]
    AddModalDevice["AddModalDevice\n(Modal)"]
    DeleteModalDevices["DeleteModal\n(Gerät löschen)"]
    DeleteModalRooms["DeleteModal\n(Raum löschen)"]

    main --> App
    App --> Sidebar
    App --> Dashboard
    App --> Rooms
    App --> Devices
    App --> Simulator

    Rooms --> DeleteModalRooms

    Devices --> DeviceTypeSidebar
    Devices --> DeviceCard
    Devices --> AddModalDevice
    Devices --> DeleteModalDevices
    DeviceCard --> ToggleSwitch
```

---

## 2. Data Model

```mermaid
classDiagram
    class Room {
        +String id
        +String name
        +String created_at
    }

    class Device {
        +String id
        +String room_id
        +String name
        +DeviceType type
        +Number energy_consumption
        +Record state
    }

    class DeviceType {
        <<enumeration>>
        Schalter
        Dimmer
        Thermostat
        Sensor
        Jalousie
    }

    Room "1" --> "0..*" Device : contains
    Device --> DeviceType : is of
```

---

## 3. Service & Data Flow

```mermaid
graph LR
    subgraph Pages
        Rooms["Rooms"]
        Devices["Devices"]
    end

    subgraph Services
        roomSvc["roomService"]
        deviceSvc["deviceService"]
    end

    subgraph Backend
        supabase["supabaseClient\n(Supabase)"]
        db[("Supabase DB\nrooms / devices")]
    end

    Rooms -->|"fetchRooms()\naddToRoomTable()\ndeleteRoomFromTable()\nupdateRoomInTable()\nfetchNumberOfDevicesInRoom()"| roomSvc
    Devices -->|"fetchDevices()\naddDeviceToRoom()\ndeleteDevice()\nupdateDeviceName()"| deviceSvc

    roomSvc --> supabase
    deviceSvc --> supabase
    supabase <--> db
```

---

## 4. Routing

```mermaid
graph LR
    root["/"] --> Dashboard
    rooms["/rooms"] --> Rooms
    roomId["/rooms/:roomId"] --> Devices
    sim["/simulator"] --> Simulator
```

---
