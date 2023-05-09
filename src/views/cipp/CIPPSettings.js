import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CButtonGroup,
  CCallout,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CFormLabel,
  CNav,
  CNavItem,
  CRow,
  CTabContent,
  CTabPane,
  CForm,
  CListGroup,
  CListGroupItem,
  CLink,
  CSpinner,
} from '@coreui/react'
import {
  useGenericGetRequestQuery,
  useLazyExecClearCacheQuery,
  useLazyExecNotificationConfigQuery,
  useLazyExecPermissionsAccessCheckQuery,
  useLazyExecTenantsAccessCheckQuery,
  useLazyGenericGetRequestQuery,
  useLazyGenericPostRequestQuery,
  useLazyListNotificationConfigQuery,
  useLoadVersionsQuery,
} from 'src/store/api/app'
import {
  useExecAddExcludeTenantMutation,
  useExecRemoveExcludeTenantMutation,
} from 'src/store/api/tenants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faCircleNotch,
  faExclamationTriangle,
  faEye,
  faEyeSlash,
  faLink,
  faRecycle,
  faScroll,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { useListTenantsQuery } from 'src/store/api/tenants'
import { useLazyEditDnsConfigQuery, useLazyGetDnsConfigQuery } from 'src/store/api/domains'
import { useDispatch, useSelector } from 'react-redux'
import {
  CellBadge,
  cellBooleanFormatter,
  CellTip,
  CellTipIcon,
  CippTable,
} from 'src/components/tables'
import { CippPage, CippPageList } from 'src/components/layout'
import {
  RFFCFormSwitch,
  RFFCFormInput,
  RFFCFormSelect,
  RFFSelectSearch,
} from 'src/components/forms'
import { Form } from 'react-final-form'
import useConfirmModal from 'src/hooks/useConfirmModal'
import { setCurrentTenant } from 'src/store/features/app'
import {
  CippCodeBlock,
  ModalService,
  StatusIcon,
  TenantSelectorMultiple,
} from 'src/components/utilities'
import CippListOffcanvas from 'src/components/utilities/CippListOffcanvas'
import { TitleButton } from 'src/components/buttons'
import Skeleton from 'react-loading-skeleton'
import { Buffer } from 'buffer'

const CIPPSettings = () => {
  const [active, setActive] = useState(1)
  return (
    <CippPage title="Settings" tenantSelector={false}>
      <CNav variant="tabs" role="tablist">
        <CNavItem active={active === 1} onClick={() => setActive(1)} href="#">
          General
        </CNavItem>
        <CNavItem active={active === 2} onClick={() => setActive(2)} href="#">
          Tenants
        </CNavItem>
        <CNavItem active={active === 3} onClick={() => setActive(3)} href="#">
          Backend
        </CNavItem>
        <CNavItem active={active === 4} onClick={() => setActive(4)} href="#">
          Notifications
        </CNavItem>
        <CNavItem active={active === 5} onClick={() => setActive(5)} href="#">
          Licenses
        </CNavItem>
        <CNavItem active={active === 6} onClick={() => setActive(6)} href="#">
          Maintenance
        </CNavItem>
      </CNav>
      <CTabContent>
        <CTabPane visible={active === 1} className="mt-3">
          <GeneralSettings />
        </CTabPane>
        <CTabPane visible={active === 2} className="mt-3">
          <ExcludedTenantsSettings />
        </CTabPane>
        <CTabPane visible={active === 3} className="mt-3">
          <SecuritySettings />
        </CTabPane>
        <CTabPane visible={active === 4} className="mt-3">
          <NotificationsSettings />
        </CTabPane>
        <CTabPane visible={active === 5} className="mt-3">
          <LicenseSettings />
        </CTabPane>
        <CTabPane visible={active === 6} className="mt-3">
          <Maintenance />
        </CTabPane>
      </CTabContent>
    </CippPage>
  )
}

export default CIPPSettings

const checkAccessColumns = [
  {
    name: 'Tenant Domain',
    selector: (row) => row['TenantName'],
    grow: 0,
  },
  {
    name: 'Result',
    selector: (row) => row['Status'],
    grow: 1,
  },
]

