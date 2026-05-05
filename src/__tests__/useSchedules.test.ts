import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { Mock } from 'vitest'

vi.mock('../services/scheduleService', () => ({
  scheduleService: {
    fetchAllSchedules: vi.fn(),
  },
}))

const { mockFrom, mockSelect, mockSupabaseRef } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockSelect: vi.fn(),
  mockSupabaseRef: { current: null as unknown },
}))

vi.mock('../config/supabaseClient', () => ({
  get supabase() {
    return mockSupabaseRef.current as { from: typeof mockFrom } | null
  },
}))

import { scheduleService } from '../services/scheduleService'
import { useSchedules } from '../hooks/useSchedules'

const mockFetchAllSchedules = vi.mocked(scheduleService.fetchAllSchedules)

describe('useSchedules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseRef.current = { from: mockFrom }
    mockFrom.mockReturnValue({ select: mockSelect })
    mockFetchAllSchedules.mockResolvedValue([{ id: 's1', name: 'Morgen' }])
    ;(mockSelect as Mock).mockResolvedValue({ data: [{ id: 'd1', name: 'Lampe' }], error: null })
  })

  it('laedt Zeitplaene und Devices beim Mount', async () => {
    const { result } = renderHook(() => useSchedules())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.schedules).toEqual([{ id: 's1', name: 'Morgen' }])
    expect(result.current.devices).toEqual([{ id: 'd1', name: 'Lampe' }])
    expect(mockFetchAllSchedules).toHaveBeenCalledTimes(1)
  })

  it('refresh laedt Daten erneut', async () => {
    const { result } = renderHook(() => useSchedules())
    await waitFor(() => expect(result.current.loading).toBe(false))

    mockFetchAllSchedules.mockResolvedValueOnce([{ id: 's2', name: 'Abend' }])
    ;(mockSelect as Mock).mockResolvedValueOnce({ data: [{ id: 'd2', name: 'Heizung' }], error: null })

    await result.current.refresh()

    await waitFor(() => expect(result.current.schedules).toEqual([{ id: 's2', name: 'Abend' }]))
    expect(result.current.devices).toEqual([{ id: 'd2', name: 'Heizung' }])
  })

  it('behandelt Fehler robust und beendet loading', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchAllSchedules.mockRejectedValueOnce(new Error('db fail'))

    const { result } = renderHook(() => useSchedules())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.schedules).toEqual([])
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('bleibt im initialen loading wenn supabase fehlt (aktuelles Verhalten)', async () => {
    mockSupabaseRef.current = null

    const { result } = renderHook(() => useSchedules())

    expect(result.current.loading).toBe(true)
    expect(mockFetchAllSchedules).not.toHaveBeenCalled()
  })
})
