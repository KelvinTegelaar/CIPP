import {
  Box,
  ButtonBase,
  Card,
  Chip,
  Collapse,
  LinearProgress,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import Link from 'next/link'
import { useState } from 'react'
import { parseCippDate } from '../../utils/parse-cipp-date'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'

// Shared severity vocabulary for the All Tenants dashboard. Kept separate from the primary accent
// so a card's colour always encodes state, never branding.
export const SEVERITY_COLORS = {
  critical: 'error.main',
  warning: 'warning.main',
  ok: 'success.main',
  info: 'info.main',
  neutral: 'divider',
}

export const severityColor = (severity) => SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.neutral

const CHIP_COLOR = {
  critical: 'error',
  warning: 'warning',
  ok: 'success',
  info: 'info',
  neutral: 'default',
}

/**
 * KPI tile with a severity stripe down the left edge, so the thing needing attention reads at a
 * glance without parsing the number first. Pass `link` to make the whole tile navigate to the page
 * where the number can be dug into.
 */
export const AllTenantsStatTile = ({
  value,
  label,
  meta,
  severity = 'neutral',
  isFetching,
  link,
}) => {
  const tile = (
    <Card
      sx={{
        height: '100%',
        p: 2,
        borderLeft: 3,
        borderLeftColor: severityColor(severity),
        ...(link && {
          cursor: 'pointer',
          '&:hover': { backgroundColor: 'action.hover' },
        }),
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.1,
          color: severity === 'neutral' ? 'text.primary' : severityColor(severity),
        }}
      >
        {isFetching ? <Skeleton width={64} /> : value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
        {isFetching ? <Skeleton width="80%" /> : label}
      </Typography>
      {(meta || isFetching) && (
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
          {isFetching ? <Skeleton width="45%" /> : meta}
        </Typography>
      )}
    </Card>
  )

  if (!link) return tile

  return (
    <Link href={link} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      {tile}
    </Link>
  )
}

/**
 * Rows of `label — stacked bar — value`. Segments are drawn proportionally to `max` so bars stay
 * comparable across rows rather than each normalising to its own total.
 */
export const AllTenantsBarList = ({ rows = [], max, isFetching, emptyText = 'No data' }) => {
  if (isFetching) {
    return (
      <Stack spacing={1.5}>
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} variant="rounded" height={22} />
        ))}
      </Stack>
    )
  }

  if (!rows.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
        {emptyText}
      </Typography>
    )
  }

  const scale = max ?? Math.max(...rows.map((row) => row.total ?? 0), 1)

  return (
    <Stack spacing={1.5}>
      {rows.map((row) => (
        <Box
          key={row.label}
          sx={{
            display: 'grid',
            gridTemplateColumns: '110px 1fr 52px',
            gap: 1.25,
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary" noWrap title={row.label}>
            {row.label}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              height: 8,
              borderRadius: 5,
              overflow: 'hidden',
              backgroundColor: 'action.hover',
            }}
          >
            {(row.segments ?? []).map((segment, index) => (
              <Tooltip key={index} title={`${segment.label ?? ''} ${segment.value}`.trim()}>
                <Box
                  sx={{
                    width: `${((segment.value ?? 0) / scale) * 100}%`,
                    backgroundColor: severityColor(segment.severity),
                  }}
                />
              </Tooltip>
            ))}
          </Box>
          <Typography
            variant="body2"
            sx={{
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 600,
            }}
          >
            {row.total}
          </Typography>
        </Box>
      ))}
    </Stack>
  )
}

/**
 * Severity-striped rows with an optional status chip. Used wherever a card is a short worklist
 * rather than a chart.
 */
