import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { cellBooleanFormatter, cellDateFormatter, CellTip } from 'src/components/tables'

const columns = [
  {
    name: 'Name',
    selector: (row) => row['displayName'],
    sortable: true,
    cell: (row) => CellTip(row['displayName']),
    exportSelector: 'displayName',
  },
  {
    name: 'Enabled',
    selector: (row) => row['accountEnabled'],
    sortable: true,
    cell: cellBooleanFormatter({ colourless: true }),
    exportSelector: 'accountEnabled',
  },
  {
    name: 'Compliant',
    selector: (row) => row['isCompliant'],
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'isCompliant',
  },
  {
    name: 'Manufacturer',
    selector: (row) => row['manufacturer'],
    sortable: true,
    cell: (row) => CellTip(row['manufacturer']),
    exportSelector: 'manufacturer',
  },
  {
    name: 'Model',
    selector: (row) => row['model'],
    sortable: true,
    cell: (row) => CellTip(row['model']),
    exportSelector: 'model',
  },
  {
    name: 'Operating System',
    selector: (row) => row['operatingSystem'],
    sortable: true,
    exportSelector: 'operatingSystem',
  },
  {
    name: 'Operating System Version',
    selector: (row) => row['operatingSystemVersion'],
    sortable: true,
    exportSelector: 'operatingSystemVersion',
  },
  {
    name: 'Created',
    selector: (row) => row['createdDateTime'],
    sortable: true,
    cell: cellDateFormatter({ format: 'short', showTime: false }),
    exportSelector: 'createdDateTime',
  },
  /*
  * This should not be used, it is not anywhere near accurate, it is out by days even weeks 
  * in my testing, I don't recommend we display it, we have alternate sources for this
  * as well which are significantly closer to (if not) accurate - knightian
  {
    name: 'Approx Last SignIn',
    selector: (row) => row['approximateLastSignInDateTime'],
    sortable: true,
    cell: cellDateFormatter(),
    exportSelector: 'approximateLastSignInDateTime',
  },**/
  {
    name: 'Ownership',
    selector: (row) => row['deviceOwnership'],
    sortable: true,
    exportSelector: 'deviceOwnership',
  },
  {
    name: 'Enrollment Type',
    selector: (row) => row['enrollmentType'],
    sortable: true,
    exportSelector: 'enrollmentType',
    cell: (row) => CellTip(row['enrollmentType']),
  },
  {
    name: 'Management Type',
    selector: (row) => row['managementType'],
    sortable: true,
    exportSelector: 'managementType',
  },
  {
    name: 'On-Premises Sync Enabled',
    selector: (row) => row['onPremisesSyncEnabled'],
    cell: cellBooleanFormatter({ colourless: true }),
    sortable: true,
    exportSelector: 'onPremisessSyncEnabled',
  },
  {
    name: 'Trust Type',
    selector: (row) => row['trustType'],
    sortable: true,
    exportSelector: 'trustType',
  },
]

const DevicesList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Devices"
      datatable={{
        columns,
        path: '/api/ListDevices',
        reportName: `${tenant?.defaultDomainName}-Device-List`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default DevicesList
