import React from 'react'
import { useSelector } from 'react-redux'
import { CellTip, cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'
import { TitleButton } from 'src/components/buttons'

const columns = [
  {
    selector: (row) => row['displayName'],
    name: 'Name',
    sortable: true,
    cell: (row) => CellTip(row['displayName']),
    exportSelector: 'displayName',
    minWidth: '250px',
  },
  {
    selector: (row) => row['Description'],
    name: 'Description',
    sortable: true,
    cell: (row) => CellTip(row['Description']),
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
    cell: cellBooleanFormatter({ colourless: true }),
    exportSelector: 'showInstallationProgress',
  },
  {
    selector: (row) => row['blockDeviceSetupRetryByUser'],
    name: 'Block Retries',
    sortable: true,
    cell: cellBooleanFormatter({ colourless: true }),
    exportSelector: 'blockDeviceSetupRetryByUser',
  },
  {
    selector: (row) => row['allowDeviceResetOnInstallFailure'],
    name: 'Allow reset on failure',
    sortable: true,
    cell: cellBooleanFormatter({ colourless: true }),
    exportSelector: 'allowDeviceResetOnInstallFailure',
  },
  {
    selector: (row) => row['allowDeviceUseOnInstallFailure'],
    name: 'Allow usage on failure',
    sortable: true,
    exportSelector: 'allowDeviceUseOnInstallFailure',
    cell: cellBooleanFormatter({ colourless: true }),
  },
]

const AutopilotListESP = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Autopilot Status Pages"
      titleButton={
        <>
          <TitleButton
            href={`/endpoint/autopilot/add-status-page?customerId=${tenant?.customerId}&tableFilter=${tenant?.defaultDomainName}`}
            title="Deploy Autopilot Status Page"
          />
        </>
      }
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
