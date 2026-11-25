import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'

vi.mock('../../../src/api/ApiCall', async () =>
  (await import('../../mocks/api-call')).apiCallMock()
)
import { api, getResult, postResult } from '../../mocks/api-call'

import { CippManagedBaselineRequestDrawer } from '../../../src/components/CippBaselines/CippManagedBaselineRequestDrawer'

const tenantsResult = getResult({
  data: [
    {
      defaultDomainName: 'contoso.com',
      displayName: 'Contoso',
      customerId: 'tenant-1',
    },
  ],
})
const emptyResult = getResult({ isSuccess: false })
api.get = (opts) =>
  opts?.url === '/api/ListTenants' ? tenantsResult : emptyResult
api.post = postResult()

const pick = async (user, field, option) => {
  await user.click(screen.getByRole('combobox', { name: field }))
  await user.click(await screen.findByRole('option', { name: option }))
}

const open = async (user) => {
  renderWithProviders(<CippManagedBaselineRequestDrawer />)
  await user.click(
    screen.getByRole('button', { name: 'Request Custom Baseline' })
  )
}

describe('Custom managed baseline request drawer', () => {
  it('asks what the MSP expects and which exceptions must exist, and not for a market', async () => {
    const user = userEvent.setup({ delay: null })
    await open(user)

    for (const field of [
      'Typical tenant to snapshot',
      'Main industry of your clients',
      'Typical client size',
      'Frameworks your clients have to meet',
    ]) {
      expect(screen.getByRole('combobox', { name: field })).toBeInTheDocument()
    }
    for (const field of [
      'What do you expect from this baseline?',
      'Which exceptions must exist?',
      'Anything else we should know?',
    ]) {
      expect(screen.getByRole('textbox', { name: field })).toBeInTheDocument()
    }
    expect(
      screen.queryByRole('textbox', { name: 'Market' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(
        /The request is refused when what you type names the tenant/
      )
    ).toBeInTheDocument()
  }, 60000)

  it('keeps sending unavailable until the expectations are filled in, then sends the request', async () => {
    const user = userEvent.setup({ delay: null })
    api.post.mutate.mockClear()
    await open(user)

    await pick(user, 'Typical tenant to snapshot', 'Contoso (contoso.com)')
    await pick(user, 'Main industry of your clients', 'Healthcare')
    await pick(user, 'Typical client size', '26-100 seats')

    expect(screen.getByRole('button', { name: 'Send Request' })).toBeDisabled()

    await user.type(
      screen.getByRole('textbox', {
        name: 'What do you expect from this baseline?',
      }),
      'Pass the insurance questionnaire'
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Which exceptions must exist?' }),
      'Scanners need SMTP'
    )
    await pick(user, 'Frameworks your clients have to meet', 'CIS')

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Send Request' })).toBeEnabled()
    )
    await user.click(screen.getByRole('button', { name: 'Send Request' }))

    await waitFor(() => expect(api.post.mutate).toHaveBeenCalled())
    const sent = api.post.mutate.mock.calls[0][0]
    expect(sent.url).toBe('/api/ExecManagedBaselineRequest')
    expect(sent.data).toMatchObject({
      Action: 'Create',
      clientSize: '26-100',
      wants: 'Pass the insurance questionnaire',
      exceptions: 'Scanners need SMTP',
    })
    expect(sent.data.market).toBeUndefined()
    expect(sent.data.tenantFilter.value).toBe('contoso.com')
    expect(sent.data.industry.value).toBe('Healthcare')
    expect(sent.data.frameworks.map((entry) => entry.value)).toEqual(['CIS'])
  }, 90000)
})
