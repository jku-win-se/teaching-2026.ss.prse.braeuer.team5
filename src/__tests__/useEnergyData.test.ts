import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { Mock } from 'vitest'

const { mockFrom, mockDevicesSelect, mockLogsSelect, mockLogsGt, mockSupabaseRef } = vi.hoisted(
  () => ({
    mockFrom: vi.fn(),
    mockDevicesSelect: vi.fn(),
    mockLogsSelect: vi.fn(),
    mockLogsGt: vi.fn(),
    mockSupabaseRef: { current: null as unknown },
  })
)

vi.mock('../config/supabaseClient', () => ({
  get supabase() {
    return mockSupabaseRef.current as { from: typeof mockFrom } | null
  },
}))

import { useEnergyData } from '../hooks/useEnergyData'

describe('useEnergyData', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockFrom.mockImplementation((table: string) => {
      if (table === 'devices') {
        return { select: mockDevicesSelect }
      }
      if (table === 'energy_logs') {
        return { select: mockLogsSelect }
      }
      return { select: vi.fn() }
    })

    mockLogsSelect.mockReturnValue({ gt: mockLogsGt })
    mockSupabaseRef.current = { from: mockFrom }
  })

  it('berechnet Tagesstatistiken aus Devices und History', async () => {
    ;(mockDevicesSelect as Mock).mockResolvedValueOnce({
      data: [
        { id: 'd1', name: 'Lampe', state: { on: true }, energy_consumption: 100, rooms: { name: 'Kueche' } },
        { id: 'd2', name: 'Heizung', state: 'off', energy_consumption: 50, rooms: { name: 'Wohnzimmer' } },
      ],
    })
    ;(mockLogsGt as Mock).mockResolvedValueOnce({
      data: [
        {
          consumption_watt: 20,
          created_at: '2026-05-05T08:30:00.000Z',
          devices: { name: 'Lampe', rooms: { name: 'Kueche' } },
        },
      ],
    })

    const { result } = renderHook(() => useEnergyData('day'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.totalLive).toBe(100)
    expect(result.current.byRoom).toEqual({ Kueche: 100, Wohnzimmer: 50 })
    expect(result.current.historyChart).toHaveLength(6)
    expect(result.current.roomCharts.Kueche).toBeDefined()
    expect(result.current.deviceCharts.Lampe).toBeDefined()
    expect(result.current.byDevice[0].isActive).toBe(true)
    expect(result.current.byDevice[1].isActive).toBe(false)
  })

  it('berechnet Wochenansicht mit 7 Labels', async () => {
    ;(mockDevicesSelect as Mock).mockResolvedValueOnce({ data: [] })
    ;(mockLogsGt as Mock).mockResolvedValueOnce({ data: [] })

    const { result } = renderHook(() => useEnergyData('week'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.historyChart).toHaveLength(7)
  })

  it('faengt Fehler ab und beendet loading', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    ;(mockDevicesSelect as Mock).mockRejectedValueOnce(new Error('kaputt'))

    const { result } = renderHook(() => useEnergyData('day'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('bleibt im loading wenn supabase fehlt (aktuelles Verhalten)', () => {
    mockSupabaseRef.current = null

    const { result } = renderHook(() => useEnergyData('day'))
    expect(result.current.loading).toBe(true)
  })
})
