import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { CippPageList } from 'src/components/layout'
import { CellTip, cellBooleanFormatter } from 'src/components/tables'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { TitleButton } from 'src/components/buttons'
import { CippActionsOffcanvas } from 'src/components/utilities'
const Actions = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ocVisible, setOCVisible] = useState(false)
  return (
    <>
      <CButton size="sm" variant="ghost" color="warning">
        <a
          target={'_blank'}
          href={`https://outlook.office365.com/ecp/@${tenant.defaultDomainName}/UsersGroups/EditContact.aspx?exsvurl=1&realm=${tenant.customerId}&mkt=en-US&id=${row.id}`}
        ></a>
        <FontAwesomeIcon icon={faEdit} />
      </CButton>
      <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title="Contact Information"
        extendedInfo={[
          {
            label: 'Display Name',
            value: row.displayName,
          },
          {
            label: 'e-mail address',
            value: row.mail,
          },
        ]}
        actions={[
          {
            label: 'Remove Contact',
            color: 'danger',
            modal: true,
            modalUrl: `/api/RemoveContact?TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}`,
            modalMessage: 'Are you sure you want to delete this contact?',
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
//TODO: Add CellBoolean
const columns = [
  {
    selector: (row) => row['displayName'],
    name: 'Display Name',
    sortable: true,
    cell: (row) => CellTip(row['displayName']),
    exportSelector: 'displayName',
  },
  {
    selector: (row) => row['mail'],
    name: 'E-Mail Address',
    sortable: true,
    cell: (row) => CellTip(row['mail']),
    exportSelector: 'mail',
  },
  {
    selector: (row) => row['companyName'],
    name: 'Company',
    sortable: true,
    cell: (row) => CellTip(row['companyName']),
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
    cell: cellBooleanFormatter({ colourless: true }),
  },
  {
    name: 'Actions',
    cell: Actions,
    maxWidth: '80px',
  },
]

const ContactList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      capabilities={{ allTenants: false, helpContext: 'https://google.com' }}
      titleButton={<TitleButton href="/email/administration/add-contact" title="Add Contact" />}
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
