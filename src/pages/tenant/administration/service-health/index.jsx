import { CippInfoBar } from '../../../../components/CippCards/CippInfoBar'
import { CippIcons } from '../../../../utils/icon-registry'
import { Grid } from '@mui/system'
import { CippChartCard } from '../../../../components/CippCards/CippChartCard'
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import {
  Stack,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  IconButton,
  Container,
} from '@mui/material'
import { CippHtmlContent } from '../../../../components/CippComponents/CippHtmlContent'
import { useState } from 'react'
import { CippOffCanvas } from '../../../../components/CippComponents/CippOffCanvas'
import { groupRowsBy } from '../../../../utils/group-rows'
import { CippHead } from '../../../../components/CippComponents/CippHead'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { useSettings } from '../../../../hooks/use-settings'
import { ApiGetCall } from '../../../../api/ApiCall'
import tabOptions from './tabOptions'

const Page = () => {
  const { currentTenant } = useSettings()

  const theme = useTheme()

  const router = useRouter()

  const overviews = ApiGetCall({
    url: '/api/ListServiceHealthOverviews?UseReportDB=true',
    data: { tenantFilter: currentTenant },
    queryKey: `overviews-${currentTenant}`,
    waiting: !!currentTenant,
  })
  const issues = ApiGetCall({
    url: '/api/ListServiceHealthIssues?UseReportDB=true',
    data: { tenantFilter: currentTenant },
    queryKey: `issues-${currentTenant}`,
    waiting: !!currentTenant,
  })
  const messages = ApiGetCall({
    url: '/api/ListMessageCenterMessages?UseReportDB=true',
    data: { tenantFilter: currentTenant },
    queryKey: `messages-${currentTenant}`,
    waiting: !!currentTenant,
  })
  const [moreInfo1, setMoreInfo1] = useState(null)
  const [moreInfo2, setMoreInfo2] = useState(null)
  const [moreInfo3, setMoreInfo3] = useState(null)

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <CippHead title="Overview" />
      <Stack spacing={2}>
        <CippInfoBar
          data={[
            {
              name: 'Services with issues',
              data: new Set(
                (overviews.data ?? [])
                  .filter((r) => String(r?.status) !== 'serviceOperational')
                  .map((r) => r?.service)
              ).size,
              icon: <CippIcons.Warning />,
              color: 'warning',
              link: '/tenant/administration/service-health/status',
            },
            {
              name: 'Open incidents',
              data: (issues.data ?? []).filter(
                (r) =>
                  String(r?.isResolved) === 'false' &&
                  String(r?.classification) === 'incident'
              ).length,
              icon: <CippIcons.Error />,
              color: 'error',
              link: '/tenant/administration/service-health/issues?filters=%5B%7B%22id%22%3A%22isResolved%22%2C%22value%22%3A%22No%22%7D%2C%7B%22id%22%3A%22classification%22%2C%22value%22%3A%22incident%22%7D%5D',
            },
            {
              name: 'Open advisories',
              data: (issues.data ?? []).filter(
                (r) =>
                  String(r?.isResolved) === 'false' &&
                  String(r?.classification) === 'advisory'
              ).length,
              icon: <CippIcons.Info />,
              color: 'warning',
              link: '/tenant/administration/service-health/issues?filters=%5B%7B%22id%22%3A%22isResolved%22%2C%22value%22%3A%22No%22%7D%2C%7B%22id%22%3A%22classification%22%2C%22value%22%3A%22advisory%22%7D%5D',
            },
            {
              name: 'Action required',
              data: (messages.data ?? []).filter(
                (r) =>
                  r?.actionRequiredByDateTime != null &&
                  r?.actionRequiredByDateTime !== ''
              ).length,
              icon: <CippIcons.NewReleases />,
              color: 'warning',
              link: '/tenant/administration/service-health/message-center',
            },
          ]}
          isFetching={
            overviews.isFetching || issues.isFetching || messages.isFetching
          }
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 12, md: 4 }}>
            <CippChartCard
              title="Service status"
              chartType="donut"
              labels={['Operational', 'Degraded', 'Interrupted', 'Other']}
              chartSeries={[
                (overviews.data ?? []).filter(
                  (r) => String(r?.status) === 'serviceOperational'
                ).length,
                (overviews.data ?? []).filter(
                  (r) => String(r?.status) === 'serviceDegradation'
                ).length,
                (overviews.data ?? []).filter(
                  (r) => String(r?.status) === 'serviceInterruption'
                ).length,
                (overviews.data ?? []).filter(
                  (r) =>
                    String(r?.status) !== 'serviceOperational' &&
                    String(r?.status) !== 'serviceDegradation' &&
                    String(r?.status) !== 'serviceInterruption'
                ).length,
              ]}
              totalLabel="Checks"
              colors={[
                theme.palette.success.main,
                theme.palette.warning.main,
                theme.palette.error.main,
                theme.palette.neutral[200],
              ]}
              isFetching={overviews.isFetching}
              onClick={() =>
                router.push({
                  pathname: '/tenant/administration/service-health/status',
                })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 4 }}>
            <CippChartCard
              title="Open issues"
              chartType="donut"
              labels={['Incidents', 'Advisories']}
              chartSeries={[
                (issues.data ?? []).filter(
                  (r) =>
                    String(r?.isResolved) === 'false' &&
                    String(r?.classification) === 'incident'
                ).length,
                (issues.data ?? []).filter(
                  (r) =>
                    String(r?.isResolved) === 'false' &&
                    String(r?.classification) === 'advisory'
                ).length,
              ]}
              totalLabel="Open"
              colors={[theme.palette.error.main, theme.palette.warning.main]}
              isFetching={issues.isFetching}
              onClick={() =>
                router.push({
                  pathname: '/tenant/administration/service-health/issues',
                  query: {
                    filters: JSON.stringify([
                      { id: 'isResolved', value: 'No' },
                    ]),
                  },
                })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 4 }}>
            <CippChartCard
              title="Message center"
              chartType="donut"
              labels={['Plan for change', 'Stay informed', 'Prevent or fix']}
              chartSeries={[
                (messages.data ?? []).filter(
                  (r) => String(r?.category) === 'planForChange'
                ).length,
                (messages.data ?? []).filter(
                  (r) => String(r?.category) === 'stayInformed'
                ).length,
                (messages.data ?? []).filter(
                  (r) => String(r?.category) === 'preventOrFixIssue'
                ).length,
              ]}
              totalLabel="Messages"
              colors={[
                theme.palette.warning.main,
                theme.palette.success.main,
                theme.palette.error.main,
              ]}
              isFetching={messages.isFetching}
              onClick={() =>
                router.push({
                  pathname:
                    '/tenant/administration/service-health/message-center',
                })
              }
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={2}>
              <Card>
                <CardHeader title="Open incidents and advisories" />
                <Divider />
                <CardContent>
                  <Stack spacing={2}>
                    <>
                      <Stack spacing={0}>
                        {((items) =>
                          items.length ? (
                            items.map((item, i) => (
                              <Accordion
                                key={i}
                                disableGutters
                                variant="outlined"
                              >
                                <AccordionSummary
                                  expandIcon={<CippIcons.ExpandMore />}
                                >
                                  <Typography variant="subtitle2">
                                    {item?.title}
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Stack spacing={1}>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: 'text.secondary',
                                        whiteSpace: 'pre-line',
                                      }}
                                    >{`${item?.service ?? ''} · ${item?.classification ?? ''} · ${item?.status ?? ''} · ${item?.Tenant ?? ''} · updated ${(item?.lastModifiedDateTime ? new Date(item?.lastModifiedDateTime).toLocaleString() : '') ?? ''}`}</Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: 'text.primary',
                                        whiteSpace: 'pre-line',
                                      }}
                                    >
                                      {item?.impactDescription}
                                    </Typography>
                                    <Typography
                                      variant="overline"
                                      sx={{
                                        color: 'text.secondary',
                                        whiteSpace: 'pre-line',
                                      }}
                                    >
                                      {'Latest update'}
                                    </Typography>
                                    <Stack spacing={1}>
                                      {[...(item?.posts ?? [])]
                                        .sort((a, b) =>
                                          String(
                                            b?.createdDateTime ?? ''
                                          ).localeCompare(
                                            String(a?.createdDateTime ?? '')
                                          )
                                        )
                                        .slice(0, 1)
                                        .map((item, i) => (
                                          <Stack key={i} spacing={1}>
                                            {i > 0 && <Divider />}
                                            <Stack spacing={1}>
                                              <CippHtmlContent
                                                html={
                                                  item?.description?.content
                                                }
                                              />
                                            </Stack>
                                          </Stack>
                                        ))}
                                    </Stack>
                                    <Stack
                                      direction="row"
                                      sx={{ justifyContent: 'flex-end' }}
                                    >
                                      <Button
                                        size="small"
                                        startIcon={<CippIcons.Info />}
                                        onClick={() => setMoreInfo1(item)}
                                      >
                                        More info
                                      </Button>
                                    </Stack>
                                  </Stack>
                                </AccordionDetails>
                              </Accordion>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {'No open incidents or advisories.'}
                            </Typography>
                          ))(
                          [...(issues.data ?? [])]
                            .filter((r) => String(r?.isResolved) === 'false')
                            .sort((a, b) =>
                              String(
                                b?.lastModifiedDateTime ?? ''
                              ).localeCompare(
                                String(a?.lastModifiedDateTime ?? '')
                              )
                            )
                            .slice(0, 8)
                        )}
                      </Stack>
                      <CippOffCanvas
                        visible={Boolean(moreInfo1)}
                        onClose={() => setMoreInfo1(null)}
                        extendedData={moreInfo1}
                        extendedInfoFields={[
                          'service',
                          'feature',
                          'classification',
                          'status',
                          'impactDescription',
                          'startDateTime',
                          'lastModifiedDateTime',
                          'Tenants',
                        ]}
                        title={
                          moreInfo1 ? ((item) => item?.title)(moreInfo1) : ''
                        }
                        size="lg"
                      >
                        {(item) => (
                          <Stack spacing={2}>
                            <Typography variant="h6">{'Updates'}</Typography>
                            <Stack spacing={0}>
                              {[...(item?.posts ?? [])]
                                .sort((a, b) =>
                                  String(
                                    b?.createdDateTime ?? ''
                                  ).localeCompare(
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
                                    <AccordionSummary
                                      expandIcon={<CippIcons.ExpandMore />}
                                    >
                                      <Typography variant="subtitle2">
                                        {item?.createdDateTime
                                          ? new Date(
                                              item?.createdDateTime
                                            ).toLocaleString()
                                          : ''}
                                      </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                      <Stack spacing={1}>
                                        <CippHtmlContent
                                          html={item?.description?.content}
                                        />
                                      </Stack>
                                    </AccordionDetails>
                                  </Accordion>
                                ))}
                            </Stack>
                          </Stack>
                        )}
                      </CippOffCanvas>
                    </>
                  </Stack>
                </CardContent>
              </Card>
              <Card>
                <CardHeader title="Message center: action required" />
                <Divider />
                <CardContent>
                  <Stack spacing={2}>
                    <>
                      <Stack spacing={0}>
                        {((items) =>
                          items.length ? (
                            items.map((item, i) => (
                              <Accordion
                                key={i}
                                disableGutters
                                variant="outlined"
                              >
                                <AccordionSummary
                                  expandIcon={<CippIcons.ExpandMore />}
                                >
                                  <Typography variant="subtitle2">
                                    {item?.title}
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Stack spacing={1}>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: 'text.secondary',
                                        whiteSpace: 'pre-line',
                                      }}
                                    >{`Due ${(item?.actionRequiredByDateTime ? new Date(item?.actionRequiredByDateTime).toLocaleString() : '') ?? ''} · ${item?.category ?? ''} · ${item?.services ?? ''} · ${item?.Tenant ?? ''}`}</Typography>
                                    <CippHtmlContent
                                      html={item?.body?.content}
                                    />
                                    <Stack
                                      direction="row"
                                      sx={{ justifyContent: 'flex-end' }}
                                    >
                                      <Button
                                        size="small"
                                        startIcon={<CippIcons.Info />}
                                        onClick={() => setMoreInfo2(item)}
                                      >
                                        More info
                                      </Button>
                                    </Stack>
                                  </Stack>
                                </AccordionDetails>
                              </Accordion>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {'Nothing needs action.'}
                            </Typography>
                          ))(
                          [...(messages.data ?? [])]
                            .filter(
                              (r) =>
                                r?.actionRequiredByDateTime != null &&
                                r?.actionRequiredByDateTime !== ''
                            )
                            .sort((a, b) =>
                              String(
                                a?.actionRequiredByDateTime ?? ''
                              ).localeCompare(
                                String(b?.actionRequiredByDateTime ?? '')
                              )
                            )
                            .slice(0, 8)
                        )}
                      </Stack>
                      <CippOffCanvas
                        visible={Boolean(moreInfo2)}
                        onClose={() => setMoreInfo2(null)}
                        extendedData={moreInfo2}
                        extendedInfoFields={[
                          'category',
                          'severity',
                          'services',
                          'tags',
                          'isMajorChange',
                          'actionRequiredByDateTime',
                          'lastModifiedDateTime',
                          'Tenants',
                        ]}
                        title={
                          moreInfo2 ? ((item) => item?.title)(moreInfo2) : ''
                        }
                        size="lg"
                      >
                        {(item) => (
                          <Stack spacing={2}>
                            <CippHtmlContent html={item?.body?.content} />
                          </Stack>
                        )}
                      </CippOffCanvas>
                    </>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={2}>
              <CippChartCard
                title="Open issues by service"
                chartType="bar"
                labels={Object.entries(
                  (issues.data ?? [])
                    .filter((r) => String(r?.isResolved) === 'false')
                    .reduce(
                      (a, r) => ({
                        ...a,
                        [String(r?.service ?? '')]:
                          (a[String(r?.service ?? '')] ?? 0) + 1,
                      }),
                      {}
                    )
                )
                  .sort((x, y) => y[1] - x[1])
                  .map(([k, n]) => k)}
                chartSeries={Object.entries(
                  (issues.data ?? [])
                    .filter((r) => String(r?.isResolved) === 'false')
                    .reduce(
                      (a, r) => ({
                        ...a,
                        [String(r?.service ?? '')]:
                          (a[String(r?.service ?? '')] ?? 0) + 1,
                      }),
                      {}
                    )
                )
                  .sort((x, y) => y[1] - x[1])
                  .map(([k, n]) => n)}
                totalLabel="Open issues"
                isFetching={issues.isFetching}
                onClick={() =>
                  router.push({
                    pathname: '/tenant/administration/service-health/issues',
                    query: {
                      filters: JSON.stringify([
                        { id: 'isResolved', value: 'No' },
                      ]),
                    },
                  })
                }
              />
              <Card>
                <CardHeader title="Services not operational" />
                <Divider />
                <CardContent>
                  <Stack spacing={2}>
                    <>
                      <Stack spacing={1}>
                        {((items) =>
                          items.length ? (
                            items.map((item, i) => (
                              <Stack key={i} spacing={1}>
                                {i > 0 && <Divider />}
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  sx={{ alignItems: 'flex-start' }}
                                >
                                  <Stack
                                    spacing={1}
                                    sx={{ flex: 1, minWidth: 0 }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        color: 'text.primary',
                                        whiteSpace: 'pre-line',
                                      }}
                                    >
                                      {item?.service}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: 'text.secondary',
                                        whiteSpace: 'pre-line',
                                      }}
                                    >{`${item?.status ?? ''} · ${item?.Tenant ?? ''}`}</Typography>
                                  </Stack>
                                  <IconButton
                                    size="small"
                                    title="More info"
                                    onClick={() => setMoreInfo3(item)}
                                  >
                                    <CippIcons.Info fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </Stack>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {'All services are operational.'}
                            </Typography>
                          ))(
                          groupRowsBy('service, status')(overviews.data ?? [])
                            .filter(
                              (r) => String(r?.status) !== 'serviceOperational'
                            )
                            .sort((a, b) =>
                              String(a?.service ?? '').localeCompare(
                                String(b?.service ?? '')
                              )
                            )
                        )}
                      </Stack>
                      <CippOffCanvas
                        visible={Boolean(moreInfo3)}
                        onClose={() => setMoreInfo3(null)}
                        extendedData={moreInfo3}
                        extendedInfoFields={[
                          'service',
                          'status',
                          'TenantCount',
                          'Tenants',
                        ]}
                        title={
                          moreInfo3 ? ((item) => item?.service)(moreInfo3) : ''
                        }
                        size="md"
                      ></CippOffCanvas>
                    </>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={true}>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)
export default Page
