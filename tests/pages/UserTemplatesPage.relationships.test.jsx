import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../test-utils'
import { api, getResult, postResult } from '../mocks/api-call'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
vi.mock('../../src/components/CippComponents/CippTablePage.jsx', () => ({
  CippTablePage: ({ cardButton }) => <div>{cardButton}</div>,
}))

import Page from '../../src/pages/identity/administration/users/user-defaults.jsx'

const allTenants = settingsWith({ currentTenant: 'AllTenants' })

const fillTemplate = async (user, manager) => {
  renderWithProviders(<Page />, { settings: allTenants })
  await user.click(screen.getByRole('button', { name: 'Add Template' }))
  await user.type(
    screen.getByRole('textbox', { name: /Template Name/ }),
    'Sales'
  )
  await user.type(screen.getByRole('textbox', { name: 'Manager' }), manager)
}

describe('User Templates page - manager', () => {
  let post

  beforeEach(() => {
    post = postResult()
    api.get = getResult()
    api.post = () => post
  })

  it('saves a variable typed into Manager on an All Tenants template', async () => {
    const user = userEvent.setup()
    await fillTemplate(user, '%salesmanager%')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(post.mutate).toHaveBeenCalledTimes(1))
    expect(post.mutate.mock.calls[0][0].data).toMatchObject({
      tenantFilter: 'AllTenants',
      setManager: '%salesmanager%',
    })
  })

  it('refuses a user principal name on an All Tenants template', async () => {
    await fillTemplate(userEvent.setup(), 'jane@contoso.com')

    expect(
      await screen.findByText(
        'Templates shared across tenants need a variable, for example %salesmanager%'
      )
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
  })
})
