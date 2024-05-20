import React, { useState } from 'react'
import {
  faBook,
  faCog,
  faLaptopCode,
  faMailBulk,
  faUser,
  faUserFriends,
  faUserPlus,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import {
  CButton,
  CCol,
  CCollapse,
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CLink,
  CRow,
} from '@coreui/react'
import { useGenericGetRequestQuery } from 'src/store/api/app'
import { CippContentCard } from 'src/components/layout'
import Skeleton from 'react-loading-skeleton'
import { UniversalSearch } from 'src/components/utilities/UniversalSearch'
import { useSelector } from 'react-redux'
import allStandardsList from 'src/data/standards'
import Portals from 'src/data/portals'
import CippCopyToClipboard from 'src/components/utilities/CippCopyToClipboard'
import { CChart } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import { ModalService } from 'src/components/utilities'

const TenantDashboard = () => {
  const [visible, setVisible] = useState(false)
  const [domainVisible, setDomainVisible] = useState(false)
  const navigate = useNavigate()

  const currentTenant = useSelector((state) => state.app.currentTenant)
  const theme = useSelector((state) => state.app.currentTheme)

  var buttonColor = ''
  if (theme === 'impact') {
    buttonColor = 'secondary'
  } else {
    buttonColor = 'primary'
  }

  const {
    data: organization,
    isLoading: isLoadingOrg,
    isSuccess: issuccessOrg,
    isFetching: isFetchingOrg,
  } = useGenericGetRequestQuery({
    path: '/api/ListOrg',
    params: { tenantFilter: currentTenant.defaultDomainName },
  })

  const {
    data: dashboard,
    isLoading: isLoadingUserCounts,
    isSuccess: issuccessUserCounts,
    isFetching: isFetchingUserCount,
  } = useGenericGetRequestQuery({
    path: '/api/ListuserCounts',
    params: { tenantFilter: currentTenant.defaultDomainName },
  })

  const GlobalAdminList = useGenericGetRequestQuery({
    path: '/api/ListGraphRequest',
    params: {
      tenantFilter: currentTenant.defaultDomainName,
      Endpoint: "/directoryRoles(roleTemplateId='62e90394-69f5-4237-9190-012177145e10')/members",
      $select: 'displayName,userPrincipalName,accountEnabled',
    },
  })

  const {
    data: sharepoint,
    isLoading: isLoadingSPQuota,
    isSuccess: issuccessSPQuota,
    isFetching: isFetchingSPQuota,
  } = useGenericGetRequestQuery({
    path: '/api/ListSharepointQuota',
    params: { tenantFilter: currentTenant.defaultDomainName },
  })

  const {
    data: standards = [],
    isLoading: isLoadingStandards,
    isSuccess: issuccessStandards,
    isFetching: isFetchingStandards,
  } = useGenericGetRequestQuery({
    path: '/api/ListStandards',
    params: { ShowConsolidated: true, TenantFilter: currentTenant.defaultDomainName },
  })

  const {
    data: partners,
    isLoading: isLoadingPartners,
    isSuccess: issuccessPartners,
    isFetching: isFetchingPartners,
  } = useGenericGetRequestQuery({
    path: '/api/ListGraphRequest',
    params: {
      Endpoint: 'policies/crossTenantAccessPolicy/partners',
      tenantFilter: currentTenant.defaultDomainName,
      ReverseTenantLookup: true,
    },
  })

  const actions1 = Portals.map((portal) => ({
    icon: portal.icon,
    label: portal.label,
    target: '_blank',
    link: portal.url.replace(portal.variable, currentTenant[portal.variable]),
  }))

  const actions2 = [
    {
      label: 'Edit Tenant',
      link: `/tenant/administration/tenants/Edit?customerId=${currentTenant.customerId}&tenantFilter=${currentTenant.defaultDomainName}`,
      icon: faCog,
    },
    {
      label: 'List Users',
      link: `/identity/administration/users?customerId=${currentTenant.customerId}`,
      icon: faUser,
    },
    {
      label: 'List Mailboxes',
      link: `/email/administration/mailboxes?customerId=${currentTenant.customerId}`,
      icon: faMailBulk,
    },
    {
      label: 'List Groups',
      link: `/identity/administration/groups?customerId=${currentTenant.customerId}`,
      icon: faUsers,
    },
    {
      label: 'List Devices',
      link: `/endpoint/reports/devices?customerId=${currentTenant.customerId}`,
      icon: faLaptopCode,
    },
    {
      label: 'Create User',
      link: `/identity/administration/users/add?customerId=${currentTenant.customerId}`,
      icon: faUserPlus,
    },
    {
      label: 'Create Group',
      link: `/identity/administration/groups/add?customerId=${currentTenant.customerId}`,
      icon: faUserFriends,
    },
  ]
  const filteredStandards = (count, type) => {
    const filteredStandards = standards?.filter((standard) => standard.Settings[type] === true)
    if (count) {
      return filteredStandards.length
    }
    return filteredStandards.map((standard, idx) => {
      const standardDisplayname = allStandardsList.find((p) => p.name.includes(standard.Standard))
      return (
        <li key={`${standard.Standard}-${idx}`}>
          {standardDisplayname?.label || standard.Standard}
        </li>
      )
    })
  }

  const handleTable = (data, title) => {
    const QueryColumns = []
    const columns = Object.keys(data[0]).map((key) => {
      QueryColumns.push({
        name: key,
        selector: (row) => row[key], // Accessing the property using the key
        sortable: true,
        exportSelector: key,
        cell: cellGenericFormatter(),
      })
    })
    ModalService.open({
      data: data,
      componentType: 'table',
      componentProps: {
        columns: QueryColumns,
        keyField: 'id',
      },
      title: title,
      size: 'lg',
    })
  }

  const userChartLegendClickHandler = function (e, legendItem, legend) {
    switch (legendItem.text) {
      case 'Total Users':
        navigate('/identity/administration/users?customerId=' + currentTenant.customerId)
        break
      case 'Licensed Users':
        navigate(
          '/identity/administration/users?customerId=' +
            currentTenant.customerId +
            '&tableFilter=Graph%3A+assignedLicenses%2F%24count+ne+0',
        )
        break
      case 'Guests':
        navigate(
          '/identity/administration/users?customerId=' +
            currentTenant.customerId +
            '&tableFilter=Graph%3A+usertype+eq+%27guest%27',
        )
        break
      case 'Global Admins':
        handleTable(GlobalAdminList.data?.Results, 'Global Admins')
        break
    }
  }

  return (
    <>
      <CRow className="mb-3">
        <CCol sm={12}>
          <CDropdown variant="btn-group" className="me-2">
            <CDropdownToggle color={buttonColor}>
              <FontAwesomeIcon icon="external-link" className="me-2" />
              Portals
            </CDropdownToggle>
            <CDropdownMenu>
              {actions1.map((item, idx) => (
                <CLink
                  className="dropdown-item"
                  key={idx}
                  href={item.link}
                  target={item.target ?? ''}
                  onClick={item.onClick}
                >
                  {item.icon && <FontAwesomeIcon icon={item.icon} className="me-2" fixedWidth />}
                  {item.label}
                </CLink>
              ))}
            </CDropdownMenu>
          </CDropdown>
          <CDropdown variant="btn-group">
            <CDropdownToggle color={buttonColor}>
              <FontAwesomeIcon icon="external-link" className="me-2" />
              CIPP Actions
            </CDropdownToggle>
            <CDropdownMenu>
              {actions2.map((item, idx) => (
                <Link className="dropdown-item" key={idx} to={item.link} onClick={item.onClick}>
                  {item.icon && <FontAwesomeIcon icon={item.icon} className="me-2" fixedWidth />}
                  {item.label}
                </Link>
              ))}
            </CDropdownMenu>
          </CDropdown>
        </CCol>
      </CRow>
      <CRow className="mb-3">
        <CCol>
          <CRow>
            <CCol sm={12} md={4} className="mb-3">
              <CippContentCard title="Tenant Name" titleType="big">
                {currentTenant?.displayName}
                <CippCopyToClipboard text={currentTenant?.displayName} />
              </CippContentCard>
            </CCol>
            <CCol sm={12} md={4} className="mb-3">
              <CippContentCard title="Tenant ID" titleType="big">
                {currentTenant?.customerId}
                <CippCopyToClipboard text={currentTenant?.customerId} />
              </CippContentCard>
            </CCol>
            <CCol sm={12} md={4} className="mb-3">
              <CippContentCard title="Default Domain Name" titleType="big">
                {currentTenant?.defaultDomainName}
                <CippCopyToClipboard text={currentTenant?.defaultDomainName} />
              </CippContentCard>
            </CCol>
          </CRow>
          <CRow>
            <CCol sm={12} md={4} className="mb-3">
              <CippContentCard title="Domain Names" titleType="big">
                {!isFetchingOrg && issuccessOrg && (
                  <>
                    {organization.verifiedDomains?.slice(0, 3).map((item, idx) => (
                      <li key={idx}>{item.name}</li>
                    ))}
                    {organization.verifiedDomains?.length > 5 && (
                      <>
                        <CCollapse visible={domainVisible}>
                          {organization.verifiedDomains?.slice(3).map((item, idx) => (
                            <li key={idx}>{item.name}</li>
                          ))}
                        </CCollapse>
                        <CButton
                          size="sm"
                          className="mb-3"
                          onClick={() => setDomainVisible(!domainVisible)}
                        >
                          {domainVisible ? 'See less' : 'See more...'}
                        </CButton>
                      </>
                    )}
                  </>
                )}
              </CippContentCard>
            </CCol>
            <CCol sm={12} md={4} className="mb-3">
              <CippContentCard title="Partner Relationships" titleType="big">
                {(isLoadingPartners || isFetchingPartners) && <Skeleton />}
                {issuccessPartners &&
                  !isFetchingPartners &&
                  partners?.Results.map((partner, idx) => {
                    if (partner.TenantInfo) {
                      return (
                        <li key={`${partner.tenantId}-${idx}`}>
                          {partner.TenantInfo.displayName} ({partner.TenantInfo.defaultDomainName})
                        </li>
                      )
                    }
                  })}
              </CippContentCard>
            </CCol>
            <CCol sm={12} md={4} className="mb-3">
              <CippContentCard title="Tenant Capabilities" titleType="big">
                {(isLoadingOrg || isFetchingOrg) && <Skeleton />}
                {!isFetchingOrg &&
                  issuccessOrg &&
                  organization?.assignedPlans
                    ?.filter((p) => p.capabilityStatus == 'Enabled')
                    .reduce((plan, curr) => {
                      if (!plan.includes(curr.service)) {
                        plan.push(curr.service)
                      }
                      return plan
                    }, [])
                    .map((plan, idx) => (
                      <div key={idx}>
                        {plan === 'exchange' && <li>Exchange</li>}
                        {plan === 'AADPremiumService' && <li>AAD Premium</li>}
                        {plan === 'WindowsDefenderATP' && <li>Windows Defender</li>}
                      </div>
                    ))}
              </CippContentCard>
            </CCol>
          </CRow>
          <CRow>
            <CCol sm={12} md={4} className="mb-3">
              <CippContentCard title="Users" titleType="big">
                {(!issuccessUserCounts || isFetchingUserCount) && <Skeleton />}
                {issuccessUserCounts && !isFetchingUserCount && (
                  <CChart
                    type="pie"
                    data={{
                      labels: ['Total Users', 'Licensed Users', 'Guests', 'Global Admins'],
                      datasets: [
                        {
                          backgroundColor: [
                            getStyle('--cyberdrain-warning'),
                            getStyle('--cyberdrain-info'),
                            getStyle('--cyberdrain-success'),
                            getStyle('--cyberdrain-danger'),
                          ],
                          data: [
                            dashboard?.Users,
                            dashboard.LicUsers,
                            dashboard?.Guests,
                            GlobalAdminList.data?.Results.length || 0,
                          ],
                          borderWidth: 3,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        legend: {
                          position: 'left',
                          labels: {
                            color: getStyle('--cui-body-color'),
                          },
                          onClick: userChartLegendClickHandler,
                          onHover: (event) => {
                            event.native.target.style.cursor = 'pointer'
                          },
                          onLeave: (event) => {
                            event.native.target.style.cursor = 'default'
                          },
                        },
                      },
                    }}
                  />
                )}
              </CippContentCard>
            </CCol>
            <CCol sm={12} md={4} className="mb-3">
              <CippContentCard title="Standards set" titleType="big">
                {(isLoadingStandards || isFetchingStandards) && <Skeleton />}
                {issuccessStandards && !isFetchingStandards && (
                  <>
                    <CChart
                      className="mb-3"
                      type="bar"
                      data={{
                        labels: ['Remediation', 'Alert', 'Report', 'Total Available'],
                        datasets: [
                          {
                            label: 'Active Standards',
                            backgroundColor: getStyle('--cyberdrain-info'),
                            data: [
                              filteredStandards(true, 'remediate'),
                              filteredStandards(true, 'alert'),
                              filteredStandards(true, 'report'),
                              allStandardsList.length,
                            ],
                          },
                        ],
                      }}
                      labels="standards"
                      options={{
                        plugins: {
                          legend: {
                            labels: {
                              color: getStyle('--cui-body-color'),
                            },
                          },
                        },
                        scales: {
                          x: {
                            grid: {
                              display: false,
                            },
                            ticks: {
                              color: getStyle('--cui-body-color'),
                            },
                          },
                          y: {
                            grid: {
                              display: false,
                            },
                            ticks: {
                              color: getStyle('--cui-body-color'),
                            },
                          },
                        },
                      }}
                    />
                    Remediation Standards:
                    <small>{filteredStandards(false, 'remediate').slice(0, 5)}</small>
                    {filteredStandards(false, 'remediate').length > 5 && (
                      <>
                        <CCollapse visible={visible}>
                          <small> {filteredStandards(false, 'remediate').slice(5)}</small>
                        </CCollapse>
                        <CButton size="sm" className="mb-3" onClick={() => setVisible(!visible)}>
                          {visible ? 'See less' : 'See more...'}
                        </CButton>
                      </>
                    )}
                  </>
                )}
              </CippContentCard>
            </CCol>
            <CCol sm={12} md={4} className="mb-3">
              <CippContentCard title="SharePoint Quota" titleType="big">
                {(isLoadingSPQuota || isFetchingSPQuota) && <Skeleton />}
                {issuccessSPQuota &&
                  sharepoint.GeoUsedStorageMB === null &&
                  'No SharePoint Information available'}
                {sharepoint && !isFetchingSPQuota && sharepoint.GeoUsedStorageMB && (
                  <CChart
                    type="pie"
                    data={{
                      labels: [
                        `Used (${sharepoint.GeoUsedStorageMB}MB)`,
                        `Free (${sharepoint.TenantStorageMB - sharepoint.GeoUsedStorageMB}MB)`,
                      ],
                      datasets: [
                        {
                          backgroundColor: [
                            getStyle('--cyberdrain-warning'),
                            getStyle('--cyberdrain-info'),
                          ],
                          data: [
                            sharepoint.GeoUsedStorageMB,
                            sharepoint.TenantStorageMB - sharepoint.GeoUsedStorageMB,
                          ],
                          borderWidth: 3,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: getStyle('--cui-body-color'),
                          },
                        },
                      },
                    }}
                  />
                )}
              </CippContentCard>
            </CCol>
          </CRow>
        </CCol>
      </CRow>
    </>
  )
}

const Home = () => {
  const currentTenant = useSelector((state) => state.app.currentTenant)

  return (
    <>
      <CRow className="mb-3">
        <CCol>
          <CippContentCard className="h-100" title="Lighthouse Search" titleType="big">
            <CRow className="mb-3"></CRow>
            <CRow className="mb-3">
              <CCol>
                <UniversalSearch />
              </CCol>
            </CRow>
          </CippContentCard>
        </CCol>
      </CRow>
      {currentTenant?.customerId !== 'AllTenants' ? (
        <TenantDashboard />
      ) : (
        <CRow className="mb-3">
          <CCol sm={12}>
            <CippContentCard title="All Tenants" icon={faBook}>
              Select a Tenant to show the dashboard
            </CippContentCard>
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default Home
