[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [hooks/useMqtt](../README.md) / useMqtt

# Function: useMqtt()

> **useMqtt**(): `object`

Defined in: [hooks/useMqtt.ts:18](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useMqtt.ts#L18)

React-Hook zur Verwaltung der MQTT-Verbindung.

Abonniert Statusänderungen des [mqttService](../../../services/mqttService/variables/mqttService.md)-Singletons und
stellt Funktionen zum Verbinden und Trennen bereit.
Die Statussubscription wird beim Unmount automatisch bereinigt.

## Returns

- `config` – Aktuelle [MqttConfig](../../../services/mqttService/interfaces/MqttConfig.md) (aus `localStorage` geladen)
- `status` – Aktueller [MqttConnectionStatus](../../../services/mqttService/type-aliases/MqttConnectionStatus.md)
- `lastError` – Letzte Fehlermeldung oder `null`
- `saveAndConnect` – Speichert die Konfiguration und stellt eine Verbindung her
- `disconnect` – Trennt die aktive MQTT-Verbindung

### config

> **config**: [`MqttConfig`](../../../services/mqttService/interfaces/MqttConfig.md)

### disconnect

> **disconnect**: () => `void`

Trennt die aktive MQTT-Verbindung.

#### Returns

`void`

### lastError

> **lastError**: `string` \| `null`

### saveAndConnect

> **saveAndConnect**: (`configToUse`) => `void`

Speichert die Konfiguration in `localStorage` und baut eine neue Verbindung auf.

#### Parameters

##### configToUse

[`MqttConfig`](../../../services/mqttService/interfaces/MqttConfig.md)

Neue Broker-Konfiguration.

#### Returns

`void`

### status

> **status**: [`MqttConnectionStatus`](../../../services/mqttService/type-aliases/MqttConnectionStatus.md)
