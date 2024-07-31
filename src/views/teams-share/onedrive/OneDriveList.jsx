import { CButton, CLink } from '@coreui/react'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'
import { CippActionsOffcanvas } from 'src/components/utilities'

const OneDriveList = () => {
  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const tenant = useSelector((state) => state.app.currentTenant)
    const [ocVisible, setOCVisible] = useState(false)

    //console.log(row)
    return (
      <>
        <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
          <FontAwesomeIcon icon={faEllipsisV} />
        </CButton>
        <CippActionsOffcanvas
          title="Extended Information"
          extendedInfo={[
            {
              label: 'User Principal Name',
              value: `${row.UPN ?? ' '}`,
            },
          ]}
          actions={[
            {
              label: 'Add permissions to OneDrive',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                UPN: row.UPN,
                TenantFilter: tenant.defaultDomainName,
                RemovePermission: false,
              },
              modalUrl: `/api/ExecSharePointPerms`,
              modalDropdown: {
                url: `/api/listUsers?TenantFilter=${tenant.defaultDomainName}`,
                labelField: 'displayName',
                valueField: 'userPrincipalName',
              },
              modalMessage: 'Select the User to add to this users OneDrive permissions',
            },
            {
              label: 'Remove permissions from OneDrive',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                UPN: row.UPN,
                TenantFilter: tenant.defaultDomainName,
                RemovePermission: true,
              },
              modalUrl: `/api/ExecSharePointPerms`,
              modalDropdown: {
                url: `/api/listUsers?TenantFilter=${tenant.defaultDomainName}`,
                labelField: 'displayName',
                valueField: 'userPrincipalName',
              },
              modalMessage: 'Select the User to remove from this users OneDrive permissions',
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
  const tenant = useSelector((state) => state.app.currentTenant)
  const columns = [
    {
      name: 'Name',
      selector: (row) => row['displayName'],
      sortable: true,
      cell: (row) => CellTip(row['displayName']),
      exportSelector: 'displayName',
    },
    {
      name: 'UPN',
      selector: (row) => row['UPN'],
      sortable: true,
      cell: (row) => CellTip(row['UPN']),
      exportSelector: 'UPN',
    },
    {
      name: 'Last Active',
      selector: (row) => row['LastActive'],
      sortable: true,
      exportSelector: 'LastActive',
    },
    {
      name: 'File Count (Total)',
      selector: (row) => row['FileCount'],
      sortable: true,
      exportSelector: 'FileCount',
    },
    {
      name: 'Used (GB)',
      selector: (row) => row['UsedGB'],
      sortable: true,
      exportSelector: 'UsedGB',
    },
    {
      name: 'Allocated (GB)',
      selector: (row) => row['Allocated'],
      sortable: true,
      exportSelector: 'Allocated',
    },
    {
      selector: (row) => Math.round((row.UsedGB / row.Allocated) * 100 * 10) / 10,
      name: 'Quota Used(%)',
      sortable: true,
      exportSelector: 'QuotaUsed',
    },
    {
      name: 'URL',
      selector: (row) => row['url'],
      sortable: true,
      exportSelector: 'URL',
      cell: (row) => {
        return (
          <CLink target="_blank" href={`${row.URL}`}>
            URL
          </CLink>
        )
      },
    },
    {
      name: 'Actions',
      cell: Offcanvas,
    },
  ]
  return (
    <CippPageList
      title="OneDrive List"
      datatable={{
        columns,
        path: '/api/ListSites?type=OneDriveUsageAccount',
        reportName: `${tenant?.defaultDomainName}-OneDrive-Report`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default OneDriveList
