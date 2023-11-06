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
  CCardText,
  CTooltip,
  CFormSwitch,
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
  CippOffcanvas,
  CippCodeBlock,
  ModalService,
  StatusIcon,
  TenantSelectorMultiple,
} from 'src/components/utilities'
import CippListOffcanvas from 'src/components/utilities/CippListOffcanvas'
import { TitleButton } from 'src/components/buttons'
import Skeleton from 'react-loading-skeleton'
import { Buffer } from 'buffer'
import Extensions from 'src/data/Extensions.json'
import { CellDelegatedPrivilege } from 'src/components/tables/CellDelegatedPrivilege'
import { TableModalButton } from 'src/components/buttons'
import { cellTableFormatter } from 'src/components/tables/CellTable'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'

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
        <CNavItem active={active === 7} onClick={() => setActive(7)} href="#">
          Extensions
        </CNavItem>
        <CNavItem active={active === 8} onClick={() => setActive(8)} href="#">
          Extension Mappings
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
        <CTabPane visible={active === 7} className="mt-3">
          <ExtensionsTab />
        </CTabPane>
        <CTabPane visible={active === 8} className="mt-3">
          <MappingsTab />
        </CTabPane>
      </CTabContent>
    </CippPage>
  )
}

export default CIPPSettings

const GeneralSettings = () => {
  const { data: tenants = [] } = useListTenantsQuery({ AllTenantSelector: false })
  const [checkPermissions, permissionsResult] = useLazyExecPermissionsAccessCheckQuery()
  const [checkGDAP, GDAPResult] = useLazyGenericGetRequestQuery()

  const [clearCache, clearCacheResult] = useLazyExecClearCacheQuery()
  const [checkAccess, accessCheckResult] = useLazyExecTenantsAccessCheckQuery()
  const [selectedTenants, setSelectedTenants] = useState([])
  const [showMaxSelected, setShowMaxSelected] = useState(false)
  const [tokenOffcanvasVisible, setTokenOffcanvasVisible] = useState(false)
  const [showExtendedInfo, setShowExtendedInfo] = useState(true)

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

  const checkAccessColumns = [
    {
      name: 'Tenant Domain',
      selector: (row) => row['TenantName'],
      grow: 0,
      cell: cellGenericFormatter(),
    },
    {
      name: 'Result',
      selector: (row) => row['Status'],
      minWidth: '380px',
      maxWidth: '380px',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Missing GDAP Roles',
      selector: (row) => row?.MissingRoles,
      cell: cellTableFormatter('MissingRoles', true, false),
    },
    {
      name: 'Roles available',
      selector: (row) => row?.GDAPRoles,
      cell: cellTableFormatter('GDAPRoles', false, true),
      omit: showExtendedInfo,
    },
    {
      name: 'SAM User Roles',
      selector: (row) => row?.SAMUserRoles,
      cell: cellTableFormatter('SAMUserRoles', false, true),
      omit: showExtendedInfo,
    },
  ]

  const checkGDAPColumns = [
    {
      name: 'Tenant',
      selector: (row) => row['Tenant'],
      sortable: true,
      cell: cellGenericFormatter(),
      minWidth: '200px',
      maxWidth: '200px',
    },
    {
      name: 'Error Type',
      selector: (row) => row['Type'],
      sortable: true,
      cell: cellGenericFormatter(),
      minWidth: '100px',
      maxWidth: '100px',
    },
    {
      name: 'Issue',
      selector: (row) => row?.Issue,
      sortable: true,
      cell: cellGenericFormatter(),
    },
    {
      name: 'Resolution Link',
      sortable: true,
      selector: (row) => row?.Link,
      cell: cellGenericFormatter(),
    },
    {
      name: 'Relationship ID',
      sortable: true,
      selector: (row) => row?.Relationship,
      cell: cellGenericFormatter(),
    },
  ]

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

  const tableProps = {
    pagination: false,
    actions: [
      <CFormSwitch
        size="sm"
        label="Show Extended Info"
        onChange={(e) => {
          console.log(e)
          setShowExtendedInfo(!e.target.checked)
        }}
      />,
    ],
  }

  return (
    <div>
      <CRow className="mb-3">
        <CCol>
          <DNSSettings />
        </CCol>
      </CRow>
      <CRow className="mb-3">
        <CCol className="mb-3">
          <CCard>
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
                          href="https://docs.cipp.app/setup/installation/permissions#manual-permissions"
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
                      <CButton className="me-3" onClick={() => setTokenOffcanvasVisible(true)}>
                        Details
                      </CButton>
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
        <CCol md={6} className="mb-3">
          <CCard>
            <CCardHeader>
              <CCardTitle>GDAP Check</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CRow>Click the button below to start a check for general GDAP settings.</CRow>
              <CButton
                onClick={() => checkGDAP({ path: '/api/ExecAccessChecks?GDAP=true' })}
                disabled={GDAPResult.isFetching}
                className="mt-3"
              >
                {GDAPResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Run GDAP Check
              </CButton>
              <CRow>
                <CCol>
                  {GDAPResult.isSuccess && GDAPResult.data.Results.GDAPIssues?.length > 0 && (
                    <CippTable
                      showFilter={true}
                      reportName="none"
                      columns={checkGDAPColumns}
                      data={GDAPResult.data.Results.GDAPIssues}
                    />
                  )}
                  {GDAPResult.isSuccess && GDAPResult.data.Results.GDAPIssues?.length === 0 && (
                    <CCallout color="success">
                      No relationships with issues found. Please perform a Permissions Check or
                      Tenant Access Check if you are experiencing issues.
                    </CCallout>
                  )}
                  {GDAPResult.isSuccess && (
                    <>
                      <TableModalButton
                        className="me-3"
                        data={GDAPResult.data.Results?.Memberships?.filter(
                          (p) => p['@odata.type'] == '#microsoft.graph.group',
                        )}
                        title="Groups"
                      />
                      <TableModalButton
                        data={GDAPResult.data.Results?.Memberships?.filter(
                          (p) => p['@odata.type'] == '#microsoft.graph.directoryRole',
                        )}
                        title="Roles"
                      />
                    </>
                  )}
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow className="mb-3">
        <CCol>
          <CCard>
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
                      showFilter={false}
                      disablePDFExport={true}
                      disableCSVExport={true}
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
          <CTooltip content="Remove Exclusion">
            <CButton
              size="sm"
              variant="ghost"
              color="info"
              onClick={() => handleRemoveExclusion(row.defaultDomainName)}
            >
              <FontAwesomeIcon icon={faEye} href="" />
            </CButton>
          </CTooltip>
        )}
        {!row.Excluded && (
          <CTooltip content="Exclude Tenant">
            <CButton
              size="sm"
              variant="ghost"
              color="danger"
              onClick={() => handleConfirmExcludeTenant({ value: row.customerId })}
            >
              <FontAwesomeIcon icon={faEyeSlash} href="" />
            </CButton>
          </CTooltip>
        )}
        <CTooltip content="CPV Refresh">
          <CButton size="sm" variant="ghost" color="info" onClick={() => handleCPVPermissions(row)}>
            <FontAwesomeIcon icon={faRecycle} href="" />
          </CButton>
        </CTooltip>
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
      cell: (row) => CellDelegatedPrivilege({ cell: row['delegatedPrivilegeStatus'] }),
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
      {refreshPermissionsResults.isSuccess &&
      refreshPermissionsResults.data?.Results &&
      Array.isArray(refreshPermissionsResults.data.Results) ? (
        <CCallout color="success" dismissible>
          {refreshPermissionsResults.data.Results.map((result, idx) => (
            <li key={idx}>{result}</li>
          ))}
        </CCallout>
      ) : null}
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
  const [visible, setVisible] = useState(false)
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
                <p>
                  The Resource group contains all the CIPP resources in your tenant, except the SAM
                  Application
                </p>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.ResourceGroup}
                  rel="noreferrer"
                >
                  <CButton className="mb-3">Go to Resource Group</CButton>
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
                <p>
                  The keyvault allows you to check token information. By default you do not have
                  access.
                </p>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.KeyVault}
                  rel="noreferrer"
                >
                  <CButton className="mb-3">Go to Keyvault</CButton>
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
                <p>
                  The Static Web App role management allows you to invite other users to the
                  application.
                </p>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.SWARoles}
                  rel="noreferrer"
                >
                  <CButton className="mb-3">Go to Role Management</CButton>
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
                <p>The Function App Deployment Center allows you to run updates on the API</p>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.FunctionDeployment}
                  rel="noreferrer"
                >
                  <CButton className="mb-3">Go to Function App Deployment Center</CButton>
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
                <p>
                  At the Function App Configuration you can check the status of the API access to
                  your keyvault
                </p>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.FunctionConfig}
                  rel="noreferrer"
                >
                  <CButton className="mb-3">Go to Function App Configuration</CButton>
                </a>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="h-100">
              <CCardHeader>
                <CCardTitle>Function App (Overview)</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <p>At the function App Overview, you can stop and start the backend API</p>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.FunctionApp}
                  rel="noreferrer"
                >
                  <CButton className="mb-3">Go to Function App Overview</CButton>
                </a>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol md={4}>
            <CCard className="h-100">
              <CCardHeader>
                <CCardTitle>Cloud Shell</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <p>Launch an Azure Cloud Shell Window</p>
                <CLink
                  onClick={() =>
                    window.open(
                      'https://shell.azure.com/powershell',
                      '_blank',
                      'toolbar=no,scrollbars=yes,resizable=yes,menubar=no,location=no,status=no',
                    )
                  }
                  rel="noreferrer"
                >
                  <CButton className="mb-3 me-3">Cloud Shell</CButton>
                </CLink>
                <CButton onClick={() => setVisible(true)} className="mb-3">
                  Command Reference
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CippOffcanvas
          id="command-offcanvas"
          visible={visible}
          placement="end"
          className="cipp-offcanvas"
          hideFunction={() => setVisible(false)}
          title="Command Reference"
        >
          <h5 className="my-3">Function App Config</h5>
          <CippCodeBlock
            language="powershell"
            code={
              '$Function = Get-AzFunctionApp -ResourceGroupName ' +
              listBackendResult.data?.Results?.RGName +
              ' -Name ' +
              listBackendResult.data?.Results?.FunctionName +
              '; $Function | select Name, Status, Location, Runtime, ApplicationSettings'
            }
            showLineNumbers={false}
            wrapLongLines={true}
          />
          <h5 className="my-3">Function App Deployment</h5>
          <CippCodeBlock
            language="powershell"
            code={
              '$FunctionDeployment = az webapp deployment source show --resource-group ' +
              listBackendResult.data?.Results?.RGName +
              ' --name ' +
              listBackendResult.data?.Results?.FunctionName +
              ' | ConvertFrom-Json; $FunctionDeployment | Select-Object repoUrl, branch, isGitHubAction, isManualIntegration, githubActionConfiguration'
            }
            showLineNumbers={false}
            wrapLongLines={true}
          />
          <h5 className="my-3">Watch Function Logs</h5>
          <CippCodeBlock
            language="powershell"
            code={
              'az webapp log tail --resource-group ' +
              listBackendResult.data?.Results?.RGName +
              ' --name ' +
              listBackendResult.data?.Results?.FunctionName
            }
            showLineNumbers={false}
            wrapLongLines={true}
          />
          <h5 className="my-3">Static Web App Config</h5>
          <CippCodeBlock
            language="powershell"
            code={
              '$StaticWebApp = Get-AzStaticWebApp -ResourceGroupName ' +
              listBackendResult.data?.Results?.RGName +
              ' -Name ' +
              listBackendResult.data?.Results?.SWAName +
              '; $StaticWebApp | Select-Object Name, CustomDomain, DefaultHostname, RepositoryUrl'
            }
            showLineNumbers={false}
            wrapLongLines={true}
          />
          <h5 className="my-3">List CIPP Users</h5>
          <CippCodeBlock
            language="powershell"
            code={
              'Get-AzStaticWebAppUser -ResourceGroupName ' +
              listBackendResult.data?.Results?.RGName +
              ' -Name ' +
              listBackendResult.data?.Results?.SWAName +
              ' -AuthProvider all | Select-Object DisplayName, Role'
            }
            showLineNumbers={false}
            wrapLongLines={true}
          />
        </CippOffcanvas>
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
              initialValuesEqual={() => true}
              initialValues={{
                ...notificationListResult.data,
                logsToInclude: notificationListResult.data?.logsToInclude?.map((m) => ({
                  label: m,
                  value: m,
                })),
                Severity: notificationListResult.data?.Severity?.map((s) => ({
                  label: s,
                  value: s,
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
                            { value: 'Updates', name: 'Updates Status' },
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
                            { value: 'NewTenant', name: 'Adding a tenant' },
                            { value: 'ExecOffboardUser', name: 'Executing the offboard wizard' },
                          ]}
                        />
                      </CCol>
                      <CCol className="mb-3">
                        <RFFSelectSearch
                          multi={true}
                          label="Choose which severity of alert you want to be notified for."
                          name="Severity"
                          values={[
                            { value: 'Alert', name: 'Alert' },
                            { value: 'Error', name: 'Error' },
                            { value: 'Info', name: 'Info' },
                            { value: 'Warning', name: 'Warning' },
                            { value: 'Critical', name: 'Critical' },
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
                      <CCol>
                        <RFFCFormSwitch
                          name="sendtoIntegration"
                          label="Send notifications to configured integration(s)"
                          value={false}
                        />
                      </CCol>
                      <CCol>
                        <RFFCFormSwitch
                          name="includeTenantId"
                          label="Include Tenant ID in alerts"
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
      exportSelector: 'Product_Display_Name',
      sortable: true,
      minWidth: '300px',
    },
    {
      name: 'License ID',
      selector: (row) => row['GUID'],
      exportSelector: 'GUID',
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
      <h3 className="underline mb-5">Password Style</h3>
      <CButtonGroup role="group" aria-label="Resolver" className="my-3">
        {resolvers.map((r, index) => (
          <CButton
            onClick={() => switchResolver(r)}
            color={
              r === getPasswordConfigResult.data?.Results?.passwordType ? 'primary' : 'secondary'
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
    </>
  )
}

const DNSSettings = () => {
  const [runBackup, RunBackupResult] = useLazyGenericGetRequestQuery()
  const [restoreBackup, restoreBackupResult] = useLazyGenericPostRequestQuery()
  const [getDnsConfig, getDnsConfigResult] = useLazyGetDnsConfigQuery()
  const [editDnsConfig, editDnsConfigResult] = useLazyEditDnsConfigQuery()
  const inputRef = useRef(null)
  const [clearCache, clearCacheResult] = useLazyExecClearCacheQuery()
  const { data: versions, isSuccess: isSuccessVersion } = useLoadVersionsQuery()

  const [alertVisible, setAlertVisible] = useState(false)
  const downloadTxtFile = (data) => {
    const txtdata = [JSON.stringify(RunBackupResult.data.backup)]
    const file = new Blob(txtdata, { type: 'text/plain' })
    const element = document.createElement('a')
    element.href = URL.createObjectURL(file)
    element.download = 'CIPP-Backup' + Date.now() + '.json'
    document.body.appendChild(element)
    element.click()
  }
  const handleChange = (e) => {
    const fileReader = new FileReader()
    fileReader.readAsText(e.target.files[0], 'UTF-8')
    fileReader.onload = (e) => {
      restoreBackup({ path: '/api/ExecRestoreBackup', values: e.target.result })
    }
  }
  const switchResolver = (resolver) => {
    editDnsConfig({ resolver })
    getDnsConfig()
    setAlertVisible(true)
    setTimeout(() => {
      setAlertVisible(false)
    }, 2000)
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
  const resolvers = ['Google', 'Cloudflare', 'Quad9']

  return (
    <>
      {getDnsConfigResult.isUninitialized && getDnsConfig()}
      {getDnsConfigResult.isSuccess && (
        <CCard className="h-100">
          <CCardHeader>
            <CCardTitle>Application Settings</CCardTitle>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol>
                <PasswordSettings />
              </CCol>
              <CCol>
                <h3 className="underline mb-5">DNS Resolver</h3>
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
              </CCol>
              <CCol>
                <h3 className="underline mb-5">Frontend Version</h3>
                <StatusIcon
                  type="negatedboolean"
                  status={isSuccessVersion && versions.OutOfDateCIPP}
                />
                <div>Latest: {isSuccessVersion ? versions.RemoteCIPPVersion : <Skeleton />}</div>
                <div>Current: {isSuccessVersion ? versions.LocalCIPPVersion : <Skeleton />}</div>
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <h3 className="underline mb-5">Clear Caches</h3>
                <CButton
                  className="me-2 mb-2"
                  onClick={() => handleClearCache()}
                  disabled={clearCacheResult.isFetching}
                >
                  {clearCacheResult.isFetching && (
                    <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                  )}
                  Clear All Cache
                </CButton>
                <CButton
                  className="me-2 mb-2"
                  onClick={() => handleClearCacheTenant()}
                  disabled={clearCacheResult.isFetching}
                >
                  {clearCacheResult.isFetching && (
                    <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                  )}
                  Clear Tenant Cache
                </CButton>
                {clearCacheResult.isSuccess && (
                  <div className="me-3">{clearCacheResult.data?.Results}</div>
                )}
              </CCol>

              <CCol>
                <h3 className="underline mb-5">Settings Backup</h3>
                <CButton
                  className="me-2 mb-2"
                  onClick={() => runBackup({ path: '/api/ExecRunBackup' })}
                  disabled={RunBackupResult.isFetching}
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
                  className="me-2 mb-2"
                  type="file"
                  name="file"
                  onClick={() => inputRef.current.click()}
                  disabled={restoreBackupResult.isFetching}
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
                      <CButton onClick={() => downloadTxtFile(RunBackupResult.data.backup)}>
                        Download Backup
                      </CButton>
                    </CCallout>
                  </>
                )}
              </CCol>
              <CCol>
                <h3 className="underline mb-5">Backend API Version</h3>
                <StatusIcon
                  type="negatedboolean"
                  status={isSuccessVersion && versions.OutOfDateCIPPAPI}
                />
                <div>Latest: {isSuccessVersion ? versions.RemoteCIPPAPIVersion : <Skeleton />}</div>
                <div>Current: {isSuccessVersion ? versions.LocalCIPPAPIVersion : <Skeleton />}</div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )}
    </>
  )
}
const ExtensionsTab = () => {
  const [listBackend, listBackendResult] = useLazyGenericGetRequestQuery()
  const inputRef = useRef(null)
  const [setExtensionconfig, extensionConfigResult] = useLazyGenericPostRequestQuery()
  const [execTestExtension, listExtensionTestResult] = useLazyGenericGetRequestQuery()
  const [execSyncExtension, listSyncExtensionResult] = useLazyGenericGetRequestQuery()

  const onSubmitTest = (integrationName) => {
    execTestExtension({
      path: 'api/ExecExtensionTest?extensionName=' + integrationName,
    })
  }
  const onSubmit = (values) => {
    setExtensionconfig({
      path: 'api/ExecExtensionsConfig',
      values: values,
    })
  }
  return (
    <div>
      {listBackendResult.isUninitialized && listBackend({ path: 'api/ListExtensionsConfig' })}
      <>
        {(listBackendResult.isFetching ||
          extensionConfigResult.isFetching ||
          listExtensionTestResult.isFetching ||
          listSyncExtensionResult.isFetching) && <CSpinner color="primary" />}
        {listSyncExtensionResult.isSuccess && (
          <CCard className="mb-3">
            <CCardHeader>
              <CCardTitle>Results</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <>
                <CCallout color="success">{listSyncExtensionResult.data.Results}</CCallout>
              </>
            </CCardBody>
          </CCard>
        )}

        {listExtensionTestResult.isSuccess && (
          <CCard className="mb-3">
            <CCardHeader>
              <CCardTitle>Results</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <>
                <CCallout color="success">{listExtensionTestResult.data.Results}</CCallout>
              </>
            </CCardBody>
          </CCard>
        )}
        {extensionConfigResult.isSuccess && (
          <CCard className="mb-3">
            <CCardHeader>
              <CCardTitle>Results</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <>
                <CCallout color="success">{extensionConfigResult.data.Results}</CCallout>
              </>
            </CCardBody>
          </CCard>
        )}
        <CRow>
          {Extensions.map((integration) => (
            <CCol xs={12} lg={6} xl={6} className="mb-3">
              <CCard className="d-flex flex-column h-100">
                <CCardHeader>
                  <CCardTitle>{integration.name}</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  <p>{integration.helpText}</p>
                  <Form
                    onSubmit={onSubmit}
                    initialValues={listBackendResult.data}
                    render={({ handleSubmit, submitting, values }) => {
                      return (
                        <CForm onSubmit={handleSubmit}>
                          <CCardText>
                            <CCol className="mb-3">
                              {integration.SettingOptions.map(
                                (integrationOptions) =>
                                  integrationOptions.type === 'input' && (
                                    <CCol>
                                      <RFFCFormInput
                                        type={integrationOptions.fieldtype}
                                        name={integrationOptions.name}
                                        label={integrationOptions.label}
                                        placeholder={integrationOptions.placeholder}
                                      />
                                    </CCol>
                                  ),
                              )}
                              {integration.SettingOptions.map(
                                (integrationOptions) =>
                                  integrationOptions.type === 'checkbox' && (
                                    <CCol>
                                      <RFFCFormSwitch
                                        name={integrationOptions.name}
                                        label={integrationOptions.label}
                                        value={false}
                                      />
                                    </CCol>
                                  ),
                              )}
                              <input
                                ref={inputRef}
                                type="hidden"
                                name="type"
                                value={integration.type}
                              />
                            </CCol>
                          </CCardText>
                          <CCol className="me-2">
                            <CButton className="me-2" type="submit">
                              {extensionConfigResult.isFetching && (
                                <FontAwesomeIcon
                                  icon={faCircleNotch}
                                  spin
                                  className="me-2"
                                  size="1x"
                                />
                              )}
                              Set Extension Settings
                            </CButton>
                            <CButton
                              onClick={() => onSubmitTest(integration.type)}
                              className="me-2"
                            >
                              {listExtensionTestResult.isFetching && (
                                <FontAwesomeIcon
                                  icon={faCircleNotch}
                                  spin
                                  className="me-2"
                                  size="1x"
                                />
                              )}
                              Test Extension
                            </CButton>
                            {integration.forceSyncButton && (
                              <CButton
                                onClick={() =>
                                  execSyncExtension({
                                    path: 'api/ExecExtensionSync?Extension=' + integration.type,
                                  })
                                }
                                className="me-2"
                              >
                                {listSyncExtensionResult.isFetching && (
                                  <FontAwesomeIcon
                                    icon={faCircleNotch}
                                    spin
                                    className="me-2"
                                    size="1x"
                                  />
                                )}
                                Force Sync
                              </CButton>
                            )}
                          </CCol>
                        </CForm>
                      )
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
          ))}
        </CRow>
      </>
    </div>
  )
}

const MappingsTab = () => {
  const [listHaloBackend, listBackendHaloResult = []] = useLazyGenericGetRequestQuery()
  const [setHaloExtensionconfig, extensionHaloConfigResult = []] = useLazyGenericPostRequestQuery()

  const onHaloSubmit = (values) => {
    setHaloExtensionconfig({
      path: 'api/ExecExtensionMapping?AddMapping=Halo',
      values: { mappings: values },
    })
  }
  return (
    <div>
      {listBackendHaloResult.isUninitialized &&
        listHaloBackend({ path: 'api/ExecExtensionMapping?List=Halo' })}
      <>
        <CCard className="mb-3">
          <CCardHeader>
            <CCardTitle>HaloPSA Mapping Table</CCardTitle>
          </CCardHeader>
          <CCardBody>
            {listBackendHaloResult.isFetching ? (
              <CSpinner color="primary" />
            ) : (
              <Form
                onSubmit={onHaloSubmit}
                initialValues={listBackendHaloResult.data?.Mappings}
                render={({ handleSubmit, submitting, values }) => {
                  return (
                    <CForm onSubmit={handleSubmit}>
                      <CCardText>
                        Use the table below to map your client to the correct PSA client
                        {listBackendHaloResult.isSuccess &&
                          listBackendHaloResult.data.Tenants?.map((tenant) => (
                            <RFFSelectSearch
                              key={tenant.customerId}
                              name={tenant.customerId}
                              label={tenant.displayName}
                              values={listBackendHaloResult.data.HaloClients}
                              placeholder="Select a client"
                            />
                          ))}
                      </CCardText>
                      <CCol className="me-2">
                        <CButton className="me-2" type="submit">
                          {extensionHaloConfigResult.isFetching && (
                            <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                          )}
                          Set Mappings
                        </CButton>
                        {(extensionHaloConfigResult.isSuccess ||
                          extensionHaloConfigResult.isError) && (
                          <CCallout
                            color={extensionHaloConfigResult.isSuccess ? 'success' : 'danger'}
                          >
                            {extensionHaloConfigResult.isSuccess
                              ? extensionHaloConfigResult.data.Results
                              : 'Error'}
                          </CCallout>
                        )}
                      </CCol>
                    </CForm>
                  )
                }}
              />
            )}
          </CCardBody>
        </CCard>
      </>
    </div>
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
