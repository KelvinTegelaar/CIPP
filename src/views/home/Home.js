import React from 'react'
import {
  faBook,
  faCog,
  faEllipsisH,
  faHotel,
  faLaptopCode,
  faMailBulk,
  faSearch,
  faShieldAlt,
  faSync,
  faUser,
  faUserAlt,
  faUserFriends,
  faUserPlus,
  faUsers,
  faServer,
} from '@fortawesome/free-solid-svg-icons'
import { CCol, CRow } from '@coreui/react'
import { useGenericGetRequestQuery } from 'src/store/api/app'
import { CippContentCard } from 'src/components/layout'
import Skeleton from 'react-loading-skeleton'
import { UniversalSearch } from 'src/components/utilities/UniversalSearch'
import { ActionContentCard } from 'src/components/contentcards'
import { useSelector } from 'react-redux'
import allStandardsList from 'src/data/standards'
import ReactTimeAgo from 'react-time-ago'
import { CellDelegatedPrivilege } from 'src/components/tables/CellDelegatedPrivilege'
import Portals from 'src/data/portals'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Home = () => {
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
    data: standards,
    isLoading: isLoadingStandards,
    isSuccess: issuccessStandards,
    isFetching: isFetchingStandards,
  } = useGenericGetRequestQuery({
    path: '/api/ListStandards',
    params: {},
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
                <div>
                  {issuccessUserCounts && !isFetchingUserCount ? dashboard?.Users : <Skeleton />}
                </div>
              </CippContentCard>
            </CCol>
            <CCol sm={12} md={6} xl={3} className="mb-3">
              <CippContentCard title="Total Licensed users" icon={faUsers}>
                <div>
                  {issuccessUserCounts && !isFetchingUserCount ? dashboard?.LicUsers : <Skeleton />}
                </div>
              </CippContentCard>
            </CCol>
            <CCol sm={12} md={6} xl={3} className="mb-3">
              <CippContentCard title="Global Admin Users" icon={faLaptopCode}>
                <div>
                  {issuccessUserCounts && !isFetchingUserCount ? dashboard?.Gas : <Skeleton />}
                </div>
              </CippContentCard>
            </CCol>
            <CCol sm={12} md={6} xl={3} className="mb-3">
              <CippContentCard title="Total Guests" icon={faHotel}>
                <div>
                  {issuccessUserCounts && !isFetchingUserCount ? dashboard?.Guests : <Skeleton />}
                </div>
              </CippContentCard>
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol>
              <CippContentCard title="Current Tenant" icon={faBook}>
                <CRow>
                  <CCol sm={12} md={4} className="mb-3">
                    <p className="fw-lighter">Tenant Name</p>
                    {currentTenant?.displayName}
                  </CCol>
                  <CCol sm={12} md={4} className="mb-3">
                    <p className="fw-lighter">Tenant ID</p>
                    {currentTenant?.customerId}
                  </CCol>
                  <CCol sm={12} md={4} className="mb-3">
                    <p className="fw-lighter">Default Domain Name</p>
                    {currentTenant?.defaultDomainName}
                  </CCol>
                </CRow>
                <CRow>
                  <CCol sm={12} md={4} className="mb-3">
                    <p className="fw-lighter">Tenant Status</p>
                    <CellDelegatedPrivilege cell={currentTenant?.delegatedPrivilegeStatus} />
                  </CCol>
                  <CCol sm={12} md={4} className="mb-3">
                    <p className="fw-lighter">Creation Date</p>
                    {(isLoadingOrg || isFetchingOrg) && <Skeleton />}
                    {organization && !isFetchingOrg && organization?.createdDateTime}
                  </CCol>
                  <CCol sm={12} md={4} className="mb-3">
                    <p className="fw-lighter">AD Connect Status</p>
                    {(isLoadingOrg || isFetchingOrg) && <Skeleton />}
                    {!isLoadingOrg && !isFetchingOrg && organization?.onPremisesSyncEnabled ? (
                      <>
                        <li>
                          <span class="me-1">Directory Sync:</span>
                          {organization?.onPremisesLastSyncDateTime ? (
                            <ReactTimeAgo date={organization?.onPremisesLastSyncDateTime} />
                          ) : (
                            'Never'
                          )}
                        </li>
                        <li>
                          <span class="me-1">Password Sync:</span>
                          {organization?.onPremisesLastPasswordSyncDateTime ? (
                            <ReactTimeAgo date={organization?.onPremisesLastPasswordSyncDateTime} />
                          ) : (
                            'Never'
                          )}
                        </li>
                      </>
                    ) : (
                      'Disabled'
                    )}
                  </CCol>
                </CRow>
                <CRow>
                  <CCol sm={12} md={4} className="mb-3">
                    <p className="fw-lighter">Domain(s)</p>
                    {(isLoadingOrg || isFetchingOrg) && <Skeleton />}
                    {!isFetchingOrg &&
                      issuccessOrg &&
                      organization?.verifiedDomains?.map((item) => <li>{item.name}</li>)}
                  </CCol>
                  <CCol sm={12} md={4} className="mb-3">
                    <p className="fw-lighter">Capabilities</p>
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
                        .map((plan) => (
                          <>
                            {plan == 'exchange' && <li>Exchange</li>}
                            {plan == 'AADPremiumService' && <li>AAD Premium</li>}
                            {plan == 'WindowsDefenderATP' && <li>Windows Defender</li>}
                          </>
                        ))}
                  </CCol>
                  <CCol sm={12} md={4} className="mb-3">
                    <p className="fw-lighter">Sharepoint Quota</p>
                    {(isLoadingSPQuota || isFetchingSPQuota) && <Skeleton />}
                    {sharepoint && !isFetchingSPQuota && sharepoint?.Dashboard}
                  </CCol>
                  <CCol sm={12} md={4} className="mb-3">
                    <p className="fw-lighter">Applied Standards</p>
                    {(isLoadingStandards || isFetchingStandards) && <Skeleton />}
                    {issuccessStandards &&
                      !isFetchingStandards &&
                      standards
                        .filter(
                          (p) =>
                            p.displayName == 'AllTenants' ||
                            p.displayName == currentTenant.defaultDomainName,
                        )
                        .flatMap((tenant) => {
                          return Object.keys(tenant.standards).map((standard) => {
                            const standardDisplayname = allStandardsList.filter((p) =>
                              p.name.includes(standard),
                            )
                            return (
                              <li key={`${standard}-${tenant.displayName}`}>
                                {standardDisplayname[0]?.label} ({tenant.displayName})
                              </li>
                            )
                          })
                        })}
                  </CCol>
                  <CCol sm={12} md={4} className="mb-3">
                    <p className="fw-lighter">Partner Relationships</p>
                    {(isLoadingPartners || isFetchingPartners) && <Skeleton />}
                    {issuccessPartners &&
                      !isFetchingPartners &&
                      partners.map((partner) => {
                        if (partner.TenantInfo) {
                          return (
                            <li key={`${partner.tenantId}`}>
                              {partner.TenantInfo.displayName} (
                              {partner.TenantInfo.defaultDomainName})
                            </li>
                          )
                        }
                      })}
                  </CCol>
                </CRow>
              </CippContentCard>
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
