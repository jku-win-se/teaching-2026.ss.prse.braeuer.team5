# Issue #42 — FR-18 MQTT-Integration

## Ziel
Optionale MQTT-Schnittstelle bereitstellen, damit reale IoT-Geräte angebunden werden können.
Das bestehende virtuelle Modell wird nicht verändert.

## Entscheidungen
- **Package:** `mqtt` v5 (MQTT.js, Browser WebSocket-Support, kein separates `@types/mqtt` nötig)
- **Transport:** WebSocket (`ws://` oder `wss://`) — einzige Browser-kompatible Option
- **Config:** localStorage — kein neues DB-Schema nötig
- **Kein circular dependency:** `mqttService` importiert `updateDeviceState` (deviceService),
  deviceService importiert `mqttService` NICHT. Publish aus der App ist manuell/optional.

## Topic-Konvention
```
<prefix>/devices/<device_id>/state  ← eingehend: Gerätestatus von realem Gerät
<prefix>/devices/<device_id>/set    ← ausgehend: Befehl an reales Gerät
```
Standard-Prefix: `smarthome`

## Dateien
- `src/services/mqttService.ts` — Service-Singleton (connect/disconnect/subscribe/publish)
- `src/hooks/useMqtt.ts` — React Hook für Status + Config
- `src/components/mqtt/MqttSettings.tsx` + `MqttSettings.css` — Einstellungs-UI
- `src/pages/MqttSettingsPage.tsx` — Seite
- `src/App.tsx` — Route `/mqtt`
- `src/components/sidebar/Sidebar.tsx` — Nav-Link
- `src/__tests__/mqttService.test.ts` — Unit Tests

## Offene Fragen
- Welcher MQTT-Broker soll standardmäßig vorkonfiguriert sein? (Aktuell: localhost:9001)
- Bidirektionale Sync (App → MQTT publish bei Gerätewechsel) — späteres Ticket?
