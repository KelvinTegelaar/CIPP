import React from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { CippPageList } from 'src/components/layout'
import { cellBooleanFormatter } from 'src/components/tables'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
const Actions = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <a
      href={`https://outlook.office365.com/ecp/@${tenant.defaultDomainName}/UsersGroups/EditContact.aspx?exsvurl=1&realm=${tenant.customerId}&mkt=en-US&id=${row.id}`}
    >
      <CButton size="sm" variant="ghost" color="warning">
        <FontAwesomeIcon icon={faEdit} />
      </CButton>
    </a>
  )
}
//TODO: Add CellBoolean
const columns = [
  {
    selector: (row) => row['displayName'],
    name: 'Display Name',
    sortable: true,
    exportSelector: 'displayName',
  },
  {
    selector: (row) => row['mail'],
    name: 'E-Mail Address',
    sortable: true,
    exportSelector: 'mail',
  },
  {
    selector: (row) => row['company'],
    name: 'Company',
    sortable: true,
    exportSelector: 'company',
  },
  {
    selector: (row) => row['id'],
    name: 'id',
    omit: true,
  },
  {
    selector: (row) => row['onPremisesSyncEnabled'],
    name: 'On Premises Sync',
    sortable: true,
    exportSelector: 'onPremisesSyncEnabled',
    cell: cellBooleanFormatter(),
  },
  {
    name: 'Actions',
    cell: Actions,
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
