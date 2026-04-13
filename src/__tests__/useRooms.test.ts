import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRooms } from '../hooks/useRooms';

// ---- Service-Mock ----
vi.mock('../services/roomService', () => ({
  fetchRooms: vi.fn(),
  addToRoomTable: vi.fn(),
  updateRoomInTable: vi.fn(),
  deleteRoomFromTable: vi.fn(),
}));

import {
  fetchRooms,
  addToRoomTable,
  updateRoomInTable,
  deleteRoomFromTable,
} from '../services/roomService';

const mockFetchRooms = vi.mocked(fetchRooms);
const mockAddToRoomTable = vi.mocked(addToRoomTable);
const mockUpdateRoomInTable = vi.mocked(updateRoomInTable);
const mockDeleteRoomFromTable = vi.mocked(deleteRoomFromTable);

const baseRoom = { id: 'room-1', name: 'Wohnzimmer' };

describe('useRooms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchRooms.mockResolvedValue([baseRoom]);
  });

  // --- Initialisierung ---
  it('lädt Räume beim Mounten', async () => {
    const { result } = renderHook(() => useRooms());

    await waitFor(() => expect(result.current.rooms).toHaveLength(1));

    expect(result.current.rooms[0]).toEqual(baseRoom);
    expect(mockFetchRooms).toHaveBeenCalledOnce();
  });

  it('startet mit leerem Array', () => {
    const { result } = renderHook(() => useRooms());
    expect(result.current.rooms).toEqual([]);
  });

  // --- addRoom ---
  it('fügt neuen Raum hinzu und gibt true zurück bei Erfolg', async () => {
    mockAddToRoomTable.mockResolvedValueOnce('room-2');

    const { result } = renderHook(() => useRooms());
    await waitFor(() => expect(result.current.rooms).toHaveLength(1));

    let success: boolean = false;
    await act(async () => {
      success = await result.current.addRoom('Schlafzimmer');
    });

    expect(success).toBe(true);
    expect(result.current.rooms).toHaveLength(2);
    expect(result.current.rooms[1]).toEqual({ id: 'room-2', name: 'Schlafzimmer' });
  });

  it('gibt false zurück und ändert State nicht wenn addToRoomTable null zurückgibt', async () => {
    mockAddToRoomTable.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useRooms());
    await waitFor(() => expect(result.current.rooms).toHaveLength(1));

    let success: boolean = true;
    await act(async () => {
      success = await result.current.addRoom('Fehler-Raum');
    });

    expect(success).toBe(false);
    expect(result.current.rooms).toHaveLength(1);
  });

  // --- updateRoom ---
  it('aktualisiert Raumnamen im State bei Erfolg', async () => {
    mockUpdateRoomInTable.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useRooms());
    await waitFor(() => expect(result.current.rooms).toHaveLength(1));

    await act(async () => {
      await result.current.updateRoom('room-1', 'Neuer Name');
    });

    expect(result.current.rooms[0].name).toBe('Neuer Name');
  });

  it('behält alten Namen wenn Update fehlschlägt', async () => {
    mockUpdateRoomInTable.mockResolvedValueOnce(false);

    const { result } = renderHook(() => useRooms());
    await waitFor(() => expect(result.current.rooms).toHaveLength(1));

    await act(async () => {
      await result.current.updateRoom('room-1', 'Neuer Name');
    });

    expect(result.current.rooms[0].name).toBe('Wohnzimmer');
  });

  // --- deleteRoom ---
  it('entfernt Raum aus State und gibt true zurück bei Erfolg', async () => {
    mockDeleteRoomFromTable.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useRooms());
    await waitFor(() => expect(result.current.rooms).toHaveLength(1));

    let success: boolean = false;
    await act(async () => {
      success = await result.current.deleteRoom('room-1');
    });

    expect(success).toBe(true);
    expect(result.current.rooms).toHaveLength(0);
  });

  it('behält Raum im State und gibt false zurück wenn Löschen fehlschlägt', async () => {
    mockDeleteRoomFromTable.mockResolvedValueOnce(false);

    const { result } = renderHook(() => useRooms());
    await waitFor(() => expect(result.current.rooms).toHaveLength(1));

    let success: boolean = true;
    await act(async () => {
      success = await result.current.deleteRoom('room-1');
    });

    expect(success).toBe(false);
    expect(result.current.rooms).toHaveLength(1);
  });

  it('löscht nur den richtigen Raum wenn mehrere vorhanden', async () => {
    const room2 = { id: 'room-2', name: 'Küche' };
    mockFetchRooms.mockResolvedValueOnce([baseRoom, room2]);
    mockDeleteRoomFromTable.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useRooms());
    await waitFor(() => expect(result.current.rooms).toHaveLength(2));

    await act(async () => {
      await result.current.deleteRoom('room-1');
    });

    expect(result.current.rooms).toHaveLength(1);
    expect(result.current.rooms[0].id).toBe('room-2');
  });
});
