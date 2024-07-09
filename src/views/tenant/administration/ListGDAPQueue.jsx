import React from 'react'
import { useSelector } from 'react-redux'
import { CSpinner, CCallout } from '@coreui/react'
import { CippPageList } from 'src/components/layout'

const ListGDAPQueue = () => {
  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row['Tenant'],
      sortable: true,
      exportSelector: 'Tenant',
    },
    {
      name: 'Status',
      selector: (row) => row['Status'],
      sortable: true,
      exportSelector: 'Status',
    },
    {
      name: 'Migration Started at',
      selector: (row) => row['StartAt'],
      sortable: true,
      exportSelector: 'StartAt',
    },
  ]
  return (
    <div>
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="GDAP Migration List"
        tenantSelector={false}
        datatable={{
          keyField: 'id',
          columns,
          reportName: `GDAPMigration-List`,
          path: '/api/ListGDAPQueue',
        }}
      />
    </div>
  )
}

export default ListGDAPQueue
