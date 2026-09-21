import { useEffect, useMemo, useState } from 'react'
import { CippIcons } from '../../../utils/icon-registry'
import { useRouter } from 'next/router'
import {
  Alert,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import Link from 'next/link'
import { Layout as DashboardLayout } from '../../../layouts/index'
import { CippHead } from '../../../components/CippComponents/CippHead'
import { CippSharePointBrowserBanner } from '../../../components/CippComponents/CippSharePointBrowserBanner'
import { CippSharePointBrowserProperties } from '../../../components/CippComponents/CippSharePointBrowserProperties'
import { CippSharePointBrowserPermissions } from '../../../components/CippComponents/CippSharePointBrowserPermissions'
import { CippSharePointBrowserStorage } from '../../../components/CippComponents/CippSharePointBrowserStorage'
import { CippSharePointLibraryCopyDialog } from '../../../components/CippComponents/CippSharePointLibraryCopyDialog'
import { CippSharePointRecycleFolderRestoreDialog } from '../../../components/CippComponents/CippSharePointRecycleFolderRestoreDialog'
import { CippSharePointFolderView } from '../../../components/CippComponents/CippSharePointFolderView'
import { CippApiDialog } from '../../../components/CippComponents/CippApiDialog'
import CippFormComponent from '../../../components/CippComponents/CippFormComponent'
import { CippDataTable } from '../../../components/CippTable/CippDataTable'
import { ApiGetCall, ApiPostCall } from '../../../api/ApiCall'
import { useIsNarrowForTables } from '../../../hooks/use-breakpoint'
import { useDialog } from '../../../hooks/use-dialog'
import { usePermissions } from '../../../hooks/use-permissions'
import { useSettings } from '../../../hooks/use-settings'
import {
  libraryRecyclePathSeed,
  projectRecycleBinTree,
  expandRecycleRestoreRows,
  RECYCLE_BIN_CAP,
} from '../../../utils/sharepoint-recycle-bin-tree'
import { useSharePointBrowserRecents } from '../../../hooks/use-sharepoint-browser-recents'

const optionValue = (value) =>
  value && typeof value === 'object' && 'value' in value ? value.value : value

const openUrls = (rows) => {
  const list = Array.isArray(rows) ? rows : [rows]
  list.forEach((row) => {
    if (row?.webUrl) {
      window.open(row.webUrl, '_blank', 'noopener,noreferrer')
    }
  })
}

const queryString = (value) => (typeof value === 'string' && value.length > 0 ? value : null)

const isSiteRow = (row) => row?.type === 'site'

const RECYCLE_ROOT = {
  id: '__recycle__',
  displayName: 'Recycle bin',
  type: 'recycleRoot',
  canOpen: false,
}

const PROTECTED_SITE_TYPES = [
  'Tenant Admin Site',
  'My Site Host',
  'Basic Search Center',
  'Compliance Policy Center',
  'SharePoint Online Tenant Fundamental Site',
  'Team Channel',
  'App Catalog Site',
  'App catalog',
]

const canDeleteSite = (row) =>
  isSiteRow(row) &&
  !PROTECTED_SITE_TYPES.includes(row.siteType) &&
  !/\.sharepoint\.com\/?$/i.test(row.webUrl ?? '') &&
  !/\/sites\/contentTypeHub$/i.test(row.webUrl ?? '')

const MOBILE_SIMPLE_COLUMNS = [
  'displayName',
  'siteType',
  'fileCount',
  'storageUsedInBytes',
  'createdDateTime',
  'webUrl',
]

/**
 * Mobile fallback: CippDataTable cards on ListSiteBrowser (root only).
 * Desktop explorer stays in SharePointBrowserDesktop — no library drill-in here.
 */
const SharePointBrowserMobile = ({ tenantFilter, canReadSite, canWriteSite }) => {
  // Distinct from desktop ApiGetCall's `…-root` key — infinite queries need { pages, pageParams }.
  const tableQueryKey = `ListSiteBrowser-${tenantFilter}-root-table`

  const actions = useMemo(
    () => [
      {
        label: 'Open in SharePoint',
        icon: <CippIcons.Launch />,
        noConfirm: true,
        customFunction: (row) => openUrls(row),
        condition: (row) => {
          const site = Array.isArray(row) ? row[0] : row
          return Boolean(site?.webUrl)
        },
      },
      {
        label: 'Storage',
        icon: <CippIcons.Storage />,
        condition: () => canReadSite,
        customComponent: (row, { drawerVisible, setDrawerVisible }) => {
          const site = Array.isArray(row) ? row[0] : row
          return (
            <CippSharePointBrowserStorage
              open={!!drawerVisible}
              onClose={() => setDrawerVisible(false)}
              item={site}
              tenantFilter={tenantFilter}
            />
          )
        },
        multiPost: false,
        hideBulk: true,
      },
      {
        label: 'Permissions',
        icon: <CippIcons.ManageAccounts />,
        condition: () => canReadSite,
        customComponent: (row, { drawerVisible, setDrawerVisible }) => {
          const site = Array.isArray(row) ? row[0] : row
          return (
            <CippSharePointBrowserPermissions
              open={!!drawerVisible}
              onClose={() => setDrawerVisible(false)}
              item={site}
              tenantFilter={tenantFilter}
              siteUrl={site?.webUrl}
              siteId={site?.id}
            />
          )
        },
        multiPost: false,
        hideBulk: true,
      },
      {
        label: 'Lock',
        type: 'POST',
        icon: <CippIcons.Lock />,
        url: '/api/ExecSetSiteProperties',
        confirmText:
          'Change lock state for [displayName]? Prefer Read only before No access. Teams-connected sites affect the whole team.',
        condition: () => canWriteSite,
        defaultvalues: { LockState: 'ReadOnly' },
        fields: [
          {
            type: 'radio',
            name: 'LockState',
            label: 'Lock state',
            options: [
              { label: 'Read only', value: 'ReadOnly' },
              { label: 'No access', value: 'NoAccess' },
              { label: 'Unlock', value: 'Unlock' },
            ],
          },
        ],
        customDataformatter: (row, _action, formData) => {
          const site = Array.isArray(row) ? row[0] : row
          return {
            tenantFilter: site?.Tenant ?? tenantFilter,
            SiteUrl: site?.webUrl,
            LockState: optionValue(formData.LockState) || 'ReadOnly',
          }
        },
        multiPost: false,
        allowResubmit: true,
        hideBulk: true,
      },
      {
        label: 'Delete',
        icon: <CippIcons.Delete />,
        noConfirm: true,
        customFunction: () => {},
        condition: (row) => {
          const site = Array.isArray(row) ? row[0] : row
          return canWriteSite && canDeleteSite(site)
        },
        hideBulk: true,
      },
    ],
    [canReadSite, canWriteSite, tenantFilter]
  )

  const cardButton = canWriteSite ? (
    <Button
      component={Link}
      href="/teams-share/sharepoint/add-site"
      startIcon={<CippIcons.Add />}
      variant="contained"
      size="small"
    >
      New Site
    </Button>
  ) : null

  if (!tenantFilter || tenantFilter === 'AllTenants') {
    return (
      <Typography sx={{
        color: "text.secondary"
      }}>Select a tenant to browse SharePoint sites.</Typography>
    );
  }

  return (
    <CippDataTable
      title="SharePoint Sites"
      api={{
        url: '/api/ListSiteBrowser',
        // noPagination: ListSiteBrowser returns the full root list in one response.
        data: { tenantFilter, noPagination: true },
        dataKey: 'Results',
      }}
      queryKey={tableQueryKey}
      simpleColumns={MOBILE_SIMPLE_COLUMNS}
      actions={actions}
      cardButton={cardButton}
      viewMode="cards"
    />
  )
}

const SharePointBrowserDesktop = ({ tenantFilter, canReadSite, canWriteSite }) => {
  const router = useRouter()
  const { checkPermissions } = usePermissions()
  const canReadRecycleBin = checkPermissions([
    'Sharepoint.SiteRecycleBin.Read',
    'Sharepoint.SiteRecycleBin.ReadWrite',
  ])
  const canRestoreRecycleBin = checkPermissions(['Sharepoint.SiteRecycleBin.ReadWrite'])

  const [checkedIds, setCheckedIds] = useState([])
  const [permissionsOpen, setPermissionsOpen] = useState(false)
  const [storageOpen, setStorageOpen] = useState(false)
  const [libraryCopyOpen, setLibraryCopyOpen] = useState(false)
  const [contentMode, setContentMode] = useState('browse')
  const [recycleStage, setRecycleStage] = useState('all')
  const [recycleView, setRecycleView] = useState('folders')
  const [recyclePath, setRecyclePath] = useState([])
  const [restoreTargets, setRestoreTargets] = useState(null)
  const [folderRestorePicker, setFolderRestorePicker] = useState(null)
  const lockDialog = useDialog()
  const { recent: recentSites, trackRecent } = useSharePointBrowserRecents(tenantFilter)

  const siteId = queryString(router.query.siteId)
  const siteUrlQuery = queryString(router.query.siteUrl)
  const [siteMeta, setSiteMeta] = useState(null)

  const openedSite =
    router.isReady && siteId
      ? {
          id: siteId,
          webUrl: siteMeta?.id === siteId ? siteMeta.webUrl : undefined,
          displayName: siteMeta?.id === siteId ? siteMeta.displayName || siteMeta.webUrl : '…',
          type: 'site',
          canOpen: true,
          storageUsedInBytes:
            siteMeta?.id === siteId ? siteMeta.storageUsedInBytes : undefined,
        }
      : null
  const atRoot = !openedSite
  const inRecycle = contentMode === 'recycle' && !atRoot
  const resolvingSiteUrl = Boolean(siteUrlQuery && !siteId)

  useEffect(() => {
    setCheckedIds([])
    setContentMode('browse')
    setRecycleStage('all')
    setRecycleView('folders')
    setRecyclePath([])
  }, [siteId, tenantFilter])

  const setBrowserLocation = (site) => {
    if (!router.isReady) return
    const query = { ...router.query }
    if (site?.id) {
      query.siteId = site.id
      setSiteMeta(site)
      trackRecent(site)
    } else {
      delete query.siteId
      setSiteMeta(null)
    }
    delete query.siteUrl
    delete query.siteName
    delete query.siteType
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true })
  }

  // Deep link from Storage Report: ?siteUrl=… → resolve Graph site id then replace URL.
  const resolveSiteApi = ApiGetCall({
    url: '/api/ListSiteBrowser',
    data: {
      tenantFilter,
      SiteUrl: siteUrlQuery,
    },
    queryKey: `ListSiteBrowser-resolveUrl-${tenantFilter}-${siteUrlQuery}`,
    waiting:
      router.isReady &&
      resolvingSiteUrl &&
      !!tenantFilter &&
      tenantFilter !== 'AllTenants',
  })

  useEffect(() => {
    const site = resolveSiteApi.data?.Site
    if (!resolvingSiteUrl || !site?.id) return
    setBrowserLocation(site)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when resolve payload arrives
  }, [resolvingSiteUrl, resolveSiteApi.data?.Site?.id])

  const rootQueryKey = `ListSiteBrowser-${tenantFilter}-root`
  // Keep the root catalog warm while drilled in so the site-crumb switcher can search.
  // Shares react-query cache with browserApi when atRoot (same queryKey).
  const rootCatalogApi = ApiGetCall({
    url: '/api/ListSiteBrowser',
    data: { tenantFilter },
    queryKey: rootQueryKey,
    waiting: router.isReady && !!tenantFilter && tenantFilter !== 'AllTenants' && !resolvingSiteUrl,
  })
  const browserApi = ApiGetCall({
    url: '/api/ListSiteBrowser',
    data: {
      tenantFilter,
      ...(siteId ? { SiteId: siteId } : {}),
    },
    queryKey: siteId ? `ListSiteBrowser-${tenantFilter}-${siteId}` : rootQueryKey,
    waiting:
      router.isReady &&
      !!tenantFilter &&
      tenantFilter !== 'AllTenants' &&
      !resolvingSiteUrl,
  })

  const recycleQueryKey = `SiteBrowserRecycleBin-${openedSite?.webUrl ?? ''}`
  const recycleApi = ApiGetCall({
    url: '/api/ListSiteRecycleBin',
    data: {
      SiteUrl: openedSite?.webUrl,
      tenantFilter,
    },
    queryKey: recycleQueryKey,
    waiting:
      inRecycle &&
      router.isReady &&
      !!tenantFilter &&
      tenantFilter !== 'AllTenants' &&
      !!openedSite?.webUrl,
  })

  const restoreApi = ApiPostCall({ relatedQueryKeys: recycleQueryKey })

  useEffect(() => {
    const site = browserApi.data?.Site
    if (site?.id && site.id === siteId) {
      setSiteMeta((prev) => ({
        ...prev,
        ...site,
        storageUsedInBytes: site.storageUsedInBytes ?? prev?.storageUsedInBytes,
      }))
      trackRecent(site)
    }
  }, [browserApi.data?.Site, siteId, trackRecent])

  const rawBrowseResults = browserApi.data?.Results
  const browseItems = useMemo(() => {
    if (!Array.isArray(rawBrowseResults)) return []
    return rawBrowseResults.map((row) => ({
      ...row,
      canOpen: row.type === 'site',
    }))
  }, [rawBrowseResults])

  const rawRootResults = rootCatalogApi.data?.Results
  const siteOptions = useMemo(() => {
    if (atRoot) {
      return browseItems.filter((row) => row.type === 'site')
    }
    if (!Array.isArray(rawRootResults)) return []
    return rawRootResults.filter((row) => row?.type === 'site')
  }, [atRoot, browseItems, rawRootResults])

  const rawRecycleResults = recycleApi.data?.Results
  const recycleProjection = useMemo(() => {
    if (!inRecycle) return { items: [], capped: false, totalMatching: 0 }
    return projectRecycleBinTree(Array.isArray(rawRecycleResults) ? rawRecycleResults : [], {
      recyclePath,
      recycleStage,
      recycleView,
      siteWebUrl: openedSite?.webUrl,
    })
  }, [inRecycle, rawRecycleResults, recyclePath, recycleStage, recycleView, openedSite?.webUrl])

  const items = inRecycle ? recycleProjection.items : browseItems

  const path = useMemo(() => {
    if (!openedSite) return []
    if (!inRecycle) return [openedSite]
    const crumbs = [openedSite, RECYCLE_ROOT]
    recyclePath.forEach((segment, index) => {
      const full = recyclePath.slice(0, index + 1).join('/')
      crumbs.push({
        id: `dir:${full}`,
        displayName: segment,
        type: 'recycleFolder',
        canOpen: true,
        dirName: full,
      })
    })
    return crumbs
  }, [openedSite, inRecycle, recyclePath])

  const checkedItems = useMemo(() => {
    if (!checkedIds.length) return []
    const idSet = new Set(checkedIds)
    return items.filter((item) => idSet.has(item.id))
  }, [items, checkedIds])

  const selected = checkedItems.length === 1 ? checkedItems[0] : null

  const actionRows = useMemo(() => {
    if (checkedItems.length) return checkedItems
    if (!inRecycle && openedSite?.webUrl) return [openedSite]
    return []
  }, [checkedItems, openedSite, inRecycle])

  const browseError =
    typeof rawBrowseResults === 'string'
      ? rawBrowseResults
      : browserApi.isError
        ? (browserApi.error?.message ?? 'Failed to load items.')
        : null
  const recycleError =
    typeof rawRecycleResults === 'string'
      ? rawRecycleResults
      : recycleApi.isError
        ? (recycleApi.error?.message ?? 'Failed to load recycle bin.')
        : null
  const errorMessage = inRecycle ? recycleError : browseError
  const isFetching = inRecycle ? recycleApi.isFetching : browserApi.isFetching

  const bannerSite = openedSite ?? (selected?.type === 'site' ? selected : null)
  const bannerLibrary = !inRecycle && selected?.type === 'library' ? selected : null

  // Location vs selection: empty selection inside a site defaults focus to the opened site.
  // Multi-select clears single-item inspectors. Recycle never defaults to the site object.
  const propertiesItem =
    checkedItems.length > 1
      ? null
      : selected
        ? selected
        : !inRecycle && openedSite
          ? openedSite
          : null

  const permissionsItem = (() => {
    if (inRecycle || !canReadSite || checkedItems.length > 1) return null
    if (selected?.type === 'site' || selected?.type === 'library') return selected
    if (!atRoot && openedSite) return openedSite
    return null
  })()

  // Storage is always site-scoped (selected site at root, else opened site).
  // Banner shows Storage only at root (site selected); inside a site it lives under Actions.
  const storageSite = isSiteRow(selected) ? selected : openedSite
  const showStorage =
    !inRecycle && atRoot && canReadSite && Boolean(storageSite?.webUrl)
  const showPermissions = Boolean(permissionsItem)
  const focusLibraryId =
    !inRecycle && selected?.type === 'library' ? selected.id : null

  const handleCheckedChange = (ids) => {
    setCheckedIds(ids)
  }

  const enterRecycleMode = (seedLibrary = null) => {
    if (!canReadRecycleBin || atRoot) return
    setCheckedIds([])
    setContentMode('recycle')
    setRecycleStage('all')
    const seed = libraryRecyclePathSeed(seedLibrary, openedSite?.webUrl)
    setRecyclePath(seed)
  }

  const exitRecycleMode = () => {
    setCheckedIds([])
    setContentMode('browse')
    setRecyclePath([])
    setRecycleStage('all')
  }

  const handleOpen = (item) => {
    if (!item?.canOpen) return
    setCheckedIds([])
    if (inRecycle && item.type === 'recycleFolder') {
      const segs = (item.dirName ?? '').split('/').filter(Boolean)
      setRecyclePath(segs)
      return
    }
    if (item.type === 'site') {
      exitRecycleMode()
      setBrowserLocation(item)
    }
  }

  const handleNavigate = (nextPath) => {
    setCheckedIds([])
    if (!nextPath?.length) {
      exitRecycleMode()
      setBrowserLocation(null)
      return
    }

    if (inRecycle) {
      const recycleIdx = nextPath.findIndex((c) => c?.id === RECYCLE_ROOT.id)
      if (recycleIdx < 0) {
        exitRecycleMode()
        setBrowserLocation(nextPath[0]?.type === 'site' ? nextPath[0] : null)
        return
      }
      const folderCrumbs = nextPath.slice(recycleIdx + 1)
      setRecyclePath(folderCrumbs.map((c) => c.displayName).filter(Boolean))
      return
    }

    setBrowserLocation(nextPath?.[0] ?? null)
  }

  const handleModeChange = (_event, next) => {
    if (!next) return
    if (next === 'recycle') {
      const seedLib = selected?.type === 'library' ? selected : null
      enterRecycleMode(seedLib)
    } else {
      exitRecycleMode()
    }
  }

  const runRestore = (items) => {
    if (!items?.length || !openedSite?.webUrl) return
    restoreApi.mutate({
      url: '/api/ExecRestoreRecycleBinItems',
      data: {
        Ids: items.map((t) => t.id),
        ItemNames: items.map((t) => t.leafName ?? t.displayName),
        SiteUrl: openedSite.webUrl,
        tenantFilter,
      },
    })
    setRestoreTargets(null)
    setFolderRestorePicker(null)
    setCheckedIds([])
  }

  const requestRestore = (rows) => {
    if (!canRestoreRecycleBin) return
    const list = Array.isArray(rows) ? rows : [rows]
    const hasFolder = list.some((row) => row?.type === 'recycleFolder')
    const { items, folderLabel } = expandRecycleRestoreRows(
      Array.isArray(rawRecycleResults) ? rawRecycleResults : [],
      list,
      {
        siteWebUrl: openedSite?.webUrl,
        recycleStage,
      }
    )
    if (!items.length) return

    // Folders (or bulk that includes a folder): pick from a flat explorer list first.
    if (hasFolder) {
      setFolderRestorePicker({
        items,
        folderLabel: folderLabel ?? 'Selected folders',
      })
      return
    }

    setRestoreTargets({ items })
  }

  const confirmRestore = () => {
    runRestore(restoreTargets?.items)
  }

  const bulkActions = useMemo(() => {
    if (inRecycle) {
      return [
        {
          label: 'Restore',
          icon: <CippIcons.RestoreFromTrash />,
          showInActionsMenu: true,
          noConfirm: true,
          customFunction: (rows) => requestRestore(rows),
          condition: (rows) =>
            canRestoreRecycleBin &&
            (Array.isArray(rows) ? rows : [rows]).some(
              (row) => row?.type === 'recycleItem' || row?.type === 'recycleFolder'
            ),
        },
      ]
    }
    return [
      {
        label: 'Open in SharePoint',
        icon: <CippIcons.Launch />,
        showInActionsMenu: true,
        noConfirm: true,
        customFunction: (rows) => openUrls(rows),
        condition: (rows) =>
          (Array.isArray(rows) ? rows : [rows]).some((row) => Boolean(row?.webUrl)),
      },
      {
        label: 'Storage',
        icon: <CippIcons.Storage fontSize="small" />,
        showInActionsMenu: true,
        noConfirm: true,
        condition: (rows) => {
          if (!canReadSite) return false
          const list = Array.isArray(rows) ? rows : [rows]
          if (list.length === 1 && isSiteRow(list[0]) && Boolean(list[0]?.webUrl)) return true
          return !atRoot && Boolean(openedSite?.webUrl)
        },
        customFunction: (rows) => {
          const list = Array.isArray(rows) ? rows : [rows]
          if (list[0] && isSiteRow(list[0]) && list[0]?.id) setCheckedIds([list[0].id])
          setStorageOpen(true)
        },
      },
      {
        label: 'Lock',
        icon: <CippIcons.Lock />,
        showInActionsMenu: true,
        noConfirm: true,
        condition: (rows) => {
          if (!canWriteSite) return false
          const list = Array.isArray(rows) ? rows : [rows]
          if (list.length === 1 && isSiteRow(list[0]) && Boolean(list[0]?.webUrl)) return true
          return !atRoot && Boolean(openedSite?.webUrl)
        },
        customFunction: (rows) => {
          const list = Array.isArray(rows) ? rows : [rows]
          const site =
            list.length === 1 && isSiteRow(list[0]) && list[0]?.webUrl ? list[0] : openedSite
          if (site?.webUrl) lockDialog.handleOpen(site)
        },
      },
      // Inside a site: Edit Site is secondary (Actions), not primary banner chrome.
      ...(canWriteSite && !atRoot
        ? [
            {
              label: 'Edit Site',
              icon: <CippIcons.Edit />,
              showInActionsMenu: true,
              noConfirm: true,
              customFunction: () => {},
              condition: () => Boolean(openedSite),
            },
          ]
        : []),
      {
        label: 'Delete',
        icon: <CippIcons.Delete />,
        showInActionsMenu: true,
        noConfirm: true,
        customFunction: () => {},
        condition: (rows) => {
          const list = Array.isArray(rows) ? rows : [rows]
          return canWriteSite && list.length === 1 && canDeleteSite(list[0])
        },
      },
    ]
  }, [inRecycle, canRestoreRecycleBin, canWriteSite, canReadSite, atRoot, openedSite, lockDialog.handleOpen])

  const rowActions = useMemo(() => {
    if (inRecycle) {
      return [
        {
          label: 'Open folder',
          icon: <CippIcons.FolderOpen fontSize="small" />,
          condition: (item) => item?.type === 'recycleFolder',
          onClick: handleOpen,
        },
        {
          label: 'Restore…',
          icon: <CippIcons.RestoreFromTrash />,
          condition: (item) => canRestoreRecycleBin && item?.type === 'recycleFolder',
          onClick: (item) => requestRestore(item),
        },
        {
          label: 'Restore',
          icon: <CippIcons.RestoreFromTrash />,
          condition: (item) => canRestoreRecycleBin && item?.type === 'recycleItem',
          onClick: (item) => requestRestore(item),
        },
      ]
    }
    return [
      {
        label: 'Open in SharePoint',
        icon: <CippIcons.Launch />,
        condition: (item) => Boolean(item?.webUrl),
        href: (item) => item.webUrl,
      },
      {
        label: 'Browse',
        icon: <CippIcons.FolderOpen fontSize="small" />,
        condition: (item) => Boolean(item?.canOpen),
        onClick: handleOpen,
      },
      {
        label: 'Storage',
        icon: <CippIcons.Storage fontSize="small" />,
        condition: (item) => canReadSite && isSiteRow(item) && Boolean(item?.webUrl),
        onClick: (item) => {
          if (item?.id) setCheckedIds([item.id])
          setStorageOpen(true)
        },
      },
      {
        label: 'Lock',
        icon: <CippIcons.Lock />,
        condition: (item) => canWriteSite && isSiteRow(item) && Boolean(item?.webUrl),
        onClick: (item) => lockDialog.handleOpen(item),
      },
      {
        label: 'Copy contents to library…',
        icon: <CippIcons.ContentCopy />,
        condition: (item) =>
          canWriteSite &&
          item?.type === 'library' &&
          item?.template === 'documentLibrary',
        onClick: (item) => {
          if (item?.id) setCheckedIds([item.id])
          setLibraryCopyOpen(true)
        },
      },
      {
        label: 'Delete',
        icon: <CippIcons.Delete />,
        condition: (item) => canWriteSite && canDeleteSite(item),
        onClick: () => {},
      },
    ]
  }, [inRecycle, canRestoreRecycleBin, canWriteSite, canReadSite, lockDialog.handleOpen])

  const modeSwitch =
    !atRoot && canReadRecycleBin ? (
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{
          alignItems: "center",
          flexWrap: "wrap",
          flexShrink: 0,
          maxWidth: '100%'
        }}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={inRecycle ? 'recycle' : 'browse'}
          onChange={handleModeChange}
          aria-label="Explorer content mode"
        >
          <ToggleButton value="browse">Browse</ToggleButton>
          <ToggleButton value="recycle">Recycle</ToggleButton>
        </ToggleButtonGroup>
        {inRecycle ? (
          <ToggleButtonGroup
            size="small"
            exclusive
            value={recycleView}
            onChange={(_e, next) => {
              if (!next) return
              setCheckedIds([])
              setRecycleView(next)
            }}
            aria-label="Recycle bin layout"
          >
            <ToggleButton value="folders">Folders</ToggleButton>
            <ToggleButton value="list">List</ToggleButton>
          </ToggleButtonGroup>
        ) : null}
      </Stack>
    ) : null

  const infoMessage = inRecycle
    ? recycleProjection.capped ||
      (Array.isArray(rawRecycleResults) && rawRecycleResults.length >= RECYCLE_BIN_CAP)
      ? `Showing up to ${RECYCLE_BIN_CAP} newest deleted items (API cap). ${
          recycleView === 'list'
            ? 'List view shows every item under this location.'
            : 'Folder view groups by path.'
        }`
      : recycleView === 'list'
        ? 'Flat list of deleted items under this location. Switch to Folders to drill by path.'
        : 'Deleted items from this site. Drill into folders by path; restore is the primary action.'
    : null

  const restoreItems = restoreTargets?.items ?? []
  const restoreLabel = (() => {
    if (!restoreItems.length) return ''
    return restoreItems.length === 1
      ? restoreItems[0].leafName ?? restoreItems[0].displayName
      : `${restoreItems.length} items`
  })()

  if (!tenantFilter || tenantFilter === 'AllTenants') {
    return (
      <Typography sx={{
        color: "text.secondary"
      }}>Select a tenant to browse SharePoint sites.</Typography>
    );
  }

  return (
    <>
      <CippSharePointBrowserBanner
        site={bannerSite}
        library={bannerLibrary}
        bulkActions={bulkActions}
        selectedRows={actionRows}
        isFetching={isFetching}
        atRoot={atRoot}
        path={path}
        onNavigate={handleNavigate}
        siteOptions={siteOptions}
        recentSites={recentSites}
        onSiteSwitch={(nextSite) => {
          if (!nextSite?.id) return
          exitRecycleMode()
          setBrowserLocation(nextSite)
        }}
        showStorage={showStorage}
        onStorageClick={() => setStorageOpen(true)}
        showPermissions={showPermissions}
        onPermissionsClick={() => setPermissionsOpen(true)}
        showNew={canWriteSite && !inRecycle}
        showEditSite={canWriteSite && !inRecycle && atRoot && isSiteRow(selected)}
        queryKeys={
          inRecycle
            ? recycleQueryKey
            : siteId
              ? `ListSiteBrowser-${tenantFilter}-${siteId}`
              : rootQueryKey
        }
        onRefresh={() => (inRecycle ? recycleApi.refetch() : browserApi.refetch())}
        refreshDisabled={isFetching}
      />
      <CippSharePointBrowserPermissions
        open={permissionsOpen}
        onClose={() => setPermissionsOpen(false)}
        item={permissionsItem}
        tenantFilter={tenantFilter}
        siteUrl={
          permissionsItem?.type === 'library' ? openedSite?.webUrl : permissionsItem?.webUrl
        }
        siteId={permissionsItem?.type === 'library' ? openedSite?.id : permissionsItem?.id}
      />
      <CippSharePointBrowserStorage
        open={storageOpen}
        onClose={() => setStorageOpen(false)}
        item={storageSite}
        tenantFilter={tenantFilter}
        focusLibraryId={focusLibraryId}
      />
      <CippSharePointLibraryCopyDialog
        open={libraryCopyOpen}
        onClose={() => setLibraryCopyOpen(false)}
        tenantFilter={tenantFilter}
        sourceSite={openedSite}
        sourceLibrary={bannerLibrary ?? (selected?.type === 'library' ? selected : null)}
      />
      <CippSharePointRecycleFolderRestoreDialog
        open={Boolean(folderRestorePicker?.items?.length)}
        onClose={() => setFolderRestorePicker(null)}
        folderLabel={folderRestorePicker?.folderLabel ?? 'Folder'}
        items={folderRestorePicker?.items ?? []}
        isPending={restoreApi.isPending}
        error={restoreApi.isError ? restoreApi.error : null}
        onConfirm={(selected) => runRestore(selected)}
      />
      <CippApiDialog
        createDialog={lockDialog}
        title="Set Site Lock"
        allowResubmit
        defaultvalues={{ LockState: 'ReadOnly' }}
        api={{
          type: 'POST',
          url: '/api/ExecSetSiteProperties',
          confirmText: `Change lock state for ${
            lockDialog.data?.displayName || lockDialog.data?.webUrl || 'this site'
          }? Prefer Read only before No access. Teams-connected sites affect the whole team.`,
          customDataformatter: (_row, _action, formData) => ({
            tenantFilter,
            SiteUrl: lockDialog.data?.webUrl,
            LockState: optionValue(formData.LockState) || 'ReadOnly',
          }),
          multiPost: false,
        }}
        row={lockDialog.data ?? {}}
      >
        {({ formHook }) => (
          <CippFormComponent
            type="radio"
            name="LockState"
            label="Lock state"
            formControl={formHook}
            options={[
              { label: 'Read only', value: 'ReadOnly' },
              { label: 'No access', value: 'NoAccess' },
              { label: 'Unlock', value: 'Unlock' },
            ]}
          />
        )}
      </CippApiDialog>
      <Dialog
        open={Boolean(restoreItems.length)}
        onClose={() => setRestoreTargets(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Restore from recycle bin</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Restore {restoreLabel} from the recycle bin?
          </DialogContentText>
          {restoreApi.isError ? (
            <Alert severity="error" sx={{ mt: 1.5 }}>
              {restoreApi.error?.message ?? 'Restore failed.'}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreTargets(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={confirmRestore}
            disabled={restoreApi.isPending}
            startIcon={<CippIcons.RestoreFromTrash />}
          >
            Restore
          </Button>
        </DialogActions>
      </Dialog>
      <Grid container spacing={2} sx={{
        alignItems: "stretch"
      }}>
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <CippSharePointBrowserProperties
            item={propertiesItem}
            summaryItems={
              atRoot && !propertiesItem && checkedItems.length === 0 ? browseItems : undefined
            }
            tenantFilter={tenantFilter}
            isFetching={isFetching}
            emptyMessage={
              atRoot
                ? 'Select a site to view details.'
                : inRecycle
                  ? 'Select a deleted item to view details.'
                  : checkedItems.length > 1
                    ? 'Select a single item to view details.'
                    : 'Select a library to view details.'
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <CippSharePointFolderView
            items={items}
            isFetching={isFetching}
            error={errorMessage}
            path={path}
            onNavigate={handleNavigate}
            checkedIds={checkedIds}
            onCheckedChange={handleCheckedChange}
            onOpen={handleOpen}
            rowActions={rowActions}
            mode={inRecycle ? 'recycle' : 'browse'}
            modeSwitch={modeSwitch}
            recycleView={inRecycle ? recycleView : 'folders'}
            recycleStage={inRecycle ? recycleStage : 'all'}
            onRecycleStageChange={(next) => {
              setCheckedIds([])
              setRecycleStage(next)
            }}
            showBreadcrumbs={false}
            infoMessage={infoMessage}
            emptyMessage={
              atRoot
                ? 'No SharePoint sites found.'
                : inRecycle
                  ? 'Recycle bin is empty.'
                  : 'No root libraries found for this site.'
            }
          />
        </Grid>
      </Grid>
    </>
  );
}

const Page = () => {
  const router = useRouter()
  const tenantFilter = useSettings().currentTenant
  const { checkPermissions } = usePermissions()
  const canWriteSite = checkPermissions(['Sharepoint.Site.ReadWrite'])
  const canReadSite = checkPermissions(['Sharepoint.Site.Read', 'Sharepoint.Site.ReadWrite'])
  const isNarrow = useIsNarrowForTables()

  // Mobile has no library drill-in — drop ?siteId= so deep links don't strand the URL.
  const siteIdQuery = router.query.siteId
  const siteUrlQuery = router.query.siteUrl
  const siteNameQuery = router.query.siteName
  useEffect(() => {
    if (!isNarrow || !router.isReady) return
    if (!siteIdQuery && !siteUrlQuery && !siteNameQuery) return
    const query = { ...router.query }
    delete query.siteId
    delete query.siteUrl
    delete query.siteName
    delete query.siteType
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when drill-in query keys appear on mobile
  }, [isNarrow, router.isReady, siteIdQuery, siteUrlQuery, siteNameQuery])

  return (
    <>
      <CippHead title="SharePoint Sites" />
      <Container maxWidth={false} sx={{ pt: 3, pb: 3, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          {isNarrow ? (
            <SharePointBrowserMobile
              tenantFilter={tenantFilter}
              canReadSite={canReadSite}
              canWriteSite={canWriteSite}
            />
          ) : (
            <SharePointBrowserDesktop
              tenantFilter={tenantFilter}
              canReadSite={canReadSite}
              canWriteSite={canWriteSite}
            />
          )}
        </Stack>
      </Container>
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
