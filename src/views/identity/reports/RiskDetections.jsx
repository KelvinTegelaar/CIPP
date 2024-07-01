import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'

const columns = [
  {
    name: 'Detected Date',
    selector: (row) => row['detectedDateTime'],
    sortable: true,
    exportSelector: 'detectedDateTime',
  },
  {
    name: 'User Principal Name',
    selector: (row) => row['userPrincipalName'],
    sortable: true,
    exportSelector: 'userPrincipalName',
  },
  {
    name: 'Location',
    selector: (row) => `${row.location?.city} - ${row.location?.countryOrRegion}`,
    sortable: true,
    exportSelector: 'Location',
    cell: (row) => CellTip(`${row.location?.city} - ${row.location?.countryOrRegion}`),
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
    name: 'Risk Level',
    selector: (row) => row['riskLevel'],
    sortable: true,
    exportSelector: 'riskLevel',
  },
  {
    name: 'Risk Type',
    selector: (row) => row['riskType'],
    sortable: true,
    exportSelector: 'riskType',
  },
  {
    name: 'Risk Event Type',
    selector: (row) => row['riskEventType'],
    sortable: true,
    exportSelector: 'riskEventType',
  },
  {
    name: 'Detection Type',
    selector: (row) => row['detectionTimingType'],
    sortable: true,
    exportSelector: 'detectionTimingType',
  },
  {
    name: 'Activity',
    selector: (row) => row['activity'],
    sortable: true,
    exportSelector: 'activity',
  },
]

const RiskDetections = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

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
            TenantFilter: tenant?.defaultDomainName,
            Endpoint: `identityProtection/riskDetections`,
            $count: true,
            $orderby: 'detectedDateTime',
          },
        }}
      />
    </>
  )
}

export default RiskDetections
