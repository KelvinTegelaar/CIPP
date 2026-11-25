import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'

const Page = () => {
  const reportDB = useCippReportDB({
    apiUrl: '/api/ListDefenderMachines',
    queryKey: 'ListDefenderMachines',
    cacheName: 'DefenderMachines',
    syncTitle: 'Sync Defender Devices',
    allowToggle: false,
    defaultCached: true,
    serverPagination: true,
  })

  return (
    <>
      <CippTablePage
        title="Defender Devices"
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        apiDataKey={reportDB.apiDataKey}
        queryKey={reportDB.resolvedQueryKey}
        dataSourceControls={reportDB.controls}
        filters={[
          {
            filterName: 'Inactive',
            value: [{ id: 'healthStatus', value: 'Inactive' }],
            type: 'column',
          },
          {
            filterName: 'Antivirus passive',
            value: [{ id: 'avMode', value: 'Passive' }],
            type: 'column',
            filterType: 'equal',
          },
          {
            filterName: 'Signatures out of date',
            value: [{ id: 'avIsSignatureUpToDate', value: 'False' }],
            type: 'column',
          },
          {
            filterName: 'Can be onboarded',
            value: [{ id: 'onboardingStatus', value: 'CanBeOnboarded' }],
            type: 'column',
          },
        ]}
        offCanvas={{
          extendedInfoFields: [
            'computerDnsName',
            'id',
            'osPlatform',
            'version',
            'osBuild',
            'osArchitecture',
            'healthStatus',
            'onboardingStatus',
            'riskScore',
            'exposureLevel',
            'deviceValue',
            'firstSeen',
            'lastSeen',
            'lastIpAddress',
            'lastExternalIpAddress',
            'aadDeviceId',
            'machineTags',
            'rbacGroupName',
            'isExcluded',
            'managedBy',
            'managedByStatus',
            'avMode',
            'avSignatureVersion',
            'avSignatureUpdateTime',
            'avIsSignatureUpToDate',
            'avEngineVersion',
            'avIsEngineUpToDate',
            'avPlatformVersion',
            'avIsPlatformUpToDate',
            'quickScanResult',
            'quickScanTime',
            'fullScanResult',
            'fullScanTime',
          ],
        }}
        simpleColumns={[
          ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
          'computerDnsName',
          'osPlatform',
          'version',
          'healthStatus',
          'onboardingStatus',
          'riskScore',
          'exposureLevel',
          'avMode',
          'avIsSignatureUpToDate',
          'avSignatureUpdateTime',
          'lastSeen',
          'machineTags',
          ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
        ]}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout tenantGroupSupport={true}>{page}</DashboardLayout>
)

export default Page
