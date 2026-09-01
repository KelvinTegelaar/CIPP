import { useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Card, CardHeader, Chip, Skeleton, Stack, Tooltip, Typography } from '@mui/material'
import { CippPropertyList } from './CippPropertyList'
import { CippCopyToClipBoard } from './CippCopyToClipboard'
import { LinearProgressWithLabel } from '../linearProgressWithLabel'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { usePermissions } from '../../hooks/use-permissions'

const isSiteLike = (item) =>
  item && (item.type === 'site' || (item.canOpen && item.type !== 'recycleFolder'))

const formatBytes = (bytes) => {
  const num = Number(bytes)
  if (bytes === null || bytes === undefined || bytes === '' || Number.isNaN(num)) return null
  if (num < 1024) return `${num} B`
  const gb = num / (1024 * 1024 * 1024)
  if (gb >= 0.01) return `${gb.toLocaleString(undefined, { maximumFractionDigits: 2 })} GB`
  const mb = num / (1024 * 1024)
  return `${mb.toLocaleString(undefined, { maximumFractionDigits: 2 })} MB`
}

/** SPO admin quota is reported in MB — same roll-up as CippSharePointQuotaCard. */
const formatQuotaMb = (sizeInMB) => {
  const size = Number(sizeInMB)
  if (!Number.isFinite(size)) return null
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} TB`
  if (size >= 1024) return `${(size / 1024).toFixed(2)} GB`
  return `${Math.round(size)} MB`
}

const toMbFromBytes = (bytes) => {
  const num = Number(bytes)
  if (!Number.isFinite(num) || num < 0) return null
  return num / (1024 * 1024)
}

const QuotaMeter = ({ usedMB, totalMB, usedTooltip, freeTooltip, caption, loading = false }) => {
  if (loading) {
    return <Skeleton variant="rounded" height={36} sx={{ maxWidth: 280 }} />
  }

  const hasQuota = Number.isFinite(usedMB) && Number.isFinite(totalMB) && totalMB > 0
  if (!hasQuota) {
    return (
      <Typography variant="body2" sx={{
        color: "text.secondary"
      }}>Unavailable
              </Typography>
    );
  }

  const quotaPct = Math.min(100, Math.round((usedMB / totalMB) * 1000) / 10)
  const freeMB = Math.max(0, totalMB - usedMB)

  return (
    <Stack spacing={0.75} sx={{ width: '100%', maxWidth: 320, pt: 0.25 }}>
      <LinearProgressWithLabel value={quotaPct} colourLevels="flipped" addedLabel="used" />
      <Stack direction="row" spacing={0.75} useFlexGap sx={{
        flexWrap: "wrap"
      }}>
        <Tooltip title={usedTooltip}>
          <Chip
            size="small"
            variant="outlined"
            label={`${formatQuotaMb(usedMB)} / ${formatQuotaMb(totalMB)}`}
          />
        </Tooltip>
        <Tooltip title={freeTooltip}>
          <Chip size="small" variant="outlined" label={`${formatQuotaMb(freeMB)} free`} />
        </Tooltip>
      </Stack>
      {caption ? (
        <Typography variant="caption" sx={{
          color: "text.secondary"
        }}>
          {caption}
        </Typography>
      ) : null}
    </Stack>
  );
}

QuotaMeter.propTypes = {
  usedMB: PropTypes.number,
  totalMB: PropTypes.number,
  usedTooltip: PropTypes.string,
  freeTooltip: PropTypes.string,
  caption: PropTypes.node,
  loading: PropTypes.bool,
}

const formatVersionPolicy = (props) => {
  if (!props || typeof props !== 'object') return null
  if (props.InheritVersionPolicyFromTenant) {
    return 'Tenant default'
  }
  const major =
    props.MajorVersionLimit === null || props.MajorVersionLimit === undefined
      ? null
      : Number(props.MajorVersionLimit)
  const days =
    props.ExpireVersionsAfterDays === null || props.ExpireVersionsAfterDays === undefined
      ? null
      : Number(props.ExpireVersionsAfterDays)

  if (props.EnableAutoExpirationVersionTrim) {
    const parts = ['Auto trim']
    if (major !== null && !Number.isNaN(major) && major > 0) {
      parts.push(`${major.toLocaleString()} major`)
    }
    if (days !== null && !Number.isNaN(days) && days > 0) {
      parts.push(`${days.toLocaleString()} days`)
    }
    return parts.join(' · ')
  }

  if (major !== null && !Number.isNaN(major)) {
    if (major <= 0) return 'Unlimited / not set'
    const label = `${major.toLocaleString()} major versions`
    if (days !== null && !Number.isNaN(days) && days > 0) {
      return `${label} · expire after ${days.toLocaleString()} days`
    }
    return label
  }

  return '—'
}

const summarizeSites = (sites) => {
  if (!Array.isArray(sites)) return null

  let storage = 0
  let files = 0
  let storageKnown = false
  let filesKnown = false
  const byType = {}

  for (const site of sites) {
    const bytes = Number(site.storageUsedInBytes)
    if (Number.isFinite(bytes)) {
      storage += bytes
      storageKnown = true
    }
    const fileCount = Number(site.fileCount)
    if (Number.isFinite(fileCount)) {
      files += fileCount
      filesKnown = true
    }
    const type = site.siteType?.trim() || 'Unknown'
    byType[type] = (byType[type] || 0) + 1
  }

  const typeEntries = Object.entries(byType).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  )

  return {
    sites: sites.length,
    storage: storageKnown ? storage : null,
    files: filesKnown ? files : null,
    typeEntries,
  }
}

/**
 * Left-hand property panel for the selected SharePoint site or library.
 * List columns cover type / name / files / size — this pane keeps IDs, URL, and site version policy.
 * At the root site list with nothing selected, shows a rollup of the loaded sites.
 */
export const CippSharePointBrowserProperties = ({
  item,
  summaryItems,
  tenantFilter,
  isFetching = false,
  emptyMessage = 'Select an item to view details.',
}) => {
  const { checkPermissions } = usePermissions()
  const canReadQuota = checkPermissions(['Sharepoint.Admin.Read', 'Sharepoint.Admin.ReadWrite'])
  const showSummary = !item && Array.isArray(summaryItems)
  const quotaEnabled =
    showSummary && Boolean(tenantFilter) && tenantFilter !== 'AllTenants' && canReadQuota

  const siteUrl = isSiteLike(item) ? item.webUrl : null
  const siteId = isSiteLike(item) ? item.id : null
  const sitePropsApi = ApiPostCall({})
  const quotaApi = ApiGetCall({
    url: '/api/ListSharepointQuota',
    data: { tenantFilter },
    queryKey: `${tenantFilter}-ListSharepointQuota`,
    waiting: quotaEnabled,
  })

  useEffect(() => {
    if (!tenantFilter || (!siteUrl && !siteId)) return
    sitePropsApi.mutate({
      url: '/api/ExecSiteBrowserActions',
      data: {
        Action: 'GetSiteProperties',
        tenantFilter,
        SiteUrl: siteUrl,
        SiteId: siteId,
      },
    })
    // refetch when the selected site changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantFilter, siteUrl, siteId])

  const rawSiteProps = sitePropsApi.data?.data?.Results
  const normalizedSiteUrl = siteUrl ? siteUrl.replace(/\/+$/, '') : null
  const siteAdminProps =
    typeof rawSiteProps === 'object' &&
    rawSiteProps !== null &&
    !Array.isArray(rawSiteProps) &&
    (!normalizedSiteUrl ||
      !rawSiteProps.Url ||
      String(rawSiteProps.Url).replace(/\/+$/, '') === normalizedSiteUrl)
      ? rawSiteProps
      : null
  const versionsLabel = formatVersionPolicy(siteAdminProps)
  const versionsFetching = Boolean(
    (siteUrl || siteId) && (sitePropsApi.isPending || (!siteAdminProps && !sitePropsApi.isError))
  )

  const rootSummary = useMemo(
    () => (showSummary ? summarizeSites(summaryItems) : null),
    [showSummary, summaryItems]
  )
  const summaryLoading = Boolean(
    showSummary && isFetching && summaryItems.length === 0
  )

  const usedMB = Number(quotaApi.data?.GeoUsedStorageMB)
  const totalMB = Number(quotaApi.data?.TenantStorageMB)
  const hasQuota = Number.isFinite(usedMB) && Number.isFinite(totalMB) && totalMB > 0
  const quotaFetching = quotaEnabled && quotaApi.isFetching && !hasQuota

  const siteUsedFromProps = Number(siteAdminProps?.StorageUsage)
  const siteQuotaFromProps = Number(siteAdminProps?.StorageMaximumLevel)
  const siteWarningFromProps = Number(siteAdminProps?.StorageWarningLevel)
  const siteUsedFromItem = toMbFromBytes(item?.storageUsedInBytes)
  const siteUsedMB = Number.isFinite(siteUsedFromProps)
    ? siteUsedFromProps
    : siteUsedFromItem
  const siteQuotaMB = Number.isFinite(siteQuotaFromProps) ? siteQuotaFromProps : null
  const siteNearWarning =
    Number.isFinite(siteWarningFromProps) &&
    Number.isFinite(siteUsedMB) &&
    siteUsedMB >= siteWarningFromProps
  const siteQuotaLoading = Boolean(
    isSiteLike(item) && versionsFetching && !Number.isFinite(siteQuotaMB)
  )

  const propertyItems = (() => {
    if (!item) {
      if (!rootSummary) return []
      const rows = [
        {
          label: 'Sites',
          value: rootSummary.sites.toLocaleString(),
        },
        {
          label: 'Listed storage',
          value: formatBytes(rootSummary.storage) || '—',
        },
      ]

      if (quotaEnabled) {
        rows.push({
          label: 'Tenant quota',
          value: (
            <QuotaMeter
              loading={quotaFetching}
              usedMB={usedMB}
              totalMB={totalMB}
              usedTooltip="Used across the shared tenant storage pool (SharePoint + OneDrive)"
              freeTooltip="Remaining in the tenant pool"
              caption="Shared tenant pool — not site-specific."
            />
          ),
        })
      }

      rows.push(
        {
          label: 'Total files',
          value:
            rootSummary.files !== null ? rootSummary.files.toLocaleString() : '—',
        },
        {
          label: 'By type',
          value: rootSummary.typeEntries.length ? (
            <Stack
              direction="row"
              spacing={0.75}
              useFlexGap
              sx={{
                flexWrap: "wrap",
                pt: 0.25
              }}>
              {rootSummary.typeEntries.map(([type, count], index) => (
                <Chip
                  key={type}
                  size="small"
                  variant={index === 0 ? 'filled' : 'outlined'}
                  label={`${type} · ${count.toLocaleString()}`}
                />
              ))}
            </Stack>
          ) : (
            '—'
          ),
        }
      )

      return rows
    }

    if (item.type === 'recycleFolder') {
      return [
        { label: 'Type', value: 'Folder (recycle path)' },
        {
          label: 'Path',
          value: item.dirName ? <CippCopyToClipBoard text={item.dirName} type="chip" /> : '—',
        },
      ]
    }

    if (item.type === 'recycleItem') {
      return [
        { label: 'Type', value: item.siteType || '—' },
        { label: 'State', value: item.itemState || '—' },
        {
          label: 'Size',
          value: formatBytes(item.storageUsedInBytes) || '—',
        },
        { label: 'Deleted by', value: item.deletedByName || '—' },
        {
          label: 'Deleted',
          value: item.createdDateTime
            ? new Date(item.createdDateTime).toLocaleString()
            : '—',
        },
        {
          label: 'Path',
          value: item.dirName ? <CippCopyToClipBoard text={item.dirName} type="chip" /> : '—',
        },
        {
          label: 'Item ID',
          value: item.id ? <CippCopyToClipBoard text={item.id} type="chip" /> : '—',
        },
      ]
    }

    if (isSiteLike(item)) {
      return [
        {
          label: 'Description',
          value: item.description?.trim() ? item.description : '—',
        },
        {
          label: 'Site quota',
          value: (
            <QuotaMeter
              loading={siteQuotaLoading}
              usedMB={siteUsedMB}
              totalMB={siteQuotaMB}
              usedTooltip="Storage used by this site against its allocated quota"
              freeTooltip="Remaining before this site hits its quota"
              caption={
                siteNearWarning
                  ? 'Near warning level — reclaim recycle or trim versions before writes lock.'
                  : 'Site allocation from SharePoint admin properties.'
              }
            />
          ),
        },
        {
          label: 'Versions',
          value: versionsFetching ? (
            <Skeleton variant="text" sx={{ maxWidth: 180 }} />
          ) : (
            versionsLabel || '—'
          ),
        },
        {
          label: 'Site ID',
          value: item.siteId ? <CippCopyToClipBoard text={item.siteId} type="chip" /> : '—',
        },
        {
          label: 'Graph ID',
          value: item.id ? <CippCopyToClipBoard text={item.id} type="chip" /> : '—',
        },
        {
          label: 'Web ID',
          value: item.webId ? <CippCopyToClipBoard text={item.webId} type="chip" /> : '—',
        },
        {
          label: 'URL',
          value: item.webUrl ? <CippCopyToClipBoard text={item.webUrl} type="chip" /> : '—',
        },
      ]
    }

    return [
      { label: 'Template', value: item.template || '—' },
      {
        label: 'List ID',
        value: item.id ? <CippCopyToClipBoard text={item.id} type="chip" /> : '—',
      },
      {
        label: 'Site ID',
        value: item.siteId ? <CippCopyToClipBoard text={item.siteId} type="chip" /> : '—',
      },
      {
        label: 'URL',
        value: item.webUrl ? <CippCopyToClipBoard text={item.webUrl} type="chip" /> : '—',
      },
    ]
  })()

  const subheader = (() => {
    if (!item) return rootSummary ? 'Overview' : 'Nothing selected'
    if (item.type === 'recycleFolder') return 'Recycle folder'
    if (item.type === 'recycleItem') return 'Deleted item'
    if (item.type === 'site' || (item.canOpen && item.type !== 'recycleFolder')) return 'Site'
    return 'Library'
  })()

  const title = item?.displayName ?? item?.name ?? (rootSummary ? 'Sites' : 'Properties')
  const showEmptyPrompt = !item && !Array.isArray(summaryItems) && !isFetching

  return (
    <Card sx={{ height: '100%', minHeight: 360 }}>
      <CardHeader
        title={title}
        subheader={subheader}
        slotProps={{
          title: { variant: 'h6', noWrap: true },
          subheader: { variant: 'caption' }
        }} />
      {showEmptyPrompt ? (
        <Typography
          sx={{
            color: "text.secondary",
            px: 3,
            pb: 2
          }}>
          {emptyMessage}
        </Typography>
      ) : (
        <CippPropertyList
          isFetching={
            summaryLoading || (isFetching && !item && !Array.isArray(summaryItems))
          }
          propertyItems={
            propertyItems.length
              ? propertyItems
              : rootSummary || Array.isArray(summaryItems)
                ? [
                    { label: 'Sites', value: '' },
                    { label: 'Listed storage', value: '' },
                    ...(quotaEnabled ? [{ label: 'Tenant quota', value: '' }] : []),
                    { label: 'Total files', value: '' },
                    { label: 'By type', value: '' },
                  ]
                : [
                    { label: 'Description', value: '' },
                    { label: 'Site quota', value: '' },
                    { label: 'Versions', value: '' },
                    { label: 'Site ID', value: '' },
                    { label: 'URL', value: '' },
                  ]
          }
          copyItems={false}
        />
      )}
    </Card>
  );
}

CippSharePointBrowserProperties.propTypes = {
  item: PropTypes.object,
  summaryItems: PropTypes.array,
  tenantFilter: PropTypes.string,
  isFetching: PropTypes.bool,
  emptyMessage: PropTypes.string,
}
