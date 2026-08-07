import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Box, Container, Divider, Stack, useMediaQuery } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useSettings } from '../hooks/use-settings'
import { Footer } from './footer'
import { MobileNav } from './mobile-nav'
import { SideNav } from './side-nav'
import { TopNav } from './top-nav'
import { ApiGetCall } from '../api/ApiCall'
import { useDispatch } from 'react-redux'
import { showToast } from '../store/toasts'
import Grid from '@mui/system/Grid'
import { CippImageCard } from '../components/CippCards/CippImageCard'
import { nativeMenuItems } from './config'
import { CippBreadcrumbNav } from '../components/CippComponents/CippBreadcrumbNav'
import { SsoMigrationDialog } from '../components/CippComponents/SsoMigrationDialog'
import { ForcedSsoMigrationDialog } from '../components/CippComponents/ForcedSsoMigrationDialog'
import { SubscriptionEndedDialog } from '../components/CippComponents/SubscriptionEndedDialog'
import { FailedPaymentDialog } from '../components/CippComponents/FailedPaymentDialog'
import { CippMaintenanceBanner } from '../components/CippComponents/CippMaintenanceBanner'

import {
  BANNER_HEIGHT_VAR,
  SIDE_NAV_PINNED_WIDTH,
  SIDE_NAV_WIDTH,
  TOP_NAV_HEIGHT,
} from './constants'

const useMobileNav = () => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handlePathnameChange = useCallback(() => {
    if (open) {
      setOpen(false)
    }
  }, [open])

  useEffect(() => {
    handlePathnameChange()
  }, [pathname])

  const handleOpen = useCallback(() => {
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  return {
    handleClose,
    handleOpen,
    open,
  }
}

const LayoutRoot = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flex: '1 1 auto',
  maxWidth: '100%',
  height: '100vh',
  overflow: 'hidden',
  paddingTop: `calc(${TOP_NAV_HEIGHT}px + ${BANNER_HEIGHT_VAR})`,
  [theme.breakpoints.up('lg')]: {
    paddingLeft: SIDE_NAV_WIDTH,
  },
}))

const LayoutContainer = styled('div')({
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  width: '100%',
  overflowY: 'auto',
  overscrollBehavior: 'contain',
})

