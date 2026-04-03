import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import App from '../App'

describe('App', () => {
  it('renders the app shell with sidebar and main content', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    const appShell = screen.getByRole('main')
    expect(appShell).toBeInTheDocument()
  })

  it('renders the Dashboard page on root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('renders the Rooms page on /rooms path', () => {
    render(
      <MemoryRouter initialEntries={['/rooms']}>
        <App />
      </MemoryRouter>
    )
    
    expect(screen.getByRole('heading', { name: 'Rooms' })).toBeInTheDocument()
  })

  it('renders the Simulator page on /simulator path', () => {
    render(
      <MemoryRouter initialEntries={['/simulator']}>
        <App />
      </MemoryRouter>
    )
    
    expect(screen.getByRole('heading', { name: 'Simulator' })).toBeInTheDocument()
  })

  it('renders Sidebar component', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    
    const sidebar = screen.getByRole('navigation')
    expect(sidebar).toBeInTheDocument()
  })

  it('has correct CSS classes for layout', () => {
    const { container } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    
    const appShell = container.querySelector('.app-shell')
    expect(appShell).toHaveClass('app-shell')
  })
})