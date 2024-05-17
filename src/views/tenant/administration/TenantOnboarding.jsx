import { CBadge, CTooltip } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { TitleButton } from 'src/components/buttons'
import { CippPageList } from 'src/components/layout'
import { CellBadge, cellDateFormatter } from 'src/components/tables'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'

const TenantOnboarding = () => {
  const titleButton = (
    <TitleButton
      href="/tenant/administration/tenant-onboarding-wizard"
      title="Start Tenant Onboarding"
    />
  )
  function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
  function getBadgeColor(status) {
    switch (status.toLowerCase()) {
      case 'queued':
        return 'info'
      case 'failed':
        return 'danger'
      case 'succeeded':
        return 'success'
      case 'running':
        return 'primary'
    }
  }
  function getLatestStep(steps) {
    var activeSteps = steps?.filter((step) => step.Status !== 'pending')
    var currentStep = activeSteps[activeSteps.length - 1]
    var color = 'info'
    var icon = 'me-2 info-circle'
    var spin = false
    switch (currentStep?.Status) {
      case 'succeeded':
        color = 'me-2 text-success'
        icon = 'check-circle'
        break
      case 'failed':
        color = 'me-2 text-danger'
        icon = 'times-circle'
        break
      case 'running':
        color = 'me-2 text-primary'
        icon = 'sync'
        spin = true
        break
    }
    return (
      <CTooltip content={currentStep?.Message ?? ''}>
        <div>
          <FontAwesomeIcon icon={icon} spin={spin} className={color} />
          {currentStep?.Title}
        </div>
      </CTooltip>
    )
  }
  const columns = [
    {
      name: 'Last Update',
      selector: (row) => row.Timestamp,
      sortable: true,
      exportSelector: 'Timestamp',
      cell: cellDateFormatter({ format: 'short' }),
    },
    {
      name: 'Tenant',
      selector: (row) => row?.Relationship?.customer?.displayName,
      sortable: true,
      cell: cellGenericFormatter(),
      exportSelector: 'Relationship/customer/displayName',
    },
    {
      name: 'Status',
      selector: (row) => row?.Status,
      sortable: true,
      exportSelector: 'Status',
      cell: (row) => CellBadge({ label: ucfirst(row?.Status), color: getBadgeColor(row?.Status) }),
    },
    {
      name: 'Onboarding Step',
      selector: (row) => row?.OnboardingSteps,
      cell: (row) => getLatestStep(row?.OnboardingSteps),
    },
    {
      name: 'Logs',
      selector: (row) => row?.Logs,
      sortable: false,
      cell: cellGenericFormatter(),
    },
  ]
  return (
    <div>
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="Tenant Onboarding"
        tenantSelector={false}
        titleButton={titleButton}
        datatable={{
          filterlist: [
            {
              filterName: 'Running',
              filter: 'Complex: Status eq Running',
            },
            {
              filterName: 'Pending',
              filter: 'Complex: Status eq Pending',
            },
            {
              filterName: 'Failed',
              filter: 'Complex: Status eq Failed',
            },
          ],
          tableProps: {
            selectableRows: true,
            actionsList: [
              {
                label: 'Cancel Onboarding',
                modal: true,
                modalType: 'POST',
                modalBody: {
                  id: '!RowKey',
                },
                modalUrl: `/api/ExecOnboardTenant?Cancel=true`,
                modalMessage: 'Are you sure you want to cancel these onboardings?',
              },
              {
                label: 'Retry Onboarding',
                modal: true,
                modalType: 'POST',
                modalBody: {
                  id: '!RowKey',
                },
                modalUrl: `/api/ExecOnboardTenant?Retry=true`,
                modalMessage: 'Are you sure you want to retry these onboardings?',
              },
            ],
          },
          keyField: 'id',
          columns,
          reportName: `Tenant-Onboarding`,
          path: '/api/ListTenantOnboarding',
          defaultSortAsc: false,
        }}
      />
    </div>
  )
}

export default TenantOnboarding
