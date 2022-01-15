import React from 'react'
import { useSelector } from 'react-redux'
import CippDatatable from 'src/components/tables/CippDatatable'
import CellBoolean from 'src/components/tables/CellBoolean'
import TenantSelector from 'src/components/utilities/TenantSelector'

import { CCard, CCardBody, CCardHeader, CCardTitle } from '@coreui/react'

const Formatter = (cell) => CellBoolean({ cell })
const columns = [
  {
    name: 'Assigned to User',
    selector: (row) => row['AssignedTo'],
    sortable: true,
    exportSelector: 'AssignedTo',
  },
  {
    name: 'Phone Number',
    selector: (row) => row['TelephoneNumber'],
    sortable: true,
    exportSelector: 'TelephoneNumber',
  },
  {
    name: 'Number Type',
    selector: (row) => row['NumberType'],
    sortable: true,
    exportSelector: 'NumberType',
  },
  {
    name: 'Country',
    selector: (row) => row['IsoCountryCode'],
    sortable: true,
    exportSelector: 'IsCountryCode',
  },
  {
    name: 'Location',
    selector: (row) => row['PlaceName'],
    sortable: true,
    exportSelector: 'PlaceName',
  },
  {
    name: 'Activation State',
    selector: (row) => row['ActivationState'],
    formatter: Formatter,
    exportSelector: 'ActivationState',
    sortable: true,
  },
  {
    name: 'Operator Connect',
    selector: (row) => row['IsOperatorConnect'],
    formatter: Formatter,
    sortable: true,
    exportSelector: 'IsOperatorConnect',
  },
  {
    name: 'Purchased on',
    selector: (row) => row['AcquisitionDate'],
    sortable: true,
    exportSelector: 'AcquisitionDate',
  },
]

const BusinessVoice = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard className="page-card">
        <CCardHeader>
          <CCardTitle className="text-primary">Teams Business Voice</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span> Select a tenant to get started.</span>}
          <CippDatatable
            reportName={`${tenant?.defaultDomainName}-Businessvoice`}
            path="/api/ListTeamsVoice"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default BusinessVoice
