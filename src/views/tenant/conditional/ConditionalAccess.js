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
    exportSelector: 'displayName',
  },
  {
    name: 'State',
    selector: (row) => row['state'],
    sortable: true,
    exportSelector: 'state',
  },
  {
    name: 'Last Modified',
    selector: (row) => row['modifiedDateTime'],
    sortable: true,
    exportSelector: 'modifiedDateTime',
  },
  {
    name: 'Client App Types',
    selector: (row) => row['clientAppTypes'],
    sortable: true,
    exportSelector: 'clientAppTypes',
  },
  {
    name: 'Platform Inc',
    selector: (row) => row['includePlatforms'],
    sortable: true,
    exportSelector: 'includePlatforms',
  },
  {
    name: 'Platform Exc',
    selector: (row) => row['excludePlatforms'],
    sortable: true,
    exportSelector: 'excludePlatforms',
  },
  {
    name: 'Include Locations',
    selector: (row) => row['includeLocations'],
    sortable: true,
    exportSelector: 'includeLocations',
  },
  {
    name: 'Exclude Locations',
    selector: (row) => row['excludeLocations'],
    sortable: true,
    exportSelector: 'excludeLocations',
  },
  {
    name: 'Include Users',
    selector: (row) => row['includeUsers'],
    sortable: true,
    exportSelector: 'includeUsers',
  },
  {
    name: 'Exclude Users',
    selector: (row) => row['excludeUsers'],
    sortable: true,
    exportSelector: 'excludeUsers',
  },
  {
    name: 'Include Groups',
    selector: (row) => row['includeGroups'],
    sortable: true,
    exportSelector: 'includeGroups',
  },
  {
    name: 'Exclude Groups',
    selector: (row) => row['excludeGroups'],
    sortable: true,
    exportSelector: 'excludeGroups',
  },
  {
    name: 'Include Applications',
    selector: (row) => row['includeApplications'],
    sortable: true,
    exportSelector: 'includeApplications',
  },
  {
    name: 'Exclude Applications',
    selector: (row) => row['excludeApplications'],
    sortable: true,
    exportSelector: 'excludeApplications',
  },
  {
    name: 'Control Operator',
    selector: (row) => row['grantControlsOperator'],
    sortable: true,
    exportSelector: 'grantControlsOperator',
  },
  {
    name: 'Built-in Controls',
    selector: (row) => row['builtInControls'],
    sortable: true,
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
