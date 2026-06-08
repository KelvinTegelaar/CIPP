import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippHVEUserDrawer } from '../../../../components/CippComponents/CippHVEUserDrawer.jsx'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { Stack } from '@mui/system'
import { TrashIcon } from '@heroicons/react/24/outline'
import {
  Edit,
  AlternateEmail,
  Receipt,
  RemoveCircleOutline,
  Reply,
} from '@mui/icons-material'

const Page = () => {
  const pageTitle = 'HVE Accounts'

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListHVEAccounts',
    queryKey: 'ListHVEAccounts',
    cacheName: 'HVEAccounts',
    syncTitle: 'Sync HVE Accounts',
    allowToggle: true,
    defaultCached: true,
  })

  const actions = [
    {
      label: 'Edit Display Name',
      type: 'POST',
      url: '/api/ExecHVEUser',
      icon: <Edit />,
      data: { Identity: 'primarySmtpAddress', Action: 'Edit' },
      fields: [
        {
          type: 'textField',
          name: 'DisplayName',
          label: 'Display Name',
        },
      ],
      confirmText: 'Update display name for [primarySmtpAddress]',
      hideBulk: true,
    },
    {
      label: 'Set Reply-To Address',
      type: 'POST',
      url: '/api/ExecHVEUser',
      icon: <Reply />,
      data: { Identity: 'primarySmtpAddress', Action: 'Edit' },
      fields: [
        {
          type: 'textField',
          name: 'ReplyTo',
          label: 'Reply-To Address',
          placeholder: 'e.g. replies@contoso.com (leave empty to clear)',
        },
      ],
      confirmText: 'Update reply-to address for [primarySmtpAddress]',
      hideBulk: true,
    },
    {
      label: 'Change Primary SMTP Address',
      type: 'POST',
      url: '/api/ExecHVEUser',
      icon: <AlternateEmail />,
      data: { Identity: 'primarySmtpAddress', Action: 'Edit' },
      fields: [
        {
          type: 'textField',
          name: 'username',
          label: 'Username (local part)',
          placeholder: 'e.g. hveaccount01',
        },
        {
          type: 'autoComplete',
          name: 'domain',
          label: 'Domain',
          api: {
            url: '/api/ListGraphRequest',
            dataKey: 'Results',
            queryKey: 'listDomains-hve',
            labelField: (option) => option.id,
            valueField: 'id',
            addedField: {
              isDefault: 'isDefault',
              isVerified: 'isVerified',
            },
            data: {
              Endpoint: 'domains',
              manualPagination: true,
              $count: true,
              $top: 99,
            },
            dataFilter: (domains) =>
              domains
                .filter((d) => d?.addedFields?.isVerified === true)
                .sort((a, b) => {
                  if (a.addedFields?.isDefault === true) return -1
                  if (b.addedFields?.isDefault === true) return 1
                  return 0
                }),
          },
        },
      ],
      confirmText: 'Change primary SMTP address for [primarySmtpAddress]',
      hideBulk: true,
    },
    {
      label: 'Assign Billing Policy',
      type: 'POST',
      url: '/api/ExecHVEUser',
      icon: <Receipt />,
      data: { Identity: 'primarySmtpAddress', Action: 'AssignBillingPolicy' },
      fields: [
        {
          type: 'autoComplete',
          name: 'BillingPolicyId',
          label: 'Billing Policy',
          multiple: false,
          api: {
            url: '/api/ListHVEAccounts',
            queryKey: 'ListHVEBillingPolicies',
            labelField: (option) =>
              `${option.Name || option.BillingPolicyName || option.BillingPolicyId} (${option.BillingPolicyId || option.Guid || option.Identity})`,
            valueField: (option) => option.BillingPolicyId || option.Guid || option.Identity,
            data: {
              ListBillingPolicies: true,
            },
          },
        },
      ],
      confirmText: 'Assign billing policy to [primarySmtpAddress]. Current policy: [BillingPolicyName]',
      hideBulk: true,
    },
    {
      label: 'Remove Billing Policy',
      type: 'POST',
      url: '/api/ExecHVEUser',
      icon: <RemoveCircleOutline />,
      data: { Identity: 'primarySmtpAddress', Action: 'RemoveBillingPolicy' },
      confirmText:
        'Remove billing policy [BillingPolicyName] from [primarySmtpAddress]?',
      condition: (row) => row.BillingPolicyName && row.BillingPolicyName !== 'None',
      hideBulk: true,
    },
    {
      label: 'Delete HVE Account',
      type: 'POST',
      icon: <TrashIcon />,
      url: '/api/ExecHVEUser',
      data: { Identity: 'primarySmtpAddress', Action: 'Remove' },
      confirmText: 'Are you sure you want to delete HVE account [primarySmtpAddress]?',
      multiPost: false,
    },
  ]

  const offCanvas = {
    extendedInfoFields: [
      'displayName',
      'primarySmtpAddress',
      'Alias',
      'AdditionalEmailAddresses',
      'BillingPolicyName',
      'BillingPolicyId',
      'WhenCreated',
      'ExternalDirectoryObjectId',
    ],
    actions: actions,
  }

  const simpleColumns = [
    ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
    'displayName',
    'primarySmtpAddress',
    'Alias',
    'WhenCreated',
    'AdditionalEmailAddresses',
    ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        queryKey={reportDB.resolvedQueryKey}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        cardButton={
          <Stack direction="row" spacing={1} alignItems="center">
            <CippHVEUserDrawer />
            {reportDB.controls}
          </Stack>
        }
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