const GeneralSettings = () => {
  const { data: versions, isSuccess: isSuccessVersion } = useLoadVersionsQuery()

  const { data: tenants = [] } = useListTenantsQuery({ AllTenantSelector: false })
  const [checkPermissions, permissionsResult] = useLazyExecPermissionsAccessCheckQuery()
  const [clearCache, clearCacheResult] = useLazyExecClearCacheQuery()
  const [checkAccess, accessCheckResult] = useLazyExecTenantsAccessCheckQuery()
  const [selectedTenants, setSelectedTenants] = useState([])
  const [showMaxSelected, setShowMaxSelected] = useState(false)
  const [tokenOffcanvasVisible, setTokenOffcanvasVisible] = useState(false)
  const [runBackup, RunBackupResult] = useLazyGenericGetRequestQuery()
  const [restoreBackup, restoreBackupResult] = useLazyGenericPostRequestQuery()

  const maxSelected = 2
  const tenantSelectorRef = useRef(null)

  const handleSetSelectedTenants = (value) => {
    if (value.length <= maxSelected) {
      setSelectedTenants(value)
      setShowMaxSelected(false)
    } else {
      setSelectedTenants(value)
      setShowMaxSelected(true)
    }
  }

  const handleCheckAccess = () => {
    const mapped = tenants.reduce(
      (current, { customerId, ...rest }) => ({
        ...current,
        [customerId]: { ...rest },
      }),
      {},
    )
    const AllTenantSelector = selectedTenants.map(
      (customerId) => mapped[customerId].defaultDomainName,
    )
    checkAccess({ tenantDomains: AllTenantSelector })
  }

  function getTokenOffcanvasProps({ tokenResults }) {
    let tokenDetails = tokenResults.AccessTokenDetails
    let helpLinks = tokenResults.Links
    let tokenOffcanvasGroups = []
    if (tokenDetails?.Name !== '') {
      let tokenItems = []
      let tokenOffcanvasGroup = {}
      tokenItems.push({
        heading: 'User',
        content: tokenDetails?.Name,
      })
      tokenItems.push({
        heading: 'UPN',
        content: tokenDetails?.UserPrincipalName,
      })
      tokenItems.push({
        heading: 'App Registration',
        content: (
          <CLink
            href={`https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/appId/${tokenDetails?.AppId}/isMSAApp/`}
            target="_blank"
          >
            {tokenDetails?.AppName}
          </CLink>
        ),
      })
      tokenItems.push({
        heading: 'IP Address',
        content: tokenDetails?.IPAddress,
      })
      tokenItems.push({
        heading: 'Auth Methods',
        content: tokenDetails?.AuthMethods.join(', '),
      })
      tokenItems.push({
        heading: 'Tenant ID',
        content: tokenDetails?.TenantId,
      })
      tokenOffcanvasGroup.items = tokenItems
      tokenOffcanvasGroup.title = 'Claims'
      tokenOffcanvasGroups.push(tokenOffcanvasGroup)
    }

    if (helpLinks.length > 0) {
      let linkItems = []
      let linkItemGroup = {}
      helpLinks.map((link, idx) =>
        linkItems.push({
          heading: '',
          content: (
            <CLink href={link.Href} target="_blank" key={idx}>
              {link.Text}
            </CLink>
          ),
        }),
      )
      linkItemGroup.title = 'Help Links'
      linkItemGroup.items = linkItems
      if (linkItemGroup.items.length > 0) {
        tokenOffcanvasGroups.push(linkItemGroup)
      }
    }

    return tokenOffcanvasGroups
  }

  const handleClearCache = useConfirmModal({
    body: <div>Are you sure you want to clear the cache?</div>,
    onConfirm: () => {
      clearCache({ tenantsOnly: false })
      localStorage.clear()
    },
  })

  const handleClearCacheTenant = useConfirmModal({
    body: <div>Are you sure you want to clear the cache?</div>,
    onConfirm: () => {
      clearCache({ tenantsOnly: true })
    },
  })

  const tableProps = {
    pagination: false,
    subheader: false,
  }
  const downloadTxtFile = (data) => {
    const txtdata = [JSON.stringify(RunBackupResult.data.backup)]
    const file = new Blob(txtdata, { type: 'text/plain' })
    const element = document.createElement('a')
    element.href = URL.createObjectURL(file)
    element.download = 'CIPP-Backup' + Date.now() + '.json'
    document.body.appendChild(element)
    element.click()
  }
  const inputRef = useRef(null)
  const handleChange = (e) => {
    const fileReader = new FileReader()
    fileReader.readAsText(e.target.files[0], 'UTF-8')
    fileReader.onload = (e) => {
      restoreBackup({ path: '/api/ExecRestoreBackup', values: e.target.result })
    }
  }
  return (
    <div>
      <CRow className="mb-3">
        <CCol>
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle>Frontend Version</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <StatusIcon
                type="negatedboolean"
                status={isSuccessVersion && versions.OutOfDateCIPP}
              />
              <div>Latest: {isSuccessVersion ? versions.RemoteCIPPVersion : <Skeleton />}</div>
              <div>Current: {isSuccessVersion ? versions.LocalCIPPVersion : <Skeleton />}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol>
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle>API Version</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <StatusIcon
                type="negatedboolean"
                status={isSuccessVersion && versions.OutOfDateCIPPAPI}
              />
              <div>Latest: {isSuccessVersion ? versions.RemoteCIPPAPIVersion : <Skeleton />}</div>
              <div>Current: {isSuccessVersion ? versions.LocalCIPPAPIVersion : <Skeleton />}</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow className="mb-3">
        <CCol>
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle>Permissions Check</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CRow>Click the button below to start a permissions check.</CRow>
              <CButton
                onClick={() => checkPermissions()}
                disabled={permissionsResult.isFetching}
                className="mt-3"
              >
                {permissionsResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Run Permissions Check
              </CButton>
              {permissionsResult.isSuccess && (
                <>
                  <CCallout
                    color={permissionsResult.data.Results?.Success === true ? 'success' : 'danger'}
                  >
                    {permissionsResult.data.Results?.Messages && (
                      <>
                        {permissionsResult.data.Results?.Messages?.map((m, idx) => (
                          <div key={idx}>{m}</div>
                        ))}
                      </>
                    )}
                    {permissionsResult.data.Results?.MissingPermissions.length > 0 && (
                      <>
                        Your Secure Application Model is missing the following permissions. See the
                        documentation on how to add permissions{' '}
                        <a
                          target="_blank"
                          href="https://cipp.app/docs/user/gettingstarted/permissions/#manual-sam-setup"
                        >
                          here
                        </a>
                        .
                        <CListGroup flush>
                          {permissionsResult.data.Results?.MissingPermissions?.map((r, index) => (
                            <CListGroupItem key={index}>{r}</CListGroupItem>
                          ))}
                        </CListGroup>
                      </>
                    )}
                  </CCallout>
                  {permissionsResult.data.Results?.AccessTokenDetails?.Name !== '' && (
                    <>
                      <CButton onClick={() => setTokenOffcanvasVisible(true)}>Details</CButton>
                      <CippListOffcanvas
                        title="Details"
                        placement="end"
                        visible={tokenOffcanvasVisible}
                        groups={getTokenOffcanvasProps({
                          tokenResults: permissionsResult.data.Results,
                        })}
                        hideFunction={() => setTokenOffcanvasVisible(false)}
                      />
                    </>
                  )}
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6}>
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle>Clear Cache</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CRow>
                Click the button below to clear the application cache. You can clear only the tenant
                cache, or all caches.
              </CRow>
              <CButton
                onClick={() => handleClearCache()}
                disabled={clearCacheResult.isFetching}
                className="me-3 mt-3"
              >
                {clearCacheResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Clear All Caches
              </CButton>
              <CButton
                onClick={() => handleClearCacheTenant()}
                disabled={clearCacheResult.isFetching}
                className="me-3 mt-3"
              >
                {clearCacheResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Clear Tenant Cache
              </CButton>
              {clearCacheResult.isSuccess && (
                <div className="mt-3">{clearCacheResult.data?.Results}</div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow className="mb-3">
        <CCol md={6}>
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle>Tenant Access Check</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol>
                  <div className="mb-3">
                    Click the button below to start a tenant access check. You can select multiple,
                    but a maximum of {maxSelected + 1} tenants is recommended.
                  </div>

                  <TenantSelectorMultiple
                    ref={tenantSelectorRef}
                    values={selectedTenants}
                    onChange={(value) =>
                      handleSetSelectedTenants(
                        value.map((val) => {
                          return val.value
                        }),
                      )
                    }
                  />
                  {showMaxSelected && (
                    <CCallout color="warning">
                      A maximum of {maxSelected + 1} tenants is recommended.
                    </CCallout>
                  )}
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol>
                  <CButton
                    onClick={() => handleCheckAccess()}
                    disabled={accessCheckResult.isFetching || selectedTenants.length < 1}
                  >
                    {accessCheckResult.isFetching && (
                      <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                    )}
                    Run access check
                  </CButton>
                </CCol>
              </CRow>
              <CRow>
                <CCol>
                  {accessCheckResult.isSuccess && (
                    <CippTable
                      reportName="none"
                      columns={checkAccessColumns}
                      tableProps={tableProps}
                      data={accessCheckResult.data.Results}
                    />
                  )}
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol>
          <DNSSettings />
        </CCol>
      </CRow>
      <CRow>
        <CCol>
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle>Run Backup</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CRow>Click the button below to start a backup of all Settings</CRow>
              <CButton
                onClick={() => runBackup({ path: '/api/ExecRunBackup' })}
                disabled={RunBackupResult.isFetching}
                className="me-3 mt-3"
              >
                {RunBackupResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Run backup
              </CButton>
              <input
                ref={inputRef}
                type="file"
                accept="json/*"
                style={{ display: 'none' }}
                id="contained-button-file"
                onChange={(e) => handleChange(e)}
              />
              <CButton
                type="file"
                name="file"
                onClick={() => inputRef.current.click()}
                disabled={restoreBackupResult.isFetching}
                className="me-3 mt-3"
              >
                {restoreBackupResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Restore backup
              </CButton>
              {restoreBackupResult.isSuccess && (
                <>
                  <CCallout color="success">{restoreBackupResult.data.Results}</CCallout>
                </>
              )}
              {RunBackupResult.isSuccess && (
                <>
                  <CCallout color="success">
                    <CButton
                      onClick={() => downloadTxtFile(RunBackupResult.data.backup)}
                      className="m-1"
                    >
                      Download Backup
                    </CButton>
                  </CCallout>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol>
          <PasswordSettings />
        </CCol>
      </CRow>
    </div>
  )
}

const ExcludedTenantsSettings = () => {
  const dispatch = useDispatch()
  const currentTenant = useSelector((state) => state.app.currentTenant)
  const [removeExcludeTenant, removeExcludeTenantResult] = useExecRemoveExcludeTenantMutation()
  const [addExcludeTenant, addExcludeTenantResult] = useExecAddExcludeTenantMutation()
  const [refreshPermissions, refreshPermissionsResults] = useLazyGenericGetRequestQuery()

  // const [selectedTenant, setSelectedTenant] = useState()
  const selectedTenant = useRef()

  useEffect(() => {
    // if a tenant is already selected and that's the tenant the
    // user wants to exclude, we need to set that to the current state
    selectedTenant.current = currentTenant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRemoveExclusion = (domain) =>
    ModalService.confirm({
      title: 'Remove Exclusion',
      body: <div>Are you sure you want to remove the exclusion for {domain}?</div>,
      onConfirm: () => removeExcludeTenant(domain),
    })

  const handleCPVPermissions = (domain) =>
    ModalService.confirm({
      title: 'Refresh Permissions',
      body: <div>Are you sure you want to refresh permissions for {domain.defaultDomainName}?</div>,
      onConfirm: () =>
        refreshPermissions({ path: `/api/ExecCPVPermissions?TenantFilter=${domain.customerId}` }),
    })
  const handleConfirmExcludeTenant = (tenant) => {
    ModalService.confirm({
      title: 'Exclude Tenant',
      body: <div>Are you sure you want to exclude this tenant?</div>,
      onConfirm: () => addExcludeTenant(tenant),
    })

      .unwrap()
      .then(() => {
        dispatch(setCurrentTenant({}))
      })
  }

  const handleExcludeTenant = (selected) => {
    ModalService.confirm({
      body: (
        <div style={{ overflow: 'visible' }}>
          <div>Select a tenant to exclude</div>
          <TenantSelectorMultiple onChange={(tenant) => (selected = tenant)} />
        </div>
      ),
      title: 'Add Exclusion',
      onConfirm: () => handleConfirmExcludeTenant(selected),
    })
  }
  const titleButton = (
    <CButton
      style={{ position: 'absolute', right: '5px' }}
      size="sm"
      href="#"
      onClick={() => handleExcludeTenant(selectedTenant)}
    >
      Add Excluded Tenant
    </CButton>
  )
  function StatusIcon(graphErrorCount) {
    if (graphErrorCount > 0) {
      return <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger" />
    } else {
      return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />
    }
  }

  function StatusText(graphErrorCount, lastGraphError) {
    if (graphErrorCount > 0) {
      return 'Error Count: ' + graphErrorCount + ' - Last Error: ' + lastGraphError
    } else {
      return 'No errors detected with this tenant'
    }
  }

  const Offcanvas = (row, rowIndex, formatExtraData) => {
    return (
      <>
        {row.Excluded && (
          <CButton
            size="sm"
            variant="ghost"
            color="info"
            onClick={() => handleRemoveExclusion(row.defaultDomainName)}
          >
            <FontAwesomeIcon icon={faEye} href="" />
          </CButton>
        )}
        {!row.Excluded && (
          <CButton
            size="sm"
            variant="ghost"
            color="danger"
            onClick={() => handleConfirmExcludeTenant({ value: row.customerId })}
          >
            <FontAwesomeIcon icon={faEyeSlash} href="" />
          </CButton>
        )}
        <CButton size="sm" variant="ghost" color="info" onClick={() => handleCPVPermissions(row)}>
          <FontAwesomeIcon icon={faRecycle} href="" />
        </CButton>
      </>
    )
  }
  const columns = [
    {
      name: 'Name',
      selector: (row) => row['displayName'],
      sortable: true,
      cell: (row) => CellTip(row['displayName']),
      exportSelector: 'displayName',
    },
    {
      name: 'Default Domain',
      selector: (row) => row['defaultDomainName'],
      sortable: true,
      cell: (row) => CellTip(row['defaultDomainName']),
      exportSelector: 'defaultDomainName',
    },
    {
      name: 'Relationship Type',
      selector: (row) => row['delegatedPrivilegeStatus'],
      sortable: true,
      cell: (row, index, column) => {
        const cell = column.selector(row)
        if (!cell) {
          return <CellBadge color="info" label="DAP" />
        }
        if (cell.toLowerCase() == 'none') {
          return <CellBadge color="info" label="No Access" />
        }
        if (cell === 'delegatedAdminPrivileges') {
          return <CellBadge color="info" label="DAP Only" />
        }
        if (cell === 'delegatedAndGranularDelegetedAdminPrivileges') {
          return <CellBadge color="info" label="GDAP & DAP" />
        }
        if (cell === 'granularDelegatedAdminPrivileges') {
          return <CellBadge color="info" label="GDAP" />
        }
        return <CellBadge color="info" label="Unknown" />
      },
      exportSelector: 'delegatedPrivilegeStatus',
    },
    {
      name: 'Excluded',
      selector: (row) => row['Excluded'],
      sortable: true,
      cell: cellBooleanFormatter({ colourless: true }),
      exportSelector: 'Excluded',
      maxWidth: '100px',
      minWidth: '100px',
    },
    {
      name: 'Exclude Date',
      selector: (row) => row['ExcludeDate'],
      sortable: true,
      exportSelector: 'ExcludeDate',
      maxWidth: '150px',
      minWidth: '150px',
    },
    {
      name: 'Exclude User',
      selector: (row) => row['ExcludeUser'],
      sortable: true,
      exportSelector: 'ExcludeUser',
      maxWidth: '130px',
      minWidth: '130px',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '80px',
    },
  ]
  return (
    <>
      {(refreshPermissionsResults.isFetching || removeExcludeTenantResult.isFetching) && (
        <CCallout color="success" dismissible>
          <CSpinner />
        </CCallout>
      )}
      {removeExcludeTenantResult.isSuccess && (
        <CCallout color="success" dismissible>
          {removeExcludeTenantResult.data?.Results}
        </CCallout>
      )}
      {refreshPermissionsResults.isSuccess && (
        <CCallout color="success" dismissible>
          {refreshPermissionsResults.data.map((result, idx) => (
            <li key={idx}>{result}</li>
          ))}
        </CCallout>
      )}
      {addExcludeTenantResult.isSuccess && (
        <CCallout color="success" dismissible>
          {addExcludeTenantResult.data?.Results}
        </CCallout>
      )}
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="Tenants - Backend"
        tenantSelector={false}
        titleButton={titleButton}
        datatable={{
          tableProps: {
            selectableRows: true,
            actionsList: [
              {
                label: 'Exclude Tenants',
                modal: true,
                modalType: 'POST',
                modalBody: {
                  value: '!customerId',
                },
                modalUrl: `/api/ExecExcludeTenant?AddExclusion=true`,
                modalMessage: 'Are you sure you want to exclude these tenants?',
              },
              {
                label: 'Include Tenants',
                modal: true,
                modalUrl: `/api/ExecExcludeTenant?RemoveExclusion=true&TenantFilter=!defaultDomainName`,
                modalMessage: 'Are you sure you want to include these tenants?',
              },
              {
                label: 'Refresh CPV Permissions',
                modal: true,
                modalUrl: `/api/ExecCPVPermissions?TenantFilter=!customerId`,
                modalMessage:
                  'Are you sure you want to refresh the CPV permissions for these tenants?',
              },
            ],
          },
          filterlist: [
            { filterName: 'Excluded Tenants', filter: '"Excluded":true' },
            { filterName: 'Included Tenants', filter: '"Excluded":false' },
          ],
          keyField: 'id',
          columns,
          reportName: `Tenants-List`,
          path: '/api/ExecExcludeTenant?ListAll=True',
        }}
      />
    </>
  )
}
const SecuritySettings = () => {
  const [listBackend, listBackendResult] = useLazyGenericGetRequestQuery()

  return (
    <div>
      {listBackendResult.isUninitialized && listBackend({ path: 'api/ExecBackendURLs' })}
      <>
        <CRow className="mb-3">
          <CCol md={4}>
            <CCard className="h-100">
              <CCardHeader>
                <CCardTitle>Resource Group</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <CRow className="mb-3">
                  The Resource group contains all the CIPP resources in your tenant, except the SAM
                  Application
                </CRow>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.ResourceGroup}
                  rel="noreferrer"
                >
                  <CButton>Go to Resource Group</CButton>
                </a>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="h-100">
              <CCardHeader>
                <CCardTitle>Key Vault</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <CRow className="mb-3">
                  The keyvault allows you to check token information. By default you do not have
                  access.
                </CRow>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.KeyVault}
                  rel="noreferrer"
                >
                  <CButton>Go to Keyvault</CButton>
                </a>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="h-100">
              <CCardHeader>
                <CCardTitle>Static Web App (Role Management)</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <CRow className="mb-3">
                  The Static Web App role management allows you to invite other users to the
                  application.
                </CRow>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.SWARoles}
                  rel="noreferrer"
                >
                  <CButton>Go to Role Management</CButton>
                </a>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol md={4}>
            <CCard className="h-100">
              <CCardHeader>
                <CCardTitle>Function App (Deployment Center)</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <CRow className="mb-3">
                  The Function App Deployment Center allows you to run updates on the API
                </CRow>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.FunctionDeployment}
                  rel="noreferrer"
                >
                  <CButton>Go to Function App Deployment Center</CButton>
                </a>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="h-100">
              <CCardHeader>
                <CCardTitle>Function App (Configuration)</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <CRow className="mb-3">
                  At the Function App Configuration you can check the status of the API access to
                  your keyvault
                  <a
                    target={'_blank'}
                    href={listBackendResult.data?.Results?.FunctionConfig}
                    rel="noreferrer"
                  >
                    <CButton>Go to Function App Configuration</CButton>
                  </a>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="h-100">
              <CCardHeader>
                <CCardTitle>Function App (Overview)</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <CRow className="mb-3">
                  At the function App Overview, you can stop and start the backend API
                </CRow>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.FunctionApp}
                  rel="noreferrer"
                >
                  <CButton>Go to Function App Overview</CButton>
                </a>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </>
    </div>
  )
}

const NotificationsSettings = () => {
  const [configNotifications, notificationConfigResult] = useLazyExecNotificationConfigQuery()
  const [listNotification, notificationListResult] = useLazyListNotificationConfigQuery()
  const onSubmit = (values) => {
    configNotifications(values)
  }
  return (
    <>
      {notificationListResult.isUninitialized && listNotification()}
      {notificationListResult.isFetching && (
        <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
      )}
      {!notificationListResult.isFetching && notificationListResult.error && (
        <span>Error loading data</span>
      )}
      {notificationListResult.isSuccess && (
        <CCard className="h-100 w-50">
          <CCardHeader>
            <CCardTitle>Notifications</CCardTitle>
          </CCardHeader>
          <CCardBody>
            <Form
              initialValues={{
                ...notificationListResult.data,
                logsToInclude: notificationListResult.data?.logsToInclude?.map((m) => ({
                  label: m,
                  value: m,
                })),
              }}
              onSubmit={onSubmit}
              render={({ handleSubmit, submitting, values }) => {
                return (
                  <CForm onSubmit={handleSubmit}>
                    {notificationConfigResult.isFetching && (
                      <CCallout color="info">
                        <CSpinner>Loading</CSpinner>
                      </CCallout>
                    )}
                    {notificationConfigResult.isSuccess && (
                      <CCallout color="info">{notificationConfigResult.data?.Results}</CCallout>
                    )}
                    {notificationConfigResult.isError && (
                      <CCallout color="danger">
                        Could not connect to API: {notificationConfigResult.error.message}
                      </CCallout>
                    )}
                    <CCol>
                      <CCol>
                        <RFFCFormInput
                          type="text"
                          name="email"
                          label="E-mail (Separate multiple E-mails with commas e.g.: matt@example.com, joe@sample.com)"
                        />
                      </CCol>
                      <CCol>
                        <RFFCFormInput type="text" name="webhook" label="Webhook" />
                      </CCol>
                      <CCol>
                        <RFFSelectSearch
                          multi={true}
                          label="Choose which logs you'd like to receive alerts from. This notification will be sent every 15 minutes."
                          name="logsToInclude"
                          values={[
                            { value: 'Standards', name: 'All Standards' },
                            { value: 'TokensUpdater', name: 'Token Events' },
                            { value: 'ExecDnsConfig', name: 'Changing DNS Settings' },
                            { value: 'ExecExcludeLicenses', name: 'Adding excluded licenses' },
                            { value: 'ExecExcludeTenant', name: 'Adding excluded tenants' },
                            { value: 'EditUser', name: 'Editing a user' },
                            { value: 'ChocoApp', name: 'Adding or deploying applications' },
                            { value: 'AddAPDevice', name: 'Adding autopilot devices' },
                            { value: 'EditTenant', name: 'Editing a tenant' },
                            { value: 'AddMSPApp', name: 'Adding an MSP app' },
                            { value: 'AddUser', name: 'Adding a user' },
                            { value: 'AddGroup', name: 'Adding a group' },
                            { value: 'ExecOffboardUser', name: 'Executing the offboard wizard' },
                          ]}
                        />
                      </CCol>
                      <CCol>
                        <RFFCFormSwitch
                          name="onePerTenant"
                          label="Receive one email per tenant"
                          value={false}
                        />
                      </CCol>
                      <CButton disabled={notificationConfigResult.isFetching} type="submit">
                        Set Notification Settings
                      </CButton>
                    </CCol>
                  </CForm>
                )
              }}
            />
          </CCardBody>
        </CCard>
      )}
    </>
  )
}

const LicenseSettings = () => {
  const [setExclusion, setExclusionResults] = useLazyGenericPostRequestQuery()
  const formRef = useRef(null)

  const handleAddLicense = (selected) => {
    ModalService.confirm({
      body: (
        <div style={{ overflow: 'visible' }}>
          <Form
            onSubmit={setExclusion}
            render={({ handleSubmit, submitting, form, values }) => {
              formRef.current = values
              return (
                <>
                  <div>Add a license to exclude</div>
                  <RFFCFormInput label="GUID" name="GUID" />
                  <RFFCFormInput label="SKU Name" name="SKUName" />
                </>
              )
            }}
          />
        </div>
      ),
      title: 'Add Exclusion',
      onConfirm: () =>
        setExclusion({
          path: '/api/ExecExcludeLicenses?AddExclusion=true',
          values: { ...formRef.current },
        }),
    })
  }

  const titleButton = <TitleButton onClick={handleAddLicense} title="Add Excluded License" />
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()

  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const handleDeleteIntuneTemplate = (apiurl, message) => {
      ModalService.confirm({
        title: 'Confirm',
        body: <div>{message}</div>,
        onConfirm: () => ExecuteGetRequest({ path: apiurl }),
        confirmLabel: 'Continue',
        cancelLabel: 'Cancel',
      })
    }
    return (
      <>
        <CButton
          size="sm"
          variant="ghost"
          color="danger"
          onClick={() =>
            handleDeleteIntuneTemplate(
              `/api/ExecExcludeLicenses?RemoveExclusion=true&GUID=${row.GUID}`,
              'Do you want to delete this exclusion?',
            )
          }
        >
          <FontAwesomeIcon icon={faTrash} href="" />
        </CButton>
      </>
    )
  }

  const columns = [
    {
      name: 'Display Name',
      selector: (row) => row['Product_Display_Name'],
      sortable: true,
      minWidth: '300px',
    },
    {
      name: 'License ID',
      selector: (row) => row['GUID'],
      sortable: true,
      minWidth: '350px',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
    },
  ]
  return (
    <>
      {setExclusionResults.isFetching ||
        (getResults.isFetching && (
          <CCallout color="info">
            <CSpinner>Loading</CSpinner>
          </CCallout>
        ))}
      {setExclusionResults.isSuccess && (
        <CCallout color="info">{setExclusionResults.data?.Results}</CCallout>
      )}
      {setExclusionResults.isError && (
        <CCallout color="danger">
          Could not connect to API: {setExclusionResults.error.message}
        </CCallout>
      )}
      {getResults.isError && (
        <CCallout color="danger">Could not connect to API: {getResults.error.message}</CCallout>
      )}
      {getResults.isSuccess && <CCallout color="info">{getResults.data?.Results}</CCallout>}
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="Excluded Licenses"
        titleButton={titleButton}
        datatable={{
          columns,
          path: 'api/ExecExcludeLicenses',
          reportName: `ExcludedLicenses`,
          params: { List: true },
        }}
      />
    </>
  )
}
const PasswordSettings = () => {
  const [getPasswordConfig, getPasswordConfigResult] = useLazyGenericGetRequestQuery()
  const [editPasswordConfig, editPasswordConfigResult] = useLazyGenericPostRequestQuery()

  const [passAlertVisible, setPassAlertVisible] = useState(false)

  const switchResolver = (resolver) => {
    editPasswordConfig({ path: '/api/ExecPasswordconfig', values: { passwordType: resolver } })
    getPasswordConfig()
    setPassAlertVisible(true)
  }

  const resolvers = ['Classic', 'Correct-Battery-Horse']

  return (
    <>
      {getPasswordConfigResult.isUninitialized &&
        getPasswordConfig({ path: '/api/ExecPasswordConfig?list=true' })}
      <CCard className="h-100">
        <CCardHeader>
          <CCardTitle>Password Generation</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CRow>Select a password style for generated passwords.</CRow>
          <CButtonGroup role="group" aria-label="Resolver" className="my-3">
            {resolvers.map((r, index) => (
              <CButton
                onClick={() => switchResolver(r)}
                color={
                  r === getPasswordConfigResult.data?.Results?.passwordType
                    ? 'primary'
                    : 'secondary'
                }
                key={index}
              >
                {r}
              </CButton>
            ))}
          </CButtonGroup>
          {(editPasswordConfigResult.isSuccess || editPasswordConfigResult.isError) && (
            <CCallout
              color={editPasswordConfigResult.isSuccess ? 'success' : 'danger'}
              visible={passAlertVisible}
            >
              {editPasswordConfigResult.isSuccess
                ? editPasswordConfigResult.data.Results
                : 'Error setting password style'}
            </CCallout>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

const DNSSettings = () => {
  const [getDnsConfig, getDnsConfigResult] = useLazyGetDnsConfigQuery()
  const [editDnsConfig, editDnsConfigResult] = useLazyEditDnsConfigQuery()

  const [alertVisible, setAlertVisible] = useState(false)

  const switchResolver = (resolver) => {
    editDnsConfig({ resolver })
    getDnsConfig()
    setAlertVisible(true)
    setTimeout(() => {
      setAlertVisible(false)
    }, 2000)
  }

  const resolvers = ['Google', 'Cloudflare', 'Quad9']

  return (
    <>
      {getDnsConfigResult.isUninitialized && getDnsConfig()}
      {getDnsConfigResult.isSuccess && (
        <CCard className="h-100">
          <CCardHeader>
            <CCardTitle>DNS Resolver</CCardTitle>
          </CCardHeader>
          <CCardBody>
            <CRow>Select a DNS resolver to use for Domain Analysis.</CRow>
            <CButtonGroup role="group" aria-label="Resolver" className="my-3">
              {resolvers.map((r, index) => (
                <CButton
                  onClick={() => switchResolver(r)}
                  color={r === getDnsConfigResult.data.Resolver ? 'primary' : 'secondary'}
                  key={index}
                >
                  {r}
                </CButton>
              ))}
            </CButtonGroup>
            {(editDnsConfigResult.isSuccess || editDnsConfigResult.isError) && (
              <CCallout
                color={editDnsConfigResult.isSuccess ? 'success' : 'danger'}
                visible={alertVisible}
              >
                {editDnsConfigResult.isSuccess
                  ? editDnsConfigResult.data.Results
                  : 'Error setting resolver'}
              </CCallout>
            )}
          </CCardBody>
        </CCard>
      )}
    </>
  )
}
const Maintenance = () => {
  const [selectedScript, setSelectedScript] = useState()
  const [listBackend, listBackendResult] = useLazyGenericGetRequestQuery()
  const [listScript, listScriptResult] = useLazyGenericGetRequestQuery()
  const [listScriptLink, listScriptLinkResult] = useLazyGenericGetRequestQuery()

  const handleSubmit = async (values) => {
    listScript({ path: 'api/ExecMaintenanceScripts', params: values })
    setSelectedScript(values.ScriptFile)
  }

  const handleGetLink = () => {
    listScriptLink({
      path: 'api/ExecMaintenanceScripts',
      params: { ScriptFile: selectedScript, MakeLink: 'True' },
    })
  }
  return (
    <>
      {listBackendResult.isUninitialized && listBackend({ path: 'api/ExecMaintenanceScripts' })}
      <CRow>
        <CCol>
          <CCard className="options-card">
            <CCardHeader>
              <CCardTitle className="d-flex justify-content-between">Maintenance</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <Form
                initialValues={{}}
                onSubmit={handleSubmit}
                render={({ handleSubmit, submitting, values }) => {
                  return (
                    <CForm onSubmit={handleSubmit}>
                      {listBackendResult.isFetching && (
                        <>
                          <CRow>
                            <CCol>
                              <Skeleton count={5} />
                            </CCol>
                          </CRow>
                        </>
                      )}
                      {!listBackendResult.isFetching && listBackendResult.isSuccess && (
                        <>
                          <CRow>
                            <CCol>
                              <RFFCFormSelect
                                name="ScriptFile"
                                label="Script File"
                                placeholder="-- Select a script --"
                                values={listBackendResult.data.ScriptFiles}
                              />
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CCol>
                              <CButton type="submit" disabled={submitting}>
                                <FontAwesomeIcon icon={faScroll} className="me-2" />
                                Load Script
                              </CButton>
                            </CCol>
                          </CRow>
                        </>
                      )}
                    </CForm>
                  )
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol>
          {listScriptResult.isFetching && (
            <CCard className="h-100">
              <CCardBody>
                <Skeleton count={10} />
              </CCardBody>
            </CCard>
          )}
          {!listScriptResult.isFetching && listScriptResult.isSuccess && (
            <CCard className="h-100">
              <CCardHeader>
                <CCardTitle>Script Details</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <p>
                  <CButton type="submit" onClick={handleGetLink}>
                    <FontAwesomeIcon icon={faLink} className="me-2" />
                    Create Link
                  </CButton>
                </p>
                {listScriptLinkResult.isSuccess && (
                  <p>
                    {listScriptLinkResult.data.Link !== undefined && (
                      <>
                        <p>
                          Copy this text into a PowerShell terminal, we recommend Azure Cloud Shell.
                          Azure modules and the az command line utilties are required for these
                          scripts to work. The link is valid for 5 minutes.
                        </p>
                        <CippCodeBlock
                          language="text"
                          showLineNumbers={false}
                          wrapLongLines={true}
                          code={
                            'irm ' +
                            window.location.origin +
                            listScriptLinkResult.data.Link +
                            ' | iex'
                          }
                        />
                      </>
                    )}
                  </p>
                )}
                {listScriptResult.data.ScriptContent !== undefined && (
                  <p>
                    <h5>Maintenance Script Contents</h5>
                    <CippCodeBlock
                      language="powershell"
                      showLineNumbers={true}
                      wrapLongLines={false}
                      code={Buffer.from(listScriptResult.data.ScriptContent, 'base64').toString()}
                    />
                  </p>
                )}
              </CCardBody>
            </CCard>
          )}
        </CCol>
      </CRow>
    </>
  )
}
