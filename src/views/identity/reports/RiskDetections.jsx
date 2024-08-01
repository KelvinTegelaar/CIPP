import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisV, faMinusCircle, faPaperPlane, faEye } from '@fortawesome/free-solid-svg-icons'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { Link, useSearchParams } from 'react-router-dom'

const RiskDetections = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const [ocVisible, setOCVisible] = useState(false)
    const viewLink = `/identity/administration/ViewBec?userId=${row.userId}&tenantDomain=${tenant.defaultDomainName}&ID=${row.userPrincipalName}`
    return (
      <>
        <Link to={viewLink}>
          <CButton size="sm" variant="ghost" color="success">
            <FontAwesomeIcon icon={faEye} />
          </CButton>
        </Link>
        <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
          <FontAwesomeIcon icon={faEllipsisV} />
        </CButton>
        <CippActionsOffcanvas
          title="Extended Information"
          extendedInfo={[
            {
              label: 'User ID',
              value: row.userId,
            },
            {
              label: 'Display Name',
              value: row.userDisplayName,
            },
            {
              label: 'User Principal',
              value: row.userPrincipalName,
            },
            {
              label: 'Detected Date Time',
              value: row.detectedDateTime,
            },
            {
              label: 'Location',
              value: `${row.location?.city} - ${row.location?.countryOrRegion}`,
            },
            {
              label: 'IP Address',
              value: row.ipAddress,
            },
            {
              label: 'Risk Level',
              value: row.riskLevel,
            },
            {
              label: 'Risk State',
              value: row.riskState,
            },
            {
              label: 'Risk Detail',
              value: row.riskDetail,
            },
            {
              label: 'Risk Event Type',
              value: row.riskEventType,
            },
            {
              label: 'Detection Timing Type',
              value: row.detectionTimingType,
            },
            {
              label: 'Activity',
              value: row.activity,
            },
          ]}
          actions={[
            {
              label: 'Research Compromised Account',
              link: `/identity/administration/ViewBec?userId=${row.userId}&tenantDomain=${tenant.defaultDomainName}&ID=${row.userPrincipalName}`,
              color: 'info',
            },
          ]}
          placement="end"
          visible={ocVisible}
          id={row.id}
          hideFunction={() => setOCVisible(false)}
        />
      </>
    )
  }

  const columns = [
    {
      name: 'Detected Date',
      selector: (row) => row['detectedDateTime'],
      sortable: true,
      exportSelector: 'detectedDateTime',
      minWidth: '150px',
    },
    {
      name: 'User Principal Name',
      selector: (row) => row['userPrincipalName'],
      sortable: true,
      exportSelector: 'userPrincipalName',
      minWidth: '200px',
    },
    {
      name: 'Location',
      selector: (row) => `${row.location?.city} - ${row.location?.countryOrRegion}`,
      sortable: true,
      exportSelector: 'Location',
      cell: (row) => CellTip(`${row.location?.city} - ${row.location?.countryOrRegion}`),
      minWidth: '40px',
    },
    {
      name: 'IP Address',
      selector: (row) => row['ipAddress'],
      sortable: true,
      exportSelector: 'ipAddress',
      minWidth: '40px',
    },
    {
      name: 'Risk State',
      selector: (row) => row['riskState'],
      sortable: true,
      exportSelector: 'riskState',
      minWidth: '40px',
    },
    {
      name: 'Risk Detail',
      selector: (row) => row['riskDetail'],
      sortable: true,
      exportSelector: 'riskDetail',
      minWidth: '200px',
    },
    {
      name: 'Risk Level',
      selector: (row) => row['riskLevel'],
      sortable: true,
      exportSelector: 'riskLevel',
      minWidth: '30px',
    },
    {
      name: 'Risk Type',
      selector: (row) => row['riskType'],
      sortable: true,
      exportSelector: 'riskType',
      minWidth: '150px',
    },
    {
      name: 'Risk Event Type',
      selector: (row) => row['riskEventType'],
      sortable: true,
      exportSelector: 'riskEventType',
      minWidth: '150px',
    },
    {
      name: 'Detection Type',
      selector: (row) => row['detectionTimingType'],
      sortable: true,
      exportSelector: 'detectionTimingType',
      minWidth: '50px',
    },
    {
      name: 'Activity',
      selector: (row) => row['activity'],
      sortable: true,
      exportSelector: 'activity',
      minWidth: '40px',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '100px',
    },
  ]

  return (
    <>
      <CippPageList
        title="Risk Detection Report"
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        datatable={{
          filterlist: [
            {
              filterName: 'State: atRisk',
              filter: 'Complex: riskState eq atRisk',
            },
            {
              filterName: 'State: confirmedCompromised',
              filter: 'Complex: riskState eq confirmedCompromised',
            },
            {
              filterName: 'State: confirmedSafe',
              filter: 'Complex: riskState eq confirmedSafe',
            },
            {
              filterName: 'State: dismissed',
              filter: 'Complex: riskState eq dismissed',
            },
            {
              filterName: 'State: remediated',
              filter: 'Complex: riskState eq remediated',
            },
            {
              filterName: 'State: unknownFutureValue',
              filter: 'Complex: riskState eq unknownFutureValue',
            },
          ],
          columns: columns,
          path: `api/ListGraphRequest`,
          reportName: `${tenant?.defaultDomainName}-RiskDetections-Report`,
          params: {
            TenantFilter: tenant.defaultDomainName,
            Endpoint: `identityProtection/riskDetections`,
            $count: true,
            $orderby: 'detectedDateTime desc',
            NoPagination: true,
            $top: 500,
          },
        }}
      />
    </>
  )
}

export default RiskDetections
