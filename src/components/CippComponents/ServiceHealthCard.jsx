import { useMemo } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Link as MuiLink,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { ApiGetCall } from '../../api/ApiCall'
import { getCippError } from '../../utils/get-cipp-error'
import { describeAge } from '../../utils/alert-lifecycle'

// Same filter shape the Service Issues page builds for its own info bar links.
export const OPEN_ISSUES_HREF = `/tenant/administration/service-health/issues?filters=${encodeURIComponent(
  JSON.stringify([{ id: 'isResolved', value: 'No' }])
)}`

const isIncident = (item) => String(item?.classification ?? '').toLowerCase() === 'incident'
// Graph returns a boolean; the cached copy round-trips through JSON and stays one, but a string
// 'true' from an older row must not slip through as open.
const isOpen = (item) => String(item?.isResolved ?? '').toLowerCase() !== 'true'

// Incidents above advisories, most recently updated first within each group.
export const sortServiceHealthIssues = (items) =>
  [...(Array.isArray(items) ? items : [])].filter(isOpen).sort((a, b) => {
    const rank = Number(isIncident(b)) - Number(isIncident(a))
    if (rank !== 0) return rank
    return String(b?.lastModifiedDateTime ?? '').localeCompare(
      String(a?.lastModifiedDateTime ?? '')
    )
  })

const counted = (count, singular, pluralForm) =>
  `${count} ${count === 1 ? singular : pluralForm}`

const rowSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  py: 1,
}

const IssueRow = ({ item }) => {
  const incident = isIncident(item)
  const updated = describeAge(item.lastModifiedDateTime)
  const secondary = [item.service, item.status, updated && `updated ${updated}`]
    .filter(Boolean)
    .join(' · ')

  return (
    <Box sx={rowSx}>
      {/* flex: 1 + minWidth: 0 lets the ellipsis engage before the row runs under the chips */}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" noWrap title={item.title} sx={{ fontWeight: 500 }}>
          {item.title}
        </Typography>
        {/* component="div": caption is a <span> by default and noWrap does nothing inline */}
        <Typography
          variant="caption"
          component="div"
          noWrap
          title={secondary}
          sx={{ color: 'text.secondary' }}
        >
          {secondary}
        </Typography>
      </Box>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
        {/* AllTenants rows carry the tenants the issue reached; single-tenant rows do not */}
        {item.TenantCount !== undefined && (
          <Chip size="small" variant="outlined" label={item.Tenant} />
        )}
        <Chip
          size="small"
          variant="outlined"
          color={incident ? 'error' : 'warning'}
          icon={incident ? <CippIcons.Error /> : <CippIcons.Info />}
          label={incident ? 'Incident' : 'Advisory'}
        />
      </Stack>
    </Box>
  )
}

export const ServiceHealthCard = ({ tenantFilter, sx }) => {
  // Open=true keeps resolved issues (and their post history) off the wire. A single tenant reads
  // live from Graph so a fresh outage shows up immediately; AllTenants always reads the cache.
  const issuesApi = ApiGetCall({
    url: '/api/ListServiceHealthIssues',
    queryKey: `ServiceHealthIssues-open-${tenantFilter}`,
    data: { tenantFilter, Open: true },
    waiting: !!tenantFilter,
  })

  const items = useMemo(() => sortServiceHealthIssues(issuesApi.data), [issuesApi.data])
  const incidentCount = items.filter(isIncident).length
  const advisoryCount = items.length - incidentCount

  // A disabled query (no tenant yet) reports isLoading=false in react-query v5, so guard
  // on tenantFilter to avoid flashing a false "all clear" before the tenant resolves.
  const isLoading = !tenantFilter || issuesApi.isLoading

  const renderBody = () => {
    if (isLoading) {
      return (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={28} width="60%" />
          <Skeleton variant="rounded" height={44} />
          <Skeleton variant="rounded" height={44} />
          <Skeleton variant="rounded" height={44} />
        </Stack>
      )
    }

    if (issuesApi.isError) {
      return (
        <Typography variant="body2" color="error" sx={{ py: 2, textAlign: 'center' }}>
          {getCippError(issuesApi.error)}
        </Typography>
      )
    }

    return (
      <>
        <Stack useFlexGap direction="row" sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            size="small"
            color={incidentCount ? 'error' : 'success'}
            variant={incidentCount ? 'filled' : 'outlined'}
            icon={<CippIcons.Error />}
            label={counted(incidentCount, 'Incident', 'Incidents')}
          />
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            icon={<CippIcons.Info />}
            label={counted(advisoryCount, 'Advisory', 'Advisories')}
          />
        </Stack>

        <Box sx={{ maxHeight: 360, overflowY: 'auto', pr: 0.5 }}>
          {items.length > 0 ? (
            <Stack divider={<Divider flexItem />}>
              {items.map((item) => (
                <IssueRow key={item.id} item={item} />
              ))}
            </Stack>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}
            >
              No open Microsoft service issues.
            </Typography>
          )}
        </Box>
      </>
    )
  }

  return (
    <Card sx={{ height: '100%', ...sx }}>
      <CardHeader
        title={
          <MuiLink
            component={Link}
            href="/tenant/administration/service-health"
            color="inherit"
            underline="hover"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
          >
            <CippIcons.Cloud sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1">Service health</Typography>
          </MuiLink>
        }
        action={
          <Button
            component={Link}
            href={OPEN_ISSUES_HREF}
            size="small"
            startIcon={<CippIcons.OpenInNew />}
          >
            View all
          </Button>
        }
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent>{renderBody()}</CardContent>
    </Card>
  )
}
