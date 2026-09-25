import React, { useState } from 'react'
import { act, screen, fireEvent } from '@testing-library/react'
import { renderWithProviders, settingsWith } from '../test-utils'
import { api, getResult } from '../mocks/api-call'
import { SettingsContext } from '../../src/contexts/settings-context'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

// the form shell and the tenant-bound pickers are stubbed: these tests pin what the pages do
// with their own form state, not what the pickers fetch
const form = vi.hoisted(() => ({ current: null, followUpRequests: null }))
vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
vi.mock('../../src/components/CippFormPages/CippFormPage', () => ({
  default: ({ formControl, followUpRequests, children }) => {
    form.current = formControl
    form.followUpRequests = followUpRequests
    return <div>{children}</div>
  },
}))
vi.mock('../../src/components/CippComponents/CippFormTenantSelector', () => ({
  CippFormTenantSelector: () => null,
}))
vi.mock('../../src/components/CippComponents/CippFormUserSelector', () => ({
  CippFormUserSelector: () => null,
}))
vi.mock('../../src/components/CippComponents/CippFormGroupSelector', () => ({
  CippFormGroupSelector: () => null,
}))
vi.mock('../../src/components/CippComponents/CippFormDomainSelector', () => ({
  CippFormDomainSelector: () => null,
}))
vi.mock('../../src/components/CippComponents/CippJitRoleTemplateApply', () => ({
  CippJitRoleTemplateApply: () => null,
}))

import TemplatePage from '../../src/pages/identity/administration/jit-admin-templates/add.jsx'
import JitAdminPage from '../../src/pages/identity/administration/jit-admin/add.jsx'

const emptyGet = getResult()
beforeEach(() => {
  api.get = () => emptyGet
})

const auditSwitch = () =>
  screen.getByRole('switch', {
    name: 'Exclude from location-based audit log alerts',
  })
const existingUserRadio = () =>
  screen.getByRole('radio', { name: 'Existing User' })

describe('JIT Admin template page tenant scope', () => {
  // the template page has no tenant picker, it follows the top-bar tenant
  let setTenant
  const Harness = ({ exposeSetter }) => {
    const [tenant, set] = useState('contoso.onmicrosoft.com')
    exposeSetter(set)
    return (
      <SettingsContext.Provider value={settingsWith({ currentTenant: tenant })}>
        <TemplatePage />
      </SettingsContext.Provider>
    )
  }

  it('saves the template to the tenant switched to, not the one the page opened on', () => {
    renderWithProviders(<Harness exposeSetter={(set) => (setTenant = set)} />)
    act(() => setTenant('fabrikam.onmicrosoft.com'))
    expect(form.current.getValues('tenantFilter')).toBe(
      'fabrikam.onmicrosoft.com'
    )
  })

  it('switching to AllTenants disables Existing User and clears the tenant-bound defaults', () => {
    renderWithProviders(<Harness exposeSetter={(set) => (setTenant = set)} />)
    fireEvent.click(existingUserRadio())
    act(() => {
      form.current.setValue('defaultExistingUser', {
        value: 'user-1',
        label: 'Jane',
      })
      form.current.setValue('defaultVacationMode', true)
    })
    act(() => {
      form.current.setValue('defaultVacationCAPolicy', [
        { value: 'policy-1', label: 'Block' },
      ])
    })

    act(() => setTenant('AllTenants'))

    expect(existingUserRadio()).toBeDisabled()
    expect(form.current.getValues('defaultUserAction')).toBeNull()
    expect(form.current.getValues('defaultExistingUser')).toBeNull()
    expect(form.current.getValues('defaultVacationMode')).toBe(false)
    expect(form.current.getValues('defaultVacationCAPolicy')).toEqual([])
  })
})

describe('JIT Admin page tenant scope', () => {
  const renderPage = () =>
    renderWithProviders(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <JitAdminPage />
      </LocalizationProvider>
    )
  const pickTenant = (value) =>
    act(() => form.current.setValue('tenantFilter', { value, label: value }))

  it('only allows Existing User once a specific tenant is picked', () => {
    renderPage()
    expect(existingUserRadio()).toBeDisabled()
    pickTenant('contoso.onmicrosoft.com')
    expect(existingUserRadio()).not.toBeDisabled()
  })

  it('drops the picked user and CA policies when the tenant changes', () => {
    renderPage()
    pickTenant('contoso.onmicrosoft.com')
    fireEvent.click(existingUserRadio())
    act(() => {
      form.current.setValue('existingUser', { value: 'user-1', label: 'Jane' })
      form.current.setValue('vacationCAPolicy', [
        { value: 'policy-1', label: 'Block' },
      ])
    })

    pickTenant('fabrikam.onmicrosoft.com')

    expect(form.current.getValues('existingUser')).toBeNull()
    expect(form.current.getValues('vacationCAPolicy')).toEqual([])
  })
})

describe('audit alert exclusion is independent of vacation mode', () => {
  it('can be enabled on a template without enabling vacation mode', () => {
    renderWithProviders(<TemplatePage />)
    fireEvent.click(existingUserRadio())
    fireEvent.click(auditSwitch())
    expect(form.current.getValues('defaultVacationMode')).toBeFalsy()
    expect(form.current.getValues('defaultVacationExcludeAuditAlerts')).toBe(
      true
    )
  })

  it('is scheduled on submit without vacation mode, and no CA exclusion is sent', () => {
    renderWithProviders(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <JitAdminPage />
      </LocalizationProvider>
    )
    act(() =>
      form.current.setValue('tenantFilter', {
        value: 'contoso.onmicrosoft.com',
        label: 'contoso.onmicrosoft.com',
      })
    )
    fireEvent.click(existingUserRadio())
    fireEvent.click(auditSwitch())

    const requests = form.followUpRequests(form.current.getValues())

    expect(requests.map((request) => request.url)).toEqual([
      '/api/ExecScheduleAuditExclusionVacation',
    ])
    expect(requests[0].data.tenantFilter).toBe('contoso.onmicrosoft.com')
  })
})
