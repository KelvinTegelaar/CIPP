import React from 'react'
import { useSelector } from 'react-redux'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { Link } from 'react-router-dom'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components'

const dropdown = (row, rowIndex, formatExtraData) => {
  return (
    <CDropdown direction="dropstart" placement="left-start">
      <CDropdownToggle size="sm" color="link">
        <FontAwesomeIcon icon={faBars} />
      </CDropdownToggle>
      <CDropdownMenu data-coreui-boundary="div.body">
        <CDropdownItem component="span">
          <Link to={`/endpoint/MEM/EditMEMApplication`}>Edit Application</Link>
        </CDropdownItem>
        <CDropdownItem component="span">Assign to All Users</CDropdownItem>
        <CDropdownItem component="span">Assign to All Devices</CDropdownItem>
        <CDropdownItem component="span">Assign Globally (All Users / All Devices)</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
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
    cell: dropdown,
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
