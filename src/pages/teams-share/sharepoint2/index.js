import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Container, Stack, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import {
  Add,
  ContentCopy,
  Delete,
  FolderOpen,
  Launch,
  ManageAccounts,
  Storage as StorageIcon,
} from '@mui/icons-material'
import Link from 'next/link'
import { Layout as DashboardLayout } from '../../../layouts/index.js'
import { CippHead } from '../../../components/CippComponents/CippHead'
import { CippSharePointBrowserBanner } from '../../../components/CippComponents/CippSharePointBrowserBanner'
import { CippSharePointBrowserProperties } from '../../../components/CippComponents/CippSharePointBrowserProperties'
import { CippSharePointBrowserPermissions } from '../../../components/CippComponents/CippSharePointBrowserPermissions'
import { CippSharePointBrowserStorage } from '../../../components/CippComponents/CippSharePointBrowserStorage'
import { CippSharePointLibraryCopyDialog } from '../../../components/CippComponents/CippSharePointLibraryCopyDialog'
import { CippSharePointFolderView } from '../../../components/CippComponents/CippSharePointFolderView'
import { CippDataTable } from '../../../components/CippTable/CippDataTable'
import { ApiGetCall } from '../../../api/ApiCall'
import { useIsNarrowForTables } from '../../../hooks/use-breakpoint'
import { usePermissions } from '../../../hooks/use-permissions'
import { useSettings } from '../../../hooks/use-settings'

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
        icon: <Launch />,
        noConfirm: true,
        customFunction: (row) => openUrls(row),
        condition: (row) => {
          const site = Array.isArray(row) ? row[0] : row
          return Boolean(site?.webUrl)
        },
      },
      {
        label: 'Storage',
        icon: <StorageIcon />,
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
        icon: <ManageAccounts />,
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
        label: 'Delete',
        icon: <Delete />,
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
      startIcon={<Add />}
      variant="contained"
      size="small"
    >
      New Site
    </Button>
  ) : null

  if (!tenantFilter || tenantFilter === 'AllTenants') {
    return (
      <Typography color="text.secondary">Select a tenant to browse SharePoint sites.</Typography>
    )
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
  const [checkedIds, setCheckedIds] = useState([])
  const [permissionsOpen, setPermissionsOpen] = useState(false)
  const [storageOpen, setStorageOpen] = useState(false)
  const [libraryCopyOpen, setLibraryCopyOpen] = useState(false)

  const siteId = queryString(router.query.siteId)
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
  const path = openedSite ? [openedSite] : []
  const atRoot = !openedSite

  useEffect(() => {
    setCheckedIds([])
  }, [siteId])

  const setBrowserLocation = (site) => {
    if (!router.isReady) return
    const query = { ...router.query }
    if (site?.id) {
      query.siteId = site.id
      setSiteMeta(site)
    } else {
      delete query.siteId
      setSiteMeta(null)
    }
    delete query.siteUrl
    delete query.siteName
    delete query.siteType
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true })
  }

  const rootQueryKey = `ListSiteBrowser-${tenantFilter}-root`
  const browserApi = ApiGetCall({
    url: '/api/ListSiteBrowser',
    data: {
      tenantFilter,
      ...(siteId ? { SiteId: siteId } : {}),
    },
    queryKey: siteId ? `ListSiteBrowser-${tenantFilter}-${siteId}` : rootQueryKey,
    waiting: router.isReady && !!tenantFilter && tenantFilter !== 'AllTenants',
  })

  useEffect(() => {
    const site = browserApi.data?.Site
    if (site?.id && site.id === siteId) {
      setSiteMeta((prev) => ({
        ...prev,
        ...site,
        storageUsedInBytes: site.storageUsedInBytes ?? prev?.storageUsedInBytes,
      }))
    }
  }, [browserApi.data?.Site, siteId])

  const rawResults = browserApi.data?.Results
  const items = useMemo(() => {
    if (!Array.isArray(rawResults)) return []
    return rawResults.map((row) => ({
      ...row,
      canOpen: row.type === 'site',
    }))
  }, [rawResults])

  const checkedItems = useMemo(() => {
    if (!checkedIds.length) return []
    const idSet = new Set(checkedIds)
    return items.filter((item) => idSet.has(item.id))
  }, [items, checkedIds])

  const selected = checkedItems.length === 1 ? checkedItems[0] : null

  const actionRows = useMemo(() => {
    if (checkedItems.length) return checkedItems
    if (openedSite?.webUrl) return [openedSite]
    return []
  }, [checkedItems, openedSite])

  const errorMessage =
    typeof rawResults === 'string'
      ? rawResults
      : browserApi.isError
        ? (browserApi.error?.message ?? 'Failed to load items.')
        : null

  const bannerSite = openedSite ?? (selected?.type === 'site' ? selected : null)
  const bannerLibrary = selected?.type === 'library' ? selected : null
  const propertiesItem = selected
  const storageSite = isSiteRow(selected) ? selected : openedSite
  const showStorage = canReadSite && Boolean(storageSite?.webUrl)

  const handleCheckedChange = (ids) => {
    setCheckedIds(ids)
  }

  const handleOpen = (item) => {
    if (!item?.canOpen) return
    setCheckedIds([])
    setBrowserLocation(item)
  }

  const handleNavigate = (nextPath) => {
    setCheckedIds([])
    setBrowserLocation(nextPath?.[0] ?? null)
  }

  const bulkActions = useMemo(
    () => [
      {
        label: 'Open in SharePoint',
        icon: <Launch fontSize="small" />,
        showInActionsMenu: true,
        noConfirm: true,
        customFunction: (rows) => openUrls(rows),
        condition: (rows) =>
          (Array.isArray(rows) ? rows : [rows]).some((row) => Boolean(row?.webUrl)),
      },
      {
        label: 'Storage',
        icon: <StorageIcon fontSize="small" />,
        showInActionsMenu: true,
        noConfirm: true,
        condition: (rows) => {
          const list = Array.isArray(rows) ? rows : [rows]
          return (
            canReadSite &&
            list.length === 1 &&
            isSiteRow(list[0]) &&
            Boolean(list[0]?.webUrl)
          )
        },
        customFunction: (rows) => {
          const list = Array.isArray(rows) ? rows : [rows]
          if (list[0]?.id) setCheckedIds([list[0].id])
          setStorageOpen(true)
        },
      },
      {
        label: 'Delete',
        icon: <Delete fontSize="small" />,
        showInActionsMenu: true,
        noConfirm: true,
        customFunction: () => {},
        condition: (rows) => {
          const list = Array.isArray(rows) ? rows : [rows]
          return canWriteSite && list.length === 1 && canDeleteSite(list[0])
        },
      },
    ],
    [canWriteSite, canReadSite]
  )

  const rowActions = useMemo(
    () => [
      {
        label: 'Open in SharePoint',
        icon: <Launch fontSize="small" />,
        condition: (item) => Boolean(item?.webUrl),
        href: (item) => item.webUrl,
      },
      {
        label: 'Browse',
        icon: <FolderOpen fontSize="small" />,
        condition: (item) => Boolean(item?.canOpen),
        onClick: handleOpen,
      },
      {
        label: 'Storage',
        icon: <StorageIcon fontSize="small" />,
        condition: (item) => canReadSite && isSiteRow(item) && Boolean(item?.webUrl),
        onClick: (item) => {
          if (item?.id) setCheckedIds([item.id])
          setStorageOpen(true)
        },
      },
      {
        label: 'Copy contents to library…',
        icon: <ContentCopy fontSize="small" />,
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
        icon: <Delete fontSize="small" />,
        condition: (item) => canWriteSite && canDeleteSite(item),
        onClick: () => {},
      },
    ],
    [canWriteSite, canReadSite, handleOpen]
  )

  if (!tenantFilter || tenantFilter === 'AllTenants') {
    return (
      <Typography color="text.secondary">Select a tenant to browse SharePoint sites.</Typography>
    )
  }

  return (
    <>
      <CippSharePointBrowserBanner
        site={bannerSite}
        library={bannerLibrary}
        bulkActions={bulkActions}
        selectedRows={actionRows}
        isFetching={browserApi.isFetching}
        atRoot={atRoot}
        showStorage={showStorage}
        onStorageClick={() => setStorageOpen(true)}
        showPermissions={
          canReadSite && (selected?.type === 'site' || selected?.type === 'library')
        }
        onPermissionsClick={() => setPermissionsOpen(true)}
        showNew={canWriteSite}
        showEditSite={canWriteSite && (Boolean(openedSite) || isSiteRow(selected))}
        queryKeys={
          siteId
            ? `ListSiteBrowser-${tenantFilter}-${siteId}`
            : rootQueryKey
        }
        onRefresh={() => browserApi.refetch()}
        refreshDisabled={browserApi.isFetching}
      />
      <CippSharePointBrowserPermissions
        open={permissionsOpen}
        onClose={() => setPermissionsOpen(false)}
        item={selected}
        tenantFilter={tenantFilter}
        siteUrl={selected?.type === 'library' ? openedSite?.webUrl : selected?.webUrl}
        siteId={selected?.type === 'library' ? openedSite?.id : selected?.id}
      />
      <CippSharePointBrowserStorage
        open={storageOpen}
        onClose={() => setStorageOpen(false)}
        item={storageSite}
        tenantFilter={tenantFilter}
      />
      <CippSharePointLibraryCopyDialog
        open={libraryCopyOpen}
        onClose={() => setLibraryCopyOpen(false)}
        tenantFilter={tenantFilter}
        sourceSite={openedSite}
        sourceLibrary={bannerLibrary ?? (selected?.type === 'library' ? selected : null)}
      />
      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <CippSharePointBrowserProperties
            item={propertiesItem}
            tenantFilter={tenantFilter}
            isFetching={browserApi.isFetching}
            emptyMessage={
              atRoot ? 'Select a site to view details.' : 'Select a library to view details.'
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <CippSharePointFolderView
            items={items}
            isFetching={browserApi.isFetching}
            error={errorMessage}
            path={path}
            onNavigate={handleNavigate}
            checkedIds={checkedIds}
            onCheckedChange={handleCheckedChange}
            onOpen={handleOpen}
            rowActions={rowActions}
            emptyMessage={
              atRoot
                ? 'No SharePoint sites found.'
                : 'No root libraries found for this site.'
            }
          />
        </Grid>
      </Grid>
    </>
  )
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
      <Container maxWidth="xl" sx={{ pt: 3, pb: 3 }}>
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
