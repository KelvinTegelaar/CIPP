import React from 'react'
import { useSelector } from 'react-redux'
import { CCard, CCardHeader, CCardTitle, CCardBody } from '@coreui/react'
import {
  cellBooleanFormatter,
  cellDateFormatter,
  TenantSelector,
  CippDatatable,
} from '../../../components/cipp'

const columns = [
  {
    name: 'Name',
    selector: (row) => row['displayName'],
    sortable: true,
  },
  {
    name: 'Enabled',
    selector: (row) => row['accountEnabled'],
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    name: 'Compliant',
    selector: (row) => row['isCompliant'],
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    name: 'Manufacturer',
    selector: (row) => row['manufacturer'],
    sortable: true,
  },
  {
    name: 'Model',
    selector: (row) => row['model'],
    sortable: true,
  },
  {
    name: 'Operating System',
    selector: (row) => row['operatingSystem'],
    sortable: true,
  },
  {
    name: 'Operating System Version',
    selector: (row) => row['operatingSystemVersion'],
    sortable: true,
  },
  {
    name: 'Created',
    selector: (row) => row['createdDateTime'],
    sortable: true,
    cell: cellDateFormatter({ format: 'short', showTime: false }),
  },
  {
    name: 'Approx Last SignIn',
    selector: (row) => row['approximateLastSignInDateTime'],
    sortable: true,
    cell: cellDateFormatter(),
  },
  {
    name: 'Ownership',
    selector: (row) => row['deviceOwnership'],
    sortable: true,
  },
  {
    name: 'Enrollment Type',
    selector: (row) => row['enrollmentType'],
    sortable: true,
  },
  {
    name: 'Management Type',
    selector: (row) => row['managementType'],
    sortable: true,
  },
  {
    name: 'On-Premises Sync Enabled',
    selector: (row) => row['onPremisesSyncEnabled'],
    cell: cellBooleanFormatter(),
    sortable: true,
  },
  {
    name: 'Trust Type',
    selector: (row) => row['trustType'],
    sortable: true,
  },
]

const DevicesList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard className="page-card">
        <CCardHeader>
          <CCardTitle className="text-primary">Devices</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
          <CippDatatable
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-Device-List`}
            path="/api/ListDevices"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default DevicesList
