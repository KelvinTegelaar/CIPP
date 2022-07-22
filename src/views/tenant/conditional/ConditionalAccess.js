import { CButton } from '@coreui/react'
import {
  faBan,
  faBook,
  faBookReader,
  faCheck,
  faEllipsisV,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { cellDateFormatter, CellTip } from 'src/components/tables'
function DateNotNull(date) {
  if (date === null || date === undefined || date === '' || date === 'undefined') {
    return ' '
  }
  return date.toString().trim() + 'Z'
}
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
        title="Rule Info"
        extendedInfo={[
          { label: 'Name', value: `${row.displayName}` },
          { label: 'State', value: `${row.state}` },
        ]}
        actions={[
          {
            label: 'Create template based on rule',
            color: 'info',
            modal: true,
            icon: <FontAwesomeIcon icon={faBook} className="me-2" />,
            modalBody: JSON.parse(row.rawjson),
            modalType: 'POST',
            modalUrl: `/api/AddCATemplate`,
            modalMessage: 'Are you sure you want to create a template based on this rule?',
          },
          {
            label: 'Enable Rule',
            color: 'info',
            icon: <FontAwesomeIcon icon={faCheck} className="me-2" />,
            modal: true,
            modalUrl: `/api/EditCAPolicy?State=Enabled&TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}`,
            modalMessage: 'Are you sure you want to enable this rule?',
          },
          {
            label: 'Disable Rule',
            color: 'info',
            icon: <FontAwesomeIcon icon={faBan} className="me-2" />,
            modal: true,
            modalUrl: `/api/EditCAPolicy?State=Disabled&TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}`,
            modalMessage: 'Are you sure you want to disable this rule?',
          },
          {
            label: 'Set rule to report only',
            color: 'info',
            icon: <FontAwesomeIcon icon={faBookReader} className="me-2" />,
            modal: true,
            modalUrl: `/api/EditCAPolicy?State=enabledForReportingButNotEnforced&TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}`,
            modalMessage: 'Are you sure you want to disable this rule?',
          },
          {
            label: 'Delete Rule',
            color: 'danger',
            modal: true,
            icon: <FontAwesomeIcon icon={faTrash} className="me-2" />,
            modalUrl: `/api/RemoveCAPolicy?TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}`,
            modalMessage: 'Are you sure you want to disable this rule?',
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
    name: 'Name',
    selector: (row) => row['displayName'],
    sortable: true,
    wrap: true,
    cell: (row) => CellTip(row['displayName']),
    exportSelector: 'displayName',
    minWidth: '300px',
  },
  {
    name: 'State',
    selector: (row) => row['state'],
    sortable: true,
    exportSelector: 'state',
  },
  {
    name: 'Last Modified (Local)',
    selector: (row) => DateNotNull(row['modifiedDateTime']),
    sortable: true,
    cell: cellDateFormatter(),
    exportSelector: 'modifiedDateTime',
  },
  {
    name: 'Client App Types',
    selector: (row) => row['clientAppTypes'],
    sortable: true,
    cell: (row) => CellTip(row['clientAppTypes']),
    exportSelector: 'clientAppTypes',
  },
  {
    name: 'Include Platforms',
    selector: (row) => row['includePlatforms'],
    sortable: true,
    cell: (row) => CellTip(row['includePlatforms']),
    exportSelector: 'includePlatforms',
  },
  {
    name: 'Exclude Platforms',
    selector: (row) => row['excludePlatforms'],
    sortable: true,
    cell: (row) => CellTip(row['excludePlatforms']),
    exportSelector: 'excludePlatforms',
  },
  {
    name: 'Include Locations',
    selector: (row) => row['includeLocations'],
    sortable: true,
    cell: (row) => CellTip(row['includeLocations']),
    exportSelector: 'includeLocations',
  },
  {
    name: 'Exclude Locations',
    selector: (row) => row['excludeLocations'],
    sortable: true,
    cell: (row) => CellTip(row['excludeLocations']),
    exportSelector: 'excludeLocations',
  },
  {
    name: 'Include Users',
    selector: (row) => row['includeUsers'],
    sortable: true,
    cell: (row) => CellTip(row['includeUsers']),
    exportSelector: 'includeUsers',
  },
  {
    name: 'Exclude Users',
    selector: (row) => row['excludeUsers'],
    sortable: true,
    cell: (row) => CellTip(row['excludeUsers']),
    exportSelector: 'excludeUsers',
  },
  {
    name: 'Include Groups',
    selector: (row) => row['includeGroups'],
    sortable: true,
    cell: (row) => CellTip(row['includeGroups']),
    exportSelector: 'includeGroups',
  },
  {
    name: 'Exclude Groups',
    selector: (row) => row['excludeGroups'],
    sortable: true,
    cell: (row) => CellTip(row['excludeGroups']),
    exportSelector: 'excludeGroups',
  },
  {
    name: 'Include Applications',
    selector: (row) => row['includeApplications'],
    sortable: true,
    cell: (row) => CellTip(row['includeApplications']),
    exportSelector: 'includeApplications',
  },
  {
    name: 'Exclude Applications',
    selector: (row) => row['excludeApplications'],
    sortable: true,
    cell: (row) => CellTip(row['excludeApplications']),
    exportSelector: 'excludeApplications',
  },
  {
    name: 'Control Operator',
    selector: (row) => row['grantControlsOperator'],
    sortable: true,
    cell: (row) => CellTip(row['grantControlsOperator']),
    exportSelector: 'grantControlsOperator',
  },
  {
    name: 'Built-in Controls',
    selector: (row) => row['builtInControls'],
    sortable: true,
    cell: (row) => CellTip(row['builtInControls']),
    exportSelector: 'builtInControls',
  },
  {
    name: 'rawjson',
    selector: (row) => row['rawjson'],
    omit: true,
  },
  {
    name: 'Actions',
    cell: Offcanvas,
  },
]

const ConditionalAccessList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Conditional Access"
      tenantSelector={false}
      datatable={{
        reportName: `${tenant?.defaultDomainName}-ConditionalAccess-List`,
        path: '/api/ListConditionalAccessPolicies',
        params: { TenantFilter: tenant?.defaultDomainName },
        columns,
      }}
    />
  )
}

export default ConditionalAccessList
