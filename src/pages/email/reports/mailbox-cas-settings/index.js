import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { useSettings } from '../../../../hooks/use-settings.js'
import { Tune } from '@mui/icons-material'

// CAS protocols that can be toggled, keyed by their Set-CASMailbox parameter.
// Most flags follow "*Enabled" (true = on). The inverted "*Disabled" flag
// (SMTP client auth) is the opposite: true = off.
const casProtocols = {
  ECPEnabled: 'ECP (Exchange Control Panel)',
  EWSEnabled: 'EWS (Exchange Web Services)',
  IMAPEnabled: 'IMAP',
  MAPIEnabled: 'MAPI',
  OWAEnabled: 'OWA (Outlook on the Web)',
  POPEnabled: 'POP',
  ActiveSyncEnabled: 'ActiveSync',
  SmtpClientAuthenticationDisabled: 'SMTP Client Authentication',
}

const Page = () => {
  const tenantFilter = useSettings().currentTenant

  // A single action lets the operator pick which protocols to enable or disable.
  // Each selected protocol becomes a Set-CASMailbox flag, accounting for the inverted
  // "*Disabled" parameter, and one request is sent per selected mailbox.
  const actions = [
    {
      label: 'Set Client Access Protocols',
      type: 'POST',
      icon: <Tune />,
      url: '/api/ExecSetCASMailbox',
      fields: [
        {
          type: 'radio',
          name: 'enable',
          label: 'Action',
          options: [
            { label: 'Enable', value: true },
            { label: 'Disable', value: false },
          ],
          validators: { required: 'Please choose whether to enable or disable' },
        },
        {
          type: 'autoComplete',
          name: 'protocols',
          label: 'Protocols',
          multiple: true,
          creatable: false,
          options: Object.entries(casProtocols).map(([value, label]) => ({ label, value })),
          validators: { required: 'Please select at least one protocol' },
        },
      ],
      confirmText:
        'Enable or disable the selected client access protocols for the chosen mailbox(es).',
      customDataformatter: (rows, action, formData) => {
        const mailboxes = Array.isArray(rows) ? rows : [rows]
        const rawEnable =
          typeof formData.enable === 'object' ? formData.enable?.value : formData.enable
        const enable = rawEnable === true || rawEnable === 'true'
        const protocolFlags = (formData.protocols ?? []).reduce((flags, selection) => {
          const param = typeof selection === 'object' ? selection.value : selection
          // "*Disabled" params are inverted: enabling the protocol means setting them false.
          // SMTP client auth is disable-only; the API rejects an enable attempt with a message.
          flags[param] = param.endsWith('Disabled') ? !enable : enable
          return flags
        }, {})

        return mailboxes.map((row) => ({
          tenantFilter,
          Identity: row.Guid,
          DisplayName: row.DisplayName,
          ...protocolFlags,
        }))
      },
      color: 'info',
    },
  ]

  return (
    <CippTablePage
      title="Mailbox Client Access Settings"
      apiUrl="/api/ListMailboxCAS"
      actions={actions}
      simpleColumns={[
        'DisplayName',
        'PrimarySmtpAddress',
        'ECPEnabled',
        'EwsEnabled',
        'MAPIEnabled',
        'OWAEnabled',
        'PopEnabled',
        'ImapEnabled',
        'ActiveSyncEnabled',
        'SmtpClientAuthenticationDisabled',
      ]}
    />
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>

export default Page
