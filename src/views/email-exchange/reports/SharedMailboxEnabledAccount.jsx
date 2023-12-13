import React from 'react'
import { CButton } from '@coreui/react'
import { faBan } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { CellTip, cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ModalService } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'

const DisableSharedMailbox = (userId) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [genericGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const handleModal = (modalMessage, modalUrl) => {
    ModalService.confirm({
      body: (
        <div style={{ overflow: 'visible' }}>
          <div>{modalMessage}</div>
        </div>
      ),
      title: 'Confirm',
      onConfirm: () => genericGetRequest({ path: modalUrl }),
    })
  }

  return (
    <>
      <CButton
        color="danger"
        variant="ghost"
        onClick={() => {
          ModalService.confirm(
            handleModal(
              'Are you sure you want to block this user from signing in?',
              `/api/ExecDisableUser?TenantFilter=${tenant?.defaultDomainName}&ID=${userId}`,
            ),
          )
        }}
      >
        <FontAwesomeIcon icon={faBan} />
      </CButton>
    </>
  )
}

const columns = [
  {
    selector: (row) => row['UserPrincipalName'],
    name: 'User Prinicipal Name',
    sortable: true,
    cell: (row) => CellTip(row['UserPrincipalName']),
    exportSelector: 'UserPrincipalName',
    minWidth: '200px',
  },
  {
    selector: (row) => row['displayName'],
    name: 'Display Name',
    sortable: true,
    cell: (row) => CellTip(row['displayName']),
    exportSelector: 'displayName',
    minWidth: '200px',
  },
  {
    selector: (row) => row['givenName'],
    name: 'First Name',
    sortable: true,
    cell: (row) => CellTip(row['givenName']),
    exportSelector: 'givenName',
    minWidth: '200px',
  },
  {
    selector: (row) => row['surname'],
    name: 'Surname',
    sortable: true,
    cell: (row) => CellTip(row['surname']),
    exportSelector: 'surname',
    minWidth: '200px',
  },
  {
    selector: (row) => row['accountEnabled'],
    name: 'Account Enabled',
    sortable: true,
    cell: (row) => CellTip(row['accountEnabled']),
    exportSelector: 'accountEnabled',
  },
  {
    name: 'Block sign-in',
    cell: (row) => DisableSharedMailbox(row['id']),
    minWidth: '100px',
  },
]

const SharedMailboxEnabledAccount = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Shared Mailbox with Enabled Account"
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-SharedMailboxEnabledAccount-List`,
        path: '/api/ListSharedMailboxAccountEnabled',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default SharedMailboxEnabledAccount
