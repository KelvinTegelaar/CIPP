import React from 'react'
import {
  faBook,
  faExclamation,
  faHotel,
  faLaptop,
  faLaptopCode,
  faSearch,
  faUsers,
  faWrench,
} from '@fortawesome/free-solid-svg-icons'
import {
  CButton,
  CCallout,
  CCol,
  CDropdown,
  CDropdownToggle,
  CListGroup,
  CListGroupItem,
  CRow,
} from '@coreui/react'
import {
  useGenericGetRequestQuery,
  useLoadDashQuery,
  useLoadVersionsQuery,
} from 'src/store/api/app'
import { FastSwitcher, StatusIcon } from 'src/components/utilities'
import { CippContentCard } from 'src/components/layout'
import { CippTable } from 'src/components/tables'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Skeleton from 'react-loading-skeleton'
import { UniversalSearch } from 'src/components/utilities/UniversalSearch'
import { ListGroupContentCard } from 'src/components/contentcards'
import { useSelector } from 'react-redux'

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
  const { data: versions, isSuccess: isSuccessVersion } = useLoadVersionsQuery()
  const tableColumns = [
    {
      name: 'Tenant',
      selector: (row) => row['Tenant'],
      sortable: true,
    },
    {
      name: 'Message',
      selector: (row) => row['Message'],
      sortable: true,
    },
  ]
  return (
    <>
      <CRow className="justify-content-end">
        <CCol xs={1}>
          <CDropdown variant="input-group">
            <CDropdownToggle
              className="btn btn-primary mb-3"
              style={{
                backgroundColor: '#f88c1a',
              }}
            >
              Actions
            </CDropdownToggle>
          </CDropdown>
        </CCol>
      </CRow>
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
      <CRow className="mb-3">
        <CCol className="mb-3">
          <CippContentCard title="Total Users" icon={faUsers}>
            <div>{!isLoadingUserCounts ? dashboard?.Users : <Skeleton />}</div>
          </CippContentCard>
        </CCol>
        <CCol className="mb-3">
          <CippContentCard title="Total Licensed users" icon={faUsers}>
            <div>{!isLoadingUserCounts ? dashboard?.LicUsers : <Skeleton />}</div>{' '}
          </CippContentCard>
        </CCol>
        <CCol className="mb-3">
          <CippContentCard title="Global Admin Users" icon={faLaptopCode}>
            <div>{!isLoadingUserCounts ? dashboard?.Gas : <Skeleton />}</div>{' '}
          </CippContentCard>
        </CCol>
        <CCol className="mb-3">
          <CippContentCard title="Total Guests" icon={faHotel}>
            <div>{!isLoadingUserCounts ? dashboard?.Guests : <Skeleton />}</div>{' '}
          </CippContentCard>
        </CCol>
      </CRow>
      <CRow className="mb-3">
        <CippContentCard title="Current Tenant" icon={faBook}>
          <CRow className="mb-3">
            <CCol>
              <p className="fw-lighter">Tenant Name</p>
              {currentTenant?.displayName}
            </CCol>
            <CCol>
              <p className="fw-lighter">Tenant ID</p>
              {currentTenant?.customerId}
            </CCol>
            <CCol>
              <p className="fw-lighter">Default Domain Name</p>
              {currentTenant?.defaultDomainName}
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol>
              <p className="fw-lighter">Tenant Status</p>
              {currentTenant?.delegatedPrivilegeStatus}
            </CCol>
            <CCol>
              <p className="fw-lighter">Creation Date</p>
              {isLoadingOrg && <Skeleton />}
              {organization && organization?.createdDateTime}
            </CCol>
            <CCol>
              <p className="fw-lighter">Current Secure Score</p>
              {isLoadingOrg && <Skeleton />}
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol>
              <p className="fw-lighter">AD Connect Status</p>
              {isLoadingOrg && <Skeleton />}
              {JSON.stringify(organization?.onPremisesSyncStatus)}
            </CCol>
            <CCol>
              <p className="fw-lighter">Domain(s)</p>
              {isLoadingOrg && <Skeleton />}
              {organization?.verifiedDomains.map((item) => (
                <li>{item.name}</li>
              ))}
            </CCol>
            <CCol>
              <p className="fw-lighter">Capabilities</p>
              {isLoadingOrg && <Skeleton />}
              {organization &&
                JSON.stringify(organization.assignedPlans).includes('AADPremiumService') && (
                  <li>AAD Premium</li>
                )}
              {organization &&
                JSON.stringify(organization.assignedPlans).includes('WindowsDefenderATP') && (
                  <li>Windows Defender</li>
                )}
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol>
              <p className="fw-lighter">Applied Standards</p>
              {isLoadingOrg && <Skeleton />}
            </CCol>
            <CCol>
              <p className="fw-lighter">Last Results</p>
              {isLoadingOrg && <Skeleton />}
            </CCol>
            <CCol>
              <p className="fw-lighter">Access Type</p>
              {isLoadingOrg && <Skeleton />}
            </CCol>
          </CRow>
        </CippContentCard>
      </CRow>
    </>
  )
}

export default Home
