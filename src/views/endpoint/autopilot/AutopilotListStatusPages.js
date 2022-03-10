import React from 'react'
import { useSelector } from 'react-redux'
import { cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'

const columns = [
  {
    selector: (row) => row['displayName'],
    name: 'Name',
    sortable: true,
    exportSelector: 'displayName',
  },
  {
    selector: (row) => row['Description'],
    name: 'Description',
    sortable: true,
    exportSelector: 'Description',
  },
  {
    selector: (row) => row['installProgressTimeoutInMinutes'],
    name: 'Installation Timeout (Minutes)',
    sortable: true,
    exportSelector: 'installProgressTimeoutInMinutes',
  },
  {
    selector: (row) => row['showInstallationProgress'],
    name: 'Show Installation Progress',
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'showInstallationProgress',
  },
  {
    selector: (row) => row['blockDeviceSetupRetryByUser'],
    name: 'Block Retries',
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'blockDeviceSetupRetryByUser',
  },
  {
    selector: (row) => row['allowDeviceResetOnInstallFailure'],
    name: 'Allow reset on failure',
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'allowDeviceResetOnInstallFailure',
  },
  {
    selector: (row) => row['allowDeviceUseOnInstallFailure'],
    name: 'Allow usage on failure',
    sortable: true,
    exportSelector: 'allowDeviceUseOnInstallFailure',
    cell: cellBooleanFormatter(),
  },
]

const AutopilotListESP = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Autopilot Status Pages"
      tenantSelector={true}
      datatable={{
        reportName: `${tenant?.defaultDomainName}-AutopilotStatusPages-List`,
        path: '/api/ListAutopilotConfig?type=ESP',
        columns,
        params: {
          TenantFilter: tenant?.defaultDomainName,
        },
      }}
    />
  )
}

export default AutopilotListESP
