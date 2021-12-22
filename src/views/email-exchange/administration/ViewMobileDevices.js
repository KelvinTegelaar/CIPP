import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { cellBooleanFormatter } from '../../../components/cipp'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faCog, faBars } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'

const dropdown = (row, rowIndex, formatExtraData) => (
  <CDropdown style={{ position: 'fixed', zIndex: 1000 }}>
    <CDropdownToggle size="sm" color="link">
      <FontAwesomeIcon icon={faBars} />
    </CDropdownToggle>
    <CDropdownMenu>
      <CDropdownItem href="#">
        <Link className="dropdown-item" to={`/email/administration/edit-contact`}>
          <FontAwesomeIcon icon={faUser} className="me-2" />
          Edit Contact
        </Link>
      </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
)

//TODO: Add CellBoolean
const columns = [
  {
    selector: (row) => row['displayName'],
    name: 'Display Name',
    sortable: true,
  },
  {
    selector: (row) => row['mail'],
    name: 'E-Mail Address',
    sortable: true,
  },
  {
    selector: (row) => row['company'],
    name: 'Company',
    sortable: true,
  },
  {
    selector: (row) => row['onPremisesSyncEnabled'],
    name: 'On Premises Sync',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    name: 'Actions',
    cell: dropdown,
  },
]

const MobileDeviceList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Mobile Devices</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        <CippDatatable
          keyField="id"
          reportName={`${tenant?.defaultDomainName} Mailbox list`}
          path="/api/ListMailboxMobileDevices"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default MobileDeviceList
