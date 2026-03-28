import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { MockedFunction } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import App from '../App'
import { supabase } from '../config/supabaseClient'

// Mock the supabase client
vi.mock('../config/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  //simulate logged in user
  const mockLoggedInSession = () => {
    if (supabase?.auth?.getSession) {
      (supabase.auth.getSession as MockedFunction<typeof supabase.auth.getSession>).mockResolvedValue({
        data: { session: { user: { id: 'test-user', app_metadata: {}, user_metadata: {}, aud: '', created_at: '' }, access_token: 'test-token', refresh_token: 'test-refresh', expires_in: 3600, token_type: 'bearer' } } ,
        error: null,
      })
    }
  }

  //simulate logged out user
  const mockLoggedOutSession = () => {
    if (supabase?.auth?.getSession) {
      (supabase.auth.getSession as MockedFunction<typeof supabase.auth.getSession>).mockResolvedValue({
        data: { session: null },
        error: null,
      })
    }
  }

  it('renders the app shell with sidebar and main content', async () => {
    mockLoggedInSession()
    const { findByRole } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    expect(await findByRole('main')).toBeInTheDocument()
  })

  it('renders the Dashboard page on root path', async () => {
    mockLoggedInSession()
    const { findByRole } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    
    expect(await findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('renders the Devices page on /devices path', async () => {
    mockLoggedInSession()
    const { findByRole } = render(
      <MemoryRouter initialEntries={['/devices']}>
        <App />
      </MemoryRouter>
    )
    
    expect(await findByRole('heading', { name: 'Devices' })).toBeInTheDocument()
  })

  it('renders the Simulator page on /simulator path', async () => {
    mockLoggedInSession()
    const { findByRole } = render(
      <MemoryRouter initialEntries={['/simulator']}>
        <App />
      </MemoryRouter>
    )
    
    expect(await findByRole('heading', { name: 'Simulator' })).toBeInTheDocument()
  })

  it('renders Sidebar component', async () => {
    mockLoggedInSession()
    const { findByRole } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    
    const sidebar = await findByRole('navigation')
    expect(sidebar).toBeInTheDocument()
  })

  it('has correct CSS classes for layout', async () => {
    mockLoggedInSession()
    const { container, findByRole } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    
    await findByRole('main')
    const appShell = container.querySelector('.app-shell')
    expect(appShell).toBeInTheDocument()
    expect(appShell).toHaveClass('app-shell')
  })

  //register page test
  it('renders the Register page when not authenticated', async () => {
    mockLoggedOutSession()
    const { findByRole, queryByRole } = render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    )
    
      expect(await findByRole('heading', { name: 'Register' })).toBeInTheDocument()
      expect(await queryByRole('navigation')).not.toBeInTheDocument()
  })
})