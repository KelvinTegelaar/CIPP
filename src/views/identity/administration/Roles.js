import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from '../../../components'

const columns = [
  {
    selector: (row) => row['DisplayName'],
    name: 'Role Name',
    sortable: true,
  },
  {
    selector: (row) => row['Description'],
    name: 'Description',
    sortable: true,
    wrap: true,
  },
  {
    selector: (row) => 'Click to Expand',
    name: 'Members',
  },
]

const RolesList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  // eslint-disable-next-line react/prop-types
  const ExpandedComponent = ({ data }) => (
    // eslint-disable-next-line react/prop-types
    <pre>{JSON.stringify(data.Members, null, 2)}</pre>
  )

  return (
    <CippPageList
      title="Roles"
      datatable={{
        reportName: `${tenant?.defaultDomainName}-Roles`,
        path: '/api/ListRoles',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName },
        tableProps: {
          expandableRows: true,
          expandableRowsComponent: ExpandedComponent,
          expandOnRowClicked: true,
        },
      }}
    />
  )
}

export default RolesList
