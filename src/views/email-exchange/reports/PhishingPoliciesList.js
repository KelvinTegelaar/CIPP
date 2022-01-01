import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CCard, CCardBody, CCardHeader, CCardTitle } from '@coreui/react'
import { cellBooleanFormatter, cellDateFormatter } from '../../../components/cipp'

//TODO: Add CellBoolean
const columns = [
  {
    selector: (row) => row['Name'],
    name: 'Name',
    sortable: true,
  },
  {
    selector: (row) => row['PhishThresholdLevel'],
    name: 'Phish Threshold Level',
    sortable: true,
  },
  {
    selector: (row) => row['Enabled'],
    name: 'Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['ExcludedSenders'],
    name: 'Excluded Senders',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['ExcludedDomains'],
    name: 'Excluded Domains',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['WhenChangedUTC'],
    name: 'Last Change Date',
    sortable: true,
    cell: cellDateFormatter(),
  },
  {
    selector: (row) => row['Priority'],
    name: 'Priority',
    sortable: true,
  },
]

const MailboxList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard>
        <CCardHeader>
          <CCardTitle className="text-primary">Phishing Policies</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
          <CippDatatable
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-PhishingPolicies-List`}
            path="/api/ListPhishPolicies"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default MailboxList
