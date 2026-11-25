import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../test-utils'
import { api, getResult, postResult } from '../mocks/api-call'

const selector = vi.hoisted(() => ({ select: null }))
const permissions = vi.hoisted(() => ({ granted: [] }))
const tracker = vi.hoisted(() => ({ props: null }))

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
vi.mock('../../src/components/CippComponents/CippFormTenantSelector', () => ({
  CippFormTenantSelector: ({ formControl, name }) => {
    useEffect(() => {
      selector.select = (tenants) =>
        formControl.setValue(name, tenants, { shouldValidate: true })
      selector.select([
        { value: 'contoso.com', label: 'Contoso (contoso.com)' },
      ])
    }, [formControl, name])
    return null
  },
}))
vi.mock('../../src/components/CippComponents/CippOffCanvas', () => ({
  CippOffCanvas: ({ children, footer, visible }) =>
    visible ? (
      <div>
        {children}
        {footer}
      </div>
    ) : null,
}))
vi.mock('../../src/components/CippComponents/CippApiResults', () => ({
  CippApiResults: () => null,
}))
vi.mock('../../src/hooks/use-permissions', () => ({
  usePermissions: () => ({
    checkPermissions: (required) =>
      required.some((entry) =>
        permissions.granted.some((granted) =>
          entry.endsWith('*')
            ? granted.startsWith(entry.slice(0, -1))
            : granted === entry
        )
      ),
  }),
}))
vi.mock('../../src/components/CippTable/CippQueueTracker', () => ({
  CippQueueTracker: (props) => {
    tracker.props = props
    return <div data-testid="queue-tracker" />
  },
}))

import { CippAddDefenderIndicatorDrawer } from '../../src/components/CippComponents/CippAddDefenderIndicatorDrawer'

const sha256 = 'a3f5'.repeat(16)

const tenantList = getResult({
  data: [
    { customerId: 'AllTenants', defaultDomainName: 'AllTenants' },
    { customerId: 'id-a', defaultDomainName: 'contoso.com' },
    { customerId: 'id-b', defaultDomainName: 'fabrikam.com' },
    { customerId: 'id-c', defaultDomainName: 'tailspin.com' },
  ],
})

const openDrawer = async (props = {}) => {
  const user = userEvent.setup()
  renderWithProviders(
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <CippAddDefenderIndicatorDrawer {...props} />
    </LocalizationProvider>
  )
  await user.click(screen.getByRole('button', { name: 'Add Indicator' }))
  return user
}

const typeKeys = [
  'FileSha256',
  'FileSha1',
  'FileMd5',
  'CertificateThumbprint',
  'IpAddress',
  'Url',
  'DomainName',
]
const actionChoices = () =>
  screen
    .queryAllByRole('radio')
    .map((radio) => radio.value)
    .filter((value) => !typeKeys.includes(value))

const paste = async (user, name, text) => {
  await user.click(screen.getByRole('textbox', { name }))
  await user.paste(text)
}

const fill = async (user, { type, action, values = sha256 }) => {
  await user.click(screen.getByLabelText(type))
  if (action) await user.click(screen.getByLabelText(action))
  await paste(user, 'Values', values)
  await paste(user, 'Title', 'Known bad')
}

const submitButton = () =>
  screen
    .getAllByRole('button', { name: 'Add Indicator' })
    .find((button) => button.closest('div[style]'))

const acknowledgement = () =>
  screen.queryByRole('checkbox', { name: /I understand/ })

beforeEach(() => {
  api.post = postResult()
  api.get = tenantList
  permissions.granted = []
  tracker.props = null
})

