import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import { api, apiCallMock, getResult } from '../../mocks/api-call'
import { CippQuarantineDetails } from '../../../src/components/CippComponents/CippQuarantineDetails'

vi.mock('../../../src/api/ApiCall', async () =>
  (await import('../../mocks/api-call')).apiCallMock()
)

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
try {
  TimeAgo.addDefaultLocale(en)
} catch (e) {
  /* already added */
}

// producer shapes: row is Get-QuarantineMessage output enriched by Add-CIPPQuarantineMessageProperties,
// analyzed is Invoke-ListMailQuarantineMessageDetails Results[0] (analyzedEmails or header fallback)
const quarantineRow = {
  Identity:
    '5e5e5e5e-1111-2222-3333-444455556666\\c81d4a2e-1111-2222-3333-444455556666',
  NetworkMessageId: '5e5e5e5e-1111-2222-3333-444455556666',
  Tenant: 'fabrikam.com',
  CustomerId: 'customer-1',
  Subject: 'Suspicious invoice',
  ReceivedTime: '2026-06-01T10:00:00Z',
  Expires: '2026-07-01T10:00:00Z',
  Type: 'HighConfPhish',
  ReleaseStatus: 'NOTRELEASED',
  PolicyType: 'AntiPhish',
  PolicyName: 'Default AntiPhish',
  SenderAddress: 'bad@evil.example',
  RecipientAddress: ['user@fabrikam.com'],
  Size: 2048,
  Direction: 'Inbound',
  EntityType: 'Email',
  MessageId: '<id@mail.evil.example>',
  QuarantinedUser: 'user@fabrikam.com',
  Reported: false,
}

const analyzed = {
  recipientEmailAddress: 'user@fabrikam.com',
  internetMessageId: '<id@mail.evil.example>',
  returnPath: 'bounce@evil.example',
  directionality: 'Inbound',
  language: 'en',
  spamConfidenceLevel: -1,
  bulkComplaintLevel: 1,
  threatTypes: ['Malware'],
  detectionMethods: ['File detonation'],
  primaryOverrideSource: 'None',
  policyAction: 'Quarantine',
  senderDetail: {
    displayName: 'Evil Sender',
    mailFromAddress: 'bad@evil.example',
    fromAddress: 'bad@evil.example',
    ipv4: '203.0.113.5',
    location: 'US',
  },
  originalDelivery: {
    originalThreats: ['Malware'],
    location: 'Quarantine',
    action: 'Quarantined',
  },
  latestDelivery: {
    latestThreats: ['Malware'],
    location: 'Quarantine',
    action: 'Quarantined',
  },
  authenticationDetails: {
    dmarc: 'fail',
    dkim: 'pass',
    senderPolicyFramework: 'softfail',
    compositeAuthentication: 'fail',
  },
  urls: [
    {
      url: 'https://evil.example/pay',
      threatType: 'Malware',
      detectionMethod: 'Detonated',
    },
  ],
  attachments: [
    {
      fileName: 'invoice.pdf',
      contentType: 'application/pdf',
      fileSize: 1024,
      sha256:
        'aa11bb22cc33dd44ee55ff6677889900aabbccddeeff00112233445566778899',
      threatType: 'Malware',
      malwareFamily: 'TestFamily',
    },
  ],
}

const detailsResult = (metadata = {}) =>
  getResult({ data: { Results: [analyzed], Metadata: metadata } })

const defaultMetadata = { Available: true, Source: 'Defender' }
const headersResult = detailsResult({ Available: true, Source: 'Headers' })
const defenderResult = detailsResult(defaultMetadata)

