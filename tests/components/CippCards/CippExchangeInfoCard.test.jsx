import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '../../test-utils'
import { CippExchangeInfoCard } from '../../../src/components/CippCards/CippExchangeInfoCard'

// Shaped like Invoke-ListUserMailboxDetails: ForwardingAddress is the SMTP forward, or the internal
// forward resolved to the recipient's UPN; MailboxActionsData.ForwardingSmtpAddress is '' when unset.
const internalForward = {
  ForwardAndDeliver: true,
  ForwardingAddress: 'adele.vance@contoso.com',
  MailboxActionsData: {
    ForwardingSmtpAddress: '',
    InternalForwardingAddress: '8f2c1d4e-5b6a-4c7d-9e8f-0a1b2c3d4e5f',
  },
}

const externalForward = {
  ForwardAndDeliver: false,
  ForwardingAddress: 'partner@fabrikam.com',
  MailboxActionsData: {
    ForwardingSmtpAddress: 'partner@fabrikam.com',
    InternalForwardingAddress: null,
  },
}

describe('CippExchangeInfoCard forwarding status', () => {
  it('labels an internal forward resolved to a UPN as internal', () => {
    renderWithTheme(<CippExchangeInfoCard exchangeData={internalForward} />)
    expect(screen.getByText('Internal Forwarding')).toBeInTheDocument()
    expect(screen.getByText('adele.vance@contoso.com')).toBeInTheDocument()
  })

  it('labels an SMTP forward as external', () => {
    renderWithTheme(<CippExchangeInfoCard exchangeData={externalForward} />)
    expect(screen.getByText('External Forwarding')).toBeInTheDocument()
    expect(screen.getByText('partner@fabrikam.com')).toBeInTheDocument()
  })
})
