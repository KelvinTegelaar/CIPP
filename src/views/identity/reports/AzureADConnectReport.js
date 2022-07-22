import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { cellDateFormatter } from 'src/components/tables'
const columns = [
  {
    name: 'Display Name',
    selector: (row) => row['displayName'],
    sortable: true,
    exportSelector: 'displayName',
  },
  {
    name: 'Object Type',
    selector: (row) => row['ObjectType'],
    sortable: true,
    exportSelector: 'ObjectType',
  },
  {
    name: 'Created Date (Local)',
    selector: (row) => row['createdDateTime'],
    sortable: true,
    cell: cellDateFormatter(),
    exportSelector: 'createdDateTime',
  },
  {
    name: 'On Premises Provisioning Errors',
    selector: (row) => row['onPremisesProvisioningErrors'],
    sortable: true,
    exportSelector: 'onPremisesProvisioningErrors',
  },
]

const AzureADConnectReport = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Azure AD Connect Report"
      datatable={{
        columns,
        path: '/api/ListAzureADConnectStatus',
        reportName: `${tenant?.defaultDomainName}-Azure-AD-Connect-Report`,
        params: { TenantFilter: tenant?.defaultDomainName, DataToReturn: 'AzureADObjectsInError' },
      }}
    />
  )
}

export default AzureADConnectReport
