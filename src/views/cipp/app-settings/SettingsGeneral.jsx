import { useListTenantsQuery } from 'src/store/api/tenants.js'
import {
  useLazyExecClearCacheQuery,
  useLazyExecPermissionsAccessCheckQuery,
  useLazyExecTenantsAccessCheckQuery,
  useLazyGenericGetRequestQuery,
} from 'src/store/api/app.js'
import React, { useRef, useState } from 'react'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat.jsx'
import { cellTableFormatter } from 'src/components/tables/CellTable.jsx'
import {
  CButton,
  CCallout,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormSwitch,
  CLink,
  CListGroup,
  CListGroupItem,
  CRow,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import CippListOffcanvas from 'src/components/utilities/CippListOffcanvas.jsx'
import { TableModalButton } from 'src/components/buttons/index.js'
import { CippTable } from 'src/components/tables/index.js'
import { TenantSelectorMultiple } from 'src/components/utilities/index.js'
import { SettingsGeneralRow } from 'src/views/cipp/app-settings/components/SettingsGeneralRow.jsx'

/**
 * SettingsGeneral component.
 * This method is responsible for managing general settings.
 * @returns {JSX.Element}
 */
export function SettingsGeneral() {
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
      cell: cellTableFormatter('MissingRoles', true, false, true),
    },
    {
      name: 'Roles available',
      selector: (row) => row?.GDAPRoles,
      cell: cellTableFormatter('GDAPRoles', false, true),
      omit: showExtendedInfo,
      exportSelector: 'GDAPRoles',
    },
    {
      name: 'SAM User Roles',
      selector: (row) => row?.SAMUserRoles,
      cell: cellTableFormatter('SAMUserRoles', false, true),
      omit: showExtendedInfo,
      exportSelector: 'SAMUserRoles',
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
        label="Show Extended Info"
        onChange={(e) => {
          console.log(e)
          setShowExtendedInfo(!e.target.checked)
        }}
        key={'Show Extended Info'}
      />,
    ],
  }

  return (
    <div>
      <CRow className="mb-3">
        <CCol>
          <SettingsGeneralRow />
        </CCol>
      </CRow>
      <CRow className="mb-3">
        <CCol className="mb-3" xl={6} md={12}>
          <CCard>
            <CCardHeader></CCardHeader>
            <CCardBody>
              <h3 className="underline mb-5">Permissions Check</h3>
              <p>Click the button below to start a permissions check.</p>
              <CButton
                onClick={() => checkPermissions()}
                disabled={permissionsResult.isFetching}
                className="mb-3 me-2"
              >
                {permissionsResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Run Permissions Check
              </CButton>
              {permissionsResult.isSuccess && (
                <>
                  {permissionsResult.data.Results?.AccessTokenDetails?.Name !== '' && (
                    <>
                      <CButton className="mb-3" onClick={() => setTokenOffcanvasVisible(true)}>
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
                          rel="noreferrer"
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
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xl={6} md={12} className="mb-3">
          <CCard>
            <CCardHeader></CCardHeader>
            <CCardBody>
              <h3 className="underline mb-5">GDAP Check</h3>
              <p>Click the button below to start a check for general GDAP settings.</p>
              <CButton
                onClick={() => checkGDAP({ path: '/api/ExecAccessChecks?GDAP=true' })}
                disabled={GDAPResult.isFetching}
                className="mb-3 me-2"
              >
                {GDAPResult.isFetching && (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
                )}
                Run GDAP Check
              </CButton>
              {GDAPResult.isSuccess && (
                <>
                  <TableModalButton
                    className="mb-3 me-2"
                    data={GDAPResult.data.Results?.Memberships?.filter(
                      (p) => p['@odata.type'] == '#microsoft.graph.group',
                    )}
                    title="Groups"
                  />
                  <TableModalButton
                    className="mb-3"
                    data={GDAPResult.data.Results?.Memberships?.filter(
                      (p) => p['@odata.type'] == '#microsoft.graph.directoryRole',
                    )}
                    title="Roles"
                  />
                </>
              )}
              <CRow>
                <CCol>
                  {GDAPResult.isSuccess && GDAPResult.data.Results.GDAPIssues?.length > 0 && (
                    <>
                      {GDAPResult.data.Results.GDAPIssues?.filter((e) => e.Type === 'Error')
                        .length > 0 && (
                        <CCallout color="danger">
                          Relationship errors detected. Review the table below for more details.
                        </CCallout>
                      )}
                      {GDAPResult.data.Results.GDAPIssues?.filter((e) => e.Type === 'Warning')
                        .length > 0 && (
                        <CCallout color="warning">
                          Relationship warnings detected. Review the table below for more details.
                        </CCallout>
                      )}
                      <CippTable
                        showFilter={true}
                        reportName="none"
                        columns={checkGDAPColumns}
                        data={GDAPResult.data.Results.GDAPIssues}
                        filterlist={[
                          {
                            filterName: 'Errors',
                            filter: 'Complex: Type eq Error',
                          },
                          {
                            filterName: 'Warnings',
                            filter: 'Complex: Type eq Warning',
                          },
                        ]}
                        isModal={true}
                      />
                    </>
                  )}
                  {GDAPResult.isSuccess && GDAPResult.data.Results.GDAPIssues?.length === 0 && (
                    <CCallout color="success">
                      No relationships with issues found. Please perform a Permissions Check or
                      Tenant Access Check if you are experiencing issues.
                    </CCallout>
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
            <CCardHeader></CCardHeader>
            <CCardBody>
              <h3 className="underline mb-5">Tenant Access Check</h3>
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
