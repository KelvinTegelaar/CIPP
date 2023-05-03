import React from 'react'
import { faBook, faExclamation, faSearch } from '@fortawesome/free-solid-svg-icons'
import { CButton, CCallout, CCol, CRow } from '@coreui/react'
import { useLoadDashQuery, useLoadVersionsQuery } from 'src/store/api/app'
import { FastSwitcher, StatusIcon } from 'src/components/utilities'
import { CippContentCard } from 'src/components/layout'
import { CippTable } from 'src/components/tables'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Skeleton from 'react-loading-skeleton'
import { UniversalSearch } from 'src/components/utilities/UniversalSearch'

const Home = () => {
  const { data: versions, isSuccess: isSuccessVersion } = useLoadVersionsQuery()
  const { data: dashboard, isLoading: isLoadingDash, isSuccess: issuccessDash } = useLoadDashQuery()
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
      <CRow>
        <CCol className="mb-3" xs={12} lg={6} xl={6}>
          <CippContentCard className="h-100" title="Lighthouse Search" icon={faSearch}>
            <CRow className="mb-3"></CRow>
            <CRow className="mb-3">
              <CCol>
                <UniversalSearch />
              </CCol>
            </CRow>
          </CippContentCard>
        </CCol>

        <CCol className="mb-3" xs={12} lg={6} xl={6}>
          <CippContentCard className="h-100" title="Alerts" icon={faExclamation}>
            {!isLoadingDash && dashboard.Alerts ? (
              dashboard.Alerts.map((mappedAlert, idx) => (
                <CCallout key={idx} color="danger">
                  {mappedAlert}
                </CCallout>
              ))
            ) : (
              <CCallout color="info">No Active Alerts</CCallout>
            )}
          </CippContentCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol className="mb-3" xs={12} lg={2} xl={3}>
          <CippContentCard title="Next Run Standards" icon={faBook}>
            <div>{!isLoadingDash ? dashboard?.NextStandardsRun : <Skeleton />}</div>
          </CippContentCard>
        </CCol>
        <CCol className="mb-3" xs={12} lg={2} xl={3}>
          <CippContentCard title="Next Run BPA" icon={faBook}>
            <div>{!isLoadingDash ? dashboard?.NextBPARun : <Skeleton />}</div>
          </CippContentCard>
        </CCol>
        <CCol className="mb-3" xs={12} lg={2} xl={3}>
          <CippContentCard title="Queued Applications" icon={faBook}>
            <div>{!isLoadingDash ? dashboard?.queuedApps : <Skeleton />}</div>
          </CippContentCard>
        </CCol>
        <CCol className="mb-3" xs={12} lg={2} xl={3}>
          <CippContentCard title="Queued Standards" icon={faBook}>
            <div> {!isLoadingDash ? dashboard?.queuedStandards : <Skeleton />}</div>
          </CippContentCard>
        </CCol>
        <CCol className="mb-3" xs={12} lg={2} xl={3}>
          <CippContentCard title="Managed Tenants" icon={faBook}>
            <div>{!isLoadingDash ? dashboard?.tenantCount : <Skeleton />}</div>
          </CippContentCard>
        </CCol>
        <CCol className="mb-3" xs={12} lg={2} xl={3}>
          <CippContentCard title="Token Refresh Date" icon={faBook}>
            <div className="mb-3">
              Refresh Token: {!isLoadingDash ? dashboard?.RefreshTokenDate : ''}
            </div>
          </CippContentCard>
        </CCol>
        <CCol className="mb-3" xs={12} lg={2} xl={3}>
          <CippContentCard title="Version Frontend" icon={faBook}>
            <StatusIcon type="negatedboolean" status={isSuccessVersion && versions.OutOfDateCIPP} />
            <div>Latest: {isSuccessVersion ? versions.RemoteCIPPVersion : <Skeleton />}</div>
            <div>Current: {isSuccessVersion ? versions.LocalCIPPVersion : <Skeleton />}</div>
          </CippContentCard>
        </CCol>
        <CCol className="mb-3" xs={12} lg={2} xl={3}>
          <CippContentCard title="Version Backend" icon={faBook}>
            <StatusIcon
              type="negatedboolean"
              status={isSuccessVersion && versions.OutOfDateCIPPAPI}
            />
            <div>Latest: {isSuccessVersion ? versions.RemoteCIPPAPIVersion : <Skeleton />}</div>
            <div>Current: {isSuccessVersion ? versions.LocalCIPPAPIVersion : <Skeleton />}</div>
          </CippContentCard>
        </CCol>
        <CCol>
          <CippContentCard title="Last Logged Items" icon={faBook}>
            {!isLoadingDash && issuccessDash && (
              <CippTable
                reportName="none"
                tableProps={{ subheader: false }}
                data={dashboard.LastLog}
                columns={tableColumns}
              />
            )}
            {isLoadingDash && <Skeleton count={10} />}
            <Link to="/cipp/logs">
              <CButton className="m-1" color="primary">
                <FontAwesomeIcon icon={faBook} className="pe-1" /> Jump to log
              </CButton>
            </Link>
          </CippContentCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Home
