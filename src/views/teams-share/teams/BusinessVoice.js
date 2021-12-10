import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import CippDatatable from 'src/components/cipp/CippDatatable'
import CellBoolean from '../../../components/cipp/CellBoolean'
import TenantSelector from 'src/components/cipp/TenantSelector'

const Formatter = (cell) => CellBoolean({ cell })
const columns = [
  {
    name: 'Assigned to User',
    selector: 'AssignedTo',
    sort: true,
  },
  {
    name: 'Phone Number',
    selector: 'TelephoneNumber',
    sort: true,
  },
  {
    name: 'Number Type',
    selector: 'NumberType',
    sort: false,
  },
  {
    name: 'Country',
    selector: 'IsoCountryCode',
    sort: false,
  },
  {
    name: 'Location',
    selector: 'PlaceName',
    sort: false,
  },
  {
    name: 'Activation State',
    selector: 'ActivationState',
    formatter: Formatter,
  },
  {
    name: 'Operator Connect',
    selector: 'IsOperatorConnect',
    formatter: Formatter,
  },
  {
    name: 'Purchased on',
    selector: 'AcquisitionDate',
    sort: false,
  },
]

const BusinessVoice = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  return (
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Teams Activity</h3>
        {Object.keys(tenant).length === 0 && <span> Select a tenant to get started.</span>}
        <CippDatatable
          reportName={`${tenant?.defaultDomainName}-Businessvoice`}
          path="/api/ListTeamsVoice"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default BusinessVoice
