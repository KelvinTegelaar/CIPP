import { useMemo, useRef, useState } from 'react'
import { Layout as DashboardLayout } from '../../../layouts/index'
import { CippInfoBar } from '../../../components/CippCards/CippInfoBar'
import { CippMultiQueueTracker } from '../../../components/CippComponents/CippMultiQueueTracker'
import { CippQueryRefreshButton } from '../../../components/CippComponents/CippQueryRefreshButton'
import { CippChartCard } from '../../../components/CippCards/CippChartCard'
import { CippImageCard } from '../../../components/CippCards/CippImageCard'
import { CippSharePointQuotaCard } from '../../../components/CippCards/CippSharePointQuotaCard'
import { CippDataTable } from '../../../components/CippTable/CippDataTable'
import { CippApiDialog } from '../../../components/CippComponents/CippApiDialog'
import { CippStorageCleanupDrawer } from '../../../components/CippComponents/CippStorageCleanupDrawer'
import { useDialog } from '../../../hooks/use-dialog'
import { ApiGetCall } from '../../../api/ApiCall'
import { useSettings } from '../../../hooks/use-settings'
import { usePermissions } from '../../../hooks/use-permissions'
import {
  CippAnonymizedReportAlert,
  isReportAnonymized,
} from '../../../components/CippComponents/CippAnonymizedReportAlert'
import {
  Alert,
  Button,
  Chip,
  Container,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import {
  Assessment,
  Archive,
  CleaningServices,
  FolderOpen,
  Launch,
  Storage as StorageIcon,
  Tune,
  WarningAmber,
} from '@mui/icons-material'
import {
  BuildingLibraryIcon,
  CloudArrowDownIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { CippHead } from '../../../components/CippComponents/CippHead'
import {
  buildCleanupOpportunities,
  formatCleanupBytes,
  rollupCleanupBySite,
  summarizeCleanupSites,
} from '../../../utils/storage-cleanup-opportunities'

const EMPTY_ROWS = []
const EMPTY_SCANS = {}
const INACTIVE_DAYS = 90
const NEAR_QUOTA_PCT = 80
const TOP_SITES_CHART = 10

const syncRows = [{ Name: 'SharePointSiteUsage' }, { Name: 'OneDriveUsage' }]
const cleanupScanRows = [{ Name: 'StorageCleanupScan' }]

/** Teams-connected SPO sites — same heuristic as Sharing Report (Group) plus channel sites. */
const isTeamsConnectedSite = (row) => {
  const normalized = String(row?.rootWebTemplate || '')
    .split('#')[0]
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
  return normalized === 'group' || normalized === 'teamchannel'
}

const isGraphCompositeSiteId = (siteId) =>
  typeof siteId === 'string' && siteId.includes(',')

const stormanUrl = (webUrl) => {
  if (!webUrl) return null
  return `${String(webUrl).replace(/\/+$/, '')}/_layouts/15/storman.aspx`
}

/** Prefill SPO storage limits (MB) from usage-report allocated GB. */
const quotaDefaultsFromRow = (row) => {
  const site = Array.isArray(row) ? row[0] : row
  const allocatedGb = Number(site?.storageAllocatedInGigabytes)
  const maxMb =
    Number.isFinite(allocatedGb) && allocatedGb > 0 ? Math.round(allocatedGb * 1024) : ''
  const warnMb =
    typeof maxMb === 'number' && maxMb > 0 ? Math.round(maxMb * 0.9) : ''
  return {
    StorageMaximumLevel: maxMb,
    StorageWarningLevel: warnMb,
  }
}

const formatSetQuotaPayload = (row, formData, tenantFilter) => {
  const formatRow = (siteRow) => {
    const payload = {
      tenantFilter: siteRow.Tenant ?? tenantFilter,
      SiteUrl: siteRow.webUrl,
    }
    const storageMax = parseInt(formData.StorageMaximumLevel, 10)
    const storageWarn = parseInt(formData.StorageWarningLevel, 10)
    if (!isNaN(storageMax) && storageMax > 0) payload.StorageMaximumLevel = storageMax
    if (!isNaN(storageWarn) && storageWarn > 0) payload.StorageWarningLevel = storageWarn
    return payload
  }
  return Array.isArray(row) ? row.map(formatRow) : formatRow(row)
}

const enrichUsageRows = (rows) => {
  if (!Array.isArray(rows)) return EMPTY_ROWS
  return rows.map((row) => {
    const used = Number(row.storageUsedInGigabytes)
    const allocated = Number(row.storageAllocatedInGigabytes)
    const percentUsed =
      Number.isFinite(used) && Number.isFinite(allocated) && allocated > 0
        ? Math.round((used / allocated) * 1000) / 10
        : null
    const metricsUrl = stormanUrl(row.webUrl)
    const browserPath = isGraphCompositeSiteId(row.siteId)
      ? `/teams-share/sharepoint2?siteId=${encodeURIComponent(row.siteId)}`
      : row.webUrl
        ? `/teams-share/sharepoint2?siteUrl=${encodeURIComponent(row.webUrl)}`
        : null
    const teamsConnected = isTeamsConnectedSite(row)
    const archiveBytes = Number(row.archivedFileDiskUsedBytes)
    const usedBytes = siteUsedBytes(row)
    return {
      ...row,
      percentUsed,
      fileArchivePercentOfSite:
        Number.isFinite(archiveBytes) && usedBytes > 0 ? percentOf(archiveBytes, usedBytes) : null,
      rootWebTemplate: row.rootWebTemplate || 'Unknown',
      teamsConnected,
      workload: teamsConnected ? 'Teams' : 'SharePoint',
      storageMetricsUrl: metricsUrl,
      browserPath,
    }
  })
}

const sumGb = (rows) =>
  rows.reduce((sum, row) => {
    const used = Number(row.storageUsedInGigabytes)
    return Number.isFinite(used) ? sum + used : sum
  }, 0)

const sumArchiveBytes = (rows) =>
  rows.reduce((sum, row) => {
    const bytes = Number(row.archivedFileDiskUsedBytes)
    return Number.isFinite(bytes) ? sum + bytes : sum
  }, 0)

const hasArchiveMetrics = (rows) =>
  Array.isArray(rows) &&
  rows.some(
    (row) => row.archivedFileDiskUsedBytes !== undefined && row.archivedFileDiskUsedBytes !== null
  )

const sumFiles = (rows) =>
  rows.reduce((sum, row) => {
    const count = Number(row.fileCount)
    return Number.isFinite(count) ? sum + count : sum
  }, 0)

const percentOf = (part, whole) => {
  const p = Number(part)
  const w = Number(whole)
  if (!Number.isFinite(p) || !Number.isFinite(w) || w <= 0) return null
  return Math.round((p / w) * 1000) / 10
}

const siteUsedBytes = (row) => {
  const bytes = Number(row?.storageUsedInBytes)
  if (Number.isFinite(bytes)) return bytes
  const gb = Number(row?.storageUsedInGigabytes)
  if (Number.isFinite(gb)) return gb * 1024 ** 3
  return null
}

/** Enrich ListSiteBrowser library rows with % of parent site used (storman-style). */
const mapLibraryPercentOfSite = (library, { parentRow } = {}) => ({
  ...library,
  percentOfSite: percentOf(library?.storageUsedInBytes, siteUsedBytes(parentRow)),
})

const nearQuotaRows = (rows) =>
  rows.filter((row) => Number.isFinite(row.percentUsed) && row.percentUsed >= NEAR_QUOTA_PCT)

const inactiveRows = (rows) => {
  const cutoff = Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000
  return rows.filter((row) => {
    if (!row.lastActivityDate) return true
    const time = Date.parse(row.lastActivityDate)
    return !Number.isFinite(time) || time < cutoff
  })
}

const templateBreakdown = (rows) => {
  const map = new Map()
  for (const row of rows) {
    const label = (row.rootWebTemplate || 'Unknown').toString()
    const used = Number(row.storageUsedInGigabytes)
    if (!Number.isFinite(used) || used <= 0) continue
    map.set(label, (map.get(label) ?? 0) + used)
  }
  return [...map.entries()]
    .map(([label, gb]) => ({ label, gb: Math.round(gb * 100) / 100 }))
    .sort((a, b) => b.gb - a.gb)
    .slice(0, 8)
}

/** System / infrastructure sites — not useful as storage "offenders" in the top-N chart. */
const SYSTEM_SITE_TEMPLATES = new Set(
  [
    'Tenant Admin Site',
    'My Site Host',
    'Basic Search Center',
    'Enterprise Search Center',
    'Compliance Policy Center',
    'SharePoint Online Tenant Fundamental Site',
    'App Catalog Site',
    'App catalog',
    'Redirect Site',
    'Redirect',
    'SRCHCENTERLITE',
    'SRCHCEN',
    'SPSMSITEHOST',
    'TENANTADMIN',
    'APPCATALOG',
    'POLICYCTR',
    'POINTPUBLISHINGHUB',
    'POINTPUBLISHINGTOPIC',
  ].map((t) => t.toLowerCase())
)

const SYSTEM_SITE_PATH_LEAVES = new Set([
  'search',
  'contenttypehub',
  'appcatalog',
  'portals/hub',
  'portals/community',
])

const sitePathLeaf = (webUrl) => {
  if (!webUrl) return ''
  try {
    const path = new URL(webUrl).pathname.replace(/^\/+|\/+$/g, '')
    if (!path) return ''
    return path.toLowerCase()
  } catch {
    return ''
  }
}

const isSystemSite = (row) => {
  const template = String(row?.rootWebTemplate || '')
    .split('#')[0]
    .trim()
    .toLowerCase()
  if (template && SYSTEM_SITE_TEMPLATES.has(template)) return true

  const path = sitePathLeaf(row?.webUrl)
  if (!path) {
    // Tenant root site: https://contoso.sharepoint.com/
    if (/\.sharepoint\.com\/?$/i.test(row?.webUrl ?? '')) return true
    return false
  }
  if (SYSTEM_SITE_PATH_LEAVES.has(path)) return true
  const leaf = path.split('/').pop()
  if (leaf && SYSTEM_SITE_PATH_LEAVES.has(leaf)) return true
  if (/\/sites\/contenttypehub$/i.test(row?.webUrl ?? '')) return true
  return false
}

const topSitesByGb = (rows) =>
  [...rows]
    .filter(
      (row) =>
        !isSystemSite(row) && Number.isFinite(Number(row.storageUsedInGigabytes))
    )
    .sort((a, b) => Number(b.storageUsedInGigabytes) - Number(a.storageUsedInGigabytes))
    .slice(0, TOP_SITES_CHART)

const Page = () => {
  const currentTenant = useSettings().currentTenant
  const { checkPermissions } = usePermissions()
  const canReadQuota = checkPermissions(['Sharepoint.Admin.Read', 'Sharepoint.Admin.ReadWrite'])
  const syncDialog = useDialog()
  const cleanupScanDialog = useDialog()
  const [syncQueueIds, setSyncQueueIds] = useState([])
  const [cleanupQueueIds, setCleanupQueueIds] = useState([])
  const newSyncRunRef = useRef(false)
  const newCleanupRunRef = useRef(false)
  const [inventoryTab, setInventoryTab] = useState(0)

  const waiting = !!currentTenant && currentTenant !== 'AllTenants'
  const spQueryKey = `ListSites-SharePointSiteUsage-${currentTenant}-true`
  const odQueryKey = `ListSites-OneDriveUsageAccount-${currentTenant}-true`
  const cleanupQueryKey = `ListStorageCleanupScan-${currentTenant}`

  const spUsage = ApiGetCall({
    url: '/api/ListSites?type=SharePointSiteUsage&UseReportDB=true',
    data: { tenantFilter: currentTenant },
    queryKey: spQueryKey,
    waiting,
  })

  const odUsage = ApiGetCall({
    url: '/api/ListSites?type=OneDriveUsageAccount&UseReportDB=true',
    data: { tenantFilter: currentTenant },
    queryKey: odQueryKey,
    waiting,
  })

  const quota = ApiGetCall({
    url: '/api/ListSharepointQuota',
    data: { tenantFilter: currentTenant },
    queryKey: `${currentTenant}-ListSharepointQuota`,
    waiting: waiting && canReadQuota,
  })

  const cleanupScan = ApiGetCall({
    url: '/api/ListStorageCleanupScan',
    data: { tenantFilter: currentTenant },
    queryKey: cleanupQueryKey,
    waiting,
  })

  const rawSpRows = useMemo(
    () => enrichUsageRows(Array.isArray(spUsage.data) ? spUsage.data : EMPTY_ROWS),
    [spUsage.data]
  )
  const odRowsBase = useMemo(
    () => enrichUsageRows(Array.isArray(odUsage.data) ? odUsage.data : EMPTY_ROWS),
    [odUsage.data]
  )

  const isFetching = spUsage.isFetching || odUsage.isFetching
  const teamsRows = useMemo(() => rawSpRows.filter((row) => row.teamsConnected), [rawSpRows])
  const classicSpRows = useMemo(() => rawSpRows.filter((row) => !row.teamsConnected), [rawSpRows])
  const teamsGb = useMemo(() => Math.round(sumGb(teamsRows) * 100) / 100, [teamsRows])
  const sharePointGb = useMemo(() => Math.round(sumGb(classicSpRows) * 100) / 100, [classicSpRows])
  const odGb = useMemo(() => Math.round(sumGb(odRowsBase) * 100) / 100, [odRowsBase])
  const teamsFiles = useMemo(() => sumFiles(teamsRows), [teamsRows])
  const sharePointFiles = useMemo(() => sumFiles(classicSpRows), [classicSpRows])
  const odFiles = useMemo(() => sumFiles(odRowsBase), [odRowsBase])

  // Prefer live SPO pool used; fall back to report sums so % of tenant still works without Admin.
  const tenantUsedGb = useMemo(() => {
    const usedMb = Number(quota.data?.GeoUsedStorageMB)
    if (Number.isFinite(usedMb) && usedMb > 0) {
      return Math.round((usedMb / 1024) * 100) / 100
    }
    const fromReports = sharePointGb + teamsGb + odGb
    return fromReports > 0 ? fromReports : null
  }, [quota.data?.GeoUsedStorageMB, sharePointGb, teamsGb, odGb])

  const spRows = useMemo(
    () =>
      rawSpRows.map((row) => ({
        ...row,
        percentOfTenant: percentOf(row.storageUsedInGigabytes, tenantUsedGb),
      })),
    [rawSpRows, tenantUsedGb]
  )
  const odRows = useMemo(
    () =>
      odRowsBase.map((row) => ({
        ...row,
        percentOfTenant: percentOf(row.storageUsedInGigabytes, tenantUsedGb),
      })),
    [odRowsBase, tenantUsedGb]
  )
  const nearQuota = useMemo(() => nearQuotaRows(spRows), [spRows])
  const inactive = useMemo(() => inactiveRows(spRows), [spRows])
  const byTemplate = useMemo(() => templateBreakdown(spRows), [spRows])
  const topSites = useMemo(() => topSitesByGb(spRows), [spRows])
  const fileArchiveBytes = useMemo(() => sumArchiveBytes(spRows), [spRows])
  const sitesWithFileArchive = useMemo(
    () => spRows.filter((row) => Number(row.archivedFileDiskUsedBytes) > 0).length,
    [spRows]
  )
  const archiveMetricsAvailable = useMemo(() => hasArchiveMetrics(rawSpRows), [rawSpRows])

  const [selectedSites, setSelectedSites] = useState([])
  const [cleanupOpen, setCleanupOpen] = useState(false)
  const [cleanupFocus, setCleanupFocus] = useState(null)

  const canWriteSite = checkPermissions(['Sharepoint.Site.ReadWrite'])

  const cleanupSummary = cleanupScan.data?.summary ?? {}
  const cleanupScans = useMemo(() => {
    const raw = cleanupScan.data?.scans
    return raw && typeof raw === 'object' ? raw : EMPTY_SCANS
  }, [cleanupScan.data?.scans])

  const opportunities = useMemo(
    () => buildCleanupOpportunities(spRows, cleanupScans),
    [spRows, cleanupScans]
  )
  const opportunitySites = useMemo(() => rollupCleanupBySite(opportunities), [opportunities])
  const opportunitySummary = useMemo(
    () => summarizeCleanupSites(opportunitySites),
    [opportunitySites]
  )
  const hasScanned = Boolean(cleanupSummary.cleanupSynced) || Object.keys(cleanupScans).length > 0
  const needsCleanupScan = cleanupScan.isSuccess && !cleanupSummary.cleanupSynced

  const opportunityByUrl = useMemo(() => {
    const map = new Map()
    for (const row of opportunitySites) {
      if (row?.siteUrl) map.set(row.siteUrl.replace(/\/+$/, ''), row)
    }
    return map
  }, [opportunitySites])

  const spRowsEnriched = useMemo(
    () =>
      spRows.map((row) => {
        const key = row?.webUrl?.replace(/\/+$/, '')
        const opp = key ? opportunityByUrl.get(key) : null
        if (!opp) {
          return {
            ...row,
            cleanupOpportunity: hasScanned ? 'No' : undefined,
            cleanupReclaimBytes: hasScanned ? 0 : undefined,
            cleanupSignals: hasScanned ? [] : undefined,
          }
        }
        const signals = []
        if (opp.versionsBytes > 0) {
          signals.push(`Versions ${formatCleanupBytes(opp.versionsBytes)}`)
        }
        if (opp.recycleBytes > 0) {
          signals.push(`Recycle ${formatCleanupBytes(opp.recycleBytes)}`)
        }
        if (opp.hasLargeLibrary) {
          signals.push(
            opp.largeLibraryCount > 1
              ? `${opp.largeLibraryCount} large libraries`
              : 'Large library'
          )
        }
        return {
          ...row,
          cleanupOpportunity: 'Yes',
          cleanupReclaimBytes: opp.reclaimBytes || 0,
          cleanupSignals: signals,
          cleanupRecommendedAction: opp.recommendedAction,
        }
      }),
    [spRows, opportunityByUrl, hasScanned]
  )

  const openCleanup = (sitesOrItem, focusItem = null) => {
    const list = Array.isArray(sitesOrItem)
      ? sitesOrItem
      : sitesOrItem
        ? [sitesOrItem]
        : selectedSites
    setCleanupFocus(focusItem)
    setSelectedSites(list.filter(Boolean))
    setCleanupOpen(true)
  }

  const anonymized =
    spRows.length > 0 && isReportAnonymized(spRows, ['ownerPrincipalName', 'ownerDisplayName'])
  const noUsageData =
    spUsage.isSuccess &&
    spRows.length > 0 &&
    spRows.every((site) => !site?.reportRefreshDate)

  const needsSync =
    (spUsage.isSuccess && spRows.length === 0) || (odUsage.isSuccess && odRows.length === 0)

  const refreshKeys = [spQueryKey, odQueryKey, `${spQueryKey}-table`, `${odQueryKey}-table`]
  const cleanupRefreshKeys = [cleanupQueryKey]

  const siteFilters = [
    {
      filterName: `Near quota (≥${NEAR_QUOTA_PCT}%)`,
      value: [{ id: 'percentUsed', value: String(NEAR_QUOTA_PCT) }],
      type: 'column',
      filterType: 'greaterThanOrEqual',
    },
    {
      filterName: 'Has cleanup opportunity',
      value: [{ id: 'cleanupOpportunity', value: 'Yes' }],
      type: 'column',
    },
    {
      filterName: 'Has file-level archive',
      value: [{ id: 'archivedFileDiskUsedGigabytes', value: '0' }],
      type: 'column',
      filterType: 'greaterThan',
    },
    {
      filterName: 'Teams-connected',
      value: [{ id: 'workload', value: 'Teams' }],
      type: 'column',
    },
    {
      filterName: 'SharePoint (non-Teams)',
      value: [{ id: 'workload', value: 'SharePoint' }],
      type: 'column',
    },
  ]

  const siteActions = [
    {
      label: 'Cleanup…',
      icon: <CleaningServices fontSize="small" />,
      noConfirm: true,
      customFunction: (row) => {
        const site = Array.isArray(row) ? row[0] : row
        if (!site || isSystemSite(site)) return
        openCleanup([site], {
          siteUrl: site.webUrl,
          site,
          type: site.cleanupRecommendedAction === 'emptyRecycle' ? 'recycle' : 'versions',
          recommendedAction: site.cleanupRecommendedAction || 'versionCleanup',
        })
      },
      condition: (row) => {
        const site = Array.isArray(row) ? row[0] : row
        return Boolean(site?.webUrl) && !isSystemSite(site) && canWriteSite
      },
    },
    {
      label: 'Set quota…',
      type: 'POST',
      icon: <Tune fontSize="small" />,
      url: '/api/ExecSetSiteProperties',
      confirmText:
        'Set storage quota for [displayName]? Limits only apply when the tenant uses manual site storage limits. Values are in MB (1024 MB = 1 GB).',
      condition: (row) => {
        const site = Array.isArray(row) ? row[0] : row
        return Boolean(site?.webUrl) && !isSystemSite(site) && canWriteSite
      },
      defaultvalues: quotaDefaultsFromRow,
      fields: [
        {
          type: 'number',
          name: 'StorageMaximumLevel',
          label: 'Storage limit (MB)',
        },
        {
          type: 'number',
          name: 'StorageWarningLevel',
          label: 'Storage warning level (MB)',
        },
      ],
      customDataformatter: (row, _action, formData) =>
        formatSetQuotaPayload(row, formData, currentTenant),
      multiPost: false,
      allowResubmit: true,
    },
    {
      label: 'Open in SharePoint',
      link: '[webUrl]',
      external: true,
      target: '_blank',
      icon: <Launch fontSize="small" />,
      multiPost: false,
      condition: (row) => Boolean(row?.webUrl),
    },
    {
      label: 'Open Storage Metrics',
      link: '[storageMetricsUrl]',
      external: true,
      target: '_blank',
      icon: <Assessment fontSize="small" />,
      multiPost: false,
      condition: (row) => Boolean(row?.storageMetricsUrl),
    },
    {
      label: 'Open in site browser',
      link: '[browserPath]',
      icon: <FolderOpen fontSize="small" />,
      multiPost: false,
      condition: (row) => Boolean(row?.browserPath),
    },
  ]

  const odActions = [
    {
      label: 'Set quota…',
      type: 'POST',
      icon: <Tune fontSize="small" />,
      url: '/api/ExecSetSiteProperties',
      confirmText:
        'Set storage quota for [displayName]? Limits only apply when the tenant uses manual site storage limits. Values are in MB (1024 MB = 1 GB).',
      condition: () => canWriteSite,
      defaultvalues: quotaDefaultsFromRow,
      fields: [
        {
          type: 'number',
          name: 'StorageMaximumLevel',
          label: 'Storage limit (MB)',
        },
        {
          type: 'number',
          name: 'StorageWarningLevel',
          label: 'Storage warning level (MB)',
        },
      ],
      customDataformatter: (row, _action, formData) =>
        formatSetQuotaPayload(row, formData, currentTenant),
      multiPost: false,
      allowResubmit: true,
    },
    {
      label: 'Open in OneDrive',
      link: '[webUrl]',
      external: true,
      target: '_blank',
      icon: <Launch fontSize="small" />,
      multiPost: false,
      condition: (row) => Boolean(row?.webUrl),
    },
  ]

  const librarySubTables = [
    {
      id: 'libraries',
      header: 'Libraries',
      label: 'View libraries',
      table: {
        title: 'Top-level libraries — [displayName]',
        queryKey: `SiteBrowserLibs-${currentTenant}-[siteId]-[webUrl]`,
        api: {
          url: '/api/ListSiteBrowser',
          data: {
            tenantFilter: currentTenant,
            SiteUrl: '[webUrl]',
          },
          dataKey: 'Results',
        },
        dataMap: mapLibraryPercentOfSite,
        defaultSorting: [{ id: 'storageUsedInBytes', desc: true }],
        simpleColumns: [
          'displayName',
          'siteType',
          'fileCount',
          'storageUsedInBytes',
          'versionEstimateBytes',
          'percentOfSite',
          'webUrl',
        ],
        actions: [
          {
            label: 'Open library',
            link: '[webUrl]',
            external: true,
            target: '_blank',
            icon: <Launch fontSize="small" />,
            multiPost: false,
            condition: (row) => Boolean(row?.webUrl),
          },
        ],
      },
    },
  ]

  return (
    <>
      <CippHead title="Storage Report" />
      <Container maxWidth={false} sx={{ flexGrow: 1, py: 2 }}>
        <Grid container spacing={2}>
          {currentTenant === 'AllTenants' ? (
            <Grid size={{ md: 4, xs: 12 }}>
              <CippImageCard
                title="Not supported"
                imageUrl="/assets/illustrations/undraw_website_ij0l.svg"
                text="The Storage Report requires a single tenant. Please select a tenant from the dropdown above."
              />
            </Grid>
          ) : (
            <>
              <Grid size={{ md: 12, xs: 12 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                  useFlexGap
                  flexWrap="wrap"
                  spacing={1}
                >
                  <Stack spacing={0.25}>
                    <Typography variant="h5">Storage Report</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tenant health for SharePoint, Teams-connected sites, and OneDrive — where
                      capacity is used. Teams storage is SharePoint capacity on group/channel sites,
                      not a separate pool. File-level M365 Archive usage (per-site archived files) is
                      included after Sync data when SharePoint admin access is available.
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CippQueryRefreshButton
                      queryKeys={[...refreshKeys, ...cleanupRefreshKeys]}
                      isFetching={isFetching || cleanupScan.isFetching}
                    />
                    <CippMultiQueueTracker
                      queueIds={syncQueueIds}
                      relatedQueryKeys={refreshKeys}
                      label="Storage sync"
                    />
                    <CippMultiQueueTracker
                      queueIds={cleanupQueueIds}
                      relatedQueryKeys={cleanupRefreshKeys}
                      label="Cleanup scan"
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        newSyncRunRef.current = true
                        syncDialog.handleOpen()
                      }}
                      startIcon={
                        <SvgIcon fontSize="small">
                          <CloudArrowDownIcon />
                        </SvgIcon>
                      }
                    >
                      Sync data
                    </Button>
                  </Stack>
                </Stack>
                {needsSync && (
                  <Alert severity="info" sx={{ mb: 1 }}>
                    No cached usage data found yet (or a workload is empty). Click Sync data to
                    refresh SharePoint site usage from SharePoint admin and OneDrive usage reports.
                  </Alert>
                )}
                {needsCleanupScan && (
                  <Alert severity="info" sx={{ mb: 1 }}>
                    No cleanup scan cached for this tenant yet. Click Scan cleanup to queue library
                    version estimates and recycle totals; reclaim columns appear when the queue
                    finishes.
                  </Alert>
                )}
                <CippAnonymizedReportAlert show={anonymized} />
                {!anonymized && noUsageData ? (
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    SharePoint usage columns look empty — Microsoft may not have generated a site
                    usage report for this tenant yet. Sync again later or check the SharePoint admin
                    center reports.
                  </Alert>
                ) : null}
              </Grid>

              <Grid size={{ md: 12, xs: 12 }}>
                <CippSharePointQuotaCard />
              </Grid>

              <Grid size={{ md: 12, xs: 12 }}>
                <CippInfoBar
                  isFetching={isFetching}
                  data={[
                    {
                      icon: <BuildingLibraryIcon />,
                      name: 'SharePoint Sites',
                      data: `${classicSpRows.length}`,
                    },
                    {
                      icon: <DocumentDuplicateIcon />,
                      name: 'Teams-Connected',
                      data: `${teamsRows.length}`,
                    },
                    {
                      icon: <StorageIcon />,
                      name: 'OneDrive Accounts',
                      data: `${odRows.length}`,
                    },
                    {
                      icon: <WarningAmber />,
                      name: `Near quota (≥${NEAR_QUOTA_PCT}%)`,
                      data: `${nearQuota.length}`,
                      color: nearQuota.length ? 'warning' : undefined,
                    },
                    {
                      icon: <ExclamationTriangleIcon />,
                      name: `Inactive (≥${INACTIVE_DAYS}d)`,
                      data: `${inactive.length}`,
                    },
                    ...(archiveMetricsAvailable
                      ? [
                          {
                            icon: <Archive />,
                            name: 'File-level archive (est.)',
                            data: formatCleanupBytes(fileArchiveBytes),
                            color: fileArchiveBytes ? 'info' : undefined,
                          },
                          {
                            icon: <Archive />,
                            name: 'Sites with file archive',
                            data: `${sitesWithFileArchive}`,
                          },
                        ]
                      : []),
                    ...(hasScanned
                      ? [
                          {
                            icon: <CleaningServices />,
                            name: 'Reclaimable (est.)',
                            data: formatCleanupBytes(opportunitySummary.reclaimBytes),
                            color: opportunitySummary.reclaimBytes ? 'warning' : undefined,
                          },
                        ]
                      : []),
                  ]}
                />
              </Grid>

              <Grid size={{ md: 12, xs: 12 }}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 0.5 }} alignItems="center">
                  <Chip
                    size="small"
                    color={nearQuota.length ? 'warning' : 'default'}
                    label={`${nearQuota.length} near quota`}
                    onClick={() => setInventoryTab(0)}
                  />
                  <Chip
                    size="small"
                    label={`${inactive.length} inactive (≥${INACTIVE_DAYS}d)`}
                    onClick={() => setInventoryTab(0)}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${teamsRows.length} Teams-connected`}
                    onClick={() => setInventoryTab(0)}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Top site ${topSites[0]?.displayName ?? '—'} (${topSites[0]?.storageUsedInGigabytes ?? 0} GB)`}
                  />
                  {archiveMetricsAvailable ? (
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={<Archive fontSize="small" />}
                      label={`${formatCleanupBytes(fileArchiveBytes)} file archive (${sitesWithFileArchive} sites)`}
                      onClick={() => setInventoryTab(0)}
                    />
                  ) : null}
                  {hasScanned ? (
                    <Chip
                      size="small"
                      color={opportunitySummary.sitesWithReclaim ? 'warning' : 'default'}
                      icon={<CleaningServices fontSize="small" />}
                      label={`~${formatCleanupBytes(opportunitySummary.reclaimBytes)} reclaimable (${opportunitySummary.sitesWithReclaim} sites)`}
                      onClick={() => setInventoryTab(0)}
                    />
                  ) : null}
                </Stack>
              </Grid>

              <Grid size={{ md: 4, xs: 12 }}>
                <CippChartCard
                  title="Storage by Workload (GB)"
                  isFetching={isFetching}
                  chartType="donut"
                  labels={['SharePoint', 'Teams', 'OneDrive']}
                  chartSeries={[sharePointGb, teamsGb, odGb]}
                  totalLabel="GB"
                />
              </Grid>
              <Grid size={{ md: 4, xs: 12 }}>
                <CippChartCard
                  title="Files by Workload"
                  isFetching={isFetching}
                  chartType="bar"
                  labels={['SharePoint', 'Teams', 'OneDrive']}
                  chartSeries={[sharePointFiles, teamsFiles, odFiles]}
                  totalLabel="Files"
                />
              </Grid>
              <Grid size={{ md: 4, xs: 12 }}>
                <CippChartCard
                  title="SharePoint by Site Template (GB)"
                  isFetching={isFetching}
                  chartType="bar"
                  labels={byTemplate.map((item) => item.label)}
                  chartSeries={byTemplate.map((item) => item.gb)}
                  totalLabel="GB"
                />
              </Grid>
              <Grid size={{ md: 12, xs: 12 }}>
                <CippChartCard
                  title={`Largest SharePoint Sites (top ${TOP_SITES_CHART})`}
                  isFetching={isFetching}
                  chartType="bar"
                  labels={topSites.map((item) => item.displayName || item.webUrl || 'Site')}
                  chartSeries={topSites.map((item) => Number(item.storageUsedInGigabytes) || 0)}
                  totalLabel="GB"
                />
              </Grid>

              <Grid size={{ md: 12, xs: 12 }}>
                <Tabs
                  value={inventoryTab}
                  onChange={(_e, next) => setInventoryTab(next)}
                  sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}
                >
                  <Tab label={`SharePoint Sites (${spRows.length})`} />
                  <Tab label={`OneDrive (${odRows.length})`} />
                </Tabs>
              </Grid>

              {inventoryTab === 0 ? (
                <Grid size={{ md: 12, xs: 12 }}>
                  <CippDataTable
                    title="SharePoint Sites"
                    queryKey={`${spQueryKey}-table`}
                    data={spRowsEnriched}
                    isFetching={spUsage.isFetching}
                    refreshFunction={spUsage}
                    actions={siteActions}
                    filters={siteFilters}
                    defaultSorting={
                      hasScanned
                        ? [{ id: 'cleanupReclaimBytes', desc: true }]
                        : [{ id: 'storageUsedInGigabytes', desc: true }]
                    }
                    onChange={(rows) => setSelectedSites(rows || [])}
                    cardButton={
                      <Button
                        size="small"
                        variant="contained"
                        disabled={spRows.length === 0}
                        onClick={() => {
                          setInventoryTab(0)
                          newCleanupRunRef.current = true
                          cleanupScanDialog.handleOpen()
                        }}
                        startIcon={<CleaningServices fontSize="small" />}
                      >
                        {hasScanned ? 'Rescan cleanup' : 'Scan cleanup'}
                      </Button>
                    }
                    simpleColumns={[
                      'libraries',
                      'displayName',
                      'workload',
                      ...(hasScanned ? ['cleanupSignals', 'cleanupReclaimBytes'] : []),
                      ...(archiveMetricsAvailable
                        ? ['archivedFileDiskUsedGigabytes', 'fileArchivePercentOfSite', 'allowFileArchive']
                        : []),
                      'rootWebTemplate',
                      'storageUsedInGigabytes',
                      'storageAllocatedInGigabytes',
                      'percentUsed',
                      'percentOfTenant',
                      'fileCount',
                      'lastActivityDate',
                      'ownerPrincipalName',
                      'webUrl',
                      'reportRefreshDate',
                    ]}
                    subTables={librarySubTables}
                  />
                </Grid>
              ) : (
                <Grid size={{ md: 12, xs: 12 }}>
                  <CippDataTable
                    title="OneDrive Accounts"
                    queryKey={`${odQueryKey}-table`}
                    data={odRows}
                    isFetching={odUsage.isFetching}
                    refreshFunction={odUsage}
                    actions={odActions}
                    defaultSorting={[{ id: 'storageUsedInGigabytes', desc: true }]}
                    simpleColumns={[
                      'displayName',
                      'ownerPrincipalName',
                      'storageUsedInGigabytes',
                      'storageAllocatedInGigabytes',
                      'percentUsed',
                      'percentOfTenant',
                      'fileCount',
                      'lastActivityDate',
                      'webUrl',
                      'reportRefreshDate',
                    ]}
                  />
                </Grid>
              )}

              <CippApiDialog
                createDialog={syncDialog}
                title="Sync storage usage data"
                api={{
                  type: 'GET',
                  url: '/api/ExecCIPPDBCache',
                  data: { Name: 'Name' },
                  confirmText:
                    'Queue a refresh of SharePoint site usage from SharePoint admin (including file-level archive metrics) and OneDrive usage for this tenant? Progress shows next to Sync; tables refresh when queues finish.',
                  relatedQueryKeys: refreshKeys,
                  onSuccess: (result) => {
                    const queueId = result?.Metadata?.QueueId
                    if (!queueId) return
                    if (newSyncRunRef.current) {
                      newSyncRunRef.current = false
                      setSyncQueueIds([queueId])
                      return
                    }
                    setSyncQueueIds((previous) =>
                      previous.includes(queueId) ? previous : [...previous, queueId]
                    )
                  },
                }}
                row={syncRows}
              />

              <CippApiDialog
                createDialog={cleanupScanDialog}
                title="Scan cleanup signals"
                api={{
                  type: 'GET',
                  url: '/api/ExecCIPPDBCache',
                  data: { Name: 'Name' },
                  confirmText:
                    'Queue a cleanup scan for this tenant? CIPP collects library version estimates and recycle-bin totals for every SharePoint site (hold-only for this report). Progress shows next to Cleanup scan; reclaim columns refresh when the queue finishes.',
                  relatedQueryKeys: cleanupRefreshKeys,
                  onSuccess: (result) => {
                    const queueId = result?.Metadata?.QueueId
                    if (!queueId) return
                    if (newCleanupRunRef.current) {
                      newCleanupRunRef.current = false
                      setCleanupQueueIds([queueId])
                      return
                    }
                    setCleanupQueueIds((previous) =>
                      previous.includes(queueId) ? previous : [...previous, queueId]
                    )
                  },
                }}
                row={cleanupScanRows}
              />

              <CippStorageCleanupDrawer
                open={cleanupOpen}
                onClose={() => {
                  setCleanupOpen(false)
                  setCleanupFocus(null)
                }}
                tenantFilter={currentTenant}
                sites={selectedSites}
                focusItem={cleanupFocus}
                initialAction={cleanupFocus?.recommendedAction}
              />
            </>
          )}
        </Grid>
      </Container>
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
