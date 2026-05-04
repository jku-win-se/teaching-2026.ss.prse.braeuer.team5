import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRules } from "../hooks/useRules";

vi.mock("../services/ruleService", () => ({
  ruleService: {
    fetchAllRules: vi.fn(),
  },
}));

const { mockFrom, mockSelect } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockSelect: vi.fn(),
}));

vi.mock("../config/supabaseClient", () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: mockFrom,
  },
}));

import { ruleService } from "../services/ruleService";

const mockFetchAllRules = vi.mocked(ruleService.fetchAllRules);

const sampleRules = [
  { id: "rule-1", name: "Hitze-Alarm", is_active: true },
];
const sampleDevices = [
  { id: "dev-1", name: "Thermostat", type: "Thermostat", room_id: "room-1" },
];

describe("useRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchAllRules.mockResolvedValue(sampleRules);
    mockSelect.mockResolvedValue({ data: sampleDevices, error: null });
    mockFrom.mockReturnValue({ select: mockSelect });
  });

  it("lädt Regeln und Geräte beim Mounten", async () => {
    const { result } = renderHook(() => useRules());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.rules).toEqual(sampleRules);
    expect(result.current.devices).toEqual(sampleDevices);
    expect(mockFetchAllRules).toHaveBeenCalledOnce();
  });

  it("startet im loading-Zustand", () => {
    mockFetchAllRules.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useRules());
    expect(result.current.loading).toBe(true);
    expect(result.current.rules).toEqual([]);
  });

  it("refresh lädt Daten neu", async () => {
    const { result } = renderHook(() => useRules());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockFetchAllRules.mockResolvedValueOnce([...sampleRules, { id: "rule-2", name: "Neue Regel" }]);
    mockSelect.mockResolvedValueOnce({ data: sampleDevices, error: null });

    await result.current.refresh();

    await waitFor(() => expect(result.current.rules).toHaveLength(2));
  });

  it("behandelt Fehler beim Laden ohne Absturz", async () => {
    mockFetchAllRules.mockRejectedValueOnce(new Error("DB-Fehler"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useRules());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.rules).toEqual([]);
    consoleSpy.mockRestore();
  });
});
