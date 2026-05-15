import { useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Box, Divider, Stack, Tab, Tabs } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { ApiGetCall } from '../api/ApiCall'

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
                ml: 1,
              },
            }}
          >
            {visibleTabs.map((option) => (
              <Tab key={option.path} label={option.label} value={option.path} />
            ))}
          </Tabs>
          <Divider />
        </Box>
        {children}
      </Stack>
    </Box>
  )
}
