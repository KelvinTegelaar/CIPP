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

export default {
  title: 'Layouts/Layout',
  component: Layout,
  tags: ['autodocs'],
  parameters: {
    msw: {
      handlers: [
        http.get('/api/me', () => {
          return HttpResponse.json(mePayload)
        }),
        http.get('/.auth/me', () => {
          return HttpResponse.json({ clientPrincipal })
        }),
        http.get('/api/ListFeatureFlags', () => {
          return HttpResponse.json([])
        }),
        http.get('/api/ListUserSettings', () => {
          return HttpResponse.json({})
        }),
        http.get('/api/GetCippAlerts', () => {
          return HttpResponse.json([])
        }),
      ],
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeSeededClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
}

export const Default = {
  args: {
    children: (
      <div style={{ padding: '20px' }}>
        <h1>Dashboard Content</h1>
        <p>This is the main content of the dashboard layout.</p>
      </div>
    ),
  },
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
  },
}
