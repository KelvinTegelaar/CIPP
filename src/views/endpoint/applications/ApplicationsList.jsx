import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components/layout'
import { faEllipsisV, faGlobeEurope, faPager, faUser } from '@fortawesome/free-solid-svg-icons'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { CellTip } from 'src/components/tables'
import { TitleButton } from 'src/components/buttons'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ocVisible, setOCVisible] = useState(false)
  return (
    <>
      {/* future version: add edit app <CButton size="sm" variant="ghost" color="warning" href={`/endpoint/MEM/EditMEMApplication`}>
        <FontAwesomeIcon icon={faEdit} />
      </CButton> */}
      {/* Future version: add delete app. <CButton size="sm" variant="ghost" color="danger">
        <FontAwesomeIcon icon={faTrash} href="" />
      </CButton> */}
      <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title="App information"
        extendedInfo={[
          { label: 'Install as', value: `${row.installExperience?.runAsAccount}` },
          { label: 'Restart behaviour', value: `${row.installExperience?.deviceRestartBehavior}` },
          { label: 'Assigned to groups', value: `${row.isAssigned}` },
          { label: 'Created at', value: `${row.createdDateTime}` },
          { label: 'Modified at', value: `${row.lastModifiedDateTime}` },
          { label: 'Featured App', value: `${row.isFeatured}` },
          { label: 'Publishing State', value: `${row.publishingState}` },
          { label: '# of Dependent Apps', value: `${row.dependentAppCount}` },
          {
            label: 'Detection Type',
            value: row.rules ? row.rules[0].ruleType : 'No detection rule',
          },
          {
            label: 'Detection File/Folder Name',
            value: row.rules ? row.rules[0].fileOrFolderName : 'No detection rule',
          },
          {
            label: 'Detection File/Folder Path',
            value: row.rules ? row.rules[0].path : 'No detection rule',
          },
        ]}
        actions={[
          {
            icon: <FontAwesomeIcon icon={faUser} />,
            label: ' Assign to All Users',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecAssignApp?AssignTo=AllUsers&TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
            modalMessage: `Are you sure you want to assign ${row.displayName} to all users?`,
          },
          {
            icon: <FontAwesomeIcon icon={faPager} />,
            label: ' Assign to All Devices',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecAssignApp?AssignTo=AllDevices&TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
            modalMessage: `Are you sure you want to assign ${row.displayName} to all devices?`,
          },
          {
            icon: <FontAwesomeIcon icon={faGlobeEurope} />,
            label: ' Assign Globally (All Users / All Devices)',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecAssignApp?AssignTo=Both&TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
            modalMessage: `Are you sure you want to assign ${row.displayName} to all users and devices?`,
          },
          {
            label: 'Delete Application',
            color: 'danger',
            modal: true,
            modalUrl: `/api/RemoveApp?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
            modalMessage: 'Are you sure you want to delete this policy?',
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
    selector: (row) => row.displayName,
    name: 'Name',
    sortable: true,
    cell: (row) => CellTip(row.displayName),
    exportSelector: 'displayName',
    minWidth: '350px',
  },
  {
    selector: (row) => row.publishingState,
    name: 'Published',
    sortable: true,
    exportSelector: 'publishingState',
  },
  {
    selector: (row) => row.installCommandLine,
    name: 'Install Command',
    sortable: true,
    cell: (row) => CellTip(row.installCommandLine),
    exportSelector: 'installCommandLine',
  },
  {
    selector: (row) => row.uninstallCommandLine,
    name: 'Uninstall Command',
    sortable: true,
    cell: (row) => CellTip(row.uninstallCommandLine),
    exportSelector: 'uninstallCommandLine',
  },
  {
    name: 'Actions',
    cell: Offcanvas,
    button: true,
  },
]

const ApplicationsList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  const titleButtons = (
    <div style={{ display: 'flex', alignItems: 'right' }}>
      <div style={{ marginLeft: '10px' }}>
        <TitleButton
          href={`/endpoint/applications/add-choco-app?customerId=${tenant?.customerId}&tableFilter=${tenant?.defaultDomainName}`}
          title="Add Choco app"
        />
      </div>
      <div style={{ marginLeft: '10px' }}>
        <TitleButton
          href={`/endpoint/applications/add-winget-app?customerId=${tenant?.customerId}&tableFilter=${tenant?.defaultDomainName}`}
          title="Add Store app"
        />
      </div>
      <div style={{ marginLeft: '10px' }}>
        <TitleButton
          href={`/endpoint/applications/add-office-app?customerId=${tenant?.customerId}&tableFilter=${tenant?.defaultDomainName}`}
          title="Add Office app"
        />
      </div>
      <div style={{ marginLeft: '10px' }}>
        <TitleButton
          href={`/endpoint/applications/add-rmm-app?customerId=${tenant?.customerId}&tableFilter=${tenant?.defaultDomainName}`}
          title="Add MSP app"
        />
      </div>
    </div>
  )

  return (
    <CippPageList
      title="Applications"
      titleButton={titleButtons}
      datatable={{
        keyField: 'id',
        columns,
        reportName: `${tenant?.defaultDomainName}-Applications-List`,
        path: '/api/ListApps',
        params: { TenantFilter: tenant?.defaultDomainName },
        tableProps: {
          selectableRows: true,
          actionsList: [
            {
              icon: <FontAwesomeIcon icon={faUser} />,
              label: ' Assign to All Users',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecAssignApp?AssignTo=AllUsers&TenantFilter=${tenant.defaultDomainName}&ID=!id`,
              modalMessage: `Are you sure you want to assign these apps to all users?`,
            },
            {
              icon: <FontAwesomeIcon icon={faPager} />,
              label: ' Assign to All Devices',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecAssignApp?AssignTo=AllDevices&TenantFilter=${tenant.defaultDomainName}&ID=!id`,
              modalMessage: `Are you sure you want to assign these apps to all devices?`,
            },
            {
              icon: <FontAwesomeIcon icon={faGlobeEurope} />,
              label: ' Assign Globally (All Users / All Devices)',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecAssignApp?AssignTo=Both&TenantFilter=${tenant.defaultDomainName}&ID=!id`,
              modalMessage: `Are you sure you want to assign these apps to all users and devices?`,
            },
            {
              label: 'Delete Application',
              color: 'danger',
              modal: true,
              modalUrl: `/api/RemoveApp?TenantFilter=${tenant.defaultDomainName}&ID=!id`,
              modalMessage: 'Are you sure you want to delete this policy?',
            },
          ],
        },
      }}
    />
  )
}

export default ApplicationsList
