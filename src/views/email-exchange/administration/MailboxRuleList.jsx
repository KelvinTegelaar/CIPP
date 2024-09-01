import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CButton } from '@coreui/react'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { ModalService } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'

const DeleteMailboxRuleButton = (ruleId, userPrincipalName, ruleName) => {
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
    <CButton
      color="danger"
      variant="ghost"
      onClick={() => {
        ModalService.confirm(
          handleModal(
            'Are you sure you want to remove this mailbox rule?',
            `/api/ExecRemoveMailboxRule?TenantFilter=${tenant?.defaultDomainName}&ruleId=${ruleId}&ruleName=${ruleName}&userPrincipalName=${userPrincipalName}`,
          ),
        )
      }}
    >
      <FontAwesomeIcon icon={faTrash} />
    </CButton>
  )
}

const MailboxRuleList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  const columns = [
    {
      selector: (row) => row?.Tenant,
      name: 'Tenant',
      sortable: true,
      exportSelector: 'Tenant',
      maxWidth: '150px',
      cell: cellGenericFormatter(),
    },
    {
      selector: (row) => row?.UserPrincipalName,
      name: 'User Principal Name',
      sortable: true,
      exportSelector: 'UserPrincipalName',
      maxWidth: '200px',
      cell: cellGenericFormatter(),
    },
    {
      selector: (row) => row?.Enabled,
      name: 'Enabled',
      sortable: true,
      cell: cellGenericFormatter(),
      exportSelector: 'Enabled',
      maxWidth: '50px',
    },
    {
      selector: (row) => row?.Name,
      name: 'Display Name',
      sortable: true,
      cell: cellGenericFormatter(),
      maxWidth: '200px',
      exportSelector: 'Name',
    },
    {
      selector: (row) => row?.Description,
      name: 'Description',
      sortable: true,
      cell: cellGenericFormatter(),
      exportSelector: 'Description',
    },
    {
      selector: (row) => row?.MailboxOwnerId,
      name: 'Mailbox',
      sortable: true,
      exportSelector: 'MailboxOwnerId',
      maxWidth: '150px',
      cell: cellGenericFormatter(),
    },
    {
      selector: (row) => row?.ForwardTo,
      name: 'Forwards To',
      sortable: true,
      exportSelector: 'ForwardTo',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Action',
      maxWidth: '100px',
      cell: (row) =>
        DeleteMailboxRuleButton(row['Identity'], row['UserPrincipalName'], row['Name']),
    },
  ]

  return (
    // TODO: Add support for displaying the result of the delete operation. Currently, the delete operation is performed but the result is not displayed anywhere but the networking tab of the dev tools in the browser.
    // All API code is in place and should return the needed HTTP status information. -Bobby
    <CippPageList
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      title="Mailbox Rules"
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-Mailbox-List`,
        path: '/api/ListMailboxRules',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default MailboxRuleList
