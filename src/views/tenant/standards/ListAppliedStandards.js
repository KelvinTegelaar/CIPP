import React from 'react'
import { useSelector } from 'react-redux'
import { CSpinner, CButton, CCallout } from '@coreui/react'
import { faCheck, faExclamationTriangle, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components/layout'
import { ModalService } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { cellBooleanFormatter } from 'src/components/tables'

const RefreshAction = () => {
  const [execStandards, execStandardsResults] = useLazyGenericGetRequestQuery()

  const showModal = () =>
    ModalService.confirm({
      body: (
        <div>
          Are you sure you want to run the standards now? <br />
          <i>Please note: this runs every three hours automatically.</i>
        </div>
      ),
      onConfirm: () => execStandards({ path: 'api/Standards_OrchestrationStarter' }),
    })

  return (
    <>
      {execStandardsResults.data?.Results ===
        'Already running. Please wait for the current instance to finish' && (
        <div> {execStandardsResults.data?.Results}</div>
      )}
      <CButton onClick={showModal} size="sm" className="m-1">
        {execStandardsResults.isLoading && <CSpinner size="sm" />}
        {execStandardsResults.error && (
          <FontAwesomeIcon icon={faExclamationTriangle} className="pe-1" />
        )}
        {execStandardsResults.isSuccess && <FontAwesomeIcon icon={faCheck} className="pe-1" />}
        Force Refresh All Data
      </CButton>
    </>
  )
}
const TenantsList = () => {
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
            `api/RemoveStandard?ID=${row.displayName}`,
            'Do you want to delete the standard?',
          )
        }
      >
        <FontAwesomeIcon icon={faTrash} href="" />
      </CButton>
    )
  }
  const columns = [
    {
      name: 'Tenant Default Domain',
      selector: (row) => row['displayName'],
      sortable: true,
      exportSelector: 'displayName',
    },
    {
      name: 'Disable Basic Authentication',
      selector: (row) => row['DisableBasicAuth'],
      sortable: true,
      exportSelector: 'standardName',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Modern Authentication',
      selector: (row) => row['ModernAuth'],
      sortable: true,
      exportSelector: 'ModernAuth',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Audit Log',
      selector: (row) => row['AuditLog'],
      sortable: true,
      exportSelector: 'AuditLog',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'No Password Expiration',
      selector: (row) => row['PasswordExpireDisabled'],
      sortable: true,
      exportSelector: 'PasswordExpireDisabled',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Disable Anonymous Reports',
      selector: (row) => row['AnonReportDisable'],
      sortable: true,
      exportSelector: 'AnonReportDisable',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Delegate Sent Items',
      selector: (row) => row['DelegateSentItems'],
      sortable: true,
      exportSelector: 'DelegateSentItems',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Oauth Consent',
      selector: (row) => row['OauthConsent'],
      sortable: true,
      exportSelector: 'OauthConsent',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'SSPR',
      selector: (row) => row['SSPR'],
      sortable: true,
      exportSelector: 'SSPR',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Legacy MFA',
      selector: (row) => row['LegacyMFA'],
      sortable: true,
      exportSelector: 'LegacyMFA',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Spoof Warnings',
      selector: (row) => row['SpoofWarn'],
      sortable: true,
      exportSelector: 'SpoofWarn',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'DisableSelfServiceLicenses',
      selector: (row) => row['DisableSelfServiceLicenses'],
      sortable: true,
      exportSelector: 'DisableSelfServiceLicenses',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Security Defaults',
      selector: (row) => row['SecurityDefaults'],
      sortable: true,
      exportSelector: 'SecurityDefaults',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Disable Shared Mailbox',
      selector: (row) => row['DisableSharedMailbox'],
      sortable: true,
      exportSelector: 'DisableSharedMailbox',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'AutoExpandArchive',
      selector: (row) => row['AutoExpandArchive'],
      sortable: true,
      exportSelector: 'AutoExpandArchive',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Applied By',
      selector: (row) => row['appliedBy'],
      sortable: true,
      exportSelector: 'appliedBy',
    },
    {
      name: 'Applied at',
      selector: (row) => row['appliedAt'],
      sortable: true,
      exportSelector: 'appliedAt',
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
        title="Applied Standards"
        tenantSelector={false}
        datatable={{
          tableProps: {
            actions: [<RefreshAction key="refresh-action-button" />],
          },
          keyField: 'id',
          columns,
          reportName: `AppliedStandards-List`,
          path: '/api/ListStandards',
          params: { TenantFilter: tenant?.defaultDomainName },
        }}
      />
    </div>
  )
}

export default TenantsList
