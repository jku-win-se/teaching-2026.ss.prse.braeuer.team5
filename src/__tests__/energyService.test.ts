import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

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

import { energyService } from '../services/energyService'

describe('energyService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseRef.current = { from: mockFrom }
    mockFrom.mockReturnValue({ select: mockSelect })
  })

  it('liefert Verbrauchsdaten zurueck', async () => {
    const rows = [{ id: 'd1', name: 'Lampe', energy_consumption: 25 }]
    ;(mockSelect as Mock).mockResolvedValueOnce({ data: rows, error: null })

    await expect(energyService.getLiveConsumption()).resolves.toEqual(rows)
    expect(mockFrom).toHaveBeenCalledWith('devices')
  })

  it('wirft Fehler wenn Supabase nicht initialisiert ist', async () => {
    mockSupabaseRef.current = null

    await expect(energyService.getLiveConsumption()).rejects.toThrow(
      'Supabase client is not initialized'
    )
  })

  it('wirft Fehler bei Supabase-Fehler', async () => {
    ;(mockSelect as Mock).mockResolvedValueOnce({
      data: null,
      error: new Error('db kaputt'),
    })

    await expect(energyService.getLiveConsumption()).rejects.toThrow()
  })
})
