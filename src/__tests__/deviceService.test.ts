import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchDevices,
  addDeviceToRoom,
  deleteDevice,
  updateDeviceName,
  updateDeviceState,
} from "../services/deviceService";

const {
  mockSingle,
  mockSelect,
  mockInsert,
  mockUpdate,
  mockDelete,
  mockEq,
  mockFrom,
  mockFetchRoomRole,
  mockGetUser,
} = vi.hoisted(() => ({
  mockSingle: vi.fn(),
  mockSelect: vi.fn(),
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
  mockEq: vi.fn(),
  mockFrom: vi.fn(),
  mockFetchRoomRole: vi.fn(),
  mockGetUser: vi.fn(),
}));

const chainable = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
  single: mockSingle,
};

Object.values(chainable).forEach((fn) => (fn as ReturnType<typeof vi.fn>).mockReturnValue(chainable));

vi.mock("../config/supabaseClient", () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: mockFrom,
    auth: {
      getUser: mockGetUser,
    },
  },
}));

vi.mock("../services/roomService", () => ({
  fetchRoomRole: mockFetchRoomRole,
}));

describe("deviceService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    Object.values(chainable).forEach((fn) => (fn as ReturnType<typeof vi.fn>).mockReturnValue(chainable));
    mockFrom.mockReturnValue(chainable);
    mockFetchRoomRole.mockResolvedValue("owner");
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  describe("fetchDevices", () => {
    it("gibt Geräte-Array zurück wenn Supabase Daten liefert", async () => {
      const devices = [
        { id: "1", room_id: "r1", name: "Lampe", type: "Schalter", state: {} },
      ];
      mockEq.mockResolvedValueOnce({ data: devices, error: null });

      const result = await fetchDevices("r1");
      expect(result).toEqual(devices);
    });

    it("gibt leeres Array zurück bei Datenbankfehler", async () => {
      mockEq.mockResolvedValueOnce({ data: null, error: { message: "DB-Fehler" } });

      const result = await fetchDevices("r1");
      expect(result).toEqual([]);
    });

    it("gibt leeres Array zurück wenn data null ist", async () => {
      mockEq.mockResolvedValueOnce({ data: null, error: null });

      const result = await fetchDevices("r1");
      expect(result).toEqual([]);
    });
  });

  describe("addDeviceToRoom", () => {
    it("gibt das neue Gerät zurück bei Erfolg", async () => {
      const newDevice = { id: "new-1", room_id: "r1", name: "Dimmer", type: "Dimmer", state: {} };
      mockSingle.mockResolvedValueOnce({ data: newDevice, error: null });

      const result = await addDeviceToRoom("r1", "Dimmer", "Dimmer", 50);
      expect(result).toEqual(newDevice);
      expect(mockFetchRoomRole).toHaveBeenCalledWith("r1", "user-123");
    });

    it("gibt null zurück und zeigt Alert bei Datenbankfehler", async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: "Insert fehlgeschlagen" } });

      const result = await addDeviceToRoom("r1", "Lampe", "Schalter", null);
      expect(result).toBeNull();
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Insert fehlgeschlagen"));
    });

    it("übergibt energy_consumption als null wenn nicht angegeben", async () => {
      const newDevice = { id: "2", room_id: "r1", name: "Test", type: "Sensor", state: {} };
      mockSingle.mockResolvedValueOnce({ data: newDevice, error: null });

      await addDeviceToRoom("r1", "Test", "Sensor", null);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ energy_consumption: null })
      );
    });
  });

  describe("deleteDevice", () => {
    it("gibt true zurück bei erfolgreichem Löschen", async () => {
      mockSingle.mockResolvedValueOnce({ data: { room_id: "r1" }, error: null });
      mockEq.mockReturnValueOnce(chainable).mockResolvedValueOnce({ error: null });

      const result = await deleteDevice("device-1");
      expect(result).toBe(true);
      expect(mockFetchRoomRole).toHaveBeenCalledWith("r1", "user-123");
    });

    it("gibt false zurück und zeigt Alert bei Fehler", async () => {
      mockSingle.mockResolvedValueOnce({ data: { room_id: "r1" }, error: null });
      mockEq.mockReturnValueOnce(chainable).mockResolvedValueOnce({ error: { message: "Löschen fehlgeschlagen" } });

      const result = await deleteDevice("device-1");
      expect(result).toBe(false);
      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe("updateDeviceName", () => {
    it("gibt true zurück bei erfolgreichem Update", async () => {
      mockSingle.mockResolvedValueOnce({ data: { room_id: "r1" }, error: null });
      mockEq.mockReturnValueOnce(chainable).mockResolvedValueOnce({ error: null });

      const result = await updateDeviceName("device-1", "Neuer Name");
      expect(result).toBe(true);
      expect(mockFetchRoomRole).toHaveBeenCalledWith("r1", "user-123");
    });

    it("gibt false zurück und zeigt Alert bei Fehler", async () => {
      mockSingle.mockResolvedValueOnce({ data: { room_id: "r1" }, error: null });
      mockEq.mockReturnValueOnce(chainable).mockResolvedValueOnce({ error: { message: "Update fehlgeschlagen" } });

      const result = await updateDeviceName("device-1", "Neuer Name");
      expect(result).toBe(false);
      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe("updateDeviceState", () => {
    it("gibt das aktualisierte Gerät zurück bei Erfolg", async () => {
      const updatedDevice = { id: "device-1", state: { on: true, brightness: 80 } };
      mockSelect.mockResolvedValueOnce({ data: [updatedDevice], error: null });

      const result = await updateDeviceState("device-1", { on: true, brightness: 80 });
      expect(result).toEqual(updatedDevice);
    });

    it("gibt null zurück bei Fehler", async () => {
      mockSelect.mockResolvedValueOnce({ data: null, error: { message: "State-Update fehlgeschlagen" } });

      const result = await updateDeviceState("device-1", { on: false });
      expect(result).toBeNull();
    });
  });
});
