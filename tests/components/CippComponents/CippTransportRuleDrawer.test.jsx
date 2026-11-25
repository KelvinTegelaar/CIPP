import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { renderWithProviders } from '../../test-utils'
import { api, apiCallMock, getResult, paginatedResult, postResult } from '../../mocks/api-call'
import { CippTransportRuleDrawer } from '../../../src/components/CippComponents/CippTransportRuleDrawer'

vi.mock('../../../src/api/ApiCall', () => apiCallMock())
vi.mock('../../../src/components/CippComponents/CippApiResults', () => ({
  CippApiResults: () => null,
}))
vi.mock('../../../src/components/CippComponents/CippOffCanvas', () => ({
  CippOffCanvas: ({ visible, title, children, footer }) =>
    visible ? (
      <div data-testid="CippOffCanvas">
        <h2>{title}</h2>
        {children}
        {footer}
      </div>
    ) : null,
}))

const noData = getResult({ data: undefined })
const noPages = paginatedResult()
const render = (ui) =>
  renderWithProviders(<LocalizationProvider dateAdapter={AdapterDateFns}>{ui}</LocalizationProvider>)

async function pick(user, pickerLabel, option) {
  await user.click(screen.getByRole('combobox', { name: pickerLabel }))
  await user.click(await screen.findByRole('option', { name: option }))
}

