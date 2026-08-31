import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTheme } from '../../src/theme'
import { SettingsContext } from '../../src/contexts/settings-context'
import { settingsWith } from '../test-utils'
import router from '../mocks/next-router'

const theme = createTheme({
  colorPreset: 'orange',
  direction: 'ltr',
  paletteMode: 'light',
  contrast: 'high',
})
const store = configureStore({ reducer: { toasts: (state = { toasts: [] }) => state } })
const settings = settingsWith()

// A stable Wrapper (rather than renderWithProviders' one-off tree) so RTL's `rerender`
// re-applies the same providers instead of losing them - a rerender that drops the
// ThemeProvider crashes MUI hooks that read the theme from context.
function Wrapper({ children }) {
  const queryClient = React.useRef(new QueryClient({ defaultOptions: { queries: { retry: false } } })).current
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SettingsContext.Provider value={settings}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </SettingsContext.Provider>
      </QueryClientProvider>
    </Provider>
  )
}

vi.mock('../../src/api/ApiCall', async () => (await import('../mocks/api-call')).apiCallMock())
import { api, getResult, postResult } from '../mocks/api-call'

import Page from '../../src/pages/identity/administration/groups/group/index.jsx'

// Stable per-id results so ApiGetCall doesn't hand back a fresh object identity every
// render (that loops effects that key off it - see mocks/api-call.js).
const groupResultCache = new Map()
const groupResultFor = (id) => {
  if (!groupResultCache.has(id)) {
    groupResultCache.set(id, getResult({ data: { id, displayName: `Group ${id}` } }))
  }
  return groupResultCache.get(id)
}
const switcherListResult = getResult({ data: { Results: [] } })

api.get = (opts) => {
  const endpoint = opts?.data?.Endpoint
  if (typeof endpoint === 'string' && endpoint.startsWith('groups/')) {
    return groupResultFor(endpoint.slice('groups/'.length))
  }
  return switcherListResult
}

describe('Group view page - bulk request refetch on entity switch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // A mutation's isSuccess stays true forever once it fires - the same as real
    // react-query - so a stale `!isSuccess` guard would only ever fire once per mount.
    const bulkState = postResult()
    bulkState.mutate = vi.fn(() => {
      bulkState.isSuccess = true
    })
    api.post = bulkState
    router.query = { groupId: 'group-1' }
    router.pathname = '/identity/administration/groups/group'
  })

  it('re-fires the bulk request when groupId changes without an unmount', async () => {
    const { rerender } = render(<Page />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(api.post.mutate).toHaveBeenCalledTimes(1)
    })
    expect(api.post.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/ListGraphBulkRequest',
        data: expect.objectContaining({
          Requests: expect.arrayContaining([
            expect.objectContaining({ url: '/groups/group-1/members' }),
          ]),
        }),
      })
    )

    // CippEntitySwitcher on the group page (or same-route navigation elsewhere) changes
    // the id in the URL without unmounting the page - simulate that here.
    router.query = { groupId: 'group-2' }
    rerender(<Page />)

    await waitFor(() => {
      expect(api.post.mutate).toHaveBeenCalledTimes(2)
    })
    expect(api.post.mutate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        url: '/api/ListGraphBulkRequest',
        data: expect.objectContaining({
          Requests: expect.arrayContaining([
            expect.objectContaining({ url: '/groups/group-2/members' }),
          ]),
        }),
      })
    )
  })
})
