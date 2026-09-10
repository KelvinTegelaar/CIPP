import { Box, Card, CardContent, CardHeader, Divider, Stack, Typography } from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'
import { Grid } from '@mui/system'
import Link from 'next/link'
import { Button } from '@mui/material'
import { getCippError } from '../../utils/get-cipp-error'
import { CippInfoBar } from '../CippCards/CippInfoBar'
import { useAllTenantsDashboard } from './useAllTenantsDashboard'
import {
  AllTenantsBandHeading,
  AllTenantsBarList,
  AllTenantsCacheList,
  AllTenantsMeterList,
  AllTenantsRowList,
  AllTenantsTrendChart,
  AllTenantsStatTile,
  severityColor,
} from './AllTenantsPrimitives'

/** Card shell that renders its own fetch error inline rather than blanking the section. */
const DashboardCard = ({ title, subheader, api, children, action }) => {
  const isError = Array.isArray(api) ? api.some((item) => item?.isError) : api?.isError
  const error = Array.isArray(api) ? api.find((item) => item?.isError)?.error : api?.error

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={action}
        slotProps={{
          title: { variant: 'h6' },
          subheader: { variant: 'caption' }
        }} />
      <Divider />
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {isError ? (
          <Typography variant="body2" color="error" sx={{ py: 2, textAlign: 'center' }}>
            {getCippError(error)}
          </Typography>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export const AllTenantsDashboard = () => {
  const {
    tenantCount,
    tenants,
    alignmentApi,
    failedTestsApi,
    domainsApi,
    countsApi,
    logsApi,
    secureScoreApi,
    delegation,
    alignment,
    tests,
    mail,
    cache,
    logs,
    secureScore,
    attention,
  } = useAllTenantsDashboard()

  // Four items exactly — CippInfoBar lays out md:3 across and its divider rules target the 3rd and
  // 4th cells. Each tile links to the list page behind its number.
  const scaleLinks = {
    Users: '/identity/administration/users',
    Mailboxes: '/email/administration/mailboxes',
    'Managed devices': '/endpoint/MEM/devices',
  }

  const portfolioBarItems = [
    {
      name: 'Tenants',
      data: tenantCount.toLocaleString(),
      icon: <CippIcons.BuildingOffice2Icon />,
      toolTip: 'Tenants under management. Select to open the tenant list.',
      link: '/tenant/administration/tenants',
    },
    ...cache.scale.map((item) => ({
      name: item.label,
      data: item.value.toLocaleString(),
      icon:
        item.label === 'Users' ? (
          <CippIcons.UsersIcon />
        ) : item.label === 'Mailboxes' ? (
          <CippIcons.EnvelopeIcon />
        ) : (
          <CippIcons.DevicePhoneMobileIcon />
        ),
      toolTip: `${item.average.toLocaleString()} per tenant on average. Select to open the list.`,
      link: scaleLinks[item.label],
    })),
  ]

  const alignmentBuckets = [
    { label: '90% and above', value: alignment.buckets.strong, severity: 'ok' },
    { label: '75 – 89%', value: alignment.buckets.good, severity: 'info' },
    { label: '50 – 74%', value: alignment.buckets.weak, severity: 'warning' },
    { label: 'Below 50%', value: alignment.buckets.poor, severity: 'critical' },
  ]

  return (
    <Stack spacing={5}>
      {/* ----------------------------------------------------------- portfolio */}
      <Box>
        <AllTenantsBandHeading
          title="Portfolio"
          description={`Scale across ${tenantCount || 'all'} tenants`}
        />
        <CippInfoBar
          isFetching={countsApi.isLoading || tenants.isLoading}
          data={portfolioBarItems}
        />
        {!countsApi.isLoading && !cache.hasData && (
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              mt: 1.5,
              display: 'block'
            }}>
            No cached collections were returned. The nightly cache job may not have run yet.
          </Typography>
        )}
      </Box>

      {/* ------------------------------------------------------------ security */}
      <Box>
        <AllTenantsBandHeading title="Security posture" description="How the estate is trending" />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <DashboardCard
              title="Secure score"
              subheader="Portfolio average, from the nightly cache"
              api={secureScoreApi}
              action={
                <Button component={Link} href="/tenant/administration/securescore" size="small">
                  View
                </Button>
              }
            >
              <Stack
                direction="row"
                spacing={3}
                sx={{
                  alignItems: "baseline",
                  mb: 2
                }}>
                <Box>
                  <Typography variant="h4" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {secureScore.average}%
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: "text.disabled"
                  }}>
                    across {secureScore.scored} tenants
                  </Typography>
                </Box>
                {secureScore.delta !== null && secureScore.delta !== undefined && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontVariantNumeric: 'tabular-nums',
                        color: severityColor(
                          secureScore.delta > 0
                            ? 'ok'
                            : secureScore.delta < 0
                              ? 'critical'
                              : 'neutral'
                        ),
                      }}
                    >
                      {secureScore.delta > 0 ? '▲' : secureScore.delta < 0 ? '▼' : '■'}{' '}
                      {Math.abs(secureScore.delta)} pts
                    </Typography>
                    <Typography variant="caption" sx={{
                      color: "text.disabled"
                    }}>
                      over {secureScore.trend.length} days
                    </Typography>
                  </Box>
                )}
              </Stack>

              {secureScore.scored > 0 ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <AllTenantsTrendChart
                      points={secureScore.trend}
                      isFetching={secureScoreApi.isLoading}
                      severity={
                        secureScore.delta < 0 ? 'critical' : secureScore.delta > 0 ? 'ok' : 'info'
                      }
                    />
                  </Box>
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      mb: 2
                    }}>
                    <Box sx={{ minWidth: 0, pr: 1 }}>
                      <Typography variant="caption" sx={{
                        color: "text.disabled"
                      }}>
                        Best
                      </Typography>
                      <Typography variant="body2" noWrap title={secureScore.best?.name}>
                        {secureScore.best?.name}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: severityColor('ok'),
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {secureScore.best?.percent}%
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 0, textAlign: 'right' }}>
                      <Typography variant="caption" sx={{
                        color: "text.disabled"
                      }}>
                        Worst
                      </Typography>
                      <Typography variant="body2" noWrap title={secureScore.worst?.name}>
                        {secureScore.worst?.name}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: severityColor('critical'),
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {secureScore.worst?.percent}%
                      </Typography>
                    </Box>
                  </Stack>
                </>
              ) : (
                !secureScoreApi.isLoading && (
                  <Typography variant="body2" sx={{
                    color: "text.secondary"
                  }}>
                    No cached secure scores yet.
                  </Typography>
                )
              )}
            </DashboardCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <DashboardCard
              title="Identity posture"
              subheader="Counted in tenants, not users"
              api={failedTestsApi}
              action={
                <Button component={Link} href="/dashboardv2/identity" size="small">
                  View
                </Button>
              }
            >
              <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontVariantNumeric: 'tabular-nums',
                      color: severityColor('warning'),
                    }}
                  >
                    {tests.identityTenantCount}
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: "text.secondary"
                  }}>
                    of {tenantCount} tenants failing
                    <br />
                    an identity check
                  </Typography>
                </Box>
              </Stack>
              {tests.identityRows.length > 0 ? (
                <Stack spacing={0.5}>
                  <Typography variant="overline" sx={{
                    color: "text.disabled"
                  }}>
                    Most widespread
                  </Typography>
                  {tests.identityRows.map((row) => (
                    <Stack
                      key={row.label}
                      direction="row"
                      spacing={2}
                      sx={{
                        justifyContent: "space-between"
                      }}
                    >
                      <Typography variant="body2" noWrap title={row.label}>
                        {row.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontVariantNumeric: 'tabular-nums',
                          fontWeight: 600,
                        }}
                      >
                        {row.tenantCount}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                !failedTestsApi.isLoading && (
                  <Typography variant="body2" sx={{
                    color: "text.secondary"
                  }}>
                    No failing identity checks.
                  </Typography>
                )
              )}
            </DashboardCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 3 }}>
            <DashboardCard
              title="Mail hygiene"
              subheader={mail.total ? `${mail.total} domains` : 'Domain analyser results'}
              api={domainsApi}
              action={
                <Button component={Link} href="/tenant/standards/domains-analyser" size="small">
                  View
                </Button>
              }
            >
              {mail.meters.length ? (
                <AllTenantsMeterList meters={mail.meters} isFetching={domainsApi.isLoading} />
              ) : (
                !domainsApi.isLoading && (
                  <Typography variant="body2" sx={{
                    color: "text.secondary"
                  }}>
                    No analysed domains yet.
                  </Typography>
                )
              )}
            </DashboardCard>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <DashboardCard
              title="Standards alignment"
              subheader="Tenants bucketed by combined alignment score"
              api={alignmentApi}
              action={
                <Button component={Link} href="/tenant/standards/alignment" size="small">
                  View
                </Button>
              }
            >
              <Stack
                direction="row"
                spacing={3}
                sx={{
                  alignItems: "center",
                  mb: 2
                }}>
                <Box>
                  <Typography variant="h4" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {alignment.average}%
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: "text.disabled"
                  }}>
                    portfolio average
                  </Typography>
                </Box>
              </Stack>
              <AllTenantsBarList
                isFetching={alignmentApi.isLoading}
                emptyText="No alignment data yet"
                max={Math.max(alignment.scores.length, 1)}
                rows={alignmentBuckets.map((bucket) => ({
                  label: bucket.label,
                  total: bucket.value,
                  segments: [{ value: bucket.value, severity: bucket.severity }],
                }))}
              />
              {alignment.lowest.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="overline" sx={{
                    color: "text.disabled"
                  }}>
                    Lowest scoring
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    {alignment.lowest.map((item) => (
                      <Stack
                        key={item.tenant}
                        direction="row"
                        spacing={2}
                        sx={{
                          justifyContent: "space-between"
                        }}
                      >
                        <Typography variant="body2" noWrap title={item.name}>
                          {item.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontVariantNumeric: 'tabular-nums',
                            fontWeight: 600,
                            color: severityColor(item.score < 50 ? 'critical' : 'warning'),
                          }}
                        >
                          {item.score}%
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              )}
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>

      {/* ---------------------------------------------------------- operations */}
      <Box>
        <AllTenantsBandHeading
          title="Operations & triage"
          description="What is broken, expiring, or stuck right now"
        />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AllTenantsStatTile
              isFetching={logsApi.isLoading}
              severity={logs.tenantCount ? 'critical' : 'ok'}
              value={logs.tenantCount}
              label="Tenants logging errors today"
              meta={`${logs.total} entries · Error or Critical`}
              link="/cipp/logs"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AllTenantsStatTile
              isFetching={tenants.isLoading}
              severity={delegation.expiringSoon ? 'warning' : 'ok'}
              value={delegation.expiringSoon}
              label="Delegations expiring within 30 days"
              meta={`${delegation.noAutoExtendSoon} without auto-extend`}
              link="/tenant/gdap-management/relationships"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AllTenantsStatTile
              isFetching={failedTestsApi.isLoading}
              severity={tests.high ? 'critical' : 'ok'}
              value={tests.high}
              label="High-risk checks failing"
              meta={`across ${tests.highRiskTenantCount} tenants`}
              link="/dashboardv2/identity"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AllTenantsStatTile
              isFetching={alignmentApi.isLoading}
              severity={alignment.pendingDeviations ? 'info' : 'ok'}
              value={alignment.pendingDeviations}
              label="Standards deviations awaiting approval"
              meta={`${alignment.pendingTenantCount} tenants`}
              link="/tenant/standards/alignment"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <DashboardCard
              title="Tenants needing attention"
              subheader="Delegation state and error activity, worst first"
              api={[tenants, logsApi]}
            >
              <AllTenantsRowList
                rows={attention.rows}
                isFetching={tenants.isLoading || logsApi.isLoading}
                emptyText="Every tenant is responding with delegation active."
              />
            </DashboardCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <DashboardCard
              title="Delegation expiry horizon"
              subheader="GDAP and CSP relationships by time remaining"
              api={tenants}
            >
              <AllTenantsBarList
                isFetching={tenants.isLoading}
                max={tenantCount || 1}
                emptyText="No relationship end dates recorded"
                rows={[
                  {
                    label: 'Expired',
                    total: delegation.buckets.expired,
                    segments: [
                      {
                        value: delegation.buckets.expired,
                        severity: 'critical',
                      },
                    ],
                  },
                  {
                    label: '0 – 7 days',
                    total: delegation.buckets.week,
                    segments: [{ value: delegation.buckets.week, severity: 'critical' }],
                  },
                  {
                    label: '8 – 30 days',
                    total: delegation.buckets.month,
                    segments: [{ value: delegation.buckets.month, severity: 'warning' }],
                  },
                  {
                    label: '31 – 90 days',
                    total: delegation.buckets.quarter,
                    segments: [{ value: delegation.buckets.quarter, severity: 'info' }],
                  },
                  {
                    label: 'Over 90 days',
                    total: delegation.buckets.healthy,
                    segments: [{ value: delegation.buckets.healthy, severity: 'ok' }],
                  },
                ]}
              />
              {delegation.noAutoExtendSoon > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 1,
                    backgroundColor: 'action.hover',
                    borderLeft: 3,
                    borderLeftColor: severityColor('critical'),
                  }}
                >
                  <Typography variant="subtitle2" color="error">
                    {delegation.noAutoExtendSoon} expiring without auto-extend
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: "text.secondary"
                  }}>
                    {delegation.urgent
                      .filter((item) => !item.hasAutoExtend)
                      .slice(0, 3)
                      .map((item) => item.name)
                      .join(' · ')}
                  </Typography>
                </Box>
              )}
            </DashboardCard>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <DashboardCard
              title="Cache freshness"
              subheader="Which tenants quietly failed to sync"
              api={[countsApi, tenants]}
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack direction="row" spacing={3}>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontVariantNumeric: 'tabular-nums',
                          color: severityColor('ok'),
                        }}
                      >
                        {cache.freshness.fresh}
                      </Typography>
                      <Typography variant="caption" sx={{
                        color: "text.secondary"
                      }}>
                        fresh
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontVariantNumeric: 'tabular-nums',
                          color: severityColor('warning'),
                        }}
                      >
                        {cache.freshness.stale}
                      </Typography>
                      <Typography variant="caption" sx={{
                        color: "text.secondary"
                      }}>
                        stale
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontVariantNumeric: 'tabular-nums',
                          color: severityColor('critical'),
                        }}
                      >
                        {cache.freshness.missing}
                      </Typography>
                      <Typography variant="caption" sx={{
                        color: "text.secondary"
                      }}>
                        never cached
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <AllTenantsCacheList
                    rows={cache.staleTenants}
                    isFetching={countsApi.isLoading || tenants.isLoading}
                    emptyText="Every tenant was cached within the last 30 hours."
                  />
                </Grid>
              </Grid>
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
}
