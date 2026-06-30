import { useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Box, Divider, Stack, Tab, Tabs } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { ApiGetCall } from '../api/ApiCall'
import { getIconByName } from '../utils/icon-registry'

export const TabbedLayout = (props) => {
  const { tabOptions, children } = props
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const featureFlags = ApiGetCall({
    url: '/api/ListFeatureFlags',
    queryKey: 'featureFlags',
    staleTime: 600000,
  })

  const visibleTabs = useMemo(() => {
    if (!featureFlags.isSuccess || !Array.isArray(featureFlags.data)) return tabOptions

    const disabledPages = featureFlags.data
      .filter((flag) => flag.Enabled === false || flag.enabled === false)
      .flatMap((flag) => flag.Pages || flag.pages || [])
      .filter((page) => typeof page === 'string')

    if (disabledPages.length === 0) return tabOptions

    return tabOptions.filter((option) => !disabledPages.includes(option.path))
  }, [tabOptions, featureFlags.isSuccess, featureFlags.data])

  const handleTabsChange = (event, value) => {
    // Preserve existing query parameters when changing tabs
    const currentParams = new URLSearchParams(searchParams.toString())
    const queryString = currentParams.toString()
    const newPath = queryString ? `${value}?${queryString}` : value
    router.push(newPath)
  }

  const currentTab = visibleTabs.find((option) => option.path === pathname)

  return (
    <Box
      sx={{
        flexGrow: 1,
        pb: 4,
        mt: -1,
      }}
    >
      <Stack spacing={2}>
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
        {children}
      </Stack>
    </Box>
  )
}
