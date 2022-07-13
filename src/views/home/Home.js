import React from 'react'
import { faBook, faExclamation } from '@fortawesome/free-solid-svg-icons'
import { CButton, CCallout } from '@coreui/react'
import { useLoadDashQuery, useLoadVersionsQuery } from 'src/store/api/app'
import { StatusIcon } from 'src/components/utilities'
import { CippContentCard, CippMasonry, CippMasonryItem } from 'src/components/layout'
import { CippTable } from 'src/components/tables'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Skeleton from 'react-loading-skeleton'

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
    <CippMasonry columns={4}>
      <>
        {dashboard?.Alerts && (
          <CippMasonryItem size="full">
            <CippContentCard title="Alerts" icon={faExclamation}>
              {dashboard.Alerts.map((mappedAlert, idx) => (
                <CCallout key={idx} color="danger">
                  {mappedAlert}
                </CCallout>
              ))}
            </CippContentCard>
          </CippMasonryItem>
        )}

        <CippMasonryItem size="card">
          <CippContentCard title="Next Run Standards" icon={faBook}>
            <div>{!isLoadingDash ? dashboard?.NextStandardsRun : <Skeleton />}</div>
          </CippContentCard>
        </CippMasonryItem>
        <CippMasonryItem size="card">
          <CippContentCard title="Next Run BPA" icon={faBook}>
            <div>{!isLoadingDash ? dashboard?.NextBPARun : <Skeleton />}</div>
          </CippContentCard>
        </CippMasonryItem>
        <CippMasonryItem size="card">
          <CippContentCard title="Queued Applications" icon={faBook}>
            <div>{!isLoadingDash ? dashboard?.queuedApps : <Skeleton />}</div>
          </CippContentCard>
        </CippMasonryItem>
        <CippMasonryItem size="card">
          <CippContentCard title="Queued Standards" icon={faBook}>
            <div> {!isLoadingDash ? dashboard?.queuedStandards : <Skeleton />}</div>
          </CippContentCard>
        </CippMasonryItem>
        <CippMasonryItem size="card">
          <CippContentCard title="Managed Tenants" icon={faBook}>
            <div>{!isLoadingDash ? dashboard?.tenantCount : <Skeleton />}</div>
            <br></br> Managed tenants
          </CippContentCard>
        </CippMasonryItem>
        <CippMasonryItem size="card">
          <CippContentCard title="Token refresh dates" icon={faBook}>
            <div className="mb-3">
              Refresh token: {!isLoadingDash ? dashboard?.RefreshTokenDate : ''}
            </div>

            <div className="mb-2">
              Exchange Token: {!isLoadingDash ? dashboard?.ExchangeTokenDate : ''}
            </div>
          </CippContentCard>
        </CippMasonryItem>
      </>
      <>
        <CippMasonryItem size="card">
          <CippContentCard title="Version Frontend" icon={faBook}>
            <StatusIcon type="negatedboolean" status={isSuccessVersion && versions.OutOfDateCIPP} />
            <div>Latest: {isSuccessVersion ? versions.RemoteCIPPVersion : <Skeleton />}</div>
            <div>Current: {isSuccessVersion ? versions.LocalCIPPVersion : <Skeleton />}</div>
          </CippContentCard>
        </CippMasonryItem>
        <CippMasonryItem size="card">
          <CippContentCard title="Version Backend" icon={faBook}>
            <StatusIcon
              type="negatedboolean"
              status={isSuccessVersion && versions.OutOfDateCIPPAPI}
            />
            <div>Latest: {isSuccessVersion ? versions.RemoteCIPPAPIVersion : <Skeleton />}</div>
            <div>Current: {isSuccessVersion ? versions.LocalCIPPAPIVersion : <Skeleton />}</div>
          </CippContentCard>
        </CippMasonryItem>
      </>
      <CippMasonryItem size="half">
        <CippContentCard title="Last logged items" icon={faBook}>
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
      </CippMasonryItem>
    </CippMasonry>
  )
}

export default Home
