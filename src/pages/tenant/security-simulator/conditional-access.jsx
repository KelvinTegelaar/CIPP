import { useEffect, useRef } from 'react'
import { Alert, Box, Button, Card, CardContent, CardHeader, Container, Divider, Stack, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import { Layout as DashboardLayout } from '../../../layouts/index'
import { TabbedLayout } from '../../../layouts/TabbedLayout'
import tabOptions from './tabOptions.json'
import { CippHead } from '../../../components/CippComponents/CippHead'
import CippFormSkeleton from '../../../components/CippFormPages/CippFormSkeleton'
import { CippCAPersonaMatrix } from '../../../components/CippSecuritySimulations/CippCAPersonaMatrix'
import { ApiGetCall } from '../../../api/ApiCall'
import { useSettings } from '../../../hooks/use-settings'

const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : [])

const severityDot = {
  Critical: 'error.main',
  High: 'warning.main',
  Medium: 'info.main',
  Low: 'text.secondary',
  Info: 'text.secondary',
}
const severityRank = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 }

const Page = () => {
  const pageTitle = 'Conditional Access Gap Analysis'
  const tenant = useSettings().currentTenant
  const tenantSelected = Boolean(tenant) && tenant !== 'AllTenants'

  const analysis = ApiGetCall({
    url: '/api/ListCAGapAnalysis',
    data: { tenantFilter: tenant },
    queryKey: `ListCAGapAnalysis-${tenant}`,
    waiting: tenantSelected,
  })

  const data = analysis.data
  const counts = data?.analysis
  const score = data?.analysis?.score

  const retriedRef = useRef(false)
  useEffect(() => {
    if (analysis.isFetching || data === undefined || (data && typeof data === 'object')) return
    if (retriedRef.current) return
    retriedRef.current = true
    analysis.refetch()
  }, [data, analysis.isFetching, analysis])
  const findings = asArray(data?.analysis?.findings)
    .slice()
    .sort((a, b) => (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9))

  return (
    <>
      <CippHead title={pageTitle} />
      <Container maxWidth={false}>
        <Stack spacing={3}>
          {!tenantSelected && (
            <Alert severity="info">Select a tenant to analyse its Conditional Access policies.</Alert>
          )}
          {tenantSelected && data?.licensed === false && (
            <Alert severity="warning">
              This tenant has no Entra ID P1 or P2 license, so it has no Conditional Access policies
              to analyse.
            </Alert>
          )}
          {tenantSelected && data?.analysisError && (
            <Alert severity="warning">Policy analysis failed: {data.analysisError}</Alert>
          )}
          {tenantSelected && analysis.isFetching && !data && <CippFormSkeleton layout={[4, 1, 1, 1]} />}
          {tenantSelected && !analysis.isFetching && analysis.isError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => analysis.refetch()}>
                  Retry
                </Button>
              }
            >
              The Conditional Access analysis could not be loaded from the API.
            </Alert>
          )}
          {tenantSelected && data && data.licensed !== false && (
            <>
              <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
                <Grid size={{ md: 2, xs: 12 }}>
                  <Card
                    style={{ width: '100%', height: '100%' }}
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.75 }}>
                        <Typography
                          variant="h2"
                          sx={{
                            fontWeight: 700,
                            lineHeight: 1,
                            color:
                              (score?.score ?? 0) >= 8
                                ? 'success.main'
                                : (score?.score ?? 0) >= 5
                                  ? 'warning.main'
                                  : 'error.main',
                          }}
                        >
                          {score?.score ?? '-'}
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                          / {score?.scoreMax ?? 10}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', display: 'block', mt: 1, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: 600 }}
                      >
                        Conditional Access score
                      </Typography>
                      {score && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                          {score.enforcedControls} of {score.applicableControls} controls enforced
                          {score.criticalFindings > 0 || score.highFindings > 0
                            ? ` · ${score.criticalFindings} critical, ${score.highFindings} high findings`
                            : ''}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ md: 10, xs: 12 }}>
                  <Card style={{ width: '100%', height: '100%' }}>
                    <CardHeader
                      title="Coverage by persona"
                      subheader={`${counts?.policyCount ?? 0} policies · ${counts?.enabledCount ?? 0} enforced · ${counts?.reportOnlyCount ?? 0} report-only · ${counts?.disabledCount ?? 0} disabled. Personas come from how each policy targets identities; hover a cell for the policies behind it.${counts?.licenses?.hasEntraIdP2 === false ? ' Risk-based controls are excluded: this tenant has no Entra ID P2 license.' : ''}`}
                      slotProps={{ subheader: { variant: 'caption' } }}
                    />
                    <Divider />
                    <CardContent>
                      <CippCAPersonaMatrix matrix={data?.analysis?.personaMatrix} />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card>
                <CardHeader
                  title="Policy findings"
                  subheader={`${findings.length} finding${findings.length === 1 ? '' : 's'} from the cached policies, most severe first`}
                  slotProps={{ subheader: { variant: 'caption' } }}
                />
                <Divider />
                {findings.length === 0 && (
                  <CardContent>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {data?.analysis ? 'No findings.' : 'Policy analysis is not available.'}
                    </Typography>
                  </CardContent>
                )}
                <Stack divider={<Divider />}>
                  {findings.map((finding) => (
                    <Box
                      key={finding.id ?? finding.title}
                      sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, px: 2.25, py: 1.5 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          flexShrink: 0,
                          position: 'relative',
                          top: -1,
                          bgcolor: severityDot[finding.severity] ?? 'text.secondary',
                        }}
                        title={finding.severity}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2">
                          {finding.title}
                          <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                            {finding.severity}
                            {finding.category ? ` · ${finding.category}` : ''}
                          </Typography>
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {finding.description}
                        </Typography>
                        {asArray(finding.affectedPolicies).length > 0 && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Policies: {asArray(finding.affectedPolicies).join(', ')}
                          </Typography>
                        )}
                        {finding.remediation && (
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            Fix: {finding.remediation}
                          </Typography>
                        )}
                      </Box>
                      {finding.documentationUrl && (
                        <Button
                          size="small"
                          variant="outlined"
                          href={finding.documentationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ whiteSpace: 'nowrap', alignSelf: 'center' }}
                        >
                          Microsoft Documentation
                        </Button>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Card>
            </>
          )}
        </Stack>
      </Container>
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
