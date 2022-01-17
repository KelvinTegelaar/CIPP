import React from 'react'
import { useSelector } from 'react-redux'
import { CellBoolean } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'

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
    <CippPageList
      title="Teams Business Voice"
      datatable={{
        columns,
        path: '/api/ListTeamsVoice',
        reportName: `${tenant?.defaultDomainName}-BusinessVoice`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default BusinessVoice
