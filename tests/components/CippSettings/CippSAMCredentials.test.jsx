import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import {
  CippSAMCredentials,
  credentialActions,
} from '../../../src/components/CippSettings/CippSAMCredentials'

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())
import { api, getResult, postResult } from '../../mocks/api-call'

// not under test, pulls clipboard/codeblock trees
vi.mock('../../../src/components/CippComponents/CippApiResults', () => ({
  CippApiResults: () => null,
}))

// the shared table is covered by its own suite; capture what the card hands it
const tableProps = vi.hoisted(() => ({ current: null }))
vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: (props) => {
    tableProps.current = props
    return <div data-testid="credentials-table">{props.data.length}</div>
  },
}))

api.get = null
api.post = postResult()

const inYears = (n) => new Date(Date.now() + n * 365 * 24 * 60 * 60 * 1000).toISOString()

const credential = (overrides) => ({
  keyId: '00000000-0000-0000-0000-000000000001',
  displayName: 'UpdateTokens',
  type: 'Secret',
  startDateTime: '2026-01-01T00:00:00Z',
  endDateTime: inYears(1),
  hint: 'abc',
  thumbprint: null,
  owner: 'thisInstance',
  expired: false,
  known: false,
  ...overrides,
})

// Invoke-ExecSAMCredentials.ps1 Status action
const statusResults = (overrides) => ({
  applicationId: '5f9c2d1e-8f30-4c9e-9d5a-1b2c3d4e5f60',
  tenantId: '11111111-2222-3333-4444-555555555555',
  tenantDomain: 'contoso.onmicrosoft.com',
  authMode: 'secret',
  storedSecret: { state: 'valid', keyId: '00000000-0000-0000-0000-000000000001', expires: inYears(1) },
  certificate: { configured: true, thumbprint: 'ABCDEF0123456789', notAfter: inYears(1), registeredOnApp: true },
  credentials: [credential()],
  partnerRefreshToken: { state: 'valid', updated: null },
  directTenants: [],
  overall: 'healthy',
  ...overrides,
})

const seedStatus = (results) => {
  api.get = getResult({ isSuccess: true, data: { Results: results } })
}

const chipRoot = (label) => screen.getByText(label).closest('.MuiChip-root')
const action = (label) => credentialActions.find((a) => a.label === label)

const openManage = async () => {
  await userEvent.setup().click(screen.getByRole('button', { name: 'Manage credentials' }))
  return tableProps.current
}

// The secondary actions live behind one Actions menu so the card stays uncluttered.
const openActions = async (user = userEvent.setup()) => {
  await user.click(screen.getByRole('button', { name: 'Actions' }))
}

