import React, { useReducer } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippBulkUserDrawer } from '../../../src/components/CippComponents/CippBulkUserDrawer'
import { CippBulkInviteGuestDrawer } from '../../../src/components/CippComponents/CippBulkInviteGuestDrawer'

// The tenant the settings hook reports; tests change it between renders to mimic the
// tenant selector while the Users page stays mounted.
let currentTenant = 'tenant-a.example.com'
vi.mock('../../../src/hooks/use-settings', () => ({
  useSettings: () => ({ currentTenant, usageLocation: 'US' }),
}))
vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({ CippDataTable: () => null }))
vi.mock('../../../src/components/CippComponents/CippFormLicenseSelector', () => ({
  CippFormLicenseSelector: () => null,
}))

// Capture the drawer's form so the test can read what a submit would send.
let formApi = null
vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useForm: (opts) => {
      const form = actual.useForm(opts)
      formApi = form
      return form
    },
  }
})

describe.each([
  ['CippBulkUserDrawer', CippBulkUserDrawer, 'Bulk Add Users'],
  ['CippBulkInviteGuestDrawer', CippBulkInviteGuestDrawer, 'Bulk Invite Guests'],
])('%s', (_name, Drawer, buttonText) => {
  beforeEach(() => {
    currentTenant = 'tenant-a.example.com'
    formApi = null
  })

  it('targets the tenant selected when the drawer is opened, not when the page loaded', async () => {
    // Re-renders in place, as the Users page does when the tenant selector changes.
    let rerenderInPlace = null
    function Harness() {
      const [, bump] = useReducer((n) => n + 1, 0)
      rerenderInPlace = bump
      return <Drawer />
    }
    renderWithProviders(<Harness />)
    expect(formApi.getValues('tenantFilter')).toBe('tenant-a.example.com')

    currentTenant = 'tenant-b.example.com'
    await act(() => rerenderInPlace())
    await userEvent.click(screen.getByRole('button', { name: buttonText }))

    expect(formApi.getValues('tenantFilter')).toBe('tenant-b.example.com')
  })
})
