import React from 'react'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { api, apiCallMock, getResult } from '../../mocks/api-call'
import { CippAutopilotProfileDrawer } from '../../../src/components/CippComponents/CippAutopilotProfileDrawer'

// The tenant selector talks to Graph; the autopilot drawer only needs it to drive
// `selectedTenants` on the form so the single-tenant gate around the group picker works.
const tenants = vi.hoisted(() => ({ value: [] }))
const tenantForm = vi.hoisted(() => ({ current: null }))
vi.mock(
  '../../../src/components/CippComponents/CippFormTenantSelector',
  async () => {
    const React = await import('react')
    return {
      CippFormTenantSelector: ({ formControl, name = 'selectedTenants' }) => {
        tenantForm.current = formControl
        React.useEffect(() => {
          formControl.setValue(name, tenants.value, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }, [formControl, name])
        return null
      },
    }
  }
)

vi.mock('../../../src/api/ApiCall', () => apiCallMock())

const singleTenant = [{ value: 'contoso.com', label: 'Contoso' }]
const multiTenant = [
  { value: 'contoso.com', label: 'Contoso' },
  { value: 'fabrikam.com', label: 'Fabrikam' },
]
const groupsResult = getResult({ data: [] })
const authWithGroupRead = getResult({
  data: {
    clientPrincipal: { userRoles: ['custom'] },
    permissions: ['Endpoint.Autopilot.ReadWrite', 'Identity.Group.Read'],
  },
})
const authWithoutGroupRead = getResult({
  data: {
    clientPrincipal: { userRoles: ['custom'] },
    permissions: ['Endpoint.Autopilot.ReadWrite'],
  },
})

async function openDrawer() {
  const user = userEvent.setup()
  renderWithProviders(<CippAutopilotProfileDrawer />)
  await user.click(screen.getByRole('button', { name: 'Add Profile' }))
  return user
}

describe('CippAutopilotProfileDrawer', () => {
  beforeEach(() => {
    tenants.value = singleTenant
    tenantForm.current = null
    api.get = (options) =>
      options.url === '/api/me' ? authWithGroupRead : groupsResult
    api.post = { ...api.post, mutate: vi.fn() }
  })

  it('shows no group UI while "Assign to all devices" is on (default)', async () => {
    await openDrawer()
    expect(
      screen.queryByText('Assign to Selected Groups')
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('warns instead of group-picking when more than one tenant is selected', async () => {
    tenants.value = multiTenant
    const user = await openDrawer()
    await user.click(screen.getByLabelText('Assign to all devices'))
    expect(
      screen.getByText(/profiling by group requires selecting a single tenant/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText('Assign to Selected Groups')
    ).not.toBeInTheDocument()
  })

  it('shows the group picker when groups are off and exactly one tenant is selected', async () => {
    const user = await openDrawer()
    await user.click(screen.getByLabelText('Assign to all devices'))
    expect(
      screen.queryByText(/profiling by group requires/i)
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Assign to Selected Groups' })
    ).toBeInTheDocument()
  })

  it('does not load the group picker without Identity Group Read permission', async () => {
    api.get = (options) =>
      options.url === '/api/me' ? authWithoutGroupRead : groupsResult

    const user = await openDrawer()
    await user.click(screen.getByLabelText('Assign to all devices'))

    expect(
      screen.getByText(/requires the Identity Group Read permission/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText('Assign to Selected Groups')
    ).not.toBeInTheDocument()
  })

  it('drops selected groups when the tenant changes before submission', async () => {
    const user = await openDrawer()
    await user.click(screen.getByLabelText('Assign to all devices'))

    act(() => {
      tenantForm.current.setValue('GroupIds', [
        { value: 'group-1', label: 'Group 1' },
      ])
      tenantForm.current.setValue('selectedTenants', [
        { value: 'fabrikam.com', label: 'Fabrikam' },
      ])
    })

    await user.type(
      screen.getByRole('textbox', { name: 'Display Name' }),
      'Test AP'
    )
    const submit = screen.getByRole('button', { name: 'Create Profile' })
    await waitFor(() => expect(submit).toBeEnabled())
    await user.click(submit)

    await waitFor(() => expect(api.post.mutate).toHaveBeenCalledTimes(1))
    expect(api.post.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ GroupIds: [] }),
      })
    )
  })

  it('submits to AddAutopilotConfig with group ids as an array', async () => {
    const user = await openDrawer()
    await user.type(
      screen.getByRole('textbox', { name: 'Display Name' }),
      'Test AP'
    )
    const submit = screen.getByRole('button', { name: 'Create Profile' })
    await waitFor(() => expect(submit).toBeEnabled())
    await user.click(submit)

    await waitFor(() => {
      expect(api.post.mutate).toHaveBeenCalledTimes(1)
    })
    expect(api.post.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/AddAutopilotConfig',
        data: expect.objectContaining({ DisplayName: 'Test AP', GroupIds: [] }),
      })
    )
  })
})
