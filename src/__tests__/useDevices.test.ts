import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDevices } from '../hooks/useDevices';

// ---- Service-Mock ----
vi.mock('../services/deviceService', () => ({
  fetchDevices: vi.fn(),
  addDeviceToRoom: vi.fn(),
  deleteDevice: vi.fn(),
  updateDeviceName: vi.fn(),
  updateDeviceState: vi.fn(),
}));

import {
  fetchDevices,
  addDeviceToRoom,
  deleteDevice,
  updateDeviceName,
  updateDeviceState,
} from '../services/deviceService';

const mockFetchDevices = vi.mocked(fetchDevices);
const mockAddDeviceToRoom = vi.mocked(addDeviceToRoom);
const mockDeleteDevice = vi.mocked(deleteDevice);
const mockUpdateDeviceName = vi.mocked(updateDeviceName);
const mockUpdateDeviceState = vi.mocked(updateDeviceState);

// Beispiel-Gerät
const baseDevice = {
  id: 'device-1',
  room_id: 'room-1',
  name: 'Deckenlampe',
  type: 'Schalter' as const,
  state: { on: false },
};

describe('useDevices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchDevices.mockResolvedValue([baseDevice]);
  });

  // --- Initialisierung ---
  it('lädt Geräte beim Mounten und setzt loading korrekt', async () => {
    const { result } = renderHook(() => useDevices('room-1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.devices).toEqual([baseDevice]);
    expect(mockFetchDevices).toHaveBeenCalledWith('room-1');
  });

  it('lädt keine Geräte wenn roomId undefined ist', () => {
    renderHook(() => useDevices(undefined));
    expect(mockFetchDevices).not.toHaveBeenCalled();
  });

  // --- addDevice ---
  it('fügt neues Gerät zum State hinzu bei Erfolg', async () => {
    const newDevice = { ...baseDevice, id: 'device-2', name: 'Stehlampe' };
    mockAddDeviceToRoom.mockResolvedValueOnce(newDevice);

    const { result } = renderHook(() => useDevices('room-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addDevice('Stehlampe', 'Schalter', null);
    });

    expect(result.current.devices).toHaveLength(2);
    expect(result.current.devices[1].name).toBe('Stehlampe');
  });

  it('ändert State nicht wenn addDeviceToRoom null zurückgibt', async () => {
    mockAddDeviceToRoom.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useDevices('room-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addDevice('Fehler-Gerät', 'Schalter', null);
    });

    expect(result.current.devices).toHaveLength(1);
  });

  // --- removeDevice ---
  it('entfernt Gerät aus State bei erfolgreichem Löschen', async () => {
    mockDeleteDevice.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useDevices('room-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeDevice('device-1');
    });

    expect(result.current.devices).toHaveLength(0);
  });

  it('behält Gerät im State wenn Löschen fehlschlägt', async () => {
    mockDeleteDevice.mockResolvedValueOnce(false);

    const { result } = renderHook(() => useDevices('room-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeDevice('device-1');
    });

    expect(result.current.devices).toHaveLength(1);
  });

  // --- renameDevice ---
  it('aktualisiert Gerätename im State bei Erfolg', async () => {
    mockUpdateDeviceName.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useDevices('room-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.renameDevice('device-1', 'Neuer Name');
    });

    expect(result.current.devices[0].name).toBe('Neuer Name');
  });

  it('behält alten Namen wenn Update fehlschlägt', async () => {
    mockUpdateDeviceName.mockResolvedValueOnce(false);

    const { result } = renderHook(() => useDevices('room-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.renameDevice('device-1', 'Neuer Name');
    });

    expect(result.current.devices[0].name).toBe('Deckenlampe');
  });

  // --- toggleDevice ---
  it('aktualisiert on-State optimistisch und ruft Service auf', async () => {
    mockUpdateDeviceState.mockResolvedValueOnce({ ...baseDevice, state: { on: true } });

    const { result } = renderHook(() => useDevices('room-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleDevice('device-1', true);
    });

    expect(result.current.devices[0].state?.on).toBe(true);
    expect(mockUpdateDeviceState).toHaveBeenCalledWith('device-1', { on: true });
  });

  // --- changeDeviceState ---
  it('merged neuen State mit bestehendem State', async () => {
    const dimmerDevice = { ...baseDevice, type: 'Dimmer' as const, state: { on: true, brightness: 50 } };
    mockFetchDevices.mockResolvedValueOnce([dimmerDevice]);
    mockUpdateDeviceState.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useDevices('room-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.changeDeviceState('device-1', { brightness: 80 });
    });

    expect(result.current.devices[0].state?.brightness).toBe(80);
    // on bleibt erhalten
    expect(result.current.devices[0].state?.on).toBe(true);
    expect(mockUpdateDeviceState).toHaveBeenCalledWith('device-1', { on: true, brightness: 80 });
  });
});
