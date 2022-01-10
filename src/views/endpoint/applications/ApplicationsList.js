import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components'
import { faEllipsisV, faGlobeEurope, faPager, faUser } from '@fortawesome/free-solid-svg-icons'
import { CippActionsOffcanvas } from 'src/components/cipp'

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
        title="User information"
        extendedInfo={[
          { label: 'Install as', value: `${row.installExperience.runAsAccount}` },
          { label: 'Restart behaviour', value: `${row.installExperience.deviceRestartBehavior}` },
          { label: 'Assigned to groups', value: `${row.isAssigned}` },
          { label: 'Created at', value: `${row.createdDateTime}` },
          { label: 'Modified at', value: `${row.lastModifiedDateTime}` },
        ]}
        actions={[
          {
            icon: <FontAwesomeIcon icon={faUser} />,
            label: ' Assign to All Users',
            link: `/identity/administration/users/view?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}`,
            color: 'primary',
          },
          {
            icon: <FontAwesomeIcon icon={faPager} />,
            label: ' Assign to All Devices',
            link: `/identity/administration/users/edit?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}`,
            color: 'primary',
          },
          {
            icon: <FontAwesomeIcon icon={faGlobeEurope} />,
            label: ' Assign Globally (All Users / All Devices)',
            link: `/identity/administration/users/bec?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}`,
            color: 'primary',
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
  },
  {
    selector: (row) => row.publishingState,
    name: 'Published',
    sortable: true,
  },
  {
    selector: (row) => row.installCommandLine,
    name: 'Install Command',
    sortable: true,
  },
  {
    selector: (row) => row.uninstallCommandLine,
    name: 'Uninstall Command',
    sortable: true,
  },
  {
    name: 'Action',
    cell: Offcanvas,
    button: true,
  },
]

const ApplicationsList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Applications"
      datatable={{
        keyField: 'id',
        columns,
        reportName: `${tenant?.defaultDomainName}-Applications-List`,
        path: '/api/ListApps',
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default ApplicationsList
