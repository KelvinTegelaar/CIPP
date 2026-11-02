import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())
import { api, getResult, postResult } from '../../mocks/api-call'

import { CippSettingsSideBar } from '../../../src/components/CippComponents/CippSettingsSideBar'

const meResult = getResult({ data: { clientPrincipal: { userDetails: 'admin@contoso.com' } } })
api.get = meResult

// handleSaveChanges posts an explicit field allowlist, a preference missing from it saves
// as a silent no-op ("Settings saved successfully" toast, nothing stored)
const Harness = () => {
  const formcontrol = useForm({
    defaultValues: {
      user: { label: 'Current User', value: 'admin@contoso.com' },
      tableViewMode: { value: 'table', label: 'Always classic table' },
      tablePageSize: { value: '50', label: '50' },
    },
  })
  return <CippSettingsSideBar formcontrol={formcontrol} />
}

describe('CippSettingsSideBar save allowlist', () => {
  it('Save Changes posts tableViewMode with the settings blob', async () => {
    const user = userEvent.setup()
    api.post = postResult()
    renderWithProviders(<Harness />)

    await user.click(await screen.findByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(api.post.mutate).toHaveBeenCalled())
    const payload = api.post.mutate.mock.calls[0][0]
    expect(payload.data.user).toBe('admin@contoso.com')
    expect(payload.data.currentSettings.tableViewMode).toEqual({
      value: 'table',
      label: 'Always classic table',
    })
    expect(payload.data.currentSettings.tablePageSize).toEqual({ value: '50', label: '50' })
  })
})
