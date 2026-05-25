import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUpdateDeviceState, mockMqttConnect, mockMqttClient } = vi.hoisted(() => {
  const client = {
    on: vi.fn(),
    end: vi.fn(),
    subscribe: vi.fn(),
    publish: vi.fn(),
  };
  return {
    mockUpdateDeviceState: vi.fn(),
    mockMqttConnect: vi.fn(() => client),
    mockMqttClient: client,
  };
});

vi.mock("../services/deviceService", () => ({
  updateDeviceState: mockUpdateDeviceState,
}));

vi.mock("mqtt", () => ({
  default: {
    connect: mockMqttConnect,
  },
}));

import mqtt from "mqtt";
import { mqttService, DEFAULT_MQTT_CONFIG, type MqttConfig } from "../services/mqttService";

const TEST_CONFIG: MqttConfig = {
  brokerUrl: "ws://test-broker",
  port: 1883,
  clientId: "test-client",
  username: "user",
  password: "pass",
  topicPrefix: "smarthome",
};

describe("mqttService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMqttClient.on.mockReset();
    mockMqttConnect.mockReturnValue(mockMqttClient);
    mqttService.disconnect();
    localStorage.clear();
  });

  it("loadConfig liefert DEFAULT_MQTT_CONFIG wenn localStorage leer", () => {
    const config = mqttService.loadConfig();
    expect(config.brokerUrl).toBe(DEFAULT_MQTT_CONFIG.brokerUrl);
    expect(config.port).toBe(DEFAULT_MQTT_CONFIG.port);
    expect(config.topicPrefix).toBe(DEFAULT_MQTT_CONFIG.topicPrefix);
  });

  it("saveConfig und loadConfig round-trip", () => {
    mqttService.saveConfig(TEST_CONFIG);
    const loaded = mqttService.loadConfig();
    expect(loaded.brokerUrl).toBe(TEST_CONFIG.brokerUrl);
    expect(loaded.port).toBe(TEST_CONFIG.port);
    expect(loaded.clientId).toBe(TEST_CONFIG.clientId);
  });

  it("onStatusChange listener wird bei connect aufgerufen", () => {
    const listener = vi.fn();
    const unsub = mqttService.onStatusChange(listener);

    mqttService.connect(TEST_CONFIG);

    expect(listener).toHaveBeenCalledWith("connecting");
    expect(mqtt.connect).toHaveBeenCalledWith(
      "ws://test-broker:1883",
      expect.objectContaining({ clientId: "test-client" })
    );

    unsub();
  });

  it("onStatusChange unsubscribe entfernt listener", () => {
    const listener = vi.fn();
    const unsub = mqttService.onStatusChange(listener);
    unsub();

    mqttService.connect(TEST_CONFIG);
    expect(listener).not.toHaveBeenCalledWith("connecting");
  });

  it("status ist 'disconnected' nach disconnect", () => {
    expect(mqttService.status).toBe("disconnected");
  });

  it("publishDeviceState tut nichts wenn nicht verbunden", () => {
    mqttService.publishDeviceState("device-1", { on: true });
    expect(mockMqttClient.publish).not.toHaveBeenCalled();
  });

  it("connect ruft mqtt.connect mit korrekter URL auf", () => {
    mqttService.connect(TEST_CONFIG);
    expect(mqtt.connect).toHaveBeenCalledWith(
      "ws://test-broker:1883",
      expect.objectContaining({
        clientId: "test-client",
        username: "user",
        password: "pass",
        reconnectPeriod: 0,
      })
    );
  });

  it("connect ohne username/password übergibt undefined statt leerem String", () => {
    mqttService.connect({ ...TEST_CONFIG, username: "", password: "" });
    expect(mqtt.connect).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ username: undefined, password: undefined })
    );
  });

  it("handleMessage aktualisiert Gerätezustand bei gültigem Payload", async () => {
    mockUpdateDeviceState.mockResolvedValue(undefined);

    let messageHandler: ((topic: string, payload: Buffer) => void) | null = null;
    mockMqttClient.on.mockImplementation((event: string, handler: unknown) => {
      if (event === "message") {
        messageHandler = handler as (topic: string, payload: Buffer) => void;
      }
    });

    mqttService.connect(TEST_CONFIG);
    expect(messageHandler).not.toBeNull();

    const payload = Buffer.from(JSON.stringify({ on: true, brightness: 75 }));
    await messageHandler!("smarthome/devices/device-42/state", payload);

    expect(mockUpdateDeviceState).toHaveBeenCalledWith(
      "device-42",
      { on: true, brightness: 75 }
    );
  });

  it("handleMessage ignoriert Topics mit falschem Format", async () => {
    let messageHandler: ((topic: string, payload: Buffer) => void) | null = null;
    mockMqttClient.on.mockImplementation((event: string, handler: unknown) => {
      if (event === "message") messageHandler = handler as typeof messageHandler;
    });

    mqttService.connect(TEST_CONFIG);

    const payload = Buffer.from(JSON.stringify({ on: true }));
    await messageHandler!("smarthome/other/device-42/state", payload);
    await messageHandler!("smarthome/devices/device-42/set", payload);
    await messageHandler!("smarthome/devices/a/b/state", payload);

    expect(mockUpdateDeviceState).not.toHaveBeenCalled();
  });

  it("handleMessage ignoriert ungültigen JSON-Payload", async () => {
    let messageHandler: ((topic: string, payload: Buffer) => void) | null = null;
    mockMqttClient.on.mockImplementation((event: string, handler: unknown) => {
      if (event === "message") messageHandler = handler as typeof messageHandler;
    });

    mqttService.connect(TEST_CONFIG);

    const badPayload = Buffer.from("not-json");
    await messageHandler!("smarthome/devices/device-42/state", badPayload);

    expect(mockUpdateDeviceState).not.toHaveBeenCalled();
  });
});
