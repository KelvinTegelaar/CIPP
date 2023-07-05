import { CButton } from '@coreui/react'
import { faEllipsisV, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { cellDateFormatter, cellNullTextFormatter } from 'src/components/tables'
import { CippActionsOffcanvas } from 'src/components/utilities'
import GDAPRoles from 'src/data/GDAPRoles'

const Actions = (row, rowIndex, formatExtraData) => {
  const [ocVisible, setOCVisible] = useState(false)

  const tenant = useSelector((state) => state.app.currentTenant)

  var extendedInfo = []
  row?.accessDetails.unifiedRoles.map((role) => {
    for (var x = 0; x < GDAPRoles.length; x++) {
      if (GDAPRoles[x].ObjectId == role.roleDefinitionId) {
        extendedInfo.push({
          label: GDAPRoles[x].Name,
          value: GDAPRoles[x].Description,
        })
        break
      }
    }
  })
  return (
    <>
      <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title={'GDAP - ' + row?.customer.displayName}
        extendedInfo={extendedInfo}
        actions={[
          {
            label: 'Terminate Relationship',
            color: 'danger',
            modal: true,
            icon: <FontAwesomeIcon icon={faTrashAlt} className="me-2" />,
            modalUrl: `/api/ExecDeleteGDAPRelationship?GDAPID=${row.id}`,
            modalMessage: 'Are you sure you want to delete this relationship?',
          },
        ]}
        placement="end"
        visible={ocVisible}
        id={row.id}
        hideFunction={() => setOCVisible(false)}
      />
    </>
  )
}

const GDAPRelationships = () => {
  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row.customer?.displayName,
      sortable: true,
      exportSelector: 'customer/displayName',
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
    {
      name: 'Actions',
      cell: Actions,
      maxWidth: '80px',
    },
  ]
  return (
    <div>
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="GDAP Relationship List"
        tenantSelector={false}
        datatable={{
          filterlist: [
            { filterName: 'Active Relationships', filter: '"status":"active"' },
            { filterName: 'Terminated Relationships', filter: '"status":"Terminated"' },
            { filterName: 'Pending Relationships', filter: 'Pending' },
          ],
          tableProps: {
            selectableRows: true,
            actionsList: [
              {
                label: 'Terminate Relationship',
                modal: true,
                modalUrl: `/api/ExecDeleteGDAPRelationship?&GDAPID=!id`,
                modalMessage: 'Are you sure you want to terminate these relationships?',
              },
            ],
          },
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
