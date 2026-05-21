import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

type QueryMock = Mock<(arg1?: unknown, arg2?: unknown) => unknown>

type QueryChain = {
  select: QueryMock
  order: QueryMock
  eq: QueryMock
}

const { mockFrom, mockSupabaseRef } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockSupabaseRef: { current: null as unknown },
}))

vi.mock('../config/supabaseClient', () => ({
  get supabase() {
    return mockSupabaseRef.current as { from: typeof mockFrom } | null
  },
}))

import { simulationService } from '../services/simulationService'

function createChain(): QueryChain {
  const chain = {
    select: vi.fn(() => chain) as QueryMock,
    order: vi.fn(() => chain) as QueryMock,
    eq: vi.fn(() => chain) as QueryMock,
  }
  return chain
}

describe('simulationService', () => {
  let schedulesQuery: QueryChain
  let devicesQuery: QueryChain

  beforeEach(() => {
    vi.clearAllMocks()
    schedulesQuery = createChain()
    devicesQuery = createChain()
    mockFrom.mockImplementation((table: string) =>
      table === 'schedules' ? schedulesQuery : devicesQuery
    )
    mockSupabaseRef.current = { from: mockFrom }
  })

  describe('fetchSimulationSchedules', () => {
    it('gibt aktive Schedules mit Gerätedaten zurück', async () => {
      const rows = [{ id: 's1', name: 'Morgen', is_active: true, devices: { name: 'Lampe' } }]
      schedulesQuery.order.mockResolvedValueOnce({ data: rows, error: null })

      const result = await simulationService.fetchSimulationSchedules()

      expect(result).toEqual(rows)
      expect(schedulesQuery.eq).toHaveBeenCalledWith('is_active', true)
      expect(schedulesQuery.order).toHaveBeenCalledWith('time', { ascending: true })
    })

    it('wirft bei Datenbankfehler', async () => {
      schedulesQuery.order.mockResolvedValueOnce({ data: null, error: new Error('DB-Fehler') })

      await expect(simulationService.fetchSimulationSchedules()).rejects.toThrow('DB-Fehler')
    })

    it('gibt leeres Array zurück wenn supabase fehlt', async () => {
      mockSupabaseRef.current = null

      await expect(simulationService.fetchSimulationSchedules()).resolves.toEqual([])
    })
  })

  describe('fetchSimulationDevices', () => {
    it('gibt Devices sortiert nach Name zurück', async () => {
      const rows = [
        { id: 'd1', name: 'Lampe', type: 'Schalter', room_id: 'r1', state: { on: true }, rooms: { name: 'Wohnzimmer' } },
        { id: 'd2', name: 'Thermostat', type: 'Thermostat', room_id: 'r1', state: { temperature: 21 }, rooms: { name: 'Wohnzimmer' } },
      ]
      devicesQuery.order.mockResolvedValueOnce({ data: rows, error: null })

      const result = await simulationService.fetchSimulationDevices()

      expect(result).toEqual(rows)
      expect(devicesQuery.order).toHaveBeenCalledWith('name', { ascending: true })
    })

    it('wirft bei Datenbankfehler', async () => {
      devicesQuery.order.mockResolvedValueOnce({ data: null, error: new Error('DB-Fehler') })

      await expect(simulationService.fetchSimulationDevices()).rejects.toThrow('DB-Fehler')
    })

    it('gibt leeres Array zurück wenn supabase fehlt', async () => {
      mockSupabaseRef.current = null

      await expect(simulationService.fetchSimulationDevices()).resolves.toEqual([])
    })
  })
})
