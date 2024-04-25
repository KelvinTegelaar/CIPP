import React, { useState } from 'react'
import {
  faBook,
  faCog,
  faEllipsisH,
  faHotel,
  faLaptopCode,
  faMailBulk,
  faSearch,
  faUser,
  faUserFriends,
  faUserPlus,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { CButton, CCol, CCollapse, CRow } from '@coreui/react'
import { useGenericGetRequestQuery } from 'src/store/api/app'
import { CippContentCard } from 'src/components/layout'
import Skeleton from 'react-loading-skeleton'
import { UniversalSearch } from 'src/components/utilities/UniversalSearch'
import { ActionContentCard } from 'src/components/contentcards'
import { useSelector } from 'react-redux'
import allStandardsList from 'src/data/standards'
import Portals from 'src/data/portals'
import { Link } from 'react-router-dom'
import { TableModalButton } from 'src/components/buttons'
import CippCopyToClipboard from 'src/components/utilities/CippCopyToClipboard'
import { CChart } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'

const Home = () => {
  const [visible, setVisible] = useState(false)
  const [domainVisible, setDomainVisible] = useState(false)
  const currentTenant = useSelector((state) => state.app.currentTenant)
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

  return (
    <>
      <CRow className="mb-3">
        <CCol>
          <CippContentCard className="h-100" title="Lighthouse Search" icon={faSearch}>
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
        <>
          <CRow>
            <CCol sm={12} md={6} xl={3} className="mb-3">
              <CippContentCard title="Total Users" icon={faUsers}>
                <Link
                  to={'/identity/administration/users?customerId=' + currentTenant.customerId}
                  className="stretched-link"
                />
                <div>
                  {issuccessUserCounts && !isFetchingUserCount ? dashboard?.Users : <Skeleton />}
                </div>
              </CippContentCard>
            </CCol>
            <CCol sm={12} md={6} xl={3} className="mb-3">
              <CippContentCard title="Total Licensed users" icon={faUsers}>
                <Link
                  to={
                    '/identity/administration/users?customerId=' +
                    currentTenant.customerId +
                    '&tableFilter=Graph%3A+assignedLicenses%2F%24count+ne+0'
                  }
                  className="stretched-link"
                />
                <div>
                  {issuccessUserCounts && !isFetchingUserCount ? dashboard?.LicUsers : <Skeleton />}
                </div>
              </CippContentCard>
            </CCol>
            <CCol sm={12} md={6} xl={3} className="mb-3">
              <CippContentCard title="Global Admin Users" icon={faLaptopCode}>
                {GlobalAdminList.isSuccess ? (
                  <>
                    <TableModalButton
                      className="stretched-link text-decoration-none"
                      data={GlobalAdminList.data?.Results}
                      countOnly={true}
                      component="a"
                      color="link"
                      title="Global Admins"
                    />
                  </>
                ) : (
                  <Skeleton />
                )}
              </CippContentCard>
            </CCol>
            <CCol sm={12} md={6} xl={3} className="mb-3">
              <CippContentCard title="Total Guests" icon={faHotel}>
                <Link
                  to={
                    '/identity/administration/users?customerId=' +
                    currentTenant.customerId +
                    '&tableFilter=Graph%3A+usertype+eq+%27guest%27'
                  }
                  className="stretched-link"
                />
                <div>
                  {issuccessUserCounts && !isFetchingUserCount ? dashboard?.Guests : <Skeleton />}
                </div>
              </CippContentCard>
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol>
              <CRow>
                <CCol sm={12} md={4} className="mb-3">
                  <CippContentCard title="Tenant Name" icon={faBook}>
                    {currentTenant?.displayName}
                    <CippCopyToClipboard text={currentTenant?.displayName} />
                  </CippContentCard>
                </CCol>
                <CCol sm={12} md={4} className="mb-3">
                  <CippContentCard title="Tenant ID" icon={faBook}>
                    {currentTenant?.customerId}
                    <CippCopyToClipboard text={currentTenant?.customerId} />
                  </CippContentCard>
                </CCol>
                <CCol sm={12} md={4} className="mb-3">
                  <CippContentCard title="Default Domain Name" icon={faBook}>
                    {currentTenant?.defaultDomainName}
                    <CippCopyToClipboard text={currentTenant?.defaultDomainName} />
                  </CippContentCard>
                </CCol>
              </CRow>
              <CRow>
                <CCol sm={12} md={4} className="mb-3">
                  <CippContentCard title="Domain Names" icon={faBook}>
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
                  <CippContentCard title="Partner Relationships" icon={faBook}>
                    {(isLoadingPartners || isFetchingPartners) && <Skeleton />}
                    {issuccessPartners &&
                      !isFetchingPartners &&
                      partners?.Results.map((partner, idx) => {
                        if (partner.TenantInfo) {
                          return (
                            <li key={`${partner.tenantId}-${idx}`}>
                              {partner.TenantInfo.displayName} (
                              {partner.TenantInfo.defaultDomainName})
                            </li>
                          )
                        }
                      })}
                  </CippContentCard>
                </CCol>
                <CCol sm={12} md={4} className="mb-3">
                  <CippContentCard title="Tenant Capabilities" icon={faBook}>
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
                  <CippContentCard title="Users">
                    {(!issuccessUserCounts || isFetchingUserCount) && <Skeleton />}
                    {issuccessUserCounts && (
                      <CChart
                        type="doughnut"
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
                <CCol sm={12} md={4} className="mb-3">
                  <CippContentCard title="Standards set">
                    {(isLoadingStandards || isFetchingStandards) && <Skeleton />}
                    {issuccessStandards && !isFetchingStandards && (
                      <>
                        <CChart
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
                            <CButton
                              size="sm"
                              className="mb-3"
                              onClick={() => setVisible(!visible)}
                            >
                              {visible ? 'See less' : 'See more...'}
                            </CButton>
                          </>
                        )}
                      </>
                    )}
                  </CippContentCard>
                </CCol>
                <CCol sm={12} md={4} className="mb-3">
                  <CippContentCard title="SharePoint Quota">
                    {(isLoadingSPQuota || isFetchingSPQuota) && <Skeleton />}
                    {issuccessSPQuota &&
                      sharepoint.GeoUsedStorageMB === null &&
                      'No SharePoint Information available'}
                    {sharepoint && !isFetchingSPQuota && sharepoint.GeoUsedStorageMB && (
                      <CChart
                        type="doughnut"
                        data={{
                          labels: ['Used', 'Free'],
                          datasets: [
                            {
                              backgroundColor: [
                                getStyle('--cyberdrain-warning'),
                                getStyle('--cyberdrain-info'),
                              ],
                              data: [sharepoint.GeoUsedStorageMB, sharepoint.TenantStorageMB],
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
          <CRow className="mb-3">
            <CCol className="mb-3">
              <ActionContentCard title="Portals" icon={faEllipsisH} content={actions1} />
            </CCol>
            <CCol className="mb-3">
              <ActionContentCard title="CIPP Actions" icon={faEllipsisH} content={actions2} />
            </CCol>
          </CRow>
        </>
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
