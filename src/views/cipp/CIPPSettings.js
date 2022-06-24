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
  CBadge,
  CLink,
  CSpinner,
} from '@coreui/react'
import {
  useLazyExecClearCacheQuery,
  useLazyExecNotificationConfigQuery,
  useLazyExecPermissionsAccessCheckQuery,
  useLazyExecTenantsAccessCheckQuery,
  useLazyGenericGetRequestQuery,
  useLazyGenericPostRequestQuery,
  useLazyListNotificationConfigQuery,
} from 'src/store/api/app'
import {
  useExecAddExcludeTenantMutation,
  useExecRemoveExcludeTenantMutation,
  useListExcludedTenantsQuery,
} from 'src/store/api/tenants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faTrash, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { useListTenantsQuery } from 'src/store/api/tenants'
import { useLazyEditDnsConfigQuery, useLazyGetDnsConfigQuery } from 'src/store/api/domains'
import { useDispatch, useSelector } from 'react-redux'
import { CippTable } from 'src/components/tables'
import { CippPage, CippPageList } from 'src/components/layout'
import { RFFCFormSwitch, RFFCFormInput } from 'src/components/forms'
import { Form } from 'react-final-form'
import useConfirmModal from 'src/hooks/useConfirmModal'
import { setCurrentTenant } from 'src/store/features/app'
import { ModalService, TenantSelectorMultiple } from 'src/components/utilities'
import CippListOffcanvas from 'src/components/utilities/CippListOffcanvas'
import { TitleButton } from 'src/components/buttons'

