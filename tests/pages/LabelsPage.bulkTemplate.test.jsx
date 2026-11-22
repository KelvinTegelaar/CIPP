import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import { api, getResult } from '../mocks/api-call'
import { CippApiDialog } from '../../src/components/CippComponents/CippApiDialog'

const tableProps = vi.hoisted(() => ({ current: null }))
vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
vi.mock('../../src/components/CippComponents/CippTablePage.jsx', () => ({
  CippTablePage: (props) => {
    tableProps.current = props
    return <div data-testid="table-page-stub" />
  },
}))

import Page from '../../src/pages/security/compliance/labels/index.jsx'

const labels = [
  { DisplayName: 'Public', Name: 'public', Guid: 'g-1', Priority: 0 },
  { DisplayName: 'Secret', Name: 'secret', Guid: 'g-2', Priority: 1 },
]

const emptyGet = getResult()

describe('Labels page - Create template based on label', () => {
  let action
  let post

  beforeEach(() => {
    post = { mutate: vi.fn(), reset: vi.fn(), isPending: false, isSuccess: false, data: undefined }
    api.post = post
    api.get = () => emptyGet
    const { unmount } = renderWithProviders(<Page />)
    action = tableProps.current.actions.find(
      (entry) => entry.label === 'Create template based on label'
    )
    unmount()
  })

  const confirm = async (row) => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippApiDialog
        createDialog={{ open: true, handleClose: vi.fn() }}
        title="Create template based on label"
        api={action}
        row={row}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Confirm' }))
    await waitFor(() => expect(post.mutate).toHaveBeenCalledTimes(1))
    return post.mutate.mock.calls[0][0]
  }

  it('is offered in bulk', () => {
    expect(action.hideBulk).toBeUndefined()
  })

  it('posts one request per selected label, each with its tenantFilter', async () => {
    const call = await confirm(labels)
    expect(call.url).toBe('/api/AddSensitivityLabelTemplate')
    expect(call.bulkRequest).toBe(true)
    expect(call.data).toEqual(
      labels.map((label) => ({ ...label, tenantFilter: 'testdomain.com' }))
    )
  })

  it('posts a single label as one plain request', async () => {
    const call = await confirm(labels[0])
    expect(call.bulkRequest).toBe(false)
    expect(call.data).toEqual({ ...labels[0], tenantFilter: 'testdomain.com' })
  })
})
