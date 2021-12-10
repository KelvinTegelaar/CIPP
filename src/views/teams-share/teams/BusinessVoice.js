import React, { useEffect } from 'react'
import CellBoolean from '../../../components/cipp/CellBoolean'
import CIPPApi from '../../../components/cipp/CIPPApiComponent'

const Formatter = (cell) => CellBoolean({ cell })
const columns = [
  {
    text: 'Assigned to User',
    dataField: 'AssignedTo',
    sort: true,
  },
  {
    text: 'Phone Number',
    dataField: 'TelephoneNumber',
    sort: true,
  },
  {
    text: 'Number Type',
    dataField: 'NumberType',
    sort: false,
  },
  {
    text: 'Country',
    dataField: 'IsoCountryCode',
    sort: false,
  },
  {
    text: 'Location',
    dataField: 'PlaceName',
    sort: false,
  },
  {
    text: 'Activation State',
    dataField: 'ActivationState',
    formatter: Formatter,
  },
  {
    text: 'Operator Connect',
    dataField: 'IsOperatorConnect',
    formatter: Formatter,
  },
  {
    text: 'Purchased on',
    dataField: 'AcquisitionDate',
    sort: false,
  },
]

const BusinessVoice = () => {
  return (
    <CIPPApi
      columns={columns}
      apiurl="/api/ListTeamsVoice"
      reportname="Teams overview"
      title="Teams Voice table"
    ></CIPPApi>
  )
}

export default BusinessVoice
