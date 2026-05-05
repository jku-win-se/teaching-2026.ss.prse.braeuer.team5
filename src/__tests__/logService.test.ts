import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import type { ActivityLog } from '../types'

const {
  mockFrom,
  mockInsert,
  mockSelect,
  mockOrder,
  mockLimit,
  mockChannel,
  mockOn,
  mockSubscribe,
  mockSupabaseRef,
} = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockInsert: vi.fn(),
  mockSelect: vi.fn(),
  mockOrder: vi.fn(),
  mockLimit: vi.fn(),
  mockChannel: vi.fn(),
  mockOn: vi.fn(),
  mockSubscribe: vi.fn(),
  mockSupabaseRef: { current: null as unknown },
}))

vi.mock('../config/supabaseClient', () => ({
  get supabase() {
    return mockSupabaseRef.current as
      | {
          from: typeof mockFrom
          channel: typeof mockChannel
        }
      | null
  },
}))

import { logAction, logService } from '../services/logService'

describe('logService', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect })
    mockSelect.mockReturnValue({ order: mockOrder })
    mockOrder.mockReturnValue({ limit: mockLimit })
    mockOn.mockReturnValue({ subscribe: mockSubscribe })

    mockSupabaseRef.current = {
      from: mockFrom,
      channel: mockChannel.mockReturnValue({ on: mockOn }),
    }
  })

  it('logAction fuegt Payload ein', async () => {
    ;(mockInsert as Mock).mockResolvedValueOnce({ error: null })
    await logAction({ action: 'Test', new_value: null, actor_type: 'user' })
    expect(mockFrom).toHaveBeenCalledWith('activity_logs')
    expect(mockInsert).toHaveBeenCalledWith([{ action: 'Test', new_value: null, actor_type: 'user' }])
  })

  it('logAction loggt Fehler in console.error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    ;(mockInsert as Mock).mockResolvedValueOnce({
      error: { message: 'insert failed' },
    })

    await logAction({ action: 'Kaputt', new_value: null, actor_type: 'user' })

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('fetchLogs liefert Daten in absteigender Reihenfolge', async () => {
    const rows = [{ id: '1', action: 'x' }] as ActivityLog[]
    ;(mockLimit as Mock).mockResolvedValueOnce({ data: rows })

    await expect(logService.fetchLogs(10)).resolves.toEqual(rows)
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(mockLimit).toHaveBeenCalledWith(10)
  })

  it('fetchLogs liefert [] bei fehlenden Daten', async () => {
    ;(mockLimit as Mock).mockResolvedValueOnce({ data: null })
    await expect(logService.fetchLogs()).resolves.toEqual([])
  })

  it('subscribeToLogs gibt Subscription zurueck und mapped payload.new', () => {
    const subscription = { id: 'sub-1' }
    ;(mockSubscribe as Mock).mockReturnValueOnce(subscription)
    ;(mockChannel as Mock).mockReturnValueOnce({ on: mockOn })

    const handler = vi.fn()
    const result = logService.subscribeToLogs(handler)

    expect(mockChannel).toHaveBeenCalledWith('activity_updates')
    expect(mockOn).toHaveBeenCalled()

    const callback = (mockOn as Mock).mock.calls[0][2]
    callback({ new: { id: 'n1', action: 'insert' } })
    expect(handler).toHaveBeenCalledWith({ id: 'n1', action: 'insert' })
    expect(result).toBe(subscription)
  })

  it('subscribeToLogs gibt null zurueck wenn supabase fehlt', () => {
    mockSupabaseRef.current = null
    expect(logService.subscribeToLogs(vi.fn())).toBeNull()
  })
})
