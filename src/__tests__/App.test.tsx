import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { MockedFunction } from 'vitest'
import type { Session } from '@supabase/supabase-js'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import App from '../App'
import { supabase } from '../config/supabaseClient'

vi.mock('../services/inviteService', () => ({
  fetchPendingRoomInvites: vi.fn().mockResolvedValue([]),
  respondToRoomInvite: vi.fn(),
  fetchRoomMembers: vi.fn(),
  createRoomInvite: vi.fn(),
  removeRoomMember: vi.fn(),
}))

// Mock the supabase client
vi.mock('../config/supabaseClient', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation((callback) => 
        Promise.resolve(callback({ data: [], error: null }))
      ),
    }),
  },
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const getSessionMock = supabase!.auth.getSession as MockedFunction<
    () => Promise<{ data: { session: Session | null }; error: null }>
  >

  // Helper: Simulate logged in user
  const mockLoggedInSession = () => {
    getSessionMock.mockResolvedValue({
      data: { 
        session: { 
          user: { id: 'test-user', app_metadata: {}, user_metadata: {}, aud: '', created_at: '' }, 
          access_token: 'test-token', 
          refresh_token: 'test-refresh', 
          expires_in: 3600, 
          token_type: 'bearer' 
        } 
      },
      error: null,
    })
  }

  // Helper: Simulate logged out user
  const mockLoggedOutSession = () => {
    getSessionMock.mockResolvedValue({
      data: { session: null },
      error: null,
    })
  }

  it('renders the app shell with sidebar and main content', async () => {
    mockLoggedInSession()
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })

  it('renders the Dashboard page on root path', async () => {
    mockLoggedInSession()
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    })
  })

  it('renders the Rooms page on /rooms path', async () => {
    mockLoggedInSession()
    render(
      <MemoryRouter initialEntries={['/rooms']}>
        <App />
      </MemoryRouter>
    )
    
    await waitFor(() => {
      // Prüft auf die Überschrift "Rooms" wie im ersten File gefordert
      expect(screen.getByRole('heading', { name: 'Rooms' })).toBeInTheDocument()
    })
  })

  it('renders the Simulator page on /simulator path', async () => {
    mockLoggedInSession()
    render(
      <MemoryRouter initialEntries={['/simulator']}>
        <App />
      </MemoryRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Simulator' })).toBeInTheDocument()
    })
  })

  it('renders the Notifications page on /notifications path', async () => {
    mockLoggedInSession()
    render(
      <MemoryRouter initialEntries={['/notifications']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Einladungen' })).toBeInTheDocument()
    })
  })

  it('renders Sidebar component', async () => {
    mockLoggedInSession()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    
    await waitFor(() => {
      const sidebar = screen.getByRole('navigation')
      expect(sidebar).toBeInTheDocument()
    })
  })

  it('has correct CSS classes for layout', async () => {
    mockLoggedInSession()
    const { container } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    
    await waitFor(() => {
      const appShell = container.querySelector('.app-shell')
      expect(appShell).toBeInTheDocument()
      expect(appShell).toHaveClass('app-shell')
    })
  })

  it('renders the Register page when not authenticated', async () => {
    mockLoggedOutSession()
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument()
    })

    // Sicherstellen, dass die Sidebar NICHT gerendert wird, wenn man ausgeloggt ist
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
