import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../../test-utils'
import { CippErrorState } from '../../../src/components/CippComponents/CippErrorState'

describe('CippErrorState', () => {
  it('renders the code, title and description', () => {
    renderWithTheme(
      <CippErrorState code="404" title="Page not found" description="This page doesn't exist." />
    )

    expect(screen.getByText('Error 404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByText("This page doesn't exist.")).toBeInTheDocument()
  })

  it('renders a link action', () => {
    renderWithTheme(
      <CippErrorState title="Page not found" actionText="Return to Home" actionHref="/" />
    )

    expect(screen.getByRole('link', { name: 'Return to Home' })).toHaveAttribute('href', '/')
  })

  // the 500 page's shape: a link primary beside a callback secondary
  it('mixes a link primary with a callback secondary', async () => {
    const onSecondaryClick = vi.fn()
    renderWithTheme(
      <CippErrorState
        title="Something went wrong"
        actionText="Return to Home"
        actionHref="/"
        secondaryText="Clear cache & reload"
        onSecondaryClick={onSecondaryClick}
      />
    )

    expect(screen.getByRole('link', { name: 'Return to Home' })).toHaveAttribute('href', '/')
    await userEvent.click(screen.getByRole('button', { name: 'Clear cache & reload' }))
    expect(onSecondaryClick).toHaveBeenCalledTimes(1)
  })

  // api-offline's shape: callback primary, no secondary
  it('fires a callback primary', async () => {
    const onActionClick = vi.fn()
    renderWithTheme(
      <CippErrorState
        title="Something went wrong"
        actionText="Test API Connection"
        onActionClick={onActionClick}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Test API Connection' }))
    expect(onActionClick).toHaveBeenCalledTimes(1)
  })

  it('hides the error detail behind a toggle', async () => {
    renderWithTheme(
      <CippErrorState title="Something went wrong" detail="Cannot read properties of undefined" />
    )

    // collapsed (and unmounted) by default
    expect(screen.queryByText('Cannot read properties of undefined')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Show details' }))
    expect(screen.getByText('Cannot read properties of undefined')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Hide details' }))
    // Collapse animates out; the text disappears once the exit transition ends
    await waitFor(() =>
      expect(screen.queryByText('Cannot read properties of undefined')).not.toBeInTheDocument()
    )
  })

  it('renders nothing optional when only a title is given', () => {
    renderWithTheme(<CippErrorState title="Not allowed" />)

    expect(screen.getByRole('heading', { name: 'Not allowed' })).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('hides the artwork from assistive tech', () => {
    const { container } = renderWithTheme(
      <CippErrorState title="Page not found" imageUrl="/cippy-404.png" />
    )

    // decorative only, so it must not surface as an img role
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    const art = container.querySelector('img[src="/cippy-404.png"]')
    expect(art).toHaveAttribute('aria-hidden', 'true')
    expect(art).toHaveAttribute('alt', '')
  })
})
