import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderWithProviders } from '../test-utils'
import router from '../mocks/next-router'

vi.mock('../../src/api/ApiCall', async () => (await import('../mocks/api-call')).apiCallMock())
import { api, getResult } from '../mocks/api-call'

// the cards' subtext and table rows are the behavior under test, everything around them is stubbed
vi.mock('../../src/layouts/HeaderedTabbedLayout', () => ({
  HeaderedTabbedLayout: ({ children }) => <div>{children}</div>,
}))
vi.mock('../../src/components/CippComponents/CippUserSwitcher', () => ({ CippUserSwitcher: () => null }))
vi.mock('../../src/components/CippComponents/CippExchangeActions', () => ({ default: () => [] }))
vi.mock('../../src/components/CippCards/CippExchangeInfoCard', () => ({ CippExchangeInfoCard: () => null }))
vi.mock('../../src/components/CippFormPages/CippExchangeSettingsForm', () => ({ default: () => null }))
vi.mock('../../src/components/CippComponents/CippApiDialog', () => ({ CippApiDialog: () => null }))
vi.mock('../../src/components/CippCards/CippBannerListCard', () => ({
  CippBannerListCard: ({ items }) => (
    <>
      {items.map((item) => (
        <section key={item.text} aria-label={item.text}>
          <p>{item.subtext}</p>
          {(item.table?.data ?? []).map((row, i) => (
            <p key={i}>{`row: ${row.User} (${row.Type})`}</p>
          ))}
        </section>
      ))}
    </>
  ),
}))

import Page from '../../src/pages/identity/administration/users/user/exchange.jsx'

const upn = 'jane@contoso.com'
const graphUser = getResult({ data: [{ id: 'u1', userPrincipalName: upn, proxyAddresses: [] }] })
const failed = getResult({ isSuccess: false, isError: true, data: undefined })
const empty = getResult({ data: [] })

// Get-MailboxPermission / Get-RecipientPermission trustees as ListUserMailboxDetails returns them
const mailboxWithPerms = getResult({
  data: [
    {
      Permissions: [
        { User: 'IT Support', AccessRights: 'FullAccess' },
        { User: 'it@CONTOSO.com', AccessRights: 'SendAs' },
      ],
    },
  ],
})
const groups = getResult({
  data: { Results: [{ id: 'g1', displayName: 'IT', mail: 'it@contoso.com' }] },
})

let routes
api.get = (opts) => {
  const url = opts?.url ?? ''
  if (url === '/api/ListGraphRequest') {
    return opts.data?.Endpoint === 'groups' ? groups : empty
  }
  const name = url.replace(/^\/api\//, '').split('?')[0]
  return routes[name] ?? empty
}

const card = (name) => within(screen.getByRole('region', { name }))

describe('User exchange page - card states', () => {
  beforeEach(() => {
    router.query = { userId: 'u1' }
    routes = { ListUsers: graphUser, ListUserMailboxDetails: empty }
  })

  it('says the data could not be loaded when a card fetch fails, not that nothing is configured', () => {
    Object.assign(routes, {
      ListUserMailboxDetails: failed,
      ListCalendarPermissions: failed,
      ListContactPermissions: failed,
      ListUserMailboxRules: failed,
      ListUserTrustedBlockedSenders: failed,
    })
    renderWithProviders(<Page />)

    for (const name of [
      'Mailbox Permissions',
      'Calendar permissions',
      'Contact permissions',
      'Current Mailbox Rules',
      'Trusted and Blocked Senders/Domains',
    ]) {
      expect(card(name).getByText(/^Could not load/)).toBeInTheDocument()
    }
  })

  it('says no one has access only when the fetch succeeded with an empty list', () => {
    Object.assign(routes, { ListCalendarPermissions: empty })
    renderWithProviders(<Page />)

    expect(
      card('Calendar permissions').getByText('No other users or groups have access to this calendar')
    ).toBeInTheDocument()
  })

  it('keeps a user whose name starts with a group name as a user, and matches group mail case-insensitively', () => {
    routes.ListUserMailboxDetails = mailboxWithPerms
    renderWithProviders(<Page />)

    const perms = card('Mailbox Permissions')
    expect(perms.getByText('row: IT Support (User)')).toBeInTheDocument()
    expect(perms.getByText('row: IT (Group)')).toBeInTheDocument()
  })
})
