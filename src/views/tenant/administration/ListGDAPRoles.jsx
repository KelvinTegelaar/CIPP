import React from 'react'
import { useSelector } from 'react-redux'
import { CSpinner, CCallout } from '@coreui/react'
import { CippPageList } from 'src/components/layout'
import { TitleButton } from 'src/components/buttons'

const ListGDAPRoles = () => {
  const columns = [
    {
      name: 'Role',
      selector: (row) => row['RoleName'],
      sortable: true,
      exportSelector: 'RoleName',
    },
    {
      name: 'Group',
      selector: (row) => row['GroupName'],
      sortable: true,
      exportSelector: 'GroupName',
    },
  ]
  return (
    <div>
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="GDAP Role List"
        titleButton={
          <TitleButton href="/tenant/administration/gdap-role-wizard" title="Map GDAP Roles" />
        }
        tenantSelector={false}
        datatable={{
          keyField: 'id',
          columns,
          reportName: `GDAPRole-List`,
          path: '/api/ListGDAPRoles',
          tableProps: {
            selectableRows: true,
            actionsList: [
              {
                label: 'Delete Mapping',
                modal: true,
                modalUrl: `/api/ExecDeleteGDAPRoleMapping?&GroupId=!GroupId`,
                modalMessage:
                  'Are you sure you want to delete this role mapping? (Note: This does not delete the associated security groups or modify any GDAP relationships.)',
              },
            ],
            keyField: 'GroupId',
          },
        }}
      />
    </div>
  )
}

export default ListGDAPRoles