describe('CippTransportRuleDrawer', () => {
  beforeEach(() => {
    api.get = noData
    api.paginated = noPages
    api.post = postResult()
  })

  it('template mode saves a tenant-free parameter set to AddTransportTemplate', async () => {
    const user = userEvent.setup()
    render(<CippTransportRuleDrawer templateMode buttonText="New Template" />)
    await user.click(screen.getByRole('button', { name: 'New Template' }))
    expect(screen.getByText('New Transport Rule Template')).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Priority' })).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Deploy Position' })).toHaveValue('Deploy last')

    await user.type(screen.getByRole('textbox', { name: 'Rule Name' }), 'Tag external')
    await pick(user, 'Select condition types', 'The sender is a member of...')
    expect(screen.getByText(/resolved per tenant at deploy/)).toBeInTheDocument()
    await user.type(
      screen.getByRole('combobox', { name: 'The sender is a member of...' }),
      'staff@%defaultdomain%'
    )
    await user.click(await screen.findByRole('option', { name: /staff@%defaultdomain%/ }))
    await pick(user, 'Select action types', 'Quarantine the message')
    await user.click(screen.getByLabelText('Quarantine the message'))

    await user.click(screen.getByRole('button', { name: 'Create Template' }))
    await waitFor(() => expect(api.post.mutate).toHaveBeenCalledTimes(1))
    const { url, data } = api.post.mutate.mock.calls[0][0]
    expect(url).toBe('/api/AddTransportTemplate')
    expect(data.GUID).toBeUndefined()
    expect(data.name).toBe('Tag external')
    const params = JSON.parse(data.PowerShellCommand)
    expect(params).toMatchObject({
      name: 'Tag external',
      Enabled: true,
      Mode: 'Enforce',
      FromMemberOf: ['staff@%defaultdomain%'],
      Quarantine: true,
    })
    for (const key of ['tenantFilter', 'Priority', 'State', 'ruleId', 'Name', 'Comments']) {
      expect(params).not.toHaveProperty(key)
    }
  }, 30000)

  it('template mode stores priority 0 for Deploy first', async () => {
    const user = userEvent.setup()
    render(<CippTransportRuleDrawer templateMode buttonText="New Template" />)
    await user.click(screen.getByRole('button', { name: 'New Template' }))

    await user.type(screen.getByRole('textbox', { name: 'Rule Name' }), 'Quarantine HTM attachments')
    await pick(user, 'Deploy Position', 'Deploy first')
    await pick(user, 'Select action types', 'Quarantine the message')
    await user.click(screen.getByLabelText('Quarantine the message'))

    await user.click(screen.getByRole('button', { name: 'Create Template' }))
    await waitFor(() => expect(api.post.mutate).toHaveBeenCalledTimes(1))
    const params = JSON.parse(api.post.mutate.mock.calls[0][0].data.PowerShellCommand)
    expect(params).toMatchObject({ name: 'Quarantine HTM attachments', Priority: 0, Quarantine: true })
  }, 30000)

  it('template mode pre-fills a stored template and saves it back under its GUID', async () => {
    const user = userEvent.setup()
    const row = {
      GUID: 'tpl-1',
      name: 'Block %tenantname% autoforward',
      comments: 'from the list',
      Enabled: false,
      Mode: 'Audit',
      Priority: 0,
      FromMemberOf: ['finance@contoso.com'],
      Quarantine: true,
    }
    render(
      <CippTransportRuleDrawer templateMode rowAction template={row} drawerVisible setDrawerVisible={vi.fn()} />
    )

    expect(screen.getByText('Edit Template: Block %tenantname% autoforward')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Rule Name' })).toHaveValue('Block %tenantname% autoforward')
    )
    expect(screen.getByRole('textbox', { name: 'Comments' })).toHaveValue('from the list')
    expect(screen.getByRole('combobox', { name: 'Deploy Position' })).toHaveValue('Deploy first')
    expect(screen.getByRole('combobox', { name: 'The sender is a member of...' })).toBeInTheDocument()
    expect(screen.getByText('finance@contoso.com')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Update Template' }))
    await waitFor(() => expect(api.post.mutate).toHaveBeenCalledTimes(1))
    const { url, data } = api.post.mutate.mock.calls[0][0]
    expect(url).toBe('/api/AddTransportTemplate')
    expect(data.GUID).toBe('tpl-1')
    expect(JSON.parse(data.PowerShellCommand)).toMatchObject({
      name: 'Block %tenantname% autoforward',
      comments: 'from the list',
      Enabled: false,
      Mode: 'Audit',
      Priority: 0,
      FromMemberOf: ['finance@contoso.com'],
      Quarantine: true,
    })
  }, 30000)

  it('rule mode still posts to AddEditTransportRule for the current tenant', async () => {
    const user = userEvent.setup()
    render(<CippTransportRuleDrawer />)
    await user.click(screen.getByRole('button', { name: 'New Transport Rule' }))
    expect(screen.getByRole('spinbutton', { name: 'Priority' })).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Rule Name' }), 'Tenant rule')
    await pick(user, 'Select action types', 'Quarantine the message')
    await user.click(screen.getByLabelText('Quarantine the message'))
    await user.click(screen.getByRole('button', { name: 'Create Rule' }))

    await waitFor(() => expect(api.post.mutate).toHaveBeenCalledTimes(1))
    const { url, data } = api.post.mutate.mock.calls[0][0]
    expect(url).toBe('/api/AddEditTransportRule')
    expect(data).toMatchObject({ tenantFilter: 'testdomain.com', Name: 'Tenant rule', State: 'Enabled', Quarantine: true })
    expect(data).not.toHaveProperty('PowerShellCommand')
  }, 30000)

  it('edit mode pre-fills external domain lists as removable chips and sends them back', async () => {
    const user = userEvent.setup()
    const senderDomains = ['1email.barclaycard.co.uk', '4seeservices.com', '172.99.115.23']
    const ruleResult = getResult({
      data: {
        Results: [
          {
            Guid: 'rule-1',
            Name: 'Quarantine external senders',
            State: 'Enabled',
            Mode: 'Enforce',
            Priority: 3,
            FromScope: 'NotInOrganization',
            SenderDomainIs: senderDomains,
            ExceptIfRecipientDomainIs: ['partner.example', 'supplier.example'],
            Quarantine: true,
          },
        ],
      },
    })
    const domainsResult = paginatedResult([
      { id: 'contoso.onmicrosoft.com', isVerified: true, isDefault: false },
      { id: 'unverified.example', isVerified: false, isDefault: false },
      { id: 'contoso.com', isVerified: true, isDefault: true },
    ])
    api.get = (opts) => (opts.url.includes('&id=rule-1') ? ruleResult : noData)
    api.paginated = (opts) => (opts.queryKey?.startsWith('Domains-') ? domainsResult : noPages)
    render(
      <CippTransportRuleDrawer isEditMode ruleId="rule-1" rowAction drawerVisible setDrawerVisible={vi.fn()} />
    )

    expect(screen.getByText('Edit Rule: Quarantine external senders')).toBeInTheDocument()
    for (const domain of [...senderDomains, 'partner.example', 'supplier.example']) {
      expect(await screen.findByRole('button', { name: domain })).toBeInTheDocument()
    }
    expect(screen.getByRole('combobox', { name: 'Sender domain is...' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Recipient domain is...' })).toBeInTheDocument()

    await user.click(screen.getByRole('combobox', { name: 'Sender domain is...' }))
    const suggestions = await screen.findAllByRole('option')
    expect(suggestions.map((o) => o.textContent)).toEqual(['contoso.com', 'contoso.onmicrosoft.com'])
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('button', { name: 'Update Rule' }))
    await waitFor(() => expect(api.post.mutate).toHaveBeenCalledTimes(1))
    expect(api.post.mutate.mock.calls[0][0]).toMatchObject({
      url: '/api/AddEditTransportRule',
      data: {
        ruleId: 'rule-1',
        FromScope: 'NotInOrganization',
        SenderDomainIs: senderDomains,
        ExceptIfRecipientDomainIs: ['partner.example', 'supplier.example'],
      },
    })
    api.post.mutate.mockClear()

    const senderField = screen.getByRole('combobox', { name: 'Sender domain is...' })
    await user.type(senderField, 'new-sender.example')
    await user.click(await screen.findByRole('option', { name: /new-sender\.example/ }))
    await user.click(
      screen.getByRole('button', { name: '4seeservices.com' }).querySelector('.MuiChip-deleteIcon')
    )
    await user.click(screen.getByRole('button', { name: 'Update Rule' }))
    await waitFor(() => expect(api.post.mutate).toHaveBeenCalledTimes(1))
    expect(api.post.mutate.mock.calls[0][0].data).toMatchObject({
      SenderDomainIs: ['1email.barclaycard.co.uk', '172.99.115.23', 'new-sender.example'],
      ExceptIfRecipientDomainIs: ['partner.example', 'supplier.example'],
    })
  }, 30000)
})
