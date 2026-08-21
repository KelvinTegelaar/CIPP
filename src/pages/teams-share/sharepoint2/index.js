import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { Container, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import { Delete, FolderOpen, Launch, Refresh, Storage as StorageIcon } from '@mui/icons-material'
import { Layout as DashboardLayout } from '../../../layouts/index.js'
import { CippHead } from '../../../components/CippComponents/CippHead'
import { CippSharePointBrowserBanner } from '../../../components/CippComponents/CippSharePointBrowserBanner'
import { CippSharePointBrowserProperties } from '../../../components/CippComponents/CippSharePointBrowserProperties'
import { CippSharePointBrowserPermissions } from '../../../components/CippComponents/CippSharePointBrowserPermissions'
import { CippSharePointBrowserStorage } from '../../../components/CippComponents/CippSharePointBrowserStorage'
import { CippSharePointFolderView } from '../../../components/CippComponents/CippSharePointFolderView'
import { ApiGetCall } from '../../../api/ApiCall'
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

const Page = () => {
  const router = useRouter()
  const tenantFilter = useSettings().currentTenant
  const [checkedIds, setCheckedIds] = useState([])
  const [permissionsOpen, setPermissionsOpen] = useState(false)
  const [storageOpen, setStorageOpen] = useState(false)

  // Location is owned by the URL (?siteId=…) — name/url come from navigation or API Site
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

  // Browser back/forward changes location without going through handlers
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

  const browserApi = ApiGetCall({
    url: '/api/ListSiteBrowser',
    data: {
      tenantFilter,
      ...(siteId ? { SiteId: siteId } : {}),
    },
    queryKey: siteId
      ? `ListSiteBrowser-${tenantFilter}-${siteId}`
      : `ListSiteBrowser-${tenantFilter}-root`,
    waiting: router.isReady && !!tenantFilter && tenantFilter !== 'AllTenants',
  })

  // Enrich from API after cold load / refresh
  useEffect(() => {
    const site = browserApi.data?.Site
    if (site?.id && site.id === siteId) {
      setSiteMeta((prev) => ({
        ...prev,
        ...site,
        // Keep storage from the site we opened if the Site payload doesn't include it
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

  // Single checked row drives properties / permissions; multi-check is for Actions only.
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

  // Banner always reflects the opened site; library only when one is selected
  const bannerSite = openedSite ?? (selected?.type === 'site' ? selected : null)
  const bannerLibrary = selected?.type === 'library' ? selected : null
  const propertiesItem = selected

  // Storage is site-scoped: selected site at root, or the opened site when drilled in
  const storageSite = isSiteRow(selected) ? selected : openedSite
  const showStorage = Boolean(storageSite?.webUrl)

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
          return list.length === 1 && isSiteRow(list[0]) && Boolean(list[0]?.webUrl)
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
      },
    ],
    []
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
        condition: (item) => isSiteRow(item) && Boolean(item?.webUrl),
        onClick: (item) => {
          if (item?.id) setCheckedIds([item.id])
          setStorageOpen(true)
        },
      },
      {
        label: 'Delete',
        icon: <Delete fontSize="small" />,
        onClick: () => {},
      },
    ],
    []
  )

  return (
    <>
      <CippHead title="SharePoint Site Browser" />
      <Container maxWidth="xl" sx={{ pt: 3, pb: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h4">SharePoint Site Browser</Typography>
            <Tooltip title="Refresh">
              <span>
                <IconButton
                  size="small"
                  onClick={() => browserApi.refetch()}
                  disabled={!tenantFilter || tenantFilter === 'AllTenants' || browserApi.isFetching}
                >
                  <Refresh />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
          {!tenantFilter || tenantFilter === 'AllTenants' ? (
            <Typography color="text.secondary">
              Select a tenant to browse SharePoint sites.
            </Typography>
          ) : (
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
                showPermissions={selected?.type === 'site' || selected?.type === 'library'}
                onPermissionsClick={() => setPermissionsOpen(true)}
                showEditSite={Boolean(openedSite) || isSiteRow(selected)}
                queryKeys={
                  siteId
                    ? `ListSiteBrowser-${tenantFilter}-${siteId}`
                    : `ListSiteBrowser-${tenantFilter}-root`
                }
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
          )}
        </Stack>
      </Container>
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
