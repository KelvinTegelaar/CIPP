import React from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components/layout'
import { Link } from 'react-router-dom'

const Actions = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  return (
    <Link to={`/endpoint/MEM/edit-policy?ID=${row.id}&tenantDomain=${tenant.defaultDomainName}`}>
      <CButton size="sm" variant="ghost" color="warning">
        <FontAwesomeIcon icon={faEdit} />
      </CButton>
    </Link>
  )
}

const columns = [
  {
    selector: (row) => row['displayName'],
    name: 'Name',
    sortable: true,
    exportSelector: 'displayName',
  },
  {
    selector: (row) => row['PolicyTypeName'],
    name: 'Profile Type',
    sortable: true,
    exportSelector: 'PolicyTypeName',
  },
  {
    selector: (row) => row['id'],
    name: 'id',
    omit: true,
  },
  {
    name: 'Actions',
    cell: Actions,
  },
]

const IntuneList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  // eslint-disable-next-line react/prop-types
  const ExpandedComponent = ({ data }) => (
    // eslint-disable-next-line react/prop-types
    <pre>{JSON.stringify(data, null, 2)}</pre>
  )

  return (
    <CippPageList
      title="MEM Policies"
      tenantSelector={true}
      datatable={{
        path: '/api/ListIntunePolicy?type=ESP',
        params: { TenantFilter: tenant?.defaultDomainName },
        columns,
        reportName: `${tenant?.defaultDomainName}-MEMPolicies-List`,
        tableProps: {
          expandableRows: true,
          expandableRowsComponent: ExpandedComponent,
          expandOnRowClicked: true,
        },
      }}
    />
  )
}

export default IntuneList
