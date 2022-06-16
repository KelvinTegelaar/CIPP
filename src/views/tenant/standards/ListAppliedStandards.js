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
        Run Standards Now
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
      selector: (row) => row.standards['DisableBasicAuth'],
      sortable: true,
      exportSelector: 'standardName',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Modern Authentication',
      selector: (row) => row.standards['ModernAuth'],
      sortable: true,
      exportSelector: 'ModernAuth',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Audit Log',
      selector: (row) => row.standards['AuditLog'],
      sortable: true,
      exportSelector: 'AuditLog',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'No Password Expiration',
      selector: (row) => row.standards['PasswordExpireDisabled'],
      sortable: true,
      exportSelector: 'PasswordExpireDisabled',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Disable Anonymous Reports',
      selector: (row) => row.standards['AnonReportDisable'],
      sortable: true,
      exportSelector: 'AnonReportDisable',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Delegate Sent Items',
      selector: (row) => row.standards['DelegateSentItems'],
      sortable: true,
      exportSelector: 'DelegateSentItems',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Oauth Consent',
      selector: (row) => row.standards['OauthConsent'],
      sortable: true,
      exportSelector: 'OauthConsent',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'SSPR',
      selector: (row) => row.standards['SSPR'],
      sortable: true,
      exportSelector: 'SSPR',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Legacy MFA',
      selector: (row) => row.standards['LegacyMFA'],
      sortable: true,
      exportSelector: 'LegacyMFA',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Spoof Warnings',
      selector: (row) => row.standards['SpoofWarn'],
      sortable: true,
      exportSelector: 'SpoofWarn',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'DisableSelfServiceLicenses',
      selector: (row) => row.standards['DisableSelfServiceLicenses'],
      sortable: true,
      exportSelector: 'DisableSelfServiceLicenses',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Security Defaults',
      selector: (row) => row.standards['SecurityDefaults'],
      sortable: true,
      exportSelector: 'SecurityDefaults',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Disable Shared Mailbox',
      selector: (row) => row.standards['DisableSharedMailbox'],
      sortable: true,
      exportSelector: 'DisableSharedMailbox',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'SendFromAlias',
      selector: (row) => row.standards['SendFromAlias'],
      sortable: true,
      exportSelector: 'SendFromAlias',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'unmanagedSync',
      selector: (row) => row.standards['unmanagedSync'],
      sortable: true,
      exportSelector: 'unmanagedSync',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'DisableViva',
      selector: (row) => row.standards['DisableViva'],
      sortable: true,
      exportSelector: 'DisableViva',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'DeletedUserRentention',
      selector: (row) => row.standards['DeletedUserRentention'],
      sortable: true,
      exportSelector: 'DeletedUserRentention',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'AzurePortal',
      selector: (row) => row.standards['AzurePortal'],
      sortable: true,
      exportSelector: 'AzurePortal',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'DisableUserSiteCreate',
      selector: (row) => row.standards['DisableUserSiteCreate'],
      sortable: true,
      exportSelector: 'DisableUserSiteCreate',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'sharingCapability',
      selector: (row) => !!row.standards['sharingCapability'],
      sortable: true,
      exportSelector: 'sharingCapability',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'DisableReshare',
      selector: (row) => row.standards['DisableReshare'],
      sortable: true,
      exportSelector: 'DisableReshare',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'TAP',
      selector: (row) => row.standards['TAP'],
      sortable: true,
      exportSelector: 'TAP',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'PWnumberMatchingRequiredState',
      selector: (row) => row.standards['PWnumberMatchingRequiredState'],
      sortable: true,
      exportSelector: 'PWnumberMatchingRequiredState',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'disableMacSync',
      selector: (row) => row.standards['disableMacSync'],
      sortable: true,
      exportSelector: 'disableMacSync',
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
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
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