describe('Add Defender indicator drawer', () => {
  it.each([
    [
      'File (SHA-256 hash)',
      ['Allowed', 'Audit', 'Warn', 'Block', 'BlockAndRemediate'],
    ],
    [
      'File (SHA-1 hash)',
      ['Allowed', 'Audit', 'Warn', 'Block', 'BlockAndRemediate'],
    ],
    [
      'File (MD5 hash)',
      ['Allowed', 'Audit', 'Warn', 'Block', 'BlockAndRemediate'],
    ],
    ['Certificate (SHA-1 thumbprint)', ['Allowed', 'BlockAndRemediate']],
    ['IP address', ['Allowed', 'Audit', 'Warn', 'Block']],
    ['URL', ['Allowed', 'Audit', 'Warn', 'Block']],
    ['Domain', ['Allowed', 'Audit', 'Warn', 'Block']],
  ])('offers the actions Defender supports for %s', async (type, expected) => {
    const user = await openDrawer()
    expect(actionChoices()).toEqual([])
    await user.click(screen.getByLabelText(type))
    expect(actionChoices()).toEqual(expected)
  })

  it('labels a certificate block as Block', async () => {
    const user = await openDrawer()
    await user.click(screen.getByLabelText('Certificate (SHA-1 thumbprint)'))
    expect(screen.getByLabelText('Block')).toHaveProperty(
      'value',
      'BlockAndRemediate'
    )
  })

  it('clears an action the new type does not support', async () => {
    const user = await openDrawer()
    await user.click(screen.getByLabelText('File (SHA-256 hash)'))
    await user.click(screen.getByLabelText(/^Warn/))
    await user.click(screen.getByLabelText('Certificate (SHA-1 thumbprint)'))
    expect(
      screen.getAllByRole('radio', { checked: true }).map((r) => r.value)
    ).toEqual(['CertificateThumbprint'])
  })

  it('sends a block for the selected tenants with each value once', async () => {
    const user = await openDrawer()
    await fill(user, {
      type: 'File (SHA-256 hash)',
      action: 'Block',
      values: `${sha256}\n  ${sha256}  \n\n${'d'.repeat(64)}`,
    })
    await act(() =>
      selector.select([
        { value: 'contoso.com', label: 'Contoso' },
        { value: 'fabrikam.com', label: 'Fabrikam' },
      ])
    )
    expect(acknowledgement()).toBeNull()
    await waitFor(() => expect(submitButton()).not.toBeDisabled())
    await user.click(submitButton())
    expect(api.post.mutate).toHaveBeenCalledTimes(1)
    expect(api.post.mutate.mock.calls[0][0]).toEqual({
      url: '/api/AddDefenderIndicator',
      data: {
        tenantFilter: ['contoso.com', 'fabrikam.com'],
        IndicatorType: 'FileSha256',
        Values: [sha256, 'd'.repeat(64)],
        Action: 'Block',
        Title: 'Known bad',
        Description: undefined,
        ExpirationTime: undefined,
        Severity: undefined,
        acknowledgeAllow: false,
      },
    })
  })

  it('sends AllTenants on its own', async () => {
    const user = await openDrawer()
    await fill(user, { type: 'Domain', action: 'Block', values: 'bad.example' })
    await act(() =>
      selector.select([{ value: 'AllTenants', label: 'All Tenants' }])
    )
    await waitFor(() => expect(submitButton()).not.toBeDisabled())
    await user.click(submitButton())
    expect(api.post.mutate.mock.calls[0][0].data.tenantFilter).toBe(
      'AllTenants'
    )
  })

  it.each(['Title', 'Description (optional)'])(
    'treats percent signs in %s as literal text',
    async (field) => {
      const get = vi.fn(() => tenantList)
      api.get = get
      const user = await openDrawer()
      await user.type(screen.getByRole('textbox', { name: field }), '%')
      expect(
        get.mock.calls.some(
          ([options]) =>
            options.waiting &&
            options.url?.startsWith('/api/ListCustomVariables?') &&
            options.url.includes('includeSystem=false')
        )
      ).toBe(false)
    }
  )

  it('blocks submission when the chosen expiration is in the past', async () => {
    const user = await openDrawer()
    await fill(user, { type: 'Domain', action: 'Block', values: 'bad.example' })
    await waitFor(() => expect(submitButton()).not.toBeDisabled())
    await user.click(screen.getByRole('button', { name: 'Now' }))
    await waitFor(() => expect(submitButton()).toBeDisabled())
    expect(
      screen.getAllByText('Choose a future expiration date')[0]
    ).toBeVisible()
    expect(api.post.mutate).not.toHaveBeenCalled()
  })

  it.each([
    ['File (SHA-256 hash)', /will trust this file/],
    [
      'Certificate (SHA-1 thumbprint)',
      /every file signed with this certificate/,
    ],
    ['URL', /takes precedence over Block and Warn/],
  ])(
    'warns what Allow does for %s and requires the acknowledgement',
    async (type, effect) => {
      const user = await openDrawer()
      const value =
        type === 'URL'
          ? 'https://bad.example/x'
          : type.startsWith('File')
            ? sha256
            : 'b4e6'.repeat(10)
      await fill(user, { type, action: 'Allow', values: value })
      expect(screen.getByText(effect)).toBeTruthy()
      expect(acknowledgement()).not.toBeChecked()
      expect(submitButton()).toBeDisabled()
      await user.click(acknowledgement())
      await waitFor(() => expect(submitButton()).not.toBeDisabled())
      await user.click(submitButton())
      expect(api.post.mutate.mock.calls[0][0].data).toMatchObject({
        Action: 'Allowed',
        acknowledgeAllow: true,
      })
    }
  )

  it('names the value and tenant counts, counting every tenant for All Tenants', async () => {
    const user = await openDrawer()
    await fill(user, {
      type: 'File (SHA-256 hash)',
      action: 'Allow',
      values: `${sha256}\n${'d'.repeat(64)}`,
    })
    expect(acknowledgement().closest('label').textContent).toBe(
      'I understand that Defender will trust 2 values in 1 tenant.'
    )
    await act(() =>
      selector.select([{ value: 'AllTenants', label: 'All Tenants' }])
    )
    expect(acknowledgement().closest('label').textContent).toBe(
      'I understand that Defender will trust 2 values in 3 tenants.'
    )
  })

  it.each([
    [
      'the tenants',
      () =>
        act(() =>
          selector.select([
            { value: 'contoso.com', label: 'Contoso' },
            { value: 'fabrikam.com', label: 'Fabrikam' },
          ])
        ),
    ],
    ['the values', (user) => paste(user, 'Values', `\n${'e'.repeat(64)}`)],
    [
      'the type',
      async (user) => {
        await user.click(screen.getByLabelText('File (SHA-1 hash)'))
        await user.click(screen.getByLabelText('Allow'))
      },
    ],
    [
      'the action',
      async (user) => {
        await user.click(screen.getByLabelText('Block'))
        await user.click(screen.getByLabelText('Allow'))
      },
    ],
  ])('clears the acknowledgement when %s change', async (_name, change) => {
    const user = await openDrawer()
    await fill(user, { type: 'File (SHA-256 hash)', action: 'Allow' })
    await user.click(acknowledgement())
    expect(acknowledgement()).toBeChecked()
    await change(user)
    await waitFor(() => expect(acknowledgement()).not.toBeChecked())
    expect(submitButton()).toBeDisabled()
  })
})

