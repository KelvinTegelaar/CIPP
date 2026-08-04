import React from 'react'
import { within, expect, waitFor } from 'storybook/test'
import { http, HttpResponse } from 'msw'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '../../src/layouts/index'

// authenticated principal: side-nav needs userRoles.length > 2, permissions
// drive nativeMenuItems filtering ('CIPP.Core.Read' matches 'CIPP.Core.*')
const clientPrincipal = {
  userDetails: 'admin@contoso.com',
  userRoles: ['anonymous', 'authenticated', 'Global Administrator'],
}

const mePayload = {
  clientPrincipal,
  permissions: ['CIPP.Core.Read', 'Identity.User.Read'],
}

// hideSidebar latches true if the auth queries are ever observed loading, so
// the cache must be warm before Layout mounts (matches the real app, where
// login pages populate these keys first)
const makeSeededClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  queryClient.setQueryData(['authmeswa'], { clientPrincipal })
  queryClient.setQueryData(['authmecipp'], mePayload)
  return queryClient
}

// GetCippAlerts is the only handler that varies between stories - the maintenance banner is
// driven entirely by what this endpoint returns.
const makeHandlers = (alerts = []) => [
  http.get('/api/me', () => HttpResponse.json(mePayload)),
  http.get('/.auth/me', () => HttpResponse.json({ clientPrincipal })),
  http.get('/api/ListFeatureFlags', () => HttpResponse.json([])),
  http.get('/api/ListUserSettings', () => HttpResponse.json({})),
  http.get('/api/GetCippAlerts', () => HttpResponse.json(alerts)),
]

const DAY_MS = 24 * 60 * 60 * 1000
const daysFromNow = (days) => new Date(Date.now() + days * DAY_MS).toISOString()

// Shaped exactly as Get-CIPPMaintenanceNotice emits it.
const maintenanceAlert = (overrides = {}) => ({
  title: 'Scheduled Maintenance',
  Alert: 'CIPP will be undergoing scheduled platform maintenance.',
  link: 'https://status.cyberdrain.com',
  type: 'warning',
  maintenance: true,
  noticeId: 'storybook-notice',
  startTime: daysFromNow(7),
  endTime: daysFromNow(21),
  active: false,
  dismissible: true,
  ...overrides,
})

const children = (
  <div style={{ padding: '20px' }}>
    <h1>Dashboard Content</h1>
    <p>This is the main content of the dashboard layout.</p>
  </div>
)

// Dismissals persist in localStorage across stories, which would hide the banner in every story
// after the first one that dismisses it.
const clearDismissals = () => {
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith('cipp_maintenance_dismissed:'))
      .forEach((key) => window.localStorage.removeItem(key))
  } catch {
    /* storage unavailable - nothing to clear */
  }
}

export default {
  title: 'Layouts/Layout',
  component: Layout,
  tags: ['autodocs'],
  parameters: {
    msw: { handlers: makeHandlers() },
  },
  decorators: [
    (Story) => {
      clearDismissals()
      return (
        <QueryClientProvider client={makeSeededClient()}>
          <Story />
        </QueryClientProvider>
      )
    },
  ],
}

export const Default = {
  args: { children },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('children render in the content area', async () => {
      await expect(canvas.getByText('Dashboard Content')).toBeInTheDocument()
    })

    await step('side nav keeps known items after permission filtering', async () => {
      await waitFor(() => {
        expect(canvasElement.querySelector('[data-tutorial="side-nav"]')).not.toBeNull()
      })
      const sideNav = within(canvasElement.querySelector('[data-tutorial="side-nav"]'))
      await waitFor(() => {
        expect(sideNav.getByText('Dashboard')).toBeInTheDocument()
      })
      await expect(sideNav.getByText('Identity Management')).toBeInTheDocument()
    })

    await step('no maintenance banner when no notice is set', async () => {
      await expect(canvas.queryByLabelText('Maintenance notice')).toBeNull()
    })
  },
}

export const MaintenanceUpcoming = {
  args: { children },
  parameters: { msw: { handlers: makeHandlers([maintenanceAlert()]) } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('banner announces the upcoming window', async () => {
      const banner = await waitFor(() => canvas.getByLabelText('Maintenance notice'))
      await expect(within(banner).getByText('Scheduled Maintenance')).toBeInTheDocument()
      await expect(within(banner).getByText(/starts in 7 days/i)).toBeInTheDocument()
    })

    await step('no Live chip before the window opens', async () => {
      const banner = canvas.getByLabelText('Maintenance notice')
      await expect(within(banner).queryByText('Live')).toBeNull()
    })

    await step('dismiss hides it', async () => {
      const banner = canvas.getByLabelText('Maintenance notice')
      within(banner).getByRole('button', { name: /dismiss maintenance notice/i }).click()
      await waitFor(() => {
        expect(canvas.queryByLabelText('Maintenance notice')).toBeNull()
      })
    })
  },
}

export const MaintenanceActive = {
  args: { children },
  parameters: {
    msw: {
      handlers: makeHandlers([
        maintenanceAlert({
          title: 'Maintenance in progress',
          Alert: 'Scheduled jobs and standards runs are delayed while storage is migrated.',
          noticeId: 'storybook-active',
          startTime: daysFromNow(-2),
          endTime: daysFromNow(12),
          active: true,
        }),
      ]),
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('banner shows the Live chip and a countdown to the end', async () => {
      const banner = await waitFor(() => canvas.getByLabelText('Maintenance notice'))
      await expect(within(banner).getByText('Maintenance in progress')).toBeInTheDocument()
      await expect(within(banner).getByText('Live')).toBeInTheDocument()
      await expect(within(banner).getByText(/ends .* in 12 days/i)).toBeInTheDocument()
    })
  },
}

export const MaintenanceOutage = {
  args: { children },
  parameters: {
    msw: {
      handlers: makeHandlers([
        maintenanceAlert({
          title: 'CIPP is read-only',
          Alert: 'CIPP is read-only during the storage cutover. Changes will fail to save.',
          type: 'error',
          noticeId: 'storybook-outage',
          startTime: daysFromNow(-1),
          endTime: daysFromNow(1),
          active: true,
          dismissible: false,
        }),
      ]),
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('a non-dismissible outage has no close button', async () => {
      const banner = await waitFor(() => canvas.getByLabelText('Maintenance notice'))
      await expect(within(banner).getByText('CIPP is read-only')).toBeInTheDocument()
      await expect(
        within(banner).queryByRole('button', { name: /dismiss maintenance notice/i })
      ).toBeNull()
    })
  },
}

export const MaintenanceMinimal = {
  args: { children },
  parameters: {
    msw: {
      handlers: makeHandlers([
        maintenanceAlert({
          title: 'Scheduled Maintenance',
          Alert: 'Planned maintenance this weekend. No downtime expected.',
          type: 'info',
          noticeId: 'storybook-minimal',
          link: null,
          startTime: null,
          endTime: null,
          active: false,
        }),
      ]),
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('message-only notice renders without a window line or link', async () => {
      const banner = await waitFor(() => canvas.getByLabelText('Maintenance notice'))
      await expect(
        within(banner).getByText('Planned maintenance this weekend. No downtime expected.')
      ).toBeInTheDocument()
      await expect(within(banner).queryByRole('link', { name: 'Details' })).toBeNull()
    })
  },
}