export const Layout = (props) => {
  // showBreadcrumb: the error routes opt out — there is no trail to a page that
  // doesn't exist or just crashed, and the bookmark button lives in there too.
  const { children, allTenantsSupport = true, showBreadcrumb = true } = props
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down('md'))
  const settings = useSettings()
  const mobileNav = useMobileNav()
  const [fetchingVisible, setFetchingVisible] = useState([])
  const [menuItems, setMenuItems] = useState(nativeMenuItems)
  const lastUserSettingsUpdate = useRef(null)
  const currentTenant = settings?.currentTenant
  const [hideSidebar, setHideSidebar] = useState(false)

  const swaStatus = ApiGetCall({
    url: '/.auth/me',
    queryKey: 'authmeswa',
    staleTime: 120000,
    refetchOnWindowFocus: true,
  })

  const currentRole = ApiGetCall({
    url: '/api/me',
    queryKey: 'authmecipp',
    waiting: swaStatus.isSuccess && swaStatus.data?.clientPrincipal !== null,
  })

  const featureFlags = ApiGetCall({
    url: '/api/ListFeatureFlags',
    queryKey: 'featureFlags',
    staleTime: 600000, // Cache for 10 minutes
  })

  useEffect(() => {
    if (currentRole.isSuccess && !currentRole.isFetching) {
      const userRoles = currentRole.data?.clientPrincipal?.userRoles
      const userPermissions = currentRole.data?.permissions
      if (!userRoles) {
        setMenuItems([])
        setHideSidebar(true)
        return
      }

      // Get disabled pages from feature flags - only filter if we have valid data
      let disabledPages = []
      if (featureFlags.isSuccess && Array.isArray(featureFlags.data)) {
        disabledPages = featureFlags.data
          .filter((flag) => flag.Enabled === false || flag.enabled === false)
          .flatMap((flag) => flag.Pages || flag.pages || [])
          .filter((page) => typeof page === 'string')
      }

      const filterItemsByRole = (items) => {
        return items
          .map((item) => {
            // Check if page is disabled by feature flag
            if (item.path && disabledPages.length > 0 && disabledPages.includes(item.path)) {
              return null
            }

            // Check permission with pattern matching support
            if (item.permissions && item.permissions.length > 0) {
              const hasPermission = userPermissions?.some((userPerm) => {
                return item.permissions.some((requiredPerm) => {
                  // Exact match
                  if (userPerm === requiredPerm) {
                    return true
                  }

                  // Pattern matching - check if required permission contains wildcards
                  if (requiredPerm.includes('*')) {
                    // Convert wildcard pattern to regex
                    const regexPattern = requiredPerm
                      .replace(/\./g, '\\.') // Escape dots
                      .replace(/\*/g, '.*') // Convert * to .*
                    const regex = new RegExp(`^${regexPattern}$`)
                    return regex.test(userPerm)
                  }

                  return false
                })
              })
              if (!hasPermission) {
                return null
              }
            } else {
              return null
            }
            // check sub-items
            if (item.items && item.items.length > 0) {
              const filteredSubItems = filterItemsByRole(item.items).filter(Boolean)
              if (filteredSubItems.length === 0) return null
              return { ...item, items: filteredSubItems }
            }

            return item
          })
          .filter(Boolean)
      }
      const filteredMenu = filterItemsByRole(nativeMenuItems)
      setMenuItems(filteredMenu)
    } else if (
      swaStatus.isLoading ||
      swaStatus.data?.clientPrincipal === null ||
      swaStatus.data === undefined ||
      currentRole.isLoading
    ) {
      setHideSidebar(true)
    }
  }, [
    currentRole.isSuccess,
    swaStatus.data,
    swaStatus.isLoading,
    currentRole.data?.clientPrincipal?.userRoles,
    currentRole.data?.permissions,
    currentRole.isFetching,
    featureFlags.isSuccess,
    featureFlags.data,
  ])

  const handleNavPin = useCallback(() => {
    settings.handleUpdate({
      pinNav: !settings.pinNav,
    })
  }, [settings])

  const offset = settings.pinNav ? SIDE_NAV_WIDTH : SIDE_NAV_PINNED_WIDTH

  const userSettingsAPI = ApiGetCall({
    url: '/api/ListUserSettings',
    queryKey: 'userSettings',
  })

  useEffect(() => {
    if (userSettingsAPI.isSuccess && !userSettingsAPI.isFetching) {
      // Only update if the data has actually changed (using dataUpdatedAt as a proxy)
      const dataUpdatedAt = userSettingsAPI.dataUpdatedAt
      if (dataUpdatedAt && dataUpdatedAt !== lastUserSettingsUpdate.current) {
        const { bookmarks: _bookmarks, ...serverSettings } = userSettingsAPI.data || {}
        //if userSettingsAPI.data contains offboardingDefaults.user, delete that specific key.
        if (serverSettings.offboardingDefaults?.user) {
          delete serverSettings.offboardingDefaults.user
        }
        if (serverSettings.offboardingDefaults?.keepCopy) {
          delete serverSettings.offboardingDefaults.keepCopy
        }
        if (serverSettings?.currentTheme) {
          delete serverSettings.currentTheme
        }
        // get current devtools settings (device-local only)
        var showDevtools = settings.showDevtools

        settings.handleUpdate({
          ...serverSettings,
          showDevtools,
        })

        // Track this update and set completion status
        lastUserSettingsUpdate.current = dataUpdatedAt
      }
    }
  }, [
    userSettingsAPI.isSuccess,
    userSettingsAPI.data,
    userSettingsAPI.isFetching,
    userSettingsAPI.dataUpdatedAt,
  ])

  const version = ApiGetCall({
    url: '/version.json',
    queryKey: 'LocalVersion',
  })

  const alertsAPI = ApiGetCall({
    url: `/api/GetCippAlerts?localversion=${encodeURIComponent(version?.data?.version)}`,
    queryKey: 'alertsDashboard',
    waiting: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
  })

  // Hosted maintenance notice, if the instance has one set. Derived from the alerts already
  // fetched above rather than a second request.
  const maintenanceAlert = useMemo(
    () => alertsAPI.data?.find((alert) => alert.maintenance === true) ?? null,
    [alertsAPI.data]
  )

  useEffect(() => {
    if (!hideSidebar && version.isFetched && !alertsAPI.isFetched) {
      alertsAPI.waiting = true
      alertsAPI.refetch()
    }
  }, [version, alertsAPI, hideSidebar])

  useEffect(() => {
    if (alertsAPI.isSuccess && !alertsAPI.isFetching) {
      setFetchingVisible(new Array(alertsAPI.data.length).fill(true))
    }
  }, [alertsAPI.isSuccess, alertsAPI.data, alertsAPI.isFetching])
  const dispatch = useDispatch()
  useEffect(() => {
    if (alertsAPI.isSuccess && !alertsAPI.isFetching) {
      if (alertsAPI.data.length > 0) {
        // The maintenance notice renders as its own banner - toasting it too would surface the
        // same message three times per page load (banner, snackbar, notification bell).
        alertsAPI.data
          .filter((alert) => !alert.maintenance)
          .forEach((alert) => {
            dispatch(
              showToast({
                message: alert.Alert,
                title: alert.title,
                toastError: alert,
              })
            )
          })
      }
    }
  }, [alertsAPI.isSuccess])

  return (
    <>
      {/* Rendered outside the hideSidebar check - maintenance applies to chrome-less pages too. */}
      <CippMaintenanceBanner alert={maintenanceAlert} />
      {hideSidebar === false && (
        <>
          <TopNav onNavOpen={mobileNav.handleOpen} openNav={mobileNav.open} />
          {mdDown && (
            <MobileNav items={menuItems} onClose={mobileNav.handleClose} open={mobileNav.open} />
          )}
          {!mdDown && <SideNav items={menuItems} onPin={handleNavPin} pinned={!!settings.pinNav} />}
        </>
      )}
      <LayoutRoot
        sx={{
          pl: {
            md: (hideSidebar ? '0' : offset) + 'px',
          },
        }}
      >
        <LayoutContainer>
          <SubscriptionEndedDialog
            hostedSubscriptionEnded={currentRole.data?.hostedSubscriptionEnded}
          />
          <FailedPaymentDialog hostedFailedPayments={currentRole.data?.hostedFailedPayments} />
          <SsoMigrationDialog meData={currentRole.data} />
          <ForcedSsoMigrationDialog />
          {(currentTenant === 'AllTenants' || !currentTenant) && !allTenantsSupport ? (
            <Box sx={{ flexGrow: 1, py: 3 }}>
              <Container maxWidth={false}>
                <CippBreadcrumbNav mode="hierarchical" />
                <Grid container spacing={3}>
                  <Grid size={6}>
                    <CippImageCard
                      title="Not supported"
                      imageUrl="/assets/illustrations/undraw_website_ij0l.svg"
                      text={
                        'The page does not support all Tenants, please select a different tenant using the tenant selector.'
                      }
                    />
                  </Grid>
                </Grid>
              </Container>
            </Box>
          ) : (
            <Stack>
              {showBreadcrumb && (
                <>
                  <Box sx={{ mx: 3, mt: 3 }}>
                    <CippBreadcrumbNav mode="hierarchical" />
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                </>
              )}
              {children}
            </Stack>
          )}
          <Footer />
        </LayoutContainer>
      </LayoutRoot>
    </>
  )
}
