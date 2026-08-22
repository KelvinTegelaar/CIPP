import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import Page from '../../src/pages/email/tools/message-encryption/index.js'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
import { api, getResult, paginatedResult, postResult } from '../mocks/api-call'

const AZURE_RMS = 'https://5c6bb73b-1234.rms.na.aadrm.com/_wmcs/licensing'
const AD_RMS = 'https://rms.contoso.local/_wmcs/licensing'

// stable identity per the mock's own warning: a fresh literal per call spins the
// effects that key off the data object
const irmConfig = (overrides = {}) => ({
  AzureRMSLicensingEnabled: true,
  InternalLicensingEnabled: true,
  ExternalLicensingEnabled: false,
  SimplifiedClientAccessEnabled: false,
  TransportDecryptionSetting: 'Optional',
  JournalReportDecryptionEnabled: true,
  LicensingLocation: [AZURE_RMS],
  MessageEncryptionEnabled: true,
  AdRmsDetected: false,
  ...overrides,
})

describe('Message Encryption page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.post = postResult()
    // ListMailboxes returns a bare array (no Results wrapper, the page's api sets no dataKey)
    api.paginated = paginatedResult([], {
      data: {
        pages: [[
          { displayName: 'Admin', UPN: 'admin@contoso.com' },
          { displayName: 'Helpdesk', UPN: 'helpdesk@contoso.com' },
        ]],
      },
    })
  })

  it('renders the current IRM state for the tenant', async () => {
    api.get = getResult({ data: irmConfig() })
    renderWithProviders(<Page />)

    expect(await screen.findByText('Current Configuration')).toBeInTheDocument()
    expect(screen.getByText('Enabled')).toBeInTheDocument()
    expect(screen.getByText(AZURE_RMS)).toBeInTheDocument()
  })

  it('hides the migration warning for a cloud-only tenant', async () => {
    api.get = getResult({ data: irmConfig() })
    renderWithProviders(<Page />)

    await screen.findByText('Current Configuration')
    expect(screen.queryByText(/not compatible with/i)).not.toBeInTheDocument()
  })

  it('warns that AD RMS has to be migrated before message encryption can be used', async () => {
    api.get = getResult({
      data: irmConfig({
        AzureRMSLicensingEnabled: false,
        MessageEncryptionEnabled: false,
        LicensingLocation: [AD_RMS],
        AdRmsDetected: true,
      }),
    })
    renderWithProviders(<Page />)

    expect(await screen.findByText(/not compatible with/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'migrated to Azure RMS' })
    ).toBeInTheDocument()
  })

  it('keeps Run Test disabled until both mailboxes are selected', async () => {
    const user = userEvent.setup()
    api.get = getResult({ data: irmConfig() })
    renderWithProviders(<Page />)

    const runTest = await screen.findByRole('button', { name: 'Run Test' })
    expect(runTest).toBeDisabled()

    await user.click(screen.getByRole('combobox', { name: 'Sender' }))
    await user.click(
      await screen.findByRole('option', { name: 'Admin (admin@contoso.com)' })
    )
    expect(runTest).toBeDisabled()

    await user.click(screen.getByRole('combobox', { name: 'Recipient' }))
    await user.click(
      await screen.findByRole('option', {
        name: 'Helpdesk (helpdesk@contoso.com)',
      })
    )
    expect(runTest).toBeEnabled()
  })

  it('posts the Test action with the entered addresses', async () => {
    const user = userEvent.setup()
    api.get = getResult({ data: irmConfig() })
    renderWithProviders(<Page />)

    await user.click(await screen.findByRole('combobox', { name: 'Sender' }))
    await user.click(
      await screen.findByRole('option', { name: 'Admin (admin@contoso.com)' })
    )
    await user.click(screen.getByRole('combobox', { name: 'Recipient' }))
    await user.click(
      await screen.findByRole('option', {
        name: 'Helpdesk (helpdesk@contoso.com)',
      })
    )
    await user.click(screen.getByRole('button', { name: 'Run Test' }))

    expect(api.post.mutate).toHaveBeenCalledWith({
      url: '/api/ExecIRMConfiguration',
      data: {
        tenantFilter: 'testdomain.com',
        Action: 'Test',
        Sender: 'admin@contoso.com',
        Recipient: 'helpdesk@contoso.com',
      },
    })
  })

  it('surfaces a load failure', async () => {
    api.get = getResult({ isSuccess: false, isError: true, data: undefined })
    renderWithProviders(<Page />)

    expect(
      await screen.findByText(/Failed to load the IRM configuration/i)
    ).toBeInTheDocument()
    // no card, otherwise every undefined field renders as a confident "Disabled"/"No"
    expect(screen.queryByText('Current Configuration')).not.toBeInTheDocument()
  })
})