describe('CippQuarantineDetails', () => {
  it('shows the header-parsed fallback notice and targets the row tenant for enrichment', () => {
    let detailOpts = null
    api.get = (opts) => {
      if (opts.url === '/api/ListMailQuarantineMessageDetails') {
        detailOpts = opts
        return headersResult
      }
      return getResult()
    }
    renderWithProviders(<CippQuarantineDetails row={quarantineRow} />)

    expect(
      screen.getByText(/Showing details parsed from the message headers/)
    ).toBeInTheDocument()
    expect(detailOpts.data.tenantFilter).toBe('fabrikam.com')
    expect(detailOpts.data.Identity).toBe(quarantineRow.Identity)
    // fallback fields render from the analyzed-shaped object
    expect(screen.getAllByText('Fail').length).toBeGreaterThan(0)
    expect(screen.getByText('Softfail')).toBeInTheDocument()
  })

  it('colors phishing and malware reason chips as error', () => {
    api.get = () => defenderResult
    renderWithProviders(<CippQuarantineDetails row={quarantineRow} />)
    expect(
      screen
        .getAllByText('HighConfPhish')
        .find((el) => el.closest('[class*="MuiChip-colorError"]'))
    ).toBeTruthy()

    api.get = () => defenderResult
    renderWithProviders(
      <CippQuarantineDetails row={{ ...quarantineRow, Type: 'Malware' }} />
    )
    expect(
      screen
        .getAllByText('Malware')
        .find((el) => el.closest('[class*="MuiChip-colorError"]'))
    ).toBeTruthy()
  })

  it('colors spam and bulk reason chips as warning', () => {
    api.get = () => defenderResult
    renderWithProviders(
      <CippQuarantineDetails row={{ ...quarantineRow, Type: 'Spam' }} />
    )
    expect(
      screen
        .getAllByText('Spam')
        .find((el) => el.closest('[class*="MuiChip-colorWarning"]'))
    ).toBeTruthy()

    api.get = () => defenderResult
    renderWithProviders(
      <CippQuarantineDetails row={{ ...quarantineRow, Type: 'Bulk' }} />
    )
    expect(
      screen
        .getAllByText('Bulk')
        .find((el) => el.closest('[class*="MuiChip-colorWarning"]'))
    ).toBeTruthy()
  })

  it('renders URL and attachment verdict tables from the analyzed enrichment', () => {
    api.get = () => defenderResult
    renderWithProviders(<CippQuarantineDetails row={quarantineRow} />)

    expect(screen.getByText('https://evil.example/pay')).toBeInTheDocument()
    expect(screen.getByText('Detonated')).toBeInTheDocument()
    expect(screen.getByText('invoice.pdf')).toBeInTheDocument()
    expect(screen.getByText('TestFamily')).toBeInTheDocument()
    expect(screen.getByText('1.0 KB')).toBeInTheDocument()
  })
})

// Metadata.PermissionError marks a missing SecurityAnalyzedMessage.Read.All grant, which is a
// consent gap the operator can repair - it must render its own caption pointing at the Permission
// Check page and win over the two Defender-licence captions.
describe('CippQuarantineDetails permission-error caption', () => {
  it('points at the Permission Check instead of the licence copy when PermissionError is set', () => {
    api.get = () =>
      detailsResult({
        Available: false,
        Source: 'Headers',
        PermissionError: true,
      })
    renderWithProviders(<CippQuarantineDetails row={quarantineRow} />)

    expect(
      screen.getByText(/SecurityAnalyzedMessage\.Read\.All/)
    ).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Permission Check/i })
    expect(link).toHaveAttribute('href', '/cipp/settings/permissions')
    expect(
      screen.queryByText(/Showing details parsed from the message headers/)
    ).toBeNull()
  })

  it('suppresses the enrichment-unavailable licence caption when PermissionError is set', () => {
    api.get = () =>
      getResult({
        data: {
          Results: [],
          Metadata: { Available: false, PermissionError: true },
        },
      })
    renderWithProviders(<CippQuarantineDetails row={quarantineRow} />)

    expect(
      screen.getByText(/SecurityAnalyzedMessage\.Read\.All/)
    ).toBeInTheDocument()
    expect(
      screen.queryByText(
        /Extended threat details are unavailable for this message/
      )
    ).toBeNull()
  })

  it('keeps the licence captions when there is no permission error', () => {
    api.get = () =>
      getResult({ data: { Results: [], Metadata: { Available: false } } })
    renderWithProviders(<CippQuarantineDetails row={quarantineRow} />)

    expect(
      screen.getByText(
        /Extended threat details are unavailable for this message/
      )
    ).toBeInTheDocument()
    expect(screen.queryByText(/SecurityAnalyzedMessage\.Read\.All/)).toBeNull()
  })
})
