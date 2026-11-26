import { useMemo } from 'react'
import { Alert, SvgIcon } from '@mui/material'
import { CippIcons } from '../../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog'
import { useDialog } from '../../../../hooks/use-dialog'
import { useSettings } from '../../../../hooks/use-settings'
import { usePermissions } from '../../../../hooks/use-permissions'
import { PermissionButton } from '../../../../utils/permissions'

const simpleColumns = [
  'name',
  'reportType',
  'workload',
  'status',
  'users',
  'requestedDateTime',
  'createdDateTime',
]

// Report statuses change on Microsoft's side, so skip the response cache when listing them.
const liveReadData = { InvalidateCIPPCache: true }

const Page = () => {
  const tenant = useSettings().currentTenant
  const { checkPermissions } = usePermissions()
  const canWrite = checkPermissions(['Sharepoint.Site.ReadWrite'])
  const createDialog = useDialog()
  const queryKey = `ListSharePointAccessReports-${tenant}`

  const actions = useMemo(
    () => [
      {
        label: 'View Report',
        link: '/teams-share/reports/access-reports/report?reportId=[id]&name=[name]',
        icon: <CippIcons.Visibility />,
        condition: (row) => row.status === 'Completed',
      },
      {
        label: 'Delete Report',
        type: 'POST',
        url: '/api/ExecSharePointAccessReport',
        icon: <CippIcons.Delete />,
        color: 'danger',
        data: { Action: '!Delete', ReportId: 'id' },
        confirmText:
          'Delete [name]? This frees a report slot in the tenant. It does not reset the 30-day wait before the same report can run again.',
        relatedQueryKeys: ['ListSharePointAccessReports-*'],
        multiPost: false,
        condition: () => canWrite,
      },
    ],
    [canWrite]
  )

  return (
    <>
      <CippTablePage
        title="Access Reports"
        apiUrl="/api/ListSharePointAccessReports"
        apiData={liveReadData}
        queryKey={queryKey}
        simpleColumns={simpleColumns}
        actions={actions}
        tableFilter={
          <Alert severity="info">
            These are Microsoft&apos;s SharePoint Advanced Management access
            reports, including any started from the SharePoint admin center.
            They need at least one Microsoft 365 Copilot licence or the
            SharePoint Advanced Management add-on in the tenant. Microsoft
            builds each report in the background: the first site permissions
            report can take up to 5 days, later ones usually finish within a
            day. A report can be run again only every 30 days.
          </Alert>
        }
        cardButton={
          <PermissionButton
            requiredPermissions={['Sharepoint.Site.ReadWrite']}
            startIcon={
              <SvgIcon fontSize="small">
                <CippIcons.Add />
              </SvgIcon>
            }
            onClick={createDialog.handleOpen}
          >
            New Report
          </PermissionButton>
        }
      />
      {canWrite && (
        <CippApiDialog
          createDialog={createDialog}
          title="Start an access report"
          relatedQueryKeys={['ListSharePointAccessReports-*']}
          defaultvalues={{
            ReportType: 'SitePermissions',
            Workload: 'sharePoint',
          }}
          fields={[
            {
              type: 'radio',
              name: 'ReportType',
              label: 'Report',
              options: [
                {
                  label: 'Site permissions: every site and who can reach it',
                  value: 'SitePermissions',
                },
                {
                  label:
                    'User permissions: every site the selected users can reach',
                  value: 'UserPermissions',
                },
              ],
              validators: { required: 'Select a report' },
            },
            {
              type: 'radio',
              name: 'Workload',
              label: 'Sites',
              options: [
                { label: 'SharePoint sites', value: 'sharePoint' },
                { label: 'OneDrive', value: 'oneDrive' },
              ],
              validators: { required: 'Select SharePoint or OneDrive' },
            },
            {
              type: 'autoComplete',
              name: 'Users',
              label: 'Users',
              multiple: true,
              creatable: false,
              condition: {
                field: 'ReportType',
                compareType: 'valueEq',
                compareValue: 'UserPermissions',
              },
              validators: {
                validate: (value) =>
                  (value?.length ?? 0) > 0 || 'Select at least one user',
              },
              api: {
                url: '/api/ListGraphRequest',
                dataKey: 'Results',
                labelField: (user) =>
                  `${user.displayName} (${user.userPrincipalName})`,
                valueField: 'userPrincipalName',
                queryKey: `ListUsersAutoComplete-${tenant}`,
                showRefresh: true,
                data: {
                  Endpoint: 'users',
                  $select: 'id,displayName,userPrincipalName',
                  $top: 999,
                  $count: true,
                },
              },
            },
          ]}
          api={{
            type: 'POST',
            url: '/api/ExecSharePointAccessReport',
            confirmText:
              'Microsoft allows each report to run once every 30 days, so starting one now also blocks the same report in the SharePoint admin center until then.',
            customDataformatter: (row, action, formData) => ({
              tenantFilter: tenant,
              Action: 'Create',
              ReportType: formData.ReportType,
              Workload: formData.Workload,
              Users: (formData.Users ?? []).map((user) => user.value),
            }),
          }}
        />
      )}
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>
)

export default Page
