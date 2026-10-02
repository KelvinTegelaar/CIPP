import { CippTablePage } from '../../../../components/CippComponents/CippTablePage'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { CippInfoBar } from '../../../../components/CippCards/CippInfoBar'
import { CippIcons } from '../../../../utils/icon-registry'
import { useRouter } from 'next/router'
import {
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
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

  const issues = ApiGetCall({
    url: '/api/ListServiceHealthIssues?UseReportDB=true',
    data: { tenantFilter: currentTenant },
    queryKey: `issues-${currentTenant}`,
    waiting: !!currentTenant,
  })
  const reportDB = useCippReportDB({
    apiUrl: '/api/ListServiceHealthIssues',
    queryKey: 'ListServiceHealthIssues',
    cacheName: 'ServiceHealthIssues',
    syncTitle: 'Sync Service Issues',
    allowToggle: true,
    defaultCached: true,
    allowAllTenantSync: true,
  })

  return (
    <>
      <CippTablePage
        title="Service Issues"
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        apiDataKey={reportDB.apiDataKey}
        queryKey={reportDB.resolvedQueryKey}
        simpleColumns={[
          ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
          'classification',
          'status',
          'service',
          'feature',
          'title',
          'isResolved',
          'startDateTime',
          'lastModifiedDateTime',
          ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
        ]}
        dataSourceControls={reportDB.controls}
        filters={[
          {
            filterName: 'Open',
            value: [{ id: 'isResolved', value: 'No' }],
            type: 'column',
          },
          {
            filterName: 'Open incidents',
            value: [
              { id: 'isResolved', value: 'No' },
              { id: 'classification', value: 'incident' },
            ],
            type: 'column',
          },
          {
            filterName: 'Open advisories',
            value: [
              { id: 'isResolved', value: 'No' },
              { id: 'classification', value: 'advisory' },
            ],
            type: 'column',
          },
          {
            filterName: 'Resolved',
            value: [{ id: 'isResolved', value: 'Yes' }],
            type: 'column',
          },
          ...urlFilters,
        ]}
        offCanvas={{
          extendedInfoFields: [
            'title',
            'impactDescription',
            'service',
            'feature',
            'status',
            'classification',
            'startDateTime',
            'lastModifiedDateTime',
            'Tenants',
          ],
          size: 'lg',
          children: (row) => (
            <Stack spacing={2}>
              <Typography variant="h6">{'Updates'}</Typography>
              <Stack spacing={0}>
                {[...(row?.posts ?? [])]
                  .sort((a, b) =>
                    String(b?.createdDateTime ?? '').localeCompare(
                      String(a?.createdDateTime ?? '')
                    )
                  )
                  .map((item, i) => (
                    <Accordion
                      key={i}
                      defaultExpanded={i === 0}
                      disableGutters
                      variant="outlined"
                    >
                      <AccordionSummary expandIcon={<CippIcons.ExpandMore />}>
                        <Typography variant="subtitle2">
                          {item?.createdDateTime
                            ? new Date(item?.createdDateTime).toLocaleString()
                            : ''}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          <CippHtmlContent html={item?.description?.content} />
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  ))}
              </Stack>
            </Stack>
          ),
        }}
        tableFilter={
          <CippInfoBar
            data={[
              {
                name: 'Open',
                data: (issues.data ?? []).filter(
                  (r) => String(r?.isResolved) === 'false'
                ).length,
                icon: <CippIcons.Warning />,
                color: 'error',
                link: `${router.pathname}?filters=${encodeURIComponent(JSON.stringify([{ id: 'isResolved', value: 'No' }]))}`,
              },
              {
                name: 'Open incidents',
                data: (issues.data ?? []).filter(
                  (r) =>
                    String(r?.isResolved) === 'false' &&
                    String(r?.classification) === 'incident'
                ).length,
                icon: <CippIcons.Error />,
                color: 'warning',
                link: `${router.pathname}?filters=${encodeURIComponent(
                  JSON.stringify([
                    { id: 'isResolved', value: 'No' },
                    { id: 'classification', value: 'incident' },
                  ])
                )}`,
              },
              {
                name: 'Open advisories',
                data: (issues.data ?? []).filter(
                  (r) =>
                    String(r?.isResolved) === 'false' &&
                    String(r?.classification) === 'advisory'
                ).length,
                icon: <CippIcons.Info />,
                color: 'primary',
                link: `${router.pathname}?filters=${encodeURIComponent(
                  JSON.stringify([
                    { id: 'isResolved', value: 'No' },
                    { id: 'classification', value: 'advisory' },
                  ])
                )}`,
              },
              {
                name: 'Services affected',
                data: new Set(
                  (issues.data ?? [])
                    .filter((r) => String(r?.isResolved) === 'false')
                    .map((r) => r?.service)
                ).size,
                icon: <CippIcons.Cloud />,
                color: 'primary',
                link: `${router.pathname}?filters=${encodeURIComponent(JSON.stringify([{ id: 'isResolved', value: 'No' }]))}`,
              },
            ]}
            isFetching={issues.isFetching}
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
