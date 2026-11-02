import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippDataTable } from '../../../src/components/CippTable/CippDataTable'

// Built-in Graph Explorer presets (src/data/GraphExplorerPresets.json) are matched to a
// ListGraphRequest table by endpoint and listed under "Graph filters" in the Filters menu.
// This pins that the servicePrincipals presets reach the Enterprise Applications page.

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())
import { api, getResult, paginatedResult, postResult } from '../../mocks/api-call'

const rows = [
  { displayName: 'Contoso App', appId: 'b78f6a77-d4e5-46fb-87e5-d1648bd02519' },
  { displayName: 'Fabrikam App', appId: '00000000-0000-0000-0000-000000000001' },
]

const noSavedPresets = getResult({ data: { Results: [] } })
const idleGet = getResult({ isSuccess: false })
const tableData = paginatedResult(rows)

api.get = (opts) => (opts.url === '/api/ListGraphExplorerPresets' ? noSavedPresets : idleGet)
api.paginated = () => tableData
api.post = postResult()

describe('CIPPTableToptoolbar - built-in Graph Explorer presets', () => {
  it('lists the servicePrincipals presets, including Connectwise Breached Apps, under Graph filters', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippDataTable
        api={{
          url: '/api/ListGraphRequest',
          dataKey: 'Results',
          data: { Endpoint: 'servicePrincipals', $select: 'id,appId,displayName', $count: true, $top: 999 },
        }}
        queryKey="BuiltinPresetTest"
        simpleColumns={['displayName', 'appId']}
        filters={[
          { filterName: 'Hidden from MyApps portal', value: [{ id: 'tags', value: 'HideApp' }], type: 'column' },
        ]}
        maxHeightOffset="100px"
      />
    )
    await screen.findByText('1-2 of 2')

    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await screen.findByRole('menuitem', { name: 'Reset all filters' })

    expect(screen.getByText('Graph filters')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'All Enterprise Applications' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'SAML Applications' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Connectwise Breached Apps' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Hidden from MyApps portal' })).toBeInTheDocument()
  }, 30000)
})
