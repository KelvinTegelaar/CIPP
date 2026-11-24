import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test-utils'
import router from '../mocks/next-router'
import { api, getResult, paginatedResult } from '../mocks/api-call'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
vi.mock('../../src/components/CippFormPages/CippFormPage', () => ({
  default: (props) => <div>{props.children}</div>,
}))
vi.mock('../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: () => <div data-testid="table-stub" />,
}))
// Capture the options each dropdown is handed instead of driving MUI popups in jsdom
const fields = vi.hoisted(() => ({}))
vi.mock('../../src/components/CippComponents/CippFormComponent', () => {
  const CippFormComponent = (props) => {
    fields[props.name] = props
    return <div>{props.label}</div>
  }
  return { default: CippFormComponent, CippFormComponent }
})

import Page from '../../src/pages/identity/administration/groups/edit.jsx'

const groupResult = getResult({
  data: {
    groupInfo: { id: 'group-1', displayName: 'Sales', mailEnabled: false, securityEnabled: true },
    owners: [],
    members: [
      {
        '@odata.type': '#microsoft.graph.user',
        id: 'user-1',
        displayName: 'Ann',
        userPrincipalName: 'ann@contoso.com',
      },
      {
        '@odata.type': '#microsoft.graph.group',
        id: 'group-2',
        displayName: 'Nested',
        mailEnabled: false,
        securityEnabled: true,
      },
      {
        '@odata.type': '#microsoft.graph.device',
        id: 'device-1',
        displayName: 'LAPTOP-01',
        operatingSystem: 'Windows',
      },
      { '@odata.type': '#microsoft.graph.servicePrincipal', id: 'sp-1', displayName: 'My App' },
    ],
  },
})
const emptyList = paginatedResult([])

const renderPage = async (groupType) => {
  for (const name of Object.keys(fields)) delete fields[name]
  router.query = { groupId: 'group-1', groupType }
  api.get = () => groupResult
  api.paginated = () => emptyList
  renderWithProviders(<Page />)
  await screen.findByText('Group Properties')
}

describe('Edit Group page - removing devices', () => {
  it('offers devices under Remove Devices and keeps them out of Remove Members', async () => {
    await renderPage('Security')

    expect(fields.RemoveDevice.options).toEqual([
      { label: 'LAPTOP-01 (Windows)', value: 'device-1', addedFields: { displayName: 'LAPTOP-01' } },
    ])
    expect(fields.RemoveMember.options.map((option) => option.label)).toEqual([
      'Ann (ann@contoso.com)',
      'Nested (Security Group)',
      'My App (Service Principal)',
    ])
  })

  it('offers no Remove Devices field on a distribution list', async () => {
    await renderPage('Distribution List')

    expect(fields.RemoveDevice).toBeUndefined()
  })
})
