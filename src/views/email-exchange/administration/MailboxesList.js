import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faCog, faBars } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'

const dropdown = (row, rowIndex, formatExtraData) => (
  <CDropdown direction="dropstart" placement="left-start">
    <CDropdownToggle size="sm" color="link">
      <FontAwesomeIcon icon={faBars} />
    </CDropdownToggle>
    <CDropdownMenu direction="left">
      <CDropdownItem href="#">
        <Link
          className="dropdown-item"
          to={`/identity/administration/users/view?userId=${row.id}&tenantDomain=${row.primDomain}`}
        >
          <FontAwesomeIcon icon={faUser} className="me-2" />
          View User
        </Link>
      </CDropdownItem>
      <CDropdownItem href="#">
        <Link className="dropdown-item" to={`/email/administration/edit-mailbox-permissions`}>
          <FontAwesomeIcon icon={faCog} className="me-2" />
          Edit Mailbox Permissions
        </Link>
      </CDropdownItem>
      <CDropdownItem href="#">
        <Link className="dropdown-item" to={`/email/administration/view-mobile-devices`}>
          <FontAwesomeIcon icon={faCog} className="me-2" />
          View Mobile Devices
        </Link>
      </CDropdownItem>
      <CDropdownItem href="#">Convert To Shared Mailbox</CDropdownItem>
      <CDropdownItem href="#">Convert To User Mailbox</CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
)

//TODO: Add CellBoolean
const columns = [
  {
    selector: (row) => row['UPN'],
    name: 'User Prinicipal Name',
    sortable: true,
  },
  {
    selector: (row) => row['displayName'],
    name: 'Display Name',
    sortable: true,
  },
  {
    selector: (row) => row['primarySmtpAddress'],
    name: 'Primary E-mail Address',
    sortable: true,
  },
  {
    selector: (row) => row['recipientType'],
    name: 'Recipient Type',
    sortable: true,
  },
  {
    selector: (row) => row['recipientTypeDetails'],
    name: 'Recipient Type Details',
    sortable: true,
  },
  {
    name: 'Additional Email Addresses',
    selector: (row) => 'Click to Expand',
    sortable: true,
  },
  {
    name: 'Actions',
    cell: dropdown,
  },
]

const MailboxList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  // eslint-disable-next-line react/prop-types
  const ExpandedComponent = ({ data }) => (
    // eslint-disable-next-line react/prop-types
    <pre>{JSON.stringify(data.AdditionalEmailAddresses, null, 2)}</pre>
  )

  return (
    <CippPageList
      title="Mailboxes"
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-Mailbox-List`,
        path: '/api/ListMailboxes',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName },
        tableProps: {
          expandableRows: true,
          expandableRowsComponent: ExpandedComponent,
          expandOnRowClicked: true,
        },
      }}
    />
  )
}

export default MailboxList
