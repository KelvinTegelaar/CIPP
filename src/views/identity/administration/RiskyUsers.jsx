import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'

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
]

const RiskyUsers = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

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
            TenantFilter: tenant?.defaultDomainName,
            Endpoint: `identityProtection/riskyUsers`,
            $count: true,
            $orderby: 'riskLastUpdatedDateTime',
          },
        }}
      />
    </>
  )
}

export default RiskyUsers
