import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippBecRunStatusCard } from '../../../src/components/CippCards/CippBecRunStatusCard'

vi.mock('react-time-ago', () => ({
  default: ({ date }) => (
    <span data-testid="timeago">{date.toISOString()}</span>
  ),
}))
vi.mock(
  '../../../src/components/CippComponents/CippBecContainmentDrawer',
  () => ({
    CippBecContainmentDrawer: ({ buttonText, disabled }) => (
      <button disabled={disabled}>{buttonText}</button>
    ),
  })
)

const base = {
  userPrincipalName: 'victim@contoso.com',
  userId: 'u1',
  tenantFilter: 'contoso.com',
  windowDays: 7,
}

describe('CippBecRunStatusCard', () => {
  it('starts nothing by itself and offers one investigation button when the user has no runs', async () => {
    const onStart = vi.fn()
    renderWithProviders(
      <CippBecRunStatusCard {...base} state="none" onStart={onStart} />
    )
    expect(
      screen.getByText(/No investigation has been run for this user yet/i)
    ).toBeInTheDocument()
    expect(screen.getByText('No runs yet')).toBeInTheDocument()
    expect(screen.getByText('victim@contoso.com')).toBeInTheDocument()
    expect(screen.queryByText(/quick check/i)).not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: /run investigation/i })
    )
    expect(onStart).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByRole('button', { name: /contain user/i })
    ).not.toBeInTheDocument()
  })

  it('shows a queued run as waiting for a worker, with the start button disabled', () => {
    renderWithProviders(
      <CippBecRunStatusCard
        {...base}
        state="waiting"
        caseId="BEC-1"
        scope="Full"
        poll={{
          Waiting: true,
          CaseId: 'BEC-1',
          RequestedAt: '2026-08-23T08:00:00Z',
          Progress: {
            Name: 'victim@contoso.com',
            Status: 'queued',
            Steps: [
              {
                Title: 'Unified audit log',
                Status: 'pending',
                Message: 'Waiting for deployment to start',
              },
              {
                Title: 'Sign-ins',
                Status: 'pending',
                Message: 'Waiting for deployment to start',
              },
            ],
          },
        }}
        onStart={vi.fn()}
      />
    )
    expect(
      screen.getByText('Queued - waiting for a worker')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/waits for a background worker/i)
    ).toBeInTheDocument()
    expect(screen.getByText('Unified audit log')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /run investigation/i })
    ).toBeDisabled()
  })

  it('shows the running phase and the step list once a worker has the run', () => {
    renderWithProviders(
      <CippBecRunStatusCard
        {...base}
        state="waiting"
        caseId="BEC-1"
        scope="Full"
        poll={{
          Waiting: true,
          CaseId: 'BEC-1',
          StartedAt: '2026-08-23T08:00:20Z',
          Progress: {
            Name: 'victim@contoso.com',
            Status: 'running',
            Steps: [
              {
                Title: 'Unified audit log',
                Status: 'succeeded',
                Message: 'Done',
              },
              {
                Title: 'Sign-ins',
                Status: 'running',
                Message: 'Reading sign-ins and mobile devices',
              },
              { Title: 'Score', Status: 'pending', Message: '' },
            ],
          },
        }}
        onStart={vi.fn()}
      />
    )
    expect(screen.getByText('Running - step 2 of 3')).toBeInTheDocument()
    expect(
      screen.getByText(/Sign-ins: Reading sign-ins and mobile devices/)
    ).toBeInTheDocument()
    expect(screen.getByText('Case BEC-1')).toBeInTheDocument()
    expect(screen.queryByText(/Quick check/)).not.toBeInTheDocument()
  })

  it('shows the failure and the phase it failed in', () => {
    renderWithProviders(
      <CippBecRunStatusCard
        {...base}
        state="error"
        caseId="BEC-2"
        poll={{
          Waiting: false,
          Error: 'bulk blew up',
          Progress: {
            Status: 'failed',
            Steps: [
              {
                Title: 'Tenant sign-ins',
                Status: 'failed',
                Message: 'bulk blew up',
              },
            ],
          },
        }}
        onStart={vi.fn()}
      />
    )
    expect(screen.getAllByText('Failed').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/bulk blew up/).length).toBeGreaterThanOrEqual(1)
    expect(
      screen.getByText(/Failed during: Tenant sign-ins/)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /run a new investigation/i })
    ).toBeEnabled()
  })
})
