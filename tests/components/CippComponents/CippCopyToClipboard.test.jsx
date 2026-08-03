import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../../test-utils'
import { CippCopyToClipBoard } from '../../../src/components/CippComponents/CippCopyToClipboard'

describe('CippCopyToClipboard', () => {
  it('renders button and copies text on click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText },
    })

    const onClick = vi.fn()
    renderWithTheme(
      <CippCopyToClipBoard text="Copy me!" type="button" visible={true} onClick={onClick} />
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    await userEvent.click(button)
    expect(writeText).toHaveBeenCalledWith('Copy me!')
    expect(onClick).toHaveBeenCalled()
  })

  it('renders chip with text', () => {
    renderWithTheme(
      <CippCopyToClipBoard text="cipp-secret-key" type="chip" visible={true} />
    )
    expect(screen.getByText('cipp-secret-key')).toBeInTheDocument()
  })

  it('copies text when chip is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText },
    })

    renderWithTheme(
      <CippCopyToClipBoard text="cipp-secret-key" type="chip" visible={true} />
    )

    // clickable Chip renders with role="button", Tooltip title is its aria-label
    await userEvent.click(screen.getByRole('button', { name: 'Copy to clipboard' }))
    expect(writeText).toHaveBeenCalledWith('cipp-secret-key')
  })

  it('renders masked password and toggles visibility', async () => {
    renderWithTheme(
      <CippCopyToClipBoard text="S3cr3tP@ssw0rd" type="password" visible={true} />
    )
    expect(screen.getByText('********')).toBeInTheDocument()

    // Tooltip title becomes the aria-label on the toggle IconButton
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(screen.getByText('S3cr3tP@ssw0rd')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(screen.getByText('********')).toBeInTheDocument()
  })
})
