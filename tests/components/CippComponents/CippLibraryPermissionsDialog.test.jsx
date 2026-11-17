import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders } from '../../test-utils'
import { CippLibraryPermissionsDialog } from '../../../src/components/CippComponents/CippLibraryPermissionsDialog'

let captured
vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())
vi.mock('../../../src/hooks/use-permissions', () => ({
  usePermissions: () => ({ checkPermissions: () => true }),
}))
vi.mock('../../../src/components/CippComponents/CippApiDialog', () => ({
  CippApiDialog: () => null,
}))
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: ({ actions }) => {
    captured = actions
    return null
  },
}))

const rows = ['a', 'b', 'c'].map((id) => ({
  PrincipalId: id,
  Title: `User ${id}`,
  RoleDefinitionId: 1073741827,
}))

describe('CippLibraryPermissionsDialog bulk actions', () => {
  it.each(['Remove Permission', 'Change Permission Level'])(
    '%s builds one payload per selected row',
    (label) => {
      renderWithProviders(
        <CippLibraryPermissionsDialog
          row={{ webUrl: 'https://c.sharepoint.com/sites/x', siteId: 's' }}
          tenantFilter="contoso.onmicrosoft.com"
          drawerVisible={true}
          setDrawerVisible={() => {}}
        />
      )
      const action = captured.find((a) => a.label === label)
      const payload = action.customDataformatter(rows, action, { RoleDefinitionId: 5 })
      expect(Array.isArray(payload)).toBe(true)
      expect(payload.map((p) => p.PrincipalId)).toEqual(['a', 'b', 'c'])
      expect(action.confirmText(rows)).toContain('3 selected')
      expect(action.confirmText(rows)).not.toContain('[')
      expect(action.confirmText(rows[0])).toContain('[Title]')
    }
  )
})
