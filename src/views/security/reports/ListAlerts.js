import React, { useEffect } from 'react'
import { CButton, CCallout, CCardGroup, CCardText } from '@coreui/react'
import { CippTable, cellDateFormatter } from 'src/components/tables'
import { CCard, CCardBody, CCardHeader, CCardTitle, CSpinner } from '@coreui/react'
import { useLazyExecAlertsListQuery } from 'src/store/api/security'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPage } from 'src/components/layout'
import PropTypes from 'prop-types'
import { faEllipsisV, faRedo } from '@fortawesome/free-solid-svg-icons'
import { ModalService } from 'src/components/utilities'

const AlertBox = ({ value, title, fetching }) => {
  let displayValue = value
  if (typeof value !== 'number') {
    displayValue = 'n/a'
  }

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

  const handleShowModal = (value) =>
    ModalService.open({
      title: 'More Information',
      body: (
        <div>
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
      ),
      size: 'xl',
    })

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
      selector: (row) => row['MSResults'],
      exportSelector: 'MSResults',
      sortable: true,
      cell: (row, index, column, id) => {
        const value = column.selector(row)

        return (
          <CButton size="sm" color="link" onClick={() => handleShowModal(value)}>
            <FontAwesomeIcon icon={faEllipsisV} />
          </CButton>
        )
      },
    },
  ]

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
      <CCard class="content-card">
        <CCardHeader>
          <CCardTitle className="d-flex justify-content-between">
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
