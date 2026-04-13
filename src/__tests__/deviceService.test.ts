import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchDevices,
  addDeviceToRoom,
  deleteDevice,
  updateDeviceName,
  updateDeviceState,
} from '../services/deviceService';

// ---- Supabase Mock ----
const mockSingle = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();

// Chainable mock: jeder Aufruf gibt dasselbe Objekt zurück
const chainable = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
  single: mockSingle,
};
Object.values(chainable).forEach((fn) => (fn as ReturnType<typeof vi.fn>).mockReturnValue(chainable));

vi.mock('../config/supabaseClient', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: vi.fn(() => chainable),
  },
}));

// ---- Tests ----

describe('deviceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(chainable).forEach((fn) =>
      (fn as ReturnType<typeof vi.fn>).mockReturnValue(chainable)
    );
  });

  // --- fetchDevices ---
  describe('fetchDevices', () => {
    it('gibt Geräte-Array zurück wenn Supabase Daten liefert', async () => {
      const devices = [
        { id: '1', room_id: 'r1', name: 'Lampe', type: 'Schalter', state: {} },
      ];
      mockEq.mockResolvedValueOnce({ data: devices, error: null });

      const result = await fetchDevices('r1');
      expect(result).toEqual(devices);
    });

    it('gibt leeres Array zurück bei Datenbankfehler', async () => {
      mockEq.mockResolvedValueOnce({ data: null, error: { message: 'DB-Fehler' } });

      const result = await fetchDevices('r1');
      expect(result).toEqual([]);
    });

    it('gibt leeres Array zurück wenn data null ist', async () => {
      mockEq.mockResolvedValueOnce({ data: null, error: null });

      const result = await fetchDevices('r1');
      expect(result).toEqual([]);
    });
  });

  // --- addDeviceToRoom ---
  describe('addDeviceToRoom', () => {
    it('gibt das neue Gerät zurück bei Erfolg', async () => {
      const newDevice = { id: 'new-1', room_id: 'r1', name: 'Dimmer', type: 'Dimmer', state: {} };
      mockSingle.mockResolvedValueOnce({ data: newDevice, error: null });

      const result = await addDeviceToRoom('r1', 'Dimmer', 'Dimmer', 50);
      expect(result).toEqual(newDevice);
    });

    it('gibt null zurück und zeigt Alert bei Datenbankfehler', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Insert fehlgeschlagen' } });

      const result = await addDeviceToRoom('r1', 'Lampe', 'Schalter', null);
      expect(result).toBeNull();
      expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('Insert fehlgeschlagen'));
    });

    it('übergibt energy_consumption als null wenn nicht angegeben', async () => {
      const newDevice = { id: '2', room_id: 'r1', name: 'Test', type: 'Sensor', state: {} };
      mockSingle.mockResolvedValueOnce({ data: newDevice, error: null });

      await addDeviceToRoom('r1', 'Test', 'Sensor', null);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ energy_consumption: null })
      );
    });
  });

  // --- deleteDevice ---
  describe('deleteDevice', () => {
    it('gibt true zurück bei erfolgreichem Löschen', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      const result = await deleteDevice('device-1');
      expect(result).toBe(true);
    });

    it('gibt false zurück und zeigt Alert bei Fehler', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
      mockEq.mockResolvedValueOnce({ error: { message: 'Löschen fehlgeschlagen' } });

      const result = await deleteDevice('device-1');
      expect(result).toBe(false);
      expect(alertMock).toHaveBeenCalled();
    });
  });

  // --- updateDeviceName ---
  describe('updateDeviceName', () => {
    it('gibt true zurück bei erfolgreichem Update', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      const result = await updateDeviceName('device-1', 'Neuer Name');
      expect(result).toBe(true);
    });

    it('gibt false zurück und zeigt Alert bei Fehler', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
      mockEq.mockResolvedValueOnce({ error: { message: 'Update fehlgeschlagen' } });

      const result = await updateDeviceName('device-1', 'Neuer Name');
      expect(result).toBe(false);
      expect(alertMock).toHaveBeenCalled();
    });
  });

  // --- updateDeviceState ---
  // Kette: .update().eq().select() → select() ist der finale awaited Call
  describe('updateDeviceState', () => {
    it('gibt das aktualisierte Gerät zurück bei Erfolg', async () => {
      const updatedDevice = { id: 'device-1', state: { on: true, brightness: 80 } };
      mockSelect.mockResolvedValueOnce({ data: [updatedDevice], error: null });

      const result = await updateDeviceState('device-1', { on: true, brightness: 80 });
      expect(result).toEqual(updatedDevice);
    });

    it('gibt null zurück bei Fehler', async () => {
      mockSelect.mockResolvedValueOnce({ data: null, error: { message: 'State-Update fehlgeschlagen' } });

      const result = await updateDeviceState('device-1', { on: false });
      expect(result).toBeNull();
    });
  });
});
