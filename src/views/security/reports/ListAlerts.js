import React, { useEffect, useState } from 'react'
import { CButton, CCallout, CCardGroup, CCardText } from '@coreui/react'
import { CippTable, cellDateFormatter } from 'src/components/tables'
import { CCard, CCardBody, CCardHeader, CCardTitle } from '@coreui/react'
import { useLazyExecAlertsListQuery } from 'src/store/api/security'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPage } from 'src/components/layout'
import PropTypes from 'prop-types'
import { faEye, faRedo, faEdit, faCheck } from '@fortawesome/free-solid-svg-icons'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { useSelector } from 'react-redux'
import Skeleton from 'react-loading-skeleton'

const AlertBox = ({ value, title, fetching }) => {
  let displayValue = value
  if (typeof value !== 'number') {
    displayValue = 'n/a'
  }

  return (
    <CCard>
      <CCardBody>
        <CCardTitle>{title}</CCardTitle>
        <CCardText>{fetching ? <Skeleton width={'20%'} /> : displayValue}</CCardText>
      </CCardBody>
    </CCard>
  )
}
AlertBox.propTypes = {
  value: PropTypes.number,
  title: PropTypes.string,
  fetching: PropTypes.bool,
}

const ListAlerts = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [execAlertsList, results] = useLazyExecAlertsListQuery()
  const { data: alerts = {}, isFetching, error } = results
  const {
    NewAlertsCount,
    InProgressAlertsCount,
    SeverityHighAlertsCount,
    SeverityMediumAlertsCount,
    SeverityLowAlertsCount,
    SeverityInformationalCount,
    MSResults = [],
  } = alerts

  useEffect(() => {
    execAlertsList({ tenantFilter: tenant.defaultDomainName })
  }, [execAlertsList, tenant.defaultDomainName])
  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const [ocVisible, setOCVisible] = useState(false)
    const extendedInfoRaw = [
      { label: 'Created on', value: `${row.RawResult.eventDateTime}` },
      { label: 'Title', value: `${row.RawResult.title}` },
      { label: 'Category', value: `${row.RawResult.category}` },
      { label: 'Status', value: `${row.Status}` },
      { label: 'Severity', value: `${row.Severity}` },
      { label: 'Tenant', value: `${row.Tenant}` },
    ]
    const mappedUsers = row.InvolvedUsers.map((user, idx) => ({
      label: `Involved user ${idx}`,
      value: `${user.userPrincipalName} - (${
        user.logonLocation ? user.logonLocation : user.logonIp
      })`,
    }))
    const extendedInfo = extendedInfoRaw.concat(mappedUsers)
    return (
      <>
        <CButton size="sm" color="success" variant="ghost" onClick={() => setOCVisible(true)}>
          <FontAwesomeIcon icon={faEye} />
        </CButton>
        <CippActionsOffcanvas
          title="Alert Information"
          extendedInfo={extendedInfo}
          actions={[
            // {
            //   label: 'View source alert in compliance center',
            //   link: `${row.RawResult.sourceMaterials[0]}`,
            //   icon: <FontAwesomeIcon icon={faEye} className="me-2" />,
            //   external: true,
            //   color: 'info',
            // },
            {
              label: 'Set status to In Progress',
              color: 'info',
              icon: <FontAwesomeIcon icon={faEdit} className="me-2" />,
              modal: true,
              modalUrl: `/api/ExecSetSecurityAlert?TenantFilter=${row.Tenant}&GUID=${row.RawResult.id}&Status=inProgress&Vendor=${row.RawResult.vendorInformation.vendor}&provider=${row.RawResult.vendorInformation.provider}`,
              modalMessage: 'Are you sure you want to set the status to In Progress?',
            },
            {
              label: 'Set Status to Resolved',
              color: 'info',
              icon: <FontAwesomeIcon icon={faCheck} className="me-2" />,
              modal: true,
              modalUrl: `/api/ExecSetSecurityAlert?TenantFilter=${row.Tenant}&GUID=${row.RawResult.id}&Status=resolved&Vendor=${row.RawResult.vendorInformation.vendor}&provider=${row.RawResult.vendorInformation.provider}`,
              modalMessage: 'Are you sure you want to set the status to Resolved?',
            },
          ]}
          placement="end"
          visible={ocVisible}
          id={row.GUID}
          hideFunction={() => setOCVisible(false)}
        />
      </>
    )
  }

  const columns = [
    {
      name: 'Date',
      selector: (row) => row['EventDateTime'],
      sortable: true,
      cell: cellDateFormatter(),
      exportSelector: 'EventDateTime',
    },
    {
      name: 'Tenant',
      selector: (row) => row['Tenant'],
      sortable: true,
      exportSelector: 'Tenant',
    },
    {
      name: 'Title',
      selector: (row) => row['Title'],
      sortable: true,
      exportSelector: 'Title',
    },
    {
      name: 'Severity',
      selector: (row) => row['Severity'],
      sortable: true,
      exportSelector: 'Severity',
    },
    {
      name: 'Status',
      selector: (row) => row['Status'],
      sortable: true,
      exportSelector: 'Status',
    },
    {
      name: 'More Info',
      cell: Offcanvas,
    },
  ]

  return (
    <CippPage tenantSelector={false} showAllTenantSelector={false} title="List Alerts">
      <CCardGroup>
        <AlertBox value={NewAlertsCount} title="New Alerts" fetching={isFetching} />
        <AlertBox value={InProgressAlertsCount} title="In Progress Alerts" fetching={isFetching} />
        <AlertBox
          value={SeverityHighAlertsCount}
          title="High Severity Alerts"
          fetching={isFetching}
        />
        <AlertBox
          value={SeverityMediumAlertsCount}
          title="Medium Severity Alerts"
          fetching={isFetching}
        />
        <AlertBox
          value={SeverityLowAlertsCount}
          title="Low Severity Alerts"
          fetching={isFetching}
        />
        <AlertBox
          value={SeverityInformationalCount}
          title="Informational Alerts"
          fetching={isFetching}
        />
      </CCardGroup>
      <CCard className="content-card">
        <CCardHeader>
          <CCardTitle className="d-flex justify-content-between">
            Alerts List
            <CButton
              size="sm"
              onClick={() => execAlertsList({ tenantFilter: tenant.defaultDomainName })}
              disabled={isFetching}
            >
              {!isFetching && <FontAwesomeIcon icon={faRedo} className="me-2" />}
              Refresh
            </CButton>
          </CCardTitle>
        </CCardHeader>
        <CCardBody>
          {isFetching && (
            <CCallout color="info">Warning! This page may take a minute or two to load.</CCallout>
          )}
          <CippTable
            reportName={'Alerts-List-Report'}
            isFetching={isFetching}
            error={error}
            data={MSResults}
            columns={columns}
            keyField="Id"
          />
        </CCardBody>
      </CCard>
    </CippPage>
  )
}

export default ListAlerts
