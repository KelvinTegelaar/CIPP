import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'

const columns = [
  {
    name: 'Date',
    selector: (row) => row['createdDateTime'],
    sortable: true,
    exportSelector: 'createdDateTime',
  },
  {
    name: 'User Principal Name',
    selector: (row) => row['userPrincipalName'],
    sortable: true,
    exportSelector: 'userPrincipalName',
  },
  {
    name: 'Location',
    selector: (row) => row.locationcipp,
    sortable: true,
    exportSelector: 'locationcipp',
    cell: (row) => CellTip(row['locationcipp']),
  },
  {
    name: 'IP Address',
    selector: (row) => row['ipAddress'],
    sortable: true,
    exportSelector: 'ipAddress',
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
    name: 'Risk Level Aggregated',
    selector: (row) => row['riskLevelAggregated'],
    sortable: true,
    exportSelector: 'riskLevelAggregated',
  },
  {
    name: 'Risk Level During Sign-In',
    selector: (row) => row['riskLevelDuringSignIn'],
    sortable: true,
    exportSelector: 'riskLevelDuringSignIn',
  },
  {
    name: 'Risk Event Type',
    selector: (row) => row['riskEventTypes_v2'],
    sortable: true,
    exportSelector: 'riskEventTypes_v2',
  },
  {
    name: 'Application Name',
    selector: (row) => row['clientAppUsed'],
    sortable: true,
    exportSelector: 'clientAppUsed',
  },
  {
    name: 'Authentication Requirements',
    selector: (row) => row['authenticationRequirement'],
    sortable: true,
    exportSelector: 'authenticationRequirement',
  },
  {
    name: 'Additional Details',
    selector: (row) => row.additionalDetails,
    sortable: true,
    exportSelector: 'additionalDetails',
    cell: (row) => CellTip(row['additionalDetails']),
  },
]

const RiskySignInsReport = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <>
      <CippPageList
        title="Risky Sign Ins Report"
        capabilities={{ allTenants: false, helpContext: 'https://google.com' }}
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
          path: `/api/ListRiskySignIns`,
          reportName: `${tenant?.defaultDomainName}-RiskySignIns-Report`,
          params: { TenantFilter: tenant?.defaultDomainName },
        }}
      />
    </>
  )
}

export default RiskySignInsReport
