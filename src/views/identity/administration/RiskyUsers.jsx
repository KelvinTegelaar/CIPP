import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisV, faMinusCircle, faPaperPlane, faEye } from '@fortawesome/free-solid-svg-icons'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { Link, useSearchParams } from 'react-router-dom'

const RiskyUsers = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const [ocVisible, setOCVisible] = useState(false)
    const viewLink = `/identity/administration/ViewBec?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}&ID=${row.userPrincipalName}`
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
              value: row.id,
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
              label: 'riskLastUpdatedDateTime',
              value: row.riskLastUpdatedDateTime,
            },
            {
              label: 'riskLevel',
              value: row.riskLevel,
            },
            {
              label: 'riskState',
              value: row.riskState,
            },
            {
              label: 'riskDetail',
              value: row.riskDetail,
            },
            {
              label: 'isProcessing',
              value: row.isProcessing,
            },
            {
              label: 'isDeleted',
              value: row.isDeleted,
            },
          ]}
          actions={[
            {
              label: 'Research Compromised Account',
              link: `/identity/administration/ViewBec?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}&ID=${row.userPrincipalName}`,
              color: 'info',
            },
            {
              label: 'Dismiss User Risk',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecDismissRiskyUser?TenantFilter=${tenant.defaultDomainName}&userid=${row.id}&userDisplayName=${row.userDisplayName}`,
              modalMessage: 'Are you sure you want to dismiss this users risk?',
              icon: <FontAwesomeIcon icon={faPaperPlane} className="me-2" />,
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
      name: 'Risk Last Updated Date',
      selector: (row) => row['riskLastUpdatedDateTime'],
      sortable: true,
      exportSelector: 'riskLastUpdatedDateTime',
    },
    {
      name: 'User Principal Name',
      selector: (row) => row['userPrincipalName'],
      sortable: true,
      exportSelector: 'userPrincipalName',
    },
    {
      name: 'Risk Level',
      selector: (row) => row['riskLevel'],
      sortable: true,
      exportSelector: 'riskLevel',
    },
    {
      name: 'Risk State',
      selector: (row) => row['riskState'],
      sortable: true,
      exportSelector: 'riskState',
    },
    {
      name: 'Risk Detail',
      selector: (row) => row['riskDetail'],
      sortable: true,
      exportSelector: 'riskDetail',
    },
    {
      name: 'isProcessing',
      selector: (row) => row['isProcessing'],
      sortable: true,
      exportSelector: 'isProcessing',
    },
    {
      name: 'isDeleted',
      selector: (row) => row['isDeleted'],
      sortable: true,
      exportSelector: 'isDeleted',
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
        title="Risky Users"
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        datatable={{
          filterlist: [
            {
              filterName: 'State: none',
              filter: 'Complex: riskState eq none',
            },
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
          reportName: `${tenant?.defaultDomainName}-ListRiskyUsers`,
          params: {
            TenantFilter: tenant.defaultDomainName,
            Endpoint: `identityProtection/riskyUsers`,
            $count: true,
            $orderby: 'riskLastUpdatedDateTime desc',
            NoPagination: true,
            $top: 500,
          },
          tableProps: {
            selectableRows: true,
            actionsList: [
              {
                label: 'Dismiss Risk',
                color: 'info',
                model: true,
                modalUrl: `/api/ExecDismissRiskyUser?TenantFilter=${tenant.defaultDomainName}&userid=!id&userDisplayName=!userDisplayName`,
              },
            ],
          },
        }}
      />
    </>
  )
}

export default RiskyUsers
