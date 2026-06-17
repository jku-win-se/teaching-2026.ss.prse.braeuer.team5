[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/mqttService](../README.md) / MqttConfig

# Interface: MqttConfig

Defined in: [services/mqttService.ts:12](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/mqttService.ts#L12)

Konfiguration für die MQTT-Broker-Verbindung.
Wird in `localStorage` unter dem Schlüssel `mqtt_config` persistiert.

## Properties

### brokerUrl

> **brokerUrl**: `string`

Defined in: [services/mqttService.ts:14](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/mqttService.ts#L14)

WebSocket-URL des Brokers (z. B. `"ws://localhost"`).

***

### clientId

> **clientId**: `string`

Defined in: [services/mqttService.ts:18](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/mqttService.ts#L18)

Eindeutige Client-ID für die MQTT-Session.

***

### password

> **password**: `string`

Defined in: [services/mqttService.ts:22](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/mqttService.ts#L22)

Passwort für die Broker-Authentifizierung (leer = anonym).

***

### port

> **port**: `number`

Defined in: [services/mqttService.ts:16](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/mqttService.ts#L16)

WebSocket-Port des Brokers (Standard: 9001).

***

### topicPrefix

> **topicPrefix**: `string`

Defined in: [services/mqttService.ts:24](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/mqttService.ts#L24)

Topic-Präfix für alle Geräte-Topics (z. B. `"smarthome"`).

***

### username

> **username**: `string`

Defined in: [services/mqttService.ts:20](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/mqttService.ts#L20)

Benutzername für die Broker-Authentifizierung (leer = anonym).
