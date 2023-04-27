import React from 'react'
import {
  faBook,
  faCog,
  faEllipsisH,
  faEnvelope,
  faHotel,
  faLaptopCode,
  faSearch,
  faSync,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { CCol, CRow } from '@coreui/react'
import {
  useGenericGetRequestQuery,
  useLoadDashQuery,
  useLoadVersionsQuery,
} from 'src/store/api/app'
import { CippContentCard } from 'src/components/layout'
import Skeleton from 'react-loading-skeleton'
import { UniversalSearch } from 'src/components/utilities/UniversalSearch'
import { ActionContentCard, ListGroupContentCard } from 'src/components/contentcards'
import { useSelector } from 'react-redux'
import TimeAgo from 'javascript-time-ago'

import en from 'javascript-time-ago/locale/en.json'
TimeAgo.addDefaultLocale(en)
import ReactTimeAgo from 'react-time-ago'

const Home = () => {
  const currentTenant = useSelector((state) => state.app.currentTenant)
  const {
    data: organization,
    isLoading: isLoadingOrg,
    isSuccess: issuccessOrg,
  } = useGenericGetRequestQuery({
    path: '/api/ListOrg',
    params: { tenantFilter: currentTenant.defaultDomainName },
  })

  const {
    data: dashboard,
    isLoading: isLoadingUserCounts,
    isSuccess: issuccessUserCounts,
  } = useGenericGetRequestQuery({
    path: '/api/ListuserCounts',
    params: { tenantFilter: currentTenant.defaultDomainName },
  })

  const actions1 = [
    {
      label: 'M365 Admin',
      link: '#',
      icon: faCog,
    },
    {
      label: 'Exchange',
      link: '#',
      icon: faSync,
    },
    {
      label: 'Intune',
      link: '#',
      icon: faEnvelope,
    },
    {
      label: 'Entra',
      link: '#',
      icon: faEnvelope,
    },
    {
      label: 'Security',
      link: '#',
      icon: faEnvelope,
    },
  ]

  const actions2 = [
    {
      label: 'Edit Tenant',
      link: `/tenant/administration/tenants/Edit?customerId=${currentTenant.customerId}&tenantFilter=${currentTenant.defaultDomainName}`,
      icon: faCog,
    },
    {
      label: 'List Users',
      link: '#',
      icon: faSync,
    },
    {
      label: 'List Groups',
      link: '#',
      icon: faSync,
    },
    {
      label: 'Create User',
      link: '#',
      icon: faSync,
    },
    {
      label: 'Create Group',
      link: '#',
      icon: faEnvelope,
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
      <CRow>
        <CCol sm={12} md={3} className="mb-3">
          <CippContentCard title="Total Users" icon={faUsers}>
            <div>{!isLoadingUserCounts ? dashboard?.Users : <Skeleton />}</div>
          </CippContentCard>
        </CCol>
        <CCol sm={12} md={3} className="mb-3">
          <CippContentCard title="Total Licensed users" icon={faUsers}>
            <div>{!isLoadingUserCounts ? dashboard?.LicUsers : <Skeleton />}</div>{' '}
          </CippContentCard>
        </CCol>
        <CCol sm={12} md={3} className="mb-3">
          <CippContentCard title="Global Admin Users" icon={faLaptopCode}>
            <div>{!isLoadingUserCounts ? dashboard?.Gas : <Skeleton />}</div>{' '}
          </CippContentCard>
        </CCol>
        <CCol sm={12} md={3} className="mb-3">
          <CippContentCard title="Total Guests" icon={faHotel}>
            <div>{!isLoadingUserCounts ? dashboard?.Guests : <Skeleton />}</div>{' '}
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
                {currentTenant?.delegatedPrivilegeStatus}
              </CCol>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Creation Date</p>
                {isLoadingOrg && <Skeleton />}
                {organization && organization?.createdDateTime}
              </CCol>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Current Secure Score</p>
                {isLoadingOrg && <Skeleton />}
              </CCol>
            </CRow>
            <CRow>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">AD Connect Status</p>
                {isLoadingOrg && <Skeleton />}
                {!isLoadingOrg && organization?.onPremisesSyncEnabled ? (
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
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Domain(s)</p>
                {isLoadingOrg && <Skeleton />}
                {organization?.verifiedDomains.map((item) => (
                  <li>{item.name}</li>
                ))}
              </CCol>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Capabilities</p>
                {isLoadingOrg && <Skeleton />}
                {organization?.assignedPlans
                  .filter((p) => p.capabilityStatus == 'Enabled')
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
            </CRow>
            <CRow>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Applied Standards</p>
                {isLoadingOrg && <Skeleton />}
              </CCol>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Last Results</p>
                {isLoadingOrg && <Skeleton />}
              </CCol>
              <CCol sm={12} md={4} className="mb-3">
                <p className="fw-lighter">Access Type</p>
                {isLoadingOrg && <Skeleton />}
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
  )
}

export default Home
