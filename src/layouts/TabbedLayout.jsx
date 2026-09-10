import { useCallback, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Box, Divider, Stack, Tab, Tabs } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { ApiGetCall } from '../api/ApiCall'
import { getIconByName } from '../utils/icon-registry'
import { useSettings } from '../hooks/use-settings'
import { useIsMobileLayout } from '../hooks/use-breakpoint'
import { TabNavigationContext, useTabNavigationValue } from './tab-navigation-context'
import { CippTabPicker } from '../components/CippComponents/CippTabPicker'

export const TabbedLayout = (props) => {
  // `activePath` lets a page reached from a tab (rather than being one) keep its parent tab
  // highlighted; the tab itself still navigates to its own path.
  const { tabOptions, children, activePath } = props
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const settings = useSettings()
  const showAdvanced = settings?.showAdvancedTools === true

  const featureFlags = ApiGetCall({
    url: '/api/ListFeatureFlags',
    queryKey: 'featureFlags',
    staleTime: 600000,
  })

  const visibleTabs = useMemo(() => {
    // Per-user gate: tabs marked { advanced: true } are hidden unless the user enabled Advanced
    // Views in preferences (Developer Options). Keeps diagnostic pages out of day-to-day use.
    let tabs = showAdvanced ? tabOptions : tabOptions.filter((option) => !option.advanced)

    if (!featureFlags.isSuccess || !Array.isArray(featureFlags.data)) return tabs

    // A DISABLED flag hides its Pages; an ENABLED flag hides its HidesPages (the
    // pages it replaces - e.g. Baselines supersedes the classic Standards tabs).
    const disabledPages = featureFlags.data
      .filter((flag) => flag.Enabled === false || flag.enabled === false)
      .flatMap((flag) => flag.Pages || flag.pages || [])
      .filter((page) => typeof page === 'string')
    const replacedPages = featureFlags.data
      .filter((flag) => flag.Enabled === true || flag.enabled === true)
      .flatMap((flag) => flag.HidesPages || flag.hidesPages || [])
      .filter((page) => typeof page === 'string')
    const hiddenPages = [...disabledPages, ...replacedPages]

    if (hiddenPages.length === 0) return tabs

    return tabs.filter((option) => !hiddenPages.includes(option.path))
  }, [tabOptions, featureFlags.isSuccess, featureFlags.data, showAdvanced])

  const navigateToTab = useCallback(
    (value) => {
      // Preserve existing query parameters when changing tabs
      const currentParams = new URLSearchParams(searchParams.toString())
      const queryString = currentParams.toString()
      const newPath = queryString ? `${value}?${queryString}` : value
      router.push(newPath)
    },
    [router, searchParams]
  )

  const handleTabsChange = (event, value) => navigateToTab(value)

  const resolvedPath = activePath ?? pathname
  const currentTab = visibleTabs.find((option) => option.path === resolvedPath)

  // Below md the tab row scrolls horizontally and still hides tabs off the right edge, so
  // navigation collapses to a full-width picker in the slot the tab bar occupied. Always the
  // layout's own row: a picker that sometimes annexes a heading somewhere on the page and
  // sometimes doesn't is a control you have to go looking for.
  const isMobile = useIsMobileLayout()
  const tabNavValue = useTabNavigationValue({
    tabs: visibleTabs,
    currentPath: resolvedPath,
    onNavigate: navigateToTab,
    enabled: isMobile,
  })

  return (
    <TabNavigationContext.Provider value={tabNavValue}>
      <Box
        sx={{
          flexGrow: 1,
          pb: 4,
          mt: -1,
        }}
      >
        <Stack spacing={2}>
          {isMobile && (
            // pt: 2 nets to the same 16px the sides and the Stack gap below pay: the
            // breadcrumb divider's mb (8) is cancelled by this layout's mt: -1.
            <Box sx={{ px: 2, pt: 2 }}>
              <CippTabPicker />
            </Box>
          )}
          {!isMobile && (
            <Box sx={{ ml: 3 }}>
              <Tabs
                onChange={handleTabsChange}
                value={currentTab?.path ?? false}
                variant="scrollable"
                sx={{
                  '& .MuiTab-root:first-of-type': {
                    ml: 2,
                  },
                }}
              >
                {visibleTabs.map((option) => {
                  const icon = getIconByName(option.icon, { fontSize: 'small' })
                  const iconPosition = option.iconPosition ?? 'start'
                  const compactIcon = icon && ['end', 'start'].includes(iconPosition)

                  return (
                    <Tab
                      key={option.path}
                      label={option.label}
                      value={option.path}
                      icon={icon ?? undefined}
                      iconPosition={icon ? iconPosition : undefined}
                      sx={compactIcon ? { minHeight: 48, py: 1.5 } : undefined}
                    />
                  )
                })}
              </Tabs>
              <Divider />
            </Box>
          )}
          {children}
        </Stack>
      </Box>
    </TabNavigationContext.Provider>
  )
}
