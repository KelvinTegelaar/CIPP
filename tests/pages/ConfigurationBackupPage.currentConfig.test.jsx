import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test-utils'
import router from '../mocks/next-router'

vi.mock('../../src/api/ApiCall', async () => (await import('../mocks/api-call')).apiCallMock())
import { api, getResult } from '../mocks/api-call'

vi.mock('../../src/layouts/HeaderedTabbedLayout', () => ({
  HeaderedTabbedLayout: ({ children }) => <div>{children}</div>,
}))
vi.mock('../../src/components/CippComponents/CippBackupScheduleDrawer', () => ({
  CippBackupScheduleDrawer: () => null,
}))
vi.mock('../../src/components/CippComponents/CippRestoreBackupDrawer', () => ({
  CippRestoreBackupDrawer: () => null,
}))
vi.mock('../../src/components/CippComponents/CippFormTenantSelector', () => ({
  CippFormTenantSelector: () => null,
}))
// the remove dialog posts api.data.ID to RemoveScheduledItem
const removeDialogApi = vi.hoisted(() => ({ current: null }))
vi.mock('../../src/components/CippComponents/CippApiDialog', () => ({
  CippApiDialog: ({ api: dialogApi }) => {
    removeDialogApi.current = dialogApi
    return null
  },
}))

import Page from '../../src/pages/tenant/manage/configuration-backup.jsx'

// ListScheduledItems rows: Tenant is reshaped to {label, value, type}; a task with no tenant
// comes back as the string 'None'
const task = (rowKey, tenant, name) => ({
  RowKey: rowKey,
  Name: name,
  Tenant: tenant === 'None' ? 'None' : { label: tenant, value: tenant, type: 'Tenant' },
  Command: { value: 'New-CIPPBackup' },
  Parameters: { ScheduledBackupValues: { users: true } },
  Recurrence: { value: '1d' },
  TaskState: 'Planned',
})

const backups = getResult({ data: [] })
let scheduled
api.get = (opts) => (opts?.url === '/api/ListScheduledItems' ? scheduled : backups)

describe('Configuration backup page - current schedule selection', () => {
  beforeEach(() => {
    router.query = {}
    removeDialogApi.current = null
  })

  it("shows and removes the tenant's own schedule even when the AllTenants schedule is listed first", () => {
    scheduled = getResult({
      data: [
        task('none-row', 'None', 'Orphaned backup'),
        task('all-row', 'AllTenants', 'All tenants backup'),
        task('tenant-row', 'testdomain.com', 'Tenant backup'),
      ],
    })
    renderWithProviders(<Page />)

    expect(screen.getByText('Tenant backup')).toBeInTheDocument()
    expect(screen.queryByText('All tenants backup')).not.toBeInTheDocument()
    expect(removeDialogApi.current.data).toEqual({ ID: 'tenant-row' })
  })

  it('falls back to the AllTenants schedule when the tenant has none of its own', () => {
    scheduled = getResult({
      data: [task('other-row', 'other.com', 'Other backup'), task('all-row', 'AllTenants', 'All tenants backup')],
    })
    renderWithProviders(<Page />)

    expect(screen.getByText('All tenants backup')).toBeInTheDocument()
    expect(removeDialogApi.current.data).toEqual({ ID: 'all-row' })
  })
})
