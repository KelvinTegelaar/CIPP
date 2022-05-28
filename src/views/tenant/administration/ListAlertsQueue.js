import React from 'react'
import { useSelector } from 'react-redux'
import { CSpinner, CButton, CCallout } from '@coreui/react'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components/layout'
import { ModalService } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { cellBooleanFormatter } from 'src/components/tables'

const ListAlertsQueue = () => {
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const Actions = (row, index, column) => {
    const handleDeleteStandard = (apiurl, message) => {
      ModalService.confirm({
        title: 'Confirm',
        body: <div>{message}</div>,
        onConfirm: () => ExecuteGetRequest({ path: apiurl }),
        confirmLabel: 'Continue',
        cancelLabel: 'Cancel',
      })
    }
    return (
      <CButton
        size="sm"
        variant="ghost"
        color="danger"
        onClick={() =>
          handleDeleteStandard(
            `api/RemoveQueuedAlert?ID=${row.tenantName}`,
            'Do you want to delete the queued alert?',
          )
        }
      >
        <FontAwesomeIcon icon={faTrash} href="" />
      </CButton>
    )
  }

  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row['tenantName'],
      sortable: true,
      exportSelector: 'tenantName',
    },
    {
      name: 'Changed Admin Passwords',
      selector: (row) => row['AdminPassword'],
      sortable: true,
      exportSelector: 'AdminPassword',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Defender Malware Alerts',
      selector: (row) => row['DefenderMalware'],
      sortable: true,
      exportSelector: 'DefenderMalware',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'MFA for Admins',
      selector: (row) => row['MFAAdmins'],
      sortable: true,
      exportSelector: 'MFAAdmins',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'MFA for Users',
      selector: (row) => row['MFAAlertUsers'],
      sortable: true,
      exportSelector: 'MFAAlertUsers',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Changes to Admin Roles',
      selector: (row) => row['NewRole'],
      sortable: true,
      exportSelector: 'NewRole',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Exchange Mailbox size',
      selector: (row) => row['QuotaUsed'],
      sortable: true,
      exportSelector: 'QuotaUsed',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Unused Licenses',
      selector: (row) => row['UnusedLicenses'],
      sortable: true,
      exportSelector: 'UnusedLicenses',
      cell: cellBooleanFormatter(),
    },

    {
      name: 'Actions',
      cell: Actions,
    },
  ]
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      {getResults.isFetching && (
        <CCallout color="info">
          <CSpinner>Loading</CSpinner>
        </CCallout>
      )}
      {getResults.isSuccess && <CCallout color="info">{getResults.data?.Results}</CCallout>}
      {getResults.isError && (
        <CCallout color="danger">Could not connect to API: {getResults.error.message}</CCallout>
      )}
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="Scheduled Alerts"
        tenantSelector={false}
        datatable={{
          keyField: 'id',
          columns,
          reportName: `AlertsQueue-List`,
          path: '/api/ListAlertsQueue',
          params: { TenantFilter: tenant?.defaultDomainName },
        }}
      />
    </div>
  )
}

export default ListAlertsQueue
