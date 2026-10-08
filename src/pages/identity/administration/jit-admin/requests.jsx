import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import tabOptions from './tabOptions.json'
import { CippIcons } from '../../../../utils/icon-registry'
import CippTablePage from '../../../../components/CippComponents/CippTablePage'
import { useSettings } from '../../../../hooks/use-settings'

const Page = () => {
  const tenantFilter = useSettings()?.currentTenant
  const actions = [
    {
      label: 'Approve',
      type: 'POST',
      url: '/api/ExecJITAdminRequestDecision',
      icon: <CippIcons.CheckCircle />,
      data: {
        RequestId: 'RequestId',
        tenantFilter: 'Tenant',
        Decision: '!Approve',
      },
      fields: [{ type: 'textField', name: 'Note', label: 'Note (optional)' }],
      confirmText: 'Approve the JIT Admin request for [TargetUser] ([Roles])?',
      condition: (row) => row.CanApprove,
      pinned: true,
    },
    {
      label: 'Reject',
      type: 'POST',
      url: '/api/ExecJITAdminRequestDecision',
      icon: <CippIcons.Cancel />,
      data: {
        RequestId: 'RequestId',
        tenantFilter: 'Tenant',
        Decision: '!Reject',
      },
      fields: [
        {
          type: 'textField',
          name: 'Note',
          label: 'Reason for rejection',
          validators: { required: 'A note is required when rejecting' },
        },
      ],
      confirmText:
        'Reject the JIT Admin request for [TargetUser]? This ends the request.',
      condition: (row) => row.CanReject,
      color: 'danger',
    },
  ]

  const filters = [
    {
      filterName: 'Pending',
      value: [{ id: 'State', value: 'Pending' }],
      type: 'column',
    },
  ]

  return (
    <CippTablePage
      title="JIT Admin Requests"
      apiUrl="/api/ListJITAdminRequests"
      queryKey={`ListJITAdminRequests-${tenantFilter}`}
      simpleColumns={[
        'State',
        'Tenant',
        'TargetUser',
        'Roles',
        'Groups',
        'StartDate',
        'EndDate',
        'Reason',
        'RequestedBy',
        'RequestedAt',
        'Approvals',
      ]}
      filters={filters}
      actions={actions}
      offCanvas={{
        extendedInfoFields: [
          'RequestId',
          'State',
          'Tenant',
          'TargetUser',
          'Roles',
          'Groups',
          'StartDate',
          'EndDate',
          'Reason',
          'RequestedBy',
          'RequestedAt',
          'ApproverRoles',
          'Approvals',
          'Decisions',
          'Results',
        ],
        actions,
      }}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={true}>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
