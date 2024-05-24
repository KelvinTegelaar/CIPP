import { CButton } from '@coreui/react'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'
import { CippActionsOffcanvas } from 'src/components/utilities'

const SharepointList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
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
              label: 'Site URL',
              value: `${row.URL ?? ' '}`,
            },
          ]}
          actions={[
            {
              label: 'Add member',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                groupId: row.UPN,
                TenantFilter: tenant.defaultDomainName,
                add: true,
                URL: row.URL,
                SharePointType: row.Template,
              },
              modalUrl: `/api/ExecSetSharePointMember`,
              modalDropdown: {
                url: `/api/listUsers?TenantFilter=${tenant.defaultDomainName}`,
                labelField: 'displayName',
                valueField: 'userPrincipalName',
              },
              modalMessage: 'Select the User to add as a member.',
            },
            {
              label: 'Remove member',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                groupId: row.UPN,
                TenantFilter: tenant.defaultDomainName,
                add: false,
                URL: row.URL,
                SharePointType: row.Template,
              },
              modalUrl: `/api/ExecSetSharePointMember`,
              modalDropdown: {
                url: `/api/listUsers?TenantFilter=${tenant.defaultDomainName}`,
                labelField: 'displayName',
                valueField: 'userPrincipalName',
              },
              modalMessage: 'Select the User to remove as a member.',
            },
            {
              label: 'Add Site Admin',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                UPN: row.UPN,
                TenantFilter: tenant.defaultDomainName,
                RemovePermission: false,
                URL: row.URL,
              },
              modalUrl: `/api/ExecSharePointOwner`,
              modalDropdown: {
                url: `/api/listUsers?TenantFilter=${tenant.defaultDomainName}`,
                labelField: 'displayName',
                valueField: 'userPrincipalName',
              },
              modalMessage: 'Select the User to add to the Site Admins permissions',
            },
            {
              label: 'Remove Site Admin',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                UPN: row.UPN,
                TenantFilter: tenant.defaultDomainName,
                RemovePermission: true,
                URL: row.URL,
              },
              modalUrl: `/api/ExecSharePointOwner`,
              modalDropdown: {
                url: `/api/listUsers?TenantFilter=${tenant.defaultDomainName}`,
                labelField: 'displayName',
                valueField: 'userPrincipalName',
              },
              modalMessage: 'Select the User to remove from the Site Admins permission',
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
      name: 'URL',
      selector: (row) => row['URL'],
      sortable: true,
      cell: (row) => CellTip(row['URL']),
      exportSelector: 'URL',
    },
    {
      name: 'Owner',
      selector: (row) => row['displayName'],
      sortable: true,
      cell: (row) => CellTip(row['displayName']),
      exportSelector: 'displayName',
      maxWidth: '300px',
    },
    {
      name: 'Last Active',
      selector: (row) => row['LastActive'],
      sortable: true,
      exportSelector: 'LastActive',
      maxWidth: '120px',
    },
    {
      name: 'File Count (Total)',
      selector: (row) => row['FileCount'],
      sortable: true,
      exportSelector: 'FileCount',
      maxWidth: '120px',
    },
    {
      name: 'Used (GB)',
      selector: (row) => row['UsedGB'],
      sortable: true,
      exportSelector: 'UsedGB',
      maxWidth: '120px',
    },
    {
      name: 'Allocated (GB)',
      selector: (row) => row['Allocated'],
      sortable: true,
      exportSelector: 'Allocated',
      maxWidth: '70px',
    },
    {
      name: 'Root Template',
      selector: (row) => row['Template'],
      sortable: true,
      cell: (row) => CellTip(row['Template']),
      exportSelector: 'Template',
      maxWidth: '200px',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
    },
  ]
  return (
    <CippPageList
      title="SharePoint List"
      datatable={{
        columns,
        path: '/api/ListSites?type=SharePointSiteUsage',
        reportName: `${tenant?.defaultDomainName}-Sharepoint-List`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default SharepointList
