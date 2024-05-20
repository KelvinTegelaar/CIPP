import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { CippPageList } from 'src/components/layout'
import { CellTip, cellBooleanFormatter } from 'src/components/tables'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { TitleButton } from 'src/components/buttons'
import { CippActionsOffcanvas } from 'src/components/utilities'

const Actions = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ocVisible, setOCVisible] = useState(false)
  return (
    <>
      <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title="Settings"
        extendedInfo={[
          {
            label: 'Entry',
            value: row.Value,
          },
          {
            label: 'Notes',
            value: row.Notes,
          },
          {
            label: 'Expiration Date',
            value: row.ExpirationDate,
          },
        ]}
        actions={[
          {
            label: 'Remove',
            color: 'danger',
            modal: true,
            modalUrl: `/api/RemoveTenantAllowBlockList?TenantFilter=${tenant.defaultDomainName}&Entries=${row.Value}&ListType=${row.ListType}`,
            modalMessage: 'Are you sure you want to delete?',
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

const columns = [
  {
    name: 'Value',
    selector: (row) => row['Value'],
    sortable: true,
    cell: (row) => CellTip(row['Value']),
    exportSelector: 'Value',
  },
  {
    name: 'ListType',
    selector: (row) => row['ListType'],
    sortable: true,
    cell: (row) => CellTip(row['ListType']),
    exportSelector: 'ListType',
    maxWidth: '80px',
  },
  {
    name: 'Action',
    selector: (row) => row['Action'],
    sortable: true,
    cell: (row) => CellTip(row['Action']),
    exportSelector: 'Action',
    maxWidth: '80px',
  },
  {
    name: 'Notes',
    selector: (row) => row['Notes'],
    sortable: true,
    cell: (row) => CellTip(row['Notes']),
    exportSelector: 'Notes',
  },
  {
    name: 'LastModifiedDateTime',
    selector: (row) => row['LastModifiedDateTime'],
    sortable: true,
    cell: (row) => CellTip(row['LastModifiedDateTime']),
    exportSelector: 'LastModifiedDateTime',
  },
  {
    name: 'ExpirationDate',
    selector: (row) => row['ExpirationDate'],
    sortable: true,
    cell: (row) => CellTip(row['ExpirationDate']),
    exportSelector: 'ExpirationDate',
  },
  /*{
    name: 'Actions',
    cell: Actions,
    maxWidth: '80px',
  },*/
]

const AllowBlockList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      titleButton={
        <TitleButton href="/email/administration/add-tenant-allow-block-list" title="New Entry" />
      }
      title="Tenant Allow/Block Lists"
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-TenantAllowBlockList`,
        path: '/api/ListTenantAllowBlockList',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default AllowBlockList
