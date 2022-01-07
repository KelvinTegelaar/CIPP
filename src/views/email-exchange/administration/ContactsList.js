import React from 'react'
import { useSelector } from 'react-redux'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { cellBooleanFormatter } from '../../../components/cipp'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faBars } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { CippPageList } from 'src/components'

const dropdown = (row, rowIndex, formatExtraData) => (
  <CDropdown direction="dropstart" placement="left-start">
    <CDropdownToggle size="sm" color="link">
      <FontAwesomeIcon icon={faBars} />
    </CDropdownToggle>
    <CDropdownMenu>
      <CDropdownItem href="#">
        <Link className="dropdown-item" to={`/email/administration/edit-contact`}>
          <FontAwesomeIcon icon={faUser} fixedWidth className="me-2" />
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

const ContactList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Contacts"
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-Contacts-List`,
        path: '/api/ListContacts',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default ContactList
