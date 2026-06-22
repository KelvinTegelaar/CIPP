import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { getCippTranslation } from '../../../../utils/get-cipp-translation'
import { getCippFormatting } from '../../../../utils/get-cipp-formatting'
import { CippPropertyListCard } from '../../../../components/CippCards/CippPropertyListCard'
import { Block, PlayArrow, DeleteForever } from '@mui/icons-material'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'

const Page = () => {
  const pageTitle = 'Mailbox Rules'

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListMailboxRules',
    queryKey: 'ListMailboxRules',
    cacheName: 'Mailboxes',
    syncTitle: 'Sync Mailbox Rules',
    syncData: { Types: 'Rules' },
    allowToggle: false,
    defaultCached: true,
  })

  const simpleColumns = [
    ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
    'UserPrincipalName',
    'Name',
    'Priority',
    'Enabled',
    'From',
    ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
  ]

  const actions = [
    {
      label: 'Enable Mailbox Rule',
      type: 'POST',
      icon: <PlayArrow />,
      url: '/api/ExecSetMailboxRule',
      data: {
        ruleId: 'Identity',
        userPrincipalName: 'OperationGuid',
        ruleName: 'Name',
        Enable: true,
        tenantFilter: 'Tenant',
      },
      condition: (row) => !row.Enabled,
      confirmText: 'Are you sure you want to enable this mailbox rule?',
      multiPost: false,
    },
    {
      label: 'Disable Mailbox Rule',
      type: 'POST',
      icon: <Block />,
      url: '/api/ExecSetMailboxRule',
      data: {
        ruleId: 'Identity',
        userPrincipalName: 'OperationGuid',
        ruleName: 'Name',
        Disable: true,
        tenantFilter: 'Tenant',
      },
      condition: (row) => row.Enabled,
      confirmText: 'Are you sure you want to disable this mailbox rule?',
      multiPost: false,
    },
    {
      label: 'Remove Mailbox Rule',
      type: 'POST',
      icon: <DeleteForever />,
      url: '/api/ExecRemoveMailboxRule',
      data: {
        ruleId: 'Identity',
        userPrincipalName: 'OperationGuid',
        ruleName: 'Name',
        tenantFilter: 'Tenant',
      },
      confirmText: 'Are you sure you want to remove this mailbox rule?',
      multiPost: false,
    },
  ]

  const offCanvas = {
    children: (data) => {
      const keys = Object.keys(data).filter(
        (key) => !key.includes('@odata') && !key.includes('@data')
      )
      const properties = []
      keys.forEach((key) => {
        if (data[key] && data[key].length > 0) {
          properties.push({
            label: getCippTranslation(key),
            value: getCippFormatting(data[key], key),
          })
        }
      })
      return (
        <CippPropertyListCard
          cardSx={{ p: 0, m: -2 }}
          title="Rule Details"
          propertyItems={properties}
          actionItems={actions}
          data={data}
        />
      )
    },
  }

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        queryKey={reportDB.resolvedQueryKey}
        simpleColumns={simpleColumns}
        offCanvas={offCanvas}
        actions={actions}
        cardButton={reportDB.controls}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>
export default Page
