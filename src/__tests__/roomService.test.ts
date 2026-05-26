import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockSupabaseRef, mockEmitChange } = vi.hoisted(() => ({
  mockSupabaseRef: { current: null as unknown },
  mockEmitChange: vi.fn(),
}))

vi.mock('../config/supabaseClient', () => ({
  get supabase() {
    return mockSupabaseRef.current
  },
}))

vi.mock('../customEvents/eventEmitter', () => ({
  eventBus: {
    emitChange: mockEmitChange,
  },
}))

import { addToRoomTable, deleteRoomFromTable, updateRoomInTable } from '../services/roomService'

function createQueryChain() {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({
        data: [] as { room_id: string; role: string; user_id: string }[],
        error: null,
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
  }
}

describe('roomService', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    const roomMembershipsQuery = createQueryChain()
    roomMembershipsQuery.select.mockReturnValueOnce({
      eq: vi.fn(() => Promise.resolve({
      data: [] as { room_id: string; role: string; user_id: string }[],
      error: null,
})),
    })

    mockSupabaseRef.current = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
      from: vi.fn((table: string) => {
        if (table === 'room_members') {
          return roomMembershipsQuery
        }

        return createQueryChain()
      }),
      rpc: vi.fn().mockResolvedValue({ data: 'room-123', error: null }),
    }

    mockEmitChange.mockResolvedValue(undefined)
  })

  it('Soll einen Raum erstellen und die ID zur�ckgeben', async () => {
    const newId = await addToRoomTable('Test-Raum')

    expect(newId).toBe('room-123')
    expect(mockEmitChange).toHaveBeenCalledWith(
      expect.objectContaining({
        room_id: 'room-123',
        action: 'Room Created',
        new_value: 'Raum: Test-Raum',
      })
    )
  })

  it('Soll einen bestehenden Raum umbenennen', async () => {
    const success = await updateRoomInTable('room-1', 'Neuer Name')

    expect(success).toBe(true)
    expect(mockEmitChange).toHaveBeenCalledWith(
      expect.objectContaining({
        room_id: 'room-1',
        action: 'Room Updated',
        new_value: 'Raumname ge�ndert zu Neuer Name',
      })
    )
  })

  it('Soll einen Raum erfolgreich aus der Tabelle l�schen', async () => {
    const success = await deleteRoomFromTable('room-1')

    expect(success).toBe(true)
    expect(mockEmitChange).toHaveBeenCalledWith(
      expect.objectContaining({
        room_id: 'room-1',
        action: 'Room Deleted',
        new_value: 'Raum wurde entfernt',
      })
    )
  })
})
