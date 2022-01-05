import React, { useEffect } from 'react'
import { CButton, CCallout, CCardGroup, CCardText } from '@coreui/react'
import { CippTable, cellDateFormatter } from '../../../components/cipp'
import { CCard, CCardBody, CCardHeader, CCardTitle, CSpinner } from '@coreui/react'
import { useLazyExecAlertsListQuery } from '../../../store/api/security'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPage } from '../../../components'
import PropTypes from 'prop-types'
import { faRedo } from '@fortawesome/free-solid-svg-icons'

const columns = [
  {
    name: 'Date',
    selector: (row) => row['EventDateTime'],
    sortable: true,
    cell: cellDateFormatter(),
  },
  {
    name: 'Tenant',
    selector: (row) => row['Tenant'],
    sortable: true,
  },
  {
    name: 'Title',
    selector: (row) => row['Title'],
    sortable: true,
  },
  {
    name: 'Severity',
    selector: (row) => row['Severity'],
    sortable: true,
  },
  {
    name: 'Status',
    selector: (row) => row['Status'],
    sortable: true,
  },
  {
    name: 'RawResult',
    selector: (row) => row['RawResult'],
    sortable: true,
  },
]

const AlertBox = ({ value, title, fetching }) => {
  const displayValue = value ? value : 'n/a'
  return (
    <CCard>
      <CCardBody>
        <CCardTitle>{title}</CCardTitle>
        <CCardText>{fetching ? <CSpinner /> : displayValue}</CCardText>
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
    execAlertsList()
  }, [execAlertsList])

  return (
    <CippPage tenantSelector={false} title="List Alerts">
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
      <CCard>
        <CCardHeader>
          <CCardTitle className="text-primary d-flex justify-content-between">
            Alerts List
            <CButton size="sm" onClick={() => execAlertsList()} disabled={isFetching}>
              {!isFetching && <FontAwesomeIcon icon={faRedo} className="me-2" />}
              Refresh
            </CButton>
          </CCardTitle>
        </CCardHeader>
        <CCardBody>
          {isFetching && (
            <CCallout color="info">
              Warning! This page is pulling data from all your tenants and may take a minute or two
              to load.
            </CCallout>
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
