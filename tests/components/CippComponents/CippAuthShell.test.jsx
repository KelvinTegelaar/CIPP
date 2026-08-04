import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Alert } from '@mui/material'
import { renderWithTheme } from '../../test-utils'
import { CippAuthShell } from '../../../src/components/CippComponents/CippAuthShell'

describe('CippAuthShell', () => {
  it('renders the title and a string description', () => {
    renderWithTheme(<CippAuthShell title="Sign in to CIPP" description="Session has expired." />)

    expect(screen.getByRole('heading', { name: 'Sign in to CIPP' })).toBeInTheDocument()
    expect(screen.getByText('Session has expired.')).toBeInTheDocument()
  })

  it('renders a jsx description, the shape api-offline passes', () => {
    renderWithTheme(
      <CippAuthShell
        title="CIPP API Unreachable"
        description={
          <>
            <p>The CIPP API appears to be offline.</p>
            <p>Check the Function App.</p>
          </>
        }
      />
    )

    expect(screen.getByText('The CIPP API appears to be offline.')).toBeInTheDocument()
    expect(screen.getByText('Check the Function App.')).toBeInTheDocument()
  })

  it('renders a link when given actionHref', () => {
    renderWithTheme(
      <CippAuthShell title="Access Denied" actionText="Login" actionHref="/.auth/login/aad" />
    )

    expect(screen.getByRole('link', { name: /Login/i })).toHaveAttribute('href', '/.auth/login/aad')
  })

  it('renders a button that fires onActionClick', async () => {
    const onActionClick = vi.fn()
    renderWithTheme(
      <CippAuthShell
        title="CIPP API Unreachable"
        actionText="Test API Connection"
        onActionClick={onActionClick}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Test API Connection' }))
    expect(onActionClick).toHaveBeenCalledTimes(1)
  })

  it('renders one control when both actionHref and onActionClick are passed', () => {
    renderWithTheme(
      <CippAuthShell
        title="Access Denied"
        actionText="Login"
        actionHref="/.auth/login/aad"
        onActionClick={vi.fn()}
      />
    )

    expect(screen.getByRole('link', { name: /Login/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Login/i })).not.toBeInTheDocument()
  })

  it('renders both actions when a secondary is given', () => {
    renderWithTheme(
      <CippAuthShell
        title="Access Denied"
        actionText="Sign in with a different account"
        actionHref="/.auth/login/aad"
        secondaryText="Return to Home"
        secondaryHref="/"
      />
    )

    expect(
      screen.getByRole('link', { name: 'Sign in with a different account' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Return to Home' })).toHaveAttribute('href', '/')
  })

  it('renders no controls when no action props are given', () => {
    renderWithTheme(<CippAuthShell title="Logging into CIPP" description="Please wait..." />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  // separate renders rather than rerender: renderWithTheme's rerender would
  // replace the ThemeProvider wrapper along with the subject
  it('shows a progress bar only while busy', () => {
    const { unmount } = renderWithTheme(<CippAuthShell title="Logging into CIPP" busy />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    unmount()

    renderWithTheme(<CippAuthShell title="Logging into CIPP" />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('renders children below the card', () => {
    renderWithTheme(
      <CippAuthShell title="CIPP API Unreachable">
        <Alert severity="error">Connection failed.</Alert>
      </CippAuthShell>
    )

    expect(screen.getByText('Connection failed.')).toBeInTheDocument()
  })

  it('renders the brand lockup and tagline, with no link in the panel', () => {
    renderWithTheme(<CippAuthShell title="Access Denied" />)

    expect(screen.getByRole('img', { name: 'CIPP' })).toHaveAttribute('src', '/logo.png')
    expect(screen.getByText('CyberDrain Improved Partner Portal')).toBeInTheDocument()
    // the panel must stay link-free: unauthenticated.js asserts no Login link
    // survives in the return-to-home case
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