const CIPPSettings = () => {
  const [active, setActive] = useState(1)
  return (
    <CippPage title="Settings" tenantSelector={false}>
      <CNav variant="tabs" role="tablist">
        <CNavItem active={active === 1} onClick={() => setActive(1)} href="#">
          General
        </CNavItem>
        <CNavItem active={active === 2} onClick={() => setActive(2)} href="#">
          Excluded Tenants
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
  const { data: tenants = [] } = useListTenantsQuery({ AllTenantSelector: false })
  const [checkPermissions, permissionsResult] = useLazyExecPermissionsAccessCheckQuery()
  const [clearCache, clearCacheResult] = useLazyExecClearCacheQuery()
  const [checkAccess, accessCheckResult] = useLazyExecTenantsAccessCheckQuery()
  const [selectedTenants, setSelectedTenants] = useState([])
  const [showMaxSelected, setShowMaxSelected] = useState(false)
  const [tokenOffcanvasVisible, setTokenOffcanvasVisible] = useState(false)
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
      clearCache()
      localStorage.clear()
    },
  })

  const tableProps = {
    pagination: false,
    subheader: false,
  }

  return (
    <div>
      <CRow className="mb-3">
        <CCol md={6}>
          <CCard className="h-100">
            <CCardHeader>
              <CCardTitle>Permissions Check</CCardTitle>
            </CCardHeader>
            <CCardBody>
              Click the button below to start a permissions check. <br />
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
                        Your Secure Application Model is missing the following delegated
                        permissions:
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
              Click the button below to clear the all caches the application uses. This includes the
              Best Practice Analyser, Tenant Cache, Domain Analyser, and personal settings such as
              theme and usage location <br />
              <CButton
                onClick={() => handleClearCache()}
                disabled={clearCacheResult.isFetching}
                className="mt-3"
              >
                {clearCacheResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Clear Cache
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
              <div className="mb-3">
                Click the button below to start a tenant access check. You can select multiple a
                maximum of {maxSelected + 1} tenants is recommended.
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
              <br />
              <CButton
                onClick={() => handleCheckAccess()}
                disabled={accessCheckResult.isFetching || selectedTenants.length < 1}
              >
                {accessCheckResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Run access check
              </CButton>
              {accessCheckResult.isSuccess && (
                <CippTable
                  reportName="none"
                  columns={checkAccessColumns}
                  tableProps={tableProps}
                  data={accessCheckResult.data.Results}
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol>
          <DNSSettings />
        </CCol>
      </CRow>
    </div>
  )
}

const ExcludedTenantsSettings = () => {
  const dispatch = useDispatch()
  const currentTenant = useSelector((state) => state.app.currentTenant)
  const {
    data: excludedTenants = [],
    isFetching: excludedTenantsFetching,
    isSuccess: excludedTenantsSuccess,
  } = useListExcludedTenantsQuery()
  const [removeExcludeTenant, removeExcludeTenantResult] = useExecRemoveExcludeTenantMutation()
  const [addExcludeTenant, addExcludeTenantResult] = useExecAddExcludeTenantMutation()
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

  const handleConfirmExcludeTenant = (tenant) => {
    addExcludeTenant(tenant)
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

  return (
    <>
      {removeExcludeTenantResult.isSuccess && (
        <CCallout color="success" dismissible>
          {removeExcludeTenantResult.data?.Results}
        </CCallout>
      )}
      {addExcludeTenantResult.isSuccess && (
        <CCallout color="success" dismissible>
          {addExcludeTenantResult.data?.Results}
        </CCallout>
      )}
      <CRow className="mb-3">
        <CCol md={12}>
          <CCard>
            <CCardHeader>
              <CCardTitle>
                Excluded Tenant List
                <CButton
                  style={{ position: 'absolute', right: '5px' }}
                  size="sm"
                  href="#"
                  onClick={() => handleExcludeTenant(selectedTenant)}
                >
                  Add Excluded Tenant
                </CButton>
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
              {excludedTenantsFetching && <CSpinner />}
              {excludedTenantsSuccess && (
                <CListGroup>
                  {excludedTenants.map((excludedTenant, idx) => (
                    <CListGroupItem key={idx}>
                      {excludedTenant.Name}
                      <CBadge
                        color="secondary"
                        shape="rounded-pill"
                        style={{ position: 'absolute', right: '40px' }}
                      >
                        Added by {excludedTenant.User} on {excludedTenant.Date}
                      </CBadge>
                      <CLink href="#">
                        <FontAwesomeIcon
                          style={{ position: 'absolute', right: '15px' }}
                          color="primary"
                          icon={faTrashAlt}
                          size="sm"
                          onClick={() => handleRemoveExclusion(excludedTenant.Name)}
                        />
                      </CLink>
                    </CListGroupItem>
                  ))}
                </CListGroup>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
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
            <CCard>
              <CCardHeader>
                <CCardTitle>Resource Group</CCardTitle>
              </CCardHeader>
              <CCardBody className="equalheight">
                The Resource group contains all the CIPP resources in your tenant, except the SAM
                Application <br /> <br />
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
            <CCard>
              <CCardHeader>
                <CCardTitle>Key Vault</CCardTitle>
              </CCardHeader>
              <CCardBody className="equalheight">
                The keyvault allows you to check token information. By default you do not have
                access.
                <br /> <br />
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
            <CCard>
              <CCardHeader>
                <CCardTitle>Static Web App (Role Management)</CCardTitle>
              </CCardHeader>
              <CCardBody className="equalheight">
                The Static Web App role management allows you to invite other users to the
                application.
                <br /> <br />
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
            <CCard>
              <CCardHeader>
                <CCardTitle>Function App (Deployment Center)</CCardTitle>
              </CCardHeader>
              <CCardBody className="equalheight">
                The Function App Deployment Center allows you to run updates on the API
                <br /> <br />
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
            <CCard>
              <CCardHeader>
                <CCardTitle>Function App (Configuration)</CCardTitle>
              </CCardHeader>
              <CCardBody className="equalheight">
                At the Function App Configuration you can check the status of the API access to your
                keyvault <br /> <br />
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.FunctionConfig}
                  rel="noreferrer"
                >
                  <CButton>Go to Function App Configuration</CButton>
                </a>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard>
              <CCardHeader>
                <CCardTitle>Function App (Overview)</CCardTitle>
              </CCardHeader>
              <CCardBody className="equalheight">
                At the function App Overview, you can stop and start the backend API <br /> <br />
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
  //to post settings
  const [configNotifications, notificationConfigResult] = useLazyExecNotificationConfigQuery()

  const onSubmit = (values) => {
    // @todo bind this
    // window.alert(JSON.stringify(values))
    // console.log(values)
    configNotifications(values)
  }
  //to get current settings
  const [listNotification, notificationListResult] = useLazyListNotificationConfigQuery()
  //todo: Replace with prettier sliders etc
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
              initialValues={{ ...notificationListResult.data }}
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
                        <RFFCFormInput type="text" name="email" label="E-mail" />
                      </CCol>
                      <CCol>
                        <RFFCFormInput type="text" name="webhook" label="Webhook" />
                      </CCol>
                      <CFormLabel>
                        Choose which types of updates you want to receive. This notification will be
                        sent every 30 minutes.
                      </CFormLabel>
                      <br />
                      <RFFCFormSwitch
                        name="addUser"
                        label="New Accounts created via CIPP"
                        value={false}
                      />
                      <RFFCFormSwitch
                        name="removeUser"
                        label="Removed Accounts via CIPP"
                        value={false}
                      />
                      <RFFCFormSwitch
                        name="addChocoApp"
                        label="New Applications added via CIPP"
                        value={false}
                      />
                      <RFFCFormSwitch
                        name="addPolicy"
                        label="New Policies added via CIPP"
                        value={false}
                      />
                      <RFFCFormSwitch
                        name="addStandardsDeploy"
                        label="New Standards added via CIPP"
                        value={false}
                      />
                      <RFFCFormSwitch
                        name="removeStandard"
                        label="Removed Standards via CIPP"
                        value={false}
                      />
                      <RFFCFormSwitch
                        name="tokenUpdater"
                        label="Token Refresh Events"
                        value={false}
                      />

                      <br></br>
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
            Select a DNS resolver to use for Domain Analysis. <br />
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
