import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import { PermissionButton } from '../../src/utils/permissions'
import { usePermissions } from '../../src/hooks/use-permissions'

vi.mock('../../src/hooks/use-permissions', () => ({
  usePermissions: vi.fn(),
}))

const renderButton = (userPermissions, isAuthenticated = true) => {
  usePermissions.mockReturnValue({
    userPermissions,
    userRoles: [],
    isAuthenticated,
  })
  return renderWithProviders(
    <PermissionButton requiredPermissions={['Tenant.Application.ReadWrite']}>
      Contain app
    </PermissionButton>
  )
}

describe('PermissionButton', () => {
  it('disables the button and says which permission is missing', async () => {
    renderButton(['Tenant.Application.Read'])

    const button = screen.getByRole('button', { name: 'Contain app' })
    expect(button).toBeDisabled()
    await userEvent.hover(button.parentElement)
    expect(
      await screen.findByText(
        'Requires the Tenant.Application.ReadWrite permission'
      )
    ).toBeInTheDocument()
  })

  it('enables the button for a user holding the permission', () => {
    renderButton(['Tenant.Application.ReadWrite'])

    expect(screen.getByRole('button', { name: 'Contain app' })).toBeEnabled()
  })

  it('stays disabled without a tooltip while the user is still loading', () => {
    renderButton([], false)

    expect(screen.getByRole('button', { name: 'Contain app' })).toBeDisabled()
    expect(screen.queryByLabelText(/Requires/)).not.toBeInTheDocument()
  })
})
