import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

type QueryMock = Mock<(arg1?: unknown, arg2?: unknown) => unknown>

type QueryChain = {
  select: QueryMock
  order: QueryMock
  insert: QueryMock
  update: QueryMock
  delete: QueryMock
  eq: QueryMock
}

const { mockFrom, mockLogAction, mockEmitChange, mockSupabaseRef } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockLogAction: vi.fn(),
  mockEmitChange: vi.fn(),
  mockSupabaseRef: { current: null as unknown },
}))

vi.mock('../config/supabaseClient', () => ({
  get supabase() {
    return mockSupabaseRef.current as { from: typeof mockFrom } | null
  },
}))

vi.mock('../services/logService', () => ({
  logAction: mockLogAction,
}))

vi.mock('../customEvents/eventEmitter', () => ({
  eventBus: {
    emitChange: mockEmitChange,
  },
}))

import { scheduleService } from '../services/scheduleService'

function createChain(): QueryChain {
  const chain = {
    select: vi.fn(() => chain) as QueryMock,
    order: vi.fn(() => chain) as QueryMock,
    insert: vi.fn(() => chain) as QueryMock,
    update: vi.fn(() => chain) as QueryMock,
    delete: vi.fn(() => chain) as QueryMock,
    eq: vi.fn(() => chain) as QueryMock,
  }
  return chain
}

describe('scheduleService', () => {
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
    mockLogAction.mockResolvedValue(undefined)
    mockEmitChange.mockResolvedValue(undefined)
  })

  it('fetchAllSchedules liefert Daten', async () => {
    const rows = [{ id: 's1' }]
    schedulesQuery.order.mockResolvedValueOnce({ data: rows, error: null })

    await expect(scheduleService.fetchAllSchedules()).resolves.toEqual(rows)
    expect(schedulesQuery.order).toHaveBeenCalledWith('time', { ascending: true })
  })

  it('fetchAllSchedules wirft bei Fehler', async () => {
    schedulesQuery.order.mockResolvedValueOnce({
      data: null,
      error: new Error('kaputt'),
    })
    await expect(scheduleService.fetchAllSchedules()).rejects.toThrow()
  })

  it('createSchedule formatiert HH:mm auf HH:mm:00', async () => {
    const created = [{ id: 's1' }]
    schedulesQuery.select.mockResolvedValueOnce({ data: created, error: null })

    const payload = {
      name: 'Morgen',
      room_id: 'r1',
      device_id: 'd1',
      time: '08:30',
      days: [1, 2],
      action_value: { on: true },
    }
    const result = await scheduleService.createSchedule(payload)

    expect(schedulesQuery.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        time: '08:30:00',
        is_active: true,
      }),
    ])
    expect(result).toEqual(created)
  })

  it('updateSchedule behaelt volle Zeit inkl. Sekunden', async () => {
    schedulesQuery.select.mockResolvedValueOnce({ data: [{ id: 'x' }], error: null })

    await scheduleService.updateSchedule('s1', {
      name: 'Abend',
      room_id: 'r1',
      device_id: 'd1',
      time: '21:45:00',
      days: [1],
      action_value: { brightness: 60 },
    })

    expect(schedulesQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        time: '21:45:00',
      })
    )
  })

  it('toggleSchedule wirft bei Fehler', async () => {
    schedulesQuery.eq.mockResolvedValueOnce({ error: new Error('update failed') })
    await expect(scheduleService.toggleSchedule('s1', true)).rejects.toThrow()
  })

  it('deleteSchedule wirft bei Fehler', async () => {
    schedulesQuery.eq.mockResolvedValueOnce({ error: new Error('delete failed') })
    await expect(scheduleService.deleteSchedule('s1')).rejects.toThrow()
  })

  it('checkAndExecuteSchedules fuehrt passende Zeitplaene aus', async () => {
    vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('10:15')
    vi.spyOn(Date.prototype, 'getDay').mockReturnValue(2)

    const activeSchedule = {
      id: 's1',
      name: 'Morgenroutine',
      room_id: 'room-1',
      device_id: 'dev-1',
      days: [2, 3],
      action_value: { on: true },
      devices: { id: 'dev-1', name: 'Lampe', type: 'Schalter', room_id: 'room-1' },
    }

    schedulesQuery.eq
      .mockImplementationOnce(() => schedulesQuery)
      .mockResolvedValueOnce({ data: [activeSchedule], error: null })
    devicesQuery.eq.mockResolvedValueOnce({ error: null })

    await scheduleService.checkAndExecuteSchedules()

    expect(mockLogAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'Zeitplan ausgeführt',
      })
    )
    expect(mockEmitChange).toHaveBeenCalled()
  })

  it('checkAndExecuteSchedules ueberspringt falschen Wochentag', async () => {
    vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('10:15')
    vi.spyOn(Date.prototype, 'getDay').mockReturnValue(5)

    const activeSchedule = {
      id: 's2',
      name: 'Nur Dienstag',
      room_id: 'room-1',
      device_id: 'dev-2',
      days: [2],
      action_value: { on: false },
    }

    schedulesQuery.eq
      .mockImplementationOnce(() => schedulesQuery)
      .mockResolvedValueOnce({ data: [activeSchedule], error: null })

    await scheduleService.checkAndExecuteSchedules()

    expect(devicesQuery.update).not.toHaveBeenCalled()
    expect(mockLogAction).not.toHaveBeenCalled()
  })

  it('gibt frueh zurueck wenn supabase fehlt', async () => {
    mockSupabaseRef.current = null

    await expect(scheduleService.fetchAllSchedules()).resolves.toEqual([])
    await expect(scheduleService.createSchedule({ time: '10:00' })).resolves.toBeNull()
    await expect(scheduleService.updateSchedule('x', { time: '10:00' })).resolves.toBeNull()
    await expect(scheduleService.toggleSchedule('x', true)).resolves.toBeUndefined()
    await expect(scheduleService.deleteSchedule('x')).resolves.toBeUndefined()
    await expect(scheduleService.checkAndExecuteSchedules()).resolves.toBeUndefined()
  })
})
