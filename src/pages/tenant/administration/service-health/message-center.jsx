import { CippTablePage } from '../../../../components/CippComponents/CippTablePage'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { CippInfoBar } from '../../../../components/CippCards/CippInfoBar'
import { CippIcons } from '../../../../utils/icon-registry'
import { useRouter } from 'next/router'
import { Typography, Stack } from '@mui/material'
import { CippHtmlContent } from '../../../../components/CippComponents/CippHtmlContent'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { useSettings } from '../../../../hooks/use-settings'
import { useUrlFilters } from '../../../../utils/url-filters'
import { ApiGetCall } from '../../../../api/ApiCall'
import tabOptions from './tabOptions'

const Page = () => {
  const { currentTenant } = useSettings()

  const router = useRouter()

  const urlFilters = useUrlFilters()

  const messages = ApiGetCall({
    url: '/api/ListMessageCenterMessages?UseReportDB=true',
    data: { tenantFilter: currentTenant },
    queryKey: `messages-${currentTenant}`,
    waiting: !!currentTenant,
  })
  const reportDB = useCippReportDB({
    apiUrl: '/api/ListMessageCenterMessages',
    queryKey: 'ListMessageCenterMessages',
    cacheName: 'MessageCenterMessages',
    syncTitle: 'Sync Message Center',
    allowToggle: true,
    defaultCached: true,
    allowAllTenantSync: true,
  })

  return (
    <>
      <CippTablePage
        title="Message Center"
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        apiDataKey={reportDB.apiDataKey}
        queryKey={reportDB.resolvedQueryKey}
        simpleColumns={[
          ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
          'title',
          'category',
          'severity',
          'services',
          'isMajorChange',
          'actionRequiredByDateTime',
          'lastModifiedDateTime',
          ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
        ]}
        dataSourceControls={reportDB.controls}
        filters={[
          {
            filterName: 'Major changes',
            value: [{ id: 'isMajorChange', value: 'Yes' }],
            type: 'column',
          },
          {
            filterName: 'High or critical',
            value: [{ id: 'severity', value: 'normal', filterFn: 'notEquals' }],
            type: 'column',
          },
          {
            filterName: 'Plan for change',
            value: [{ id: 'category', value: 'planForChange' }],
            type: 'column',
          },
          {
            filterName: 'Prevent or fix issue',
            value: [{ id: 'category', value: 'preventOrFixIssue' }],
            type: 'column',
          },
          ...urlFilters,
        ]}
        offCanvas={{
          extendedInfoFields: [
            'title',
            'category',
            'severity',
            'services',
            'tags',
            'isMajorChange',
            'actionRequiredByDateTime',
            'lastModifiedDateTime',
            'Tenants',
          ],
          size: 'lg',
          children: (row) => (
            <Stack spacing={2}>
              <Typography variant="h6">{'Message'}</Typography>
              <CippHtmlContent html={row?.body?.content} />
            </Stack>
          ),
        }}
        tableFilter={
          <CippInfoBar
            data={[
              {
                name: 'Action required',
                data: (messages.data ?? []).filter(
                  (r) =>
                    r?.actionRequiredByDateTime != null &&
                    r?.actionRequiredByDateTime !== ''
                ).length,
                icon: <CippIcons.NewReleases />,
                color: 'primary',
              },
              {
                name: 'Major changes',
                data: (messages.data ?? []).filter(
                  (r) => String(r?.isMajorChange) === 'true'
                ).length,
                icon: <CippIcons.Warning />,
                color: 'warning',
                link: `${router.pathname}?filters=${encodeURIComponent(JSON.stringify([{ id: 'isMajorChange', value: 'Yes' }]))}`,
              },
              {
                name: 'High or critical',
                data: (messages.data ?? []).filter(
                  (r) => String(r?.severity) !== 'normal'
                ).length,
                icon: <CippIcons.Error />,
                color: 'error',
              },
              {
                name: 'Plan for change',
                data: (messages.data ?? []).filter(
                  (r) => String(r?.category) === 'planForChange'
                ).length,
                icon: <CippIcons.Info />,
                color: 'primary',
                link: `${router.pathname}?filters=${encodeURIComponent(JSON.stringify([{ id: 'category', value: 'planForChange' }]))}`,
              },
            ]}
            isFetching={messages.isFetching}
          />
        }
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={true}>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)
export default Page
