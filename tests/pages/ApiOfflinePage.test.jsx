import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { renderWithTheme } from '../test-utils'
import ApiOfflinePage from '../../src/pages/api-offline'

vi.mock('axios', () => ({ default: { get: vi.fn() } }))

vi.mock('../../src/api/ApiCall', () => ({
  ApiGetCall: () => ({ isSuccess: true, data: { version: '10.7.5' } }),
}))

describe('ApiOfflinePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the offline state and the connection test action', () => {
    renderWithTheme(<ApiOfflinePage />)

    expect(screen.getByText('CIPP API Unreachable')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Test API Connection' })).toBeInTheDocument()
    // no result yet, so nothing is in flight
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('offers a reload when the connection test succeeds', async () => {
    axios.get.mockResolvedValue({
      headers: { 'content-type': 'application/json' },
      data: {},
    })
    renderWithTheme(<ApiOfflinePage />)

    await userEvent.click(screen.getByRole('button', { name: 'Test API Connection' }))

    await waitFor(() => {
      expect(
        screen.getByText('Connection successful! Try refreshing the page.')
      ).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Refresh Page' })).toBeInTheDocument()
  })

  it('reports a no-response failure', async () => {
    axios.get.mockRejectedValue({ request: {} })
    renderWithTheme(<ApiOfflinePage />)

    await userEvent.click(screen.getByRole('button', { name: 'Test API Connection' }))

    await waitFor(() => {
      expect(
        screen.getByText('No response received from API. Check if your Function App is running.')
      ).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: 'Refresh Page' })).not.toBeInTheDocument()
  })

  it('shows exactly one progress indicator while the test is in flight', async () => {
    let settle
    axios.get.mockReturnValue(
      new Promise((resolve) => {
        settle = () => resolve({ headers: { 'content-type': 'application/json' }, data: {} })
      })
    )
    renderWithTheme(<ApiOfflinePage />)

    await userEvent.click(screen.getByRole('button', { name: 'Test API Connection' }))

    await waitFor(() => {
      expect(screen.getAllByRole('progressbar')).toHaveLength(1)
    })
    expect(screen.getByRole('button', { name: 'Testing Connection...' })).toBeDisabled()

    settle()
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })
  })

  // hosted subscriptions are handled elsewhere now
  it('does not point at a GitHub subscription', () => {
    renderWithTheme(<ApiOfflinePage />)

    expect(screen.queryByText(/subscription in GitHub/i)).not.toBeInTheDocument()
  })
})
