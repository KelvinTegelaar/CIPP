import React from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'

const AllowBlockList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const Actions = (row, rowIndex, formatExtraData) => (
    <>
      <Link
        to={`/email/administration/edit-tenant-allow-block-lists?tenantDomain=${tenant.defaultDomainName}?Entry=${row.value}?ListType=${row.ListType}`}
      >
        <CButton size="sm" variant="ghost" color="warning">
          <FontAwesomeIcon icon={faEdit} />
        </CButton>
      </Link>
      <Link
        to={`/email/administration/delete-tenant-allow-block-lists?tenantDomain=${tenant.defaultDomainName}?Entry=${row.value}?ListType=${row.ListType}`}
      >
        <CButton size="sm" variant="ghost" color="danger">
          <FontAwesomeIcon icon={'trash'} />
        </CButton>
      </Link>
    </>
  )

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
    // {
    //   name: 'Actions',
    //  cell: Actions,
    //  maxWidth: '80px',
    // },
  ]

  return (
    <CippPageList
      title="Tenant Allow/Block Lists"
      datatable={{
        columns,
        path: '/api/ListTenantAllowBlockList',
        reportName: `${tenant?.defaultDomainName}-TenantAllowBlockList`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default AllowBlockList
