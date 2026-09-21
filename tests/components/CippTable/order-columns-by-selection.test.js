import { describe, it, expect } from 'vitest'
import { orderColumnsBySelection } from '../../../src/components/CippTable/CippDataTable'

// MRT reads initialState.columnOrder once; when the graph filter swaps the $select list
// after mount, new columns appended last — and the card view fills its three detail slots
// in column order, so the field the user just selected was the one overflowing into
// "+N more". Selection order has to win.
describe('orderColumnsBySelection', () => {
  const all = ['displayName', 'userPrincipalName', 'mail', 'signInActivity.lastSuccessfulSignInDateTime', 'proxyAddresses']

  it('puts the selection first, in selection order', () => {
    expect(
      orderColumnsBySelection(all, ['signInActivity.lastSuccessfulSignInDateTime', 'displayName'])
    ).toEqual([
      'signInActivity.lastSuccessfulSignInDateTime',
      'displayName',
      'userPrincipalName',
      'mail',
      'proxyAddresses',
    ])
  })

  it('ignores selected ids that have no column, keeps the rest stable', () => {
    expect(orderColumnsBySelection(all, ['nope', 'mail'])).toEqual([
      'mail',
      'displayName',
      'userPrincipalName',
      'signInActivity.lastSuccessfulSignInDateTime',
      'proxyAddresses',
    ])
  })

  it('is a no-op shape when nothing is selected', () => {
    expect(orderColumnsBySelection(all, [])).toEqual(all)
  })
})