describe('CippSAMCredentials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.get = null
    tableProps.current = null
  })

  it.each([
    ['healthy', 'Healthy', 'MuiChip-colorSuccess'],
    ['secretExpiring', 'Secret expiring', 'MuiChip-colorWarning'],
    ['tokenFailing', 'Token failing', 'MuiChip-colorError'],
    ['unreviewedCredentials', 'Unreviewed credentials', 'MuiChip-colorInfo'],
    ['notConfigured', 'Not configured', 'MuiChip-colorDefault'],
  ])('maps overall %s to the %s header chip', (overall, label, colorClass) => {
    seedStatus(statusResults({ overall }))
    renderWithProviders(<CippSAMCredentials />)
    expect(chipRoot(label)).toHaveClass(colorClass)
  })

  it('summarises credential counts on the card', () => {
    seedStatus(
      statusResults({
        credentials: [
          credential(),
          credential({ keyId: 'k-ext', owner: 'external' }),
          credential({ keyId: 'k-unk', owner: 'unknown', expired: true }),
          credential({ keyId: 'k-known', owner: 'external', known: true, label: 'Rewst' }),
        ],
      })
    )
    renderWithProviders(<CippSAMCredentials />)
    expect(screen.getByText('4 total · 1 expired')).toBeInTheDocument()
    expect(screen.getByText('2 unreviewed')).toBeInTheDocument()
    expect(screen.queryByTestId('credentials-table')).not.toBeInTheDocument()
  })

  it('Manage credentials opens the shared table with display rows and actions', async () => {
    seedStatus(
      statusResults({
        credentials: [
          credential(),
          credential({ keyId: 'k-other', displayName: 'CIPPInstall', owner: 'otherCipp' }),
          credential({ keyId: 'k-ext', displayName: 'Rewst', owner: 'external' }),
          credential({ keyId: 'k-unk', displayName: '', owner: 'unknown' }),
        ],
      })
    )
    renderWithProviders(<CippSAMCredentials />)
    const props = await openManage()

    expect(screen.getByTestId('credentials-table')).toHaveTextContent('4')
    expect(props.simpleColumns).toEqual([
      'displayName',
      'ownerLabel',
      'type',
      'startDateTime',
      'expirationDateTime',
      'provenance',
    ])
    expect(props.actions).toBe(credentialActions)
    expect(props.data.map((r) => r.ownerLabel)).toEqual([
      'This instance',
      'Other CIPP',
      'External',
      'Unknown',
    ])
    expect(props.data[3].displayName).toBe('Unnamed')
    expect(props.data[0].startDateTime).toBe('2026-01-01T00:00:00.000Z')
    // raw fields survive for the action data map
    expect(props.data[1]).toMatchObject({ keyId: 'k-other', owner: 'otherCipp', type: 'Secret' })
  })

  it('shows a known credential as "Known · label" and offers only Remove known flag', async () => {
    seedStatus(
      statusResults({
        credentials: [
          credential({ keyId: 'k-rewst', owner: 'external', known: true, label: 'Rewst automation' }),
        ],
      })
    )
    renderWithProviders(<CippSAMCredentials />)
    const [known] = (await openManage()).data
    expect(known.ownerLabel).toBe('Known · Rewst automation')
    expect(action('Remove known flag').condition(known)).toBe(true)
    expect(action('Mark as known').condition(known)).toBe(false)
  })

  it('labels CIPP-created credentials with their provenance', async () => {
    seedStatus(
      statusResults({
        credentials: [
          credential({ keyId: 'k-manual', owner: 'otherCipp', known: true, source: 'Manual', actor: 'admin@contoso.com' }),
        ],
      })
    )
    renderWithProviders(<CippSAMCredentials />)
    const [row] = (await openManage()).data
    expect(row.provenance).toBe('Manual · admin@contoso.com')
    expect(row.ownerLabel).toBe('Known · Manual · admin@contoso.com')
    // provenance-only rows have no admin label to remove
    expect(action('Remove known flag').condition(row)).toBe(false)
  })

  it('hides Revoke for this instance and offers Mark as known only on unreviewed owners', () => {
    const revoke = action('Revoke credential')
    const flag = action('Mark as known')
    expect(revoke.condition(credential())).toBe(false)
    for (const owner of ['otherCipp', 'external', 'unknown']) {
      expect(revoke.condition(credential({ owner }))).toBe(true)
    }
    expect(flag.condition(credential({ owner: 'otherCipp' }))).toBe(true)
    expect(flag.condition(credential({ owner: 'thisInstance' }))).toBe(false)
    expect(flag.condition(credential({ owner: 'external' }))).toBe(true)
    expect(flag.condition(credential({ owner: 'unknown' }))).toBe(true)
  })

  it('actions post literal Actions plus row fields and refresh the card', () => {
    expect(action('Revoke credential').data).toEqual({
      Action: '!RevokeCredential',
      keyId: 'keyId',
      type: 'type',
    })
    expect(action('Mark as known').data).toEqual({ Action: '!FlagCredential', keyId: 'keyId' })
    expect(action('Mark as known').fields.map((f) => f.name)).toEqual(['label'])
    expect(action('Remove known flag').data).toEqual({ Action: '!UnflagCredential', keyId: 'keyId' })
    for (const a of credentialActions) {
      expect(a.relatedQueryKeys).toEqual(['SAMCredentialsStatus'])
      expect(a.url).toBe('/api/ExecSAMCredentials')
    }
  })

  it('keeps Rotate in certificate mode while a rollback secret is stored', async () => {
    seedStatus(statusResults({ authMode: 'certificate' }))
    renderWithProviders(<CippSAMCredentials />)
    await openActions()
    expect(screen.getByRole('menuitem', { name: /Rotate secret/ })).toBeInTheDocument()
    expect(screen.getByText('Client secret')).toBeInTheDocument()
  })

  it('hides Rotate and the secret row when no secret is stored', async () => {
    seedStatus(
      statusResults({
        authMode: 'certificate',
        storedSecret: { state: 'none', keyId: '', expires: null },
        credentials: [],
      })
    )
    renderWithProviders(<CippSAMCredentials />)
    await openActions()
    expect(screen.queryByRole('menuitem', { name: /Rotate secret/ })).not.toBeInTheDocument()
    expect(screen.queryByText('Client secret')).not.toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Renew certificate' })).toBeInTheDocument()
  })

  it('shows Not provisioned when there is no certificate', () => {
    seedStatus(statusResults({ certificate: { configured: false } }))
    renderWithProviders(<CippSAMCredentials />)
    expect(screen.getByText('Not provisioned')).toBeInTheDocument()
  })

  it('confirms a rotate through the API dialog, with the propagation warning, before posting', async () => {
    const user = userEvent.setup()
    seedStatus(statusResults())
    renderWithProviders(<CippSAMCredentials />)
    await openActions(user)
    await user.click(screen.getByRole('menuitem', { name: /Rotate secret/ }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent(/several minutes to activate/)
    expect(api.post.mutate).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }))
    expect(api.post.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/api/ExecSAMCredentials', data: expect.objectContaining({ Action: 'RotateSecret' }) })
    )
  })

  it('keeps its content mounted while the status refetches so open dialogs survive', () => {
    api.get = getResult({ isSuccess: true, isFetching: true, data: { Results: statusResults() } })
    renderWithProviders(<CippSAMCredentials />)
    expect(screen.getByText('Application ID')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Manage credentials' })).toBeInTheDocument()
  })

  it('offers Clear token cache behind a confirmation that posts ClearTokenCache', async () => {
    const user = userEvent.setup()
    seedStatus(statusResults())
    renderWithProviders(<CippSAMCredentials />)
    await openActions(user)
    await user.click(screen.getByRole('menuitem', { name: /Clear token cache/ }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }))
    expect(api.post.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/api/ExecSAMCredentials', data: expect.objectContaining({ Action: 'ClearTokenCache' }) })
    )
  })
})
