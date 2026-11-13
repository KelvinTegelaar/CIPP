import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders } from '../../test-utils'

vi.mock('next/router', () => ({
  useRouter: () => ({ push: vi.fn(), query: {} }),
}))

// The chart itself is covered by CippSankey.test.jsx; capture what the card hands it.
const captured = vi.hoisted(() => ({ data: null }))
vi.mock('../../../src/components/CippComponents/CippSankey', () => ({
  CippSankey: ({ data }) => {
    captured.data = data
    return null
  },
}))

import { MFACard } from '../../../src/components/CippComponents/MFACard'

const user = (overrides) => ({
  AccountEnabled: true,
  MFARegistration: false,
  CoveredByCA: 'Not Enforced',
  CoveredBySD: false,
  PerUser: 'disabled',
  ...overrides,
})

const linkValue = (source, target) =>
  captured.data.links.find((l) => l.source === source && l.target === target)?.value

describe('MFACard enforcement buckets', () => {
  // "CA policies not available" and a null security-defaults state mean the enforcement could
  // not be read. Counting those users under "No enforcement" states a gap nobody measured.
  it('puts users whose enforcement could not be read under Unknown', () => {
    renderWithProviders(
      <MFACard
        isLoading={false}
        data={[
          user({ MFARegistration: true, CoveredByCA: 'CA policies not available: Forbidden' }),
          user({ CoveredByCA: 'Unknown - external tenant lookup failed' }),
          user({ CoveredBySD: null }),
          user({}),
          user({ MFARegistration: true, CoveredByCA: 'Enforced - All Apps', CoveredBySD: null }),
        ]}
      />
    )

    expect(linkValue('MFA registered', 'Unknown')).toBe(1)
    expect(linkValue('Not registered', 'Unknown')).toBe(2)
    expect(linkValue('Not registered', 'No enforcement')).toBe(1)
    expect(linkValue('MFA registered', 'CA policy')).toBe(1)
    expect(linkValue('MFA registered', 'No enforcement')).toBeUndefined()
    expect(captured.data.nodes.map((n) => n.id)).toContain('Unknown')
  })

  it('keeps a readable, unenforced tenant under No enforcement', () => {
    renderWithProviders(
      <MFACard isLoading={false} data={[user({}), user({ MFARegistration: true })]} />
    )

    expect(linkValue('Not registered', 'No enforcement')).toBe(1)
    expect(linkValue('MFA registered', 'No enforcement')).toBe(1)
    expect(linkValue('Not registered', 'Unknown')).toBeUndefined()
  })
})