export const AllTenantsRowList = ({ rows = [], isFetching, emptyText = 'Nothing to report' }) => {
  if (isFetching) {
    return (
      <Stack spacing={0.5}>
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} variant="rounded" height={48} />
        ))}
      </Stack>
    )
  }

  if (!rows.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
        {emptyText}
      </Typography>
    )
  }

  return (
    <Stack spacing={0.5}>
      {rows.map((row, index) => (
        <Stack
          key={row.key ?? `${row.name}-${index}`}
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            px: 1.25,
            py: 1.25,
            borderRadius: 1,
            borderLeft: 3,
            borderLeftColor: severityColor(row.severity),
            backgroundColor: 'action.hover',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" component="div" noWrap title={row.name}>
              {row.name}
            </Typography>
            {row.detail && (
              // component="div" matters: caption renders as a <span> by default, and noWrap's
              // overflow/text-overflow do nothing on an inline element — the text would run under
              // the chip instead of truncating.
              <Typography
                variant="caption"
                component="div"
                color="text.secondary"
                noWrap
                title={row.detail}
              >
                {row.detail}
              </Typography>
            )}
          </Box>
          {row.chipLabel && (
            <Chip
              size="small"
              variant="outlined"
              color={CHIP_COLOR[row.severity] ?? 'default'}
              label={row.chipLabel}
              sx={{ flexShrink: 0 }}
            />
          )}
        </Stack>
      ))}
    </Stack>
  )
}

// Same 72-hour boundary the summary line uses, so a row reading "Oldest collection 60 hours old"
// never expands to a collection labelled "3 days ago".
const formatAge = (hours) => {
  if (hours >= 72) return `${Math.round(hours / 24)} days ago`
  if (hours >= 1) return `${Math.round(hours)} hours ago`
  return 'under an hour ago'
}

/**
 * The cache freshness worklist: one row per tenant that is behind, expandable to the collections
 * holding it back and when each last ran.
 *
 * Scrolls rather than truncating. When a whole collection group fails estate-wide the affected
 * tenants number in the dozens, and the previous five-row cut said "stale" without ever saying which
 * collection or how stale — which is the only part you can act on.
 */
export const AllTenantsCacheList = ({
  rows = [],
  isFetching,
  emptyText = 'Nothing to report',
  maxHeight = 296,
}) => {
  const [expanded, setExpanded] = useState(null)

  if (isFetching) {
    return (
      <Stack spacing={0.5}>
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} variant="rounded" height={48} />
        ))}
      </Stack>
    )
  }

  if (!rows.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
        {emptyText}
      </Typography>
    )
  }

  return (
    <Stack spacing={0.5} sx={{ maxHeight, overflowY: 'auto', pr: 0.5 }}>
      {rows.map((row, index) => {
        const key = row.domain ?? `${row.name}-${index}`
        const isOpen = expanded === key
        const collections = row.collections ?? []
        const canExpand = collections.length > 0

        const header = (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ px: 1.25, py: 1.25, width: '100%' }}
          >
            <Box sx={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <Typography variant="subtitle2" component="div" noWrap title={row.name}>
                {row.name}
              </Typography>
              {row.detail && (
                <Typography
                  variant="caption"
                  component="div"
                  color="text.secondary"
                  noWrap
                  title={row.detail}
                >
                  {row.detail}
                </Typography>
              )}
            </Box>
            {canExpand && (
              <>
                <Chip
                  size="small"
                  variant="outlined"
                  color={CHIP_COLOR[row.severity] ?? 'default'}
                  label={`${collections.length} stale`}
                  sx={{ flexShrink: 0 }}
                />
                <ExpandMore
                  fontSize="small"
                  sx={{
                    flexShrink: 0,
                    color: 'text.secondary',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 150ms',
                  }}
                />
              </>
            )}
          </Stack>
        )

        return (
          <Box
            key={key}
            sx={{
              borderRadius: 1,
              borderLeft: 3,
              borderLeftColor: severityColor(row.severity),
              backgroundColor: 'action.hover',
            }}
          >
            {canExpand ? (
              <ButtonBase
                onClick={() => setExpanded(isOpen ? null : key)}
                aria-expanded={isOpen}
                sx={{ width: '100%', display: 'block', borderRadius: 1 }}
              >
                {header}
              </ButtonBase>
            ) : (
              header
            )}
            <Collapse in={isOpen} unmountOnExit>
              <Stack spacing={0.25} sx={{ px: 1.25, pb: 1.25 }}>
                {collections.map((collection) => (
                  <Stack
                    key={collection.type}
                    direction="row"
                    alignItems="baseline"
                    spacing={1}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    <Typography
                      variant="caption"
                      component="div"
                      noWrap
                      title={collection.type}
                      sx={{ minWidth: 0 }}
                    >
                      {collection.type}
                    </Typography>
                    <Typography
                      variant="caption"
                      component="div"
                      color="text.secondary"
                      sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {parseCippDate(collection.lastRefresh).toLocaleString()} ·{' '}
                      {formatAge(collection.ageHours)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Collapse>
          </Box>
        )
      })}
    </Stack>
  )
}

/** Labelled percentage meters, for pass-rate style measures. */
export const AllTenantsMeterList = ({ meters = [], isFetching }) => {
  if (isFetching) {
    return (
      <Stack spacing={2}>
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} variant="rounded" height={26} />
        ))}
      </Stack>
    )
  }

  return (
    <Stack spacing={2}>
      {meters.map((meter) => (
        <Box key={meter.label}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="body2" color="text.secondary">
              {meter.label}
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                fontVariantNumeric: 'tabular-nums',
                color: severityColor(meter.severity),
              }}
            >
              {meter.percent}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, meter.percent))}
            sx={{
              mt: 0.75,
              height: 8,
              borderRadius: 5,
              backgroundColor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                backgroundColor: severityColor(meter.severity),
              },
            }}
          />
          {meter.caption && (
            <Typography variant="caption" color="text.disabled">
              {meter.caption}
            </Typography>
          )}
        </Box>
      ))}
    </Stack>
  )
}