describe('Add Defender indicator drawer progress', () => {
  const queued = postResult({
    isSuccess: true,
    data: {
      status: 202,
      data: {
        Results: 'Queued 1 Block DomainName indicator for 3 tenants.',
        Metadata: { QueueId: 'queue-1' },
      },
    },
  })

  const openWithQueuedResponse = async (queryKey) => {
    const post = vi.fn(() => queued)
    api.post = post
    const user = await openDrawer({ queryKey })
    await act(() => post.mock.lastCall[0].onResult(queued.data.data))
    return user
  }

  it.each([
    ['the live list', 'ListDefenderIndicators-contoso.com'],
    ['stored data', 'ListDefenderIndicators-AllTenants-true'],
  ])(
    'passes the query key for %s to the queue tracker',
    async (_name, queryKey) => {
      permissions.granted = ['CIPP.Core.Read']
      await openWithQueuedResponse(queryKey)
      expect(screen.getByTestId('queue-tracker')).toBeTruthy()
      expect(tracker.props).toEqual({
        queueId: 'queue-1',
        queryKey,
        title: 'Add Defender indicators',
      })
    }
  )

  it('keeps tracking the accepted job after the drawer closes', async () => {
    permissions.granted = ['CIPP.Core.Read']
    const user = await openWithQueuedResponse(
      'ListDefenderIndicators-contoso.com'
    )
    expect(screen.getByTestId('queue-tracker')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.getByTestId('queue-tracker')).toBeTruthy()
    expect(tracker.props.queueId).toBe('queue-1')
  })

  it('shows the queue ID for a technician who cannot read the queue', async () => {
    permissions.granted = ['Security.Defender.ReadWrite']
    await openWithQueuedResponse('ListDefenderIndicators-AllTenants')
    expect(screen.getByText('Queue ID queue-1')).toBeTruthy()
    expect(screen.queryByTestId('queue-tracker')).toBeNull()
  })

  it.each([
    [
      'an add to one tenant',
      postResult({
        isSuccess: true,
        data: {
          status: 200,
          data: {
            Results: [
              {
                resultText: 'Added Block indicator bad.example in contoso.com.',
                state: 'success',
              },
            ],
          },
        },
      }),
    ],
    [
      'a failed submission',
      postResult({
        isError: true,
        error: {
          response: {
            status: 500,
            data: { Results: 'CIPP could not start adding the indicators' },
          },
        },
      }),
    ],
  ])('shows no queue for %s', async (_name, result) => {
    permissions.granted = ['CIPP.Core.Read']
    api.post = result
    await openDrawer({ queryKey: 'ListDefenderIndicators-contoso.com' })
    expect(screen.queryByTestId('queue-tracker')).toBeNull()
  })
})
