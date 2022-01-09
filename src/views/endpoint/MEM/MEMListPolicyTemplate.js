import React from 'react'
import { useSelector } from 'react-redux'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CCard, CCardHeader, CCardTitle, CCardBody, CButton } from '@coreui/react'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Dropdown = (row, index, column) => {
  return (
    <>
      <CButton size="sm" variant="ghost" color="danger">
        <FontAwesomeIcon icon={faTrash} href="" />
      </CButton>
    </>
  )
}

const columns = [
  {
    name: 'Display Name',
    selector: (row) => row['Displayname'],
    sortable: true,
  },
  {
    name: 'Description',
    selector: (row) => row['Description'],
    sortable: true,
  },
  {
    name: 'Type',
    selector: (row) => row['Type'],
    sortable: true,
  },
  {
    name: 'GUID',
    selector: (row) => row['GUID'],
    omit: true,
  },
  {
    name: 'Action',
    cell: Dropdown,
  },
]

//todo: expandable with RAWJson property.
/* eslint-disable-next-line react/prop-types */
const ExpandedComponent = ({ data }) => <pre>{data.RAWJson}</pre>

const AutopilotListTemplates = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <hr />
      <CCard className="page-card">
        <CCardHeader>
          <CCardTitle>Available Endpoint Manager Templates</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CippDatatable
            tableProps={{
              expandableRows: true,
              expandableRowsComponent: ExpandedComponent,
              expandOnRowClicked: true,
            }}
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-MEMPolicyTemplates-List`}
            path="/api/ListIntuneTemplates"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default AutopilotListTemplates