/**
 * Compact trend area chart, built on recharts to match the charts on the Worker Health page.
 *
 * The Y axis is scaled to the series' own range (padded, never narrower than 10 points) rather than
 * a full 0-100, so small real movements stay legible instead of flattening into a straight line.
 */
export const AllTenantsTrendChart = ({
  points = [],
  severity = 'ok',
  height = 150,
  unit = '%',
  isFetching,
}) => {
  const theme = useTheme()

  if (isFetching) {
    return <Skeleton variant="rounded" height={height} />
  }

  if (points.length < 2) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" color="text.disabled">
          Not enough history yet for a trend
        </Typography>
      </Box>
    )
  }

  const values = points.map((point) => point.percent)
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const mid = (lo + hi) / 2
  const span = Math.max(hi - lo, 10)
  const min = Math.max(0, Math.floor(mid - span / 2 - span * 0.2))
  const max = Math.min(100, Math.ceil(mid + span / 2 + span * 0.2))

  const stroke =
    {
      critical: theme.palette.error.main,
      warning: theme.palette.warning.main,
      ok: theme.palette.success.main,
      info: theme.palette.info.main,
    }[severity] ?? theme.palette.primary.main

  return (
    <Box sx={{ height }}>
      {/* numeric height, recharts warns before its first measure when both sizes are percentages */}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={points} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickMargin={6} minTickGap={24} />
          <YAxis
            domain={[min, max]}
            tick={{ fontSize: 10 }}
            tickMargin={4}
            width={40}
            unit={unit}
          />
          <RechartsTooltip
            formatter={(value) => [`${value}${unit}`, 'Average']}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
            }}
          />
          <Area
            type="monotone"
            dataKey="percent"
            name="Average"
            stroke={stroke}
            fill={stroke}
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}

/** Band heading that separates the dashboard into Portfolio / Security / Operations. */
export const AllTenantsBandHeading = ({ title, description }) => (
  <Stack useFlexGap
    direction="row"
    alignItems="baseline"
    spacing={1.5}
    sx={{
      pb: 1,
      mb: 2,
      borderBottom: 1,
      borderColor: 'divider',
      flexWrap: 'wrap',
    }}
  >
    <Typography variant="h6">{title}</Typography>
    <Typography variant="caption" color="text.disabled">
      {description}
    </Typography>
  </Stack>
)
