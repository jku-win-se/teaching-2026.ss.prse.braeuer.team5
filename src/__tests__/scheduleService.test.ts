import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

type MockFn = ReturnType<typeof vi.fn>

type ScheduleQuery = {
  select: MockFn
  order: MockFn
  insert: MockFn
  update: MockFn
  delete: MockFn
}

type DeviceQuery = {
  select: MockFn
  update: MockFn
}

function createSchedulesQuery(): ScheduleQuery {
  const orderMock = vi.fn(() => Promise.resolve({ data: [], error: null }));
  const eqMock = vi.fn(() => Promise.resolve({ data: [], error: null }));

  const queryInstance = {
    select: vi.fn(() => ({
      order: orderMock,
      eq: eqMock,
    })),
    order: orderMock,
    insert: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
  };

  return queryInstance;
}

function createDevicesQuery(): DeviceQuery {
  return {
    select: vi.fn(() => Promise.resolve({ data: [], error: null })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  }
}

describe('scheduleService', () => {
  let schedulesQuery: ScheduleQuery
  let devicesQuery: DeviceQuery

  beforeEach(() => {
    vi.clearAllMocks()
    schedulesQuery = createSchedulesQuery()
    devicesQuery = createDevicesQuery()

    mockFrom.mockImplementation((table: string) =>
      table === 'schedules' ? schedulesQuery : devicesQuery
    )

    mockSupabaseRef.current = { from: mockFrom }
    mockLogAction.mockResolvedValue(undefined)
    mockEmitChange.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetchAllSchedules liefert Daten', async () => {
    const rows = [{ id: 's1' }]
    schedulesQuery.order.mockResolvedValueOnce({ data: rows, error: null })

    await expect(scheduleService.fetchAllSchedules()).resolves.toEqual([
      { id: 's1', action_value: { on: false } },
    ])
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
    schedulesQuery.insert.mockReturnValueOnce({
      select: vi.fn(() => Promise.resolve({ data: created, error: null })),
    })

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
        action_value: { on: true },
      }),
    ])
    expect(result).toEqual(created)
  })

  it('updateSchedule behaelt volle Zeit inkl. Sekunden', async () => {
    schedulesQuery.update.mockReturnValueOnce({
      eq: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [{ id: 'x' }], error: null })),
      })),
    })

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
        action_value: expect.objectContaining({
          brightness: 60,
          on: true,
        }),
      })
    )
  })

  it('createSchedule speichert on bei nicht-Schalter-Geraeten', async () => {
    schedulesQuery.insert.mockReturnValueOnce({
      select: vi.fn(() => Promise.resolve({ data: [{ id: 's1' }], error: null })),
    })

    await scheduleService.createSchedule({
      name: 'Thermostat',
      room_id: 'r1',
      device_id: 'd1',
      time: '08:30',
      days: [1],
      action_value: { temperature: 22.5 },
    })

    expect(schedulesQuery.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        action_value: expect.objectContaining({
          temperature: 22.5,
          on: true,
        }),
      }),
    ])
  })

  it('updateSchedule speichert on bei Dimmer-Action-Values', async () => {
    schedulesQuery.update.mockReturnValueOnce({
      eq: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [{ id: 'x' }], error: null })),
      })),
    })

    await scheduleService.updateSchedule('s1', {
      name: 'Dimmer',
      room_id: 'r1',
      device_id: 'd1',
      time: '21:45:00',
      days: [1],
      action_value: { brightness: 60 },
    })

    expect(schedulesQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        action_value: expect.objectContaining({
          brightness: 60,
          on: true,
        }),
      })
    )
  })

  it('toggleSchedule wirft bei Fehler', async () => {
    schedulesQuery.update.mockReturnValueOnce({
      eq: vi.fn(() => Promise.resolve({ error: new Error('update failed') })),
    })

    await expect(scheduleService.toggleSchedule('s1', true)).rejects.toThrow()
  })

  it('deleteSchedule wirft bei Fehler', async () => {
    schedulesQuery.delete.mockReturnValueOnce({
      eq: vi.fn(() => Promise.resolve({ error: new Error('delete failed') })),
    })

    await expect(scheduleService.deleteSchedule('s1')).rejects.toThrow()
  })

  it('checkAndExecuteSchedules fuehrt passende Zeitplaene aus', async () => {
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(10)
    vi.spyOn(Date.prototype, 'getMinutes').mockReturnValue(15)
    vi.spyOn(Date.prototype, 'getDay').mockReturnValue(2)

    const activeSchedule = {
      id: 's1',
      name: 'Morgenroutine',
      room_id: 'room-1',
      device_id: 'dev-1',
      days: [2, 3],
      time: '10:15:00',
      action_value: { on: true },
      devices: { id: 'dev-1', name: 'Lampe', type: 'Schalter', room_id: 'room-1', state: { on: false } },
    }

    schedulesQuery.select.mockReturnValueOnce({
      order: schedulesQuery.order,
      eq: vi.fn().mockImplementation((column, value) => {
        if (column === 'is_active' && value === true) {
          return Promise.resolve({ data: [activeSchedule], error: null });
        }
        return Promise.resolve({ data: [], error: null });
      })
    })

    devicesQuery.update.mockReturnValueOnce({
      eq: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [{ id: 'dev-1' }], error: null })),
      })),
    })

    await scheduleService.checkAndExecuteSchedules()

    expect(mockLogAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'Zeitplan ausgeführt',
      })
    )
    expect(mockEmitChange).toHaveBeenCalled()
  })

  it('checkAndExecuteSchedules ueberspringt falschen Wochentag', async () => {
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(10)
    vi.spyOn(Date.prototype, 'getMinutes').mockReturnValue(15)
    vi.spyOn(Date.prototype, 'getDay').mockReturnValue(5)

    const activeSchedule = {
      id: 's2',
      name: 'Nur Dienstag',
      room_id: 'room-1',
      device_id: 'dev-2',
      days: [2],
      time: '10:15:00',
      action_value: { on: false },
      devices: { id: 'dev-2', name: 'Lampe', type: 'Schalter', room_id: 'room-1', state: { on: false } },
    }

    schedulesQuery.select.mockReturnValueOnce({
      order: schedulesQuery.order,
      eq: vi.fn().mockImplementation((column, value) => {
        if (column === 'is_active' && value === true) {
          return Promise.resolve({ data: [activeSchedule], error: null });
        }
        return Promise.resolve({ data: [], error: null });
      })
    })

    await scheduleService.checkAndExecuteSchedules()

    expect(devicesQuery.update).not.toHaveBeenCalled()
    expect(mockLogAction).not.toHaveBeenCalled()
  })

  it('gibt frueh zurueck wenn supabase fehlt', async () => {
    mockSupabaseRef.current = null

    await expect(scheduleService.fetchAllSchedules()).resolves.toEqual([])

    const minPayload = {
      name: '',
      room_id: '',
      device_id: '',
      time: '10:00',
      days: [],
      action_value: {},
    }

    await expect(scheduleService.createSchedule(minPayload)).resolves.toBeNull()
    await expect(scheduleService.updateSchedule('x', minPayload)).resolves.toBeNull()
    await expect(scheduleService.toggleSchedule('x', true)).resolves.toBeUndefined()
    await expect(scheduleService.deleteSchedule('x')).resolves.toBeUndefined()
    await expect(scheduleService.checkAndExecuteSchedules()).resolves.toBeUndefined()
  })
})