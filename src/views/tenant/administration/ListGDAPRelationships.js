import React from 'react'
import { useSelector } from 'react-redux'
import { CSpinner, CCallout } from '@coreui/react'
import { CippPageList } from 'src/components/layout'
import { cellDateFormatter, cellNullTextFormatter } from 'src/components/tables'

const GDAPRelationships = () => {
  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row.customer?.displayName,
      sortable: true,
      exportSelector: 'customer',
      cell: cellNullTextFormatter(),
    },
    {
      name: 'Relationship Name',
      selector: (row) => row['displayName'],
      sortable: true,
      exportSelector: 'displayName',
    },
    {
      name: 'Status',
      selector: (row) => row['status'],
      sortable: true,
      exportSelector: 'status',
    },
    {
      name: 'Created',
      selector: (row) => row['createdDateTime'],
      sortable: true,
      exportSelector: 'createdDateTime',
      cell: cellDateFormatter({ format: 'short' }),
    },
    {
      name: 'Activated',
      selector: (row) => row['activatedDateTime'],
      sortable: true,
      exportSelector: 'activatedDateTime',
      cell: cellDateFormatter({ format: 'short' }),
    },
    {
      name: 'End',
      selector: (row) => row['endDateTime'],
      sortable: true,
      exportSelector: 'endDateTime',
      cell: cellDateFormatter({ format: 'short' }),
    },
  ]
  return (
    <div>
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="GDAP Relationship List"
        tenantSelector={false}
        datatable={{
          keyField: 'id',
          columns,
          reportName: `GDAP-Relationships`,
          path: '/api/ListGraphRequest',
          params: { Endpoint: 'tenantRelationships/delegatedAdminRelationships' },
        }}
      />
    </div>
  )
}

export default GDAPRelationships
