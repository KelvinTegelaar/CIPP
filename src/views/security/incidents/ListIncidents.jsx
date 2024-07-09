import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCallout,
  CCardText,
  CListGroupItem,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
} from '@coreui/react'
import { CippTable, cellDateFormatter, CellTip } from 'src/components/tables'
import { useLazyExecIncidentsListQuery } from 'src/store/api/security'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPage } from 'src/components/layout'
import PropTypes from 'prop-types'
import {
  faEllipsisV,
  faEdit,
  faCheck,
  faRedo,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { useSelector } from 'react-redux'
import Skeleton from 'react-loading-skeleton'
import { authApi } from 'src/store/api/auth'
import classificationDetermination from 'src/data/classificationDetermination'
import { stringCamelCase } from 'src/components/utilities/CippCamelCase'

let userId
let locale = 'en-GB'
let index = 0

if (navigator?.language) {
  locale = navigator.language
}
const dateTimeArgs = [
  [locale, 'default'], // add fallback option if locale doesn't load properly
]
dateTimeArgs.push(true, true)

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

const ListIncidents = () => {
  const { data: profile } = authApi.endpoints.loadClientPrincipal.useQueryState()
  userId = profile.clientPrincipal.userDetails.toLowerCase()
  const tenant = useSelector((state) => state.app.currentTenant)
  const [execIncidentsList, results] = useLazyExecIncidentsListQuery()
  const { data: incidents = {}, isFetching, error } = results
  const { MSResults = [] } = incidents

  useEffect(() => {
    execIncidentsList({ tenantFilter: tenant.defaultDomainName })
  }, [execIncidentsList, tenant.defaultDomainName])
  const Offcanvas = (row, rowIndex, formatExtraData) => {
    let userAssign = row['AssignedTo']
    let displayAssign = row['AssignedTo']
    let displayRedirectedId = row['RedirectId']
    if (!userAssign) {
      userAssign = '' // Stops Microsoft setting the CIPP app as the user assigned if left null
      displayAssign = 'unassigned' // Instead of showing empty or 'null' in UI
    }
    if (!displayRedirectedId) {
      displayRedirectedId = 'not redirected'
    }

    let attributedComments = []

    const [ocVisible, setOCVisible] = useState(false)
    const extendedInfoRaw = [
      { label: 'Created Date', value: `${row['Created']}` },
      { label: 'Updated Date', value: `${row['Updated']}` },
      { label: 'Tenant', value: `${row['Tenant']}` },
      { label: 'ID', value: `${row['Id']}` },
      { label: 'Redirected ID', value: `${displayRedirectedId}` },
      { label: 'Display Name', value: `${row['DisplayName']}` },
      { label: 'Status', value: `${row['Status']}` },
      { label: 'Severity', value: `${row['Severity']}` },
      { label: 'Assigned To', value: `${displayAssign}` },
      { label: 'Classification', value: `${row['Classification']}` },
      { label: 'Determination', value: `${row['Determination']}` },
      { label: 'Incident URL', value: `${row['IncidentUrl']}` },
      { label: 'Tags', value: `${row['Tags']}` },
    ]
    let label = 'Comments'
    attributedComments.forEach((element) => {
      extendedInfoRaw.push({ label: label, value: element })
      label = ''
    })

    let keyIterate = 0

    function determinations(index = 0, current = 'unknown', classification = 'unknown') {
      let options = []
      let iterator = -1
      classificationDetermination.map(({ Classification, Determination }) =>
        Determination.forEach((element) => {
          if (
            iterator === index &&
            stringCamelCase(current).toLowerCase() === stringCamelCase(element).toLowerCase() &&
            stringCamelCase(Classification).toLowerCase() ===
              stringCamelCase(classification).toLowerCase()
          ) {
            options.push(
              <CListGroupItem
                className=""
                component="option"
                key={keyIterate++}
                selected={true}
                value={stringCamelCase(element)}
              >
                {element}
              </CListGroupItem>,
            )
          } else if (iterator === index) {
            options.push(
              <CListGroupItem
                className=""
                component="option"
                key={keyIterate++}
                value={stringCamelCase(element)}
              >
                {element}
              </CListGroupItem>,
            )
          }
        }, iterator++),
      )
      return options
    }

    function classifications(current = 'unknown', classification = 'unknown') {
      let citerator = 0
      return classificationDetermination.map(({ Classification }) => (
        <CListGroupItem
          className=""
          component="optgroup"
          key={keyIterate++}
          value={stringCamelCase(Classification)}
          label={Classification}
        >
          {determinations(citerator++, current, classification)}
        </CListGroupItem>
      ))
    }

    return (
      <>
        <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
          <FontAwesomeIcon icon={faEllipsisV} />
        </CButton>
        <CippActionsOffcanvas
          title="Incident Information"
          extendedInfo={extendedInfoRaw}
          actions={[
            {
              label: 'Assign to self',
              color: 'info',
              icon: <FontAwesomeIcon icon={faEdit} className="me-2" />,
              modal: true,
              modalUrl: `/api/ExecSetSecurityIncident?TenantFilter=${row.Tenant}&GUID=${row['Id']}&Assigned=${userId}&Redirected=${row['RedirectId']}`,
              modalMessage: 'Are you sure you want to assign this incident to yourself?',
            },
            {
              label: 'Set status to active',
              color: 'info',
              icon: <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />,
              modal: true,
              modalUrl: `/api/ExecSetSecurityIncident?TenantFilter=${row.Tenant}&GUID=${row['Id']}&Status=active&Assigned=${userAssign}&Redirected=${row['RedirectId']}`,
              modalMessage: 'Are you sure you want to set the status to active?',
            },
            {
              label: 'Set status to in progress',
              color: 'info',
              icon: <FontAwesomeIcon icon={faEdit} className="me-2" />,
              modal: true,
              modalUrl: `/api/ExecSetSecurityIncident?TenantFilter=${row.Tenant}&GUID=${row['Id']}&Status=inProgress&Assigned=${userAssign}&Redirected=${row['RedirectId']}`,
              modalMessage: 'Are you sure you want to set the status to in progress?',
            },
            {
              label: 'Set status to resolved',
              color: 'info',
              icon: <FontAwesomeIcon icon={faCheck} className="me-2" />,
              modal: true,
              modalUrl: `/api/ExecSetSecurityIncident?TenantFilter=${row.Tenant}&GUID=${row['Id']}&Status=resolved&Assigned=${userAssign}&Redirected=${row['RedirectId']}`,
              modalMessage: 'Are you sure you want to set the status to resolved?',
            },
          ]}
          actionsSelect={[
            {
              index: index++,
              label: 'Classification & Determination',
              color: 'info',
              id: 'classificationSelect',
              selectWords: classifications(row.Determination, row.Classification),
              url: `/api/ExecSetSecurityIncident?TenantFilter=${row.Tenant}&GUID=${row['Id']}&Determination={value1}&Classification={value2}&Redirected=${row['RedirectId']}`,
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
      name: ' Created Date (Local)',
      selector: (row) => row['Created'],
      sortable: true,
      cell: cellDateFormatter(),
      exportSelector: 'Created',
      minWidth: '155px',
    },
    {
      name: 'Tenant',
      selector: (row) => row['Tenant'],
      sortable: true,
      exportSelector: 'Tenant',
      cell: (row) => CellTip(row['Tenant']),
      minWidth: '150px',
    },
    {
      name: 'ID',
      selector: (row) => row['Id'],
      sortable: true,
      cell: (row) => CellTip(row['Id']),
      minWidth: '80px',
      maxWidth: '80px',
    },
    {
      name: 'Display Name',
      selector: (row) => row['DisplayName'],
      sortable: true,
      exportSelector: 'DisplayName',
      cell: (row) => CellTip(row['DisplayName']),
      minWidth: '450px',
    },
    {
      name: 'Status',
      selector: (row) => row['Status'],
      sortable: true,
      exportSelector: 'Status',
    },
    {
      name: 'Severity',
      selector: (row) => row['Severity'],
      sortable: true,
      cell: (row) => CellTip(row['Severity']),
      exportSelector: 'Severity',
      minWidth: '140px',
    },
    {
      name: 'Tags',
      selector: (row) => row['Tags'],
      sortable: true,
      cell: (row) => CellTip(row['Tags'].toString().replace(',', ', ')),
      exportSelector: 'Tags',
    },
    {
      name: 'Info & Actions',
      cell: Offcanvas,
    },
  ]

  return (
    <CippPage tenantSelector={false} showAllTenantSelector={false} title="List Incidents">
      <CCard className="content-card">
        <CCardHeader>
          <CCardTitle className="d-flex justify-content-between">
            Incidents List
            <CButton
              size="sm"
              onClick={() => execIncidentsList({ tenantFilter: tenant.defaultDomainName })}
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
            reportName={'Incidents-List-Report'}
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

export default ListIncidents
