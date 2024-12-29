import React from 'react'
import { CippPageList } from 'src/components/layout'
import { TitleButton } from 'src/components/buttons'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import { cellDateFormatter } from 'src/components/tables'

const ListGDAPInvites = () => {
  const columns = [
    {
      name: 'Created',
      selector: (row) => row['Timestamp'],
      sortable: true,
      exportSelector: 'Timestamp',
      cell: cellDateFormatter({ format: 'short' }),
    },
    {
      name: 'Relationship ID',
      selector: (row) => row['RowKey'],
      sortable: true,
      exportSelector: 'RowKey',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Invite URL',
      selector: (row) => row['InviteUrl'],
      exportSelector: 'InviteUrl',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Onboarding URL',
      selector: (row) => row['OnboardingUrl'],
      exportSelector: 'OnboardingUrl',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Role Mapping',
      selector: (row) => row['RoleMappings'],
      exportSelector: 'RoleMappings',
      cell: cellGenericFormatter(),
    },
  ]
  return (
    <div>
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="GDAP Invite List"
        tenantSelector={false}
        datatable={{
          keyField: 'id',
          columns,
          reportName: `GDAP-Invite-List`,
          path: '/api/ListGDAPInvite',
          tableProps: {
            selectableRows: true,
            keyField: 'RowKey',
          },
        }}
      />
    </div>
  )
}

export default ListGDAPInvites
