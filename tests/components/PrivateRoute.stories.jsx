import React from 'react'
import { within, expect, waitFor } from 'storybook/test'
import { http, HttpResponse } from 'msw'
import { PrivateRoute } from '../../src/components/PrivateRoute'

// real fetch path: ApiGetCall -> axios -> msw, exercises the latch effect and
// role gating end to end in the browser
export default {
  title: 'Components/PrivateRoute',
  component: PrivateRoute,
  tags: ['autodocs'],
}

const handlers = (swa, me, meStatus = 200) => [
  http.get('/.auth/me', () => HttpResponse.json(swa)),
  http.get('*/.auth/me', () => HttpResponse.json(swa)),
  http.get('/api/me', () => HttpResponse.json(me, { status: meStatus })),
  http.get('*/api/me', () => HttpResponse.json(me, { status: meStatus })),
]

const principal = (userRoles) => ({
  clientPrincipal: { userDetails: 'john@contoso.com', userRoles },
})

export const Unauthenticated = {
  render: () => (
    <PrivateRoute>
      <div>app content</div>
    </PrivateRoute>
  ),
  parameters: {
    msw: { handlers: handlers({ clientPrincipal: null }, { message: 'Permission Denied' }) },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('null clientPrincipal blocks the app content', async () => {
      await waitFor(
        () => {
          expect(canvas.getByText('Sign in to CIPP')).toBeInTheDocument()
        })
      expect(canvas.queryByText('app content')).not.toBeInTheDocument()
    })
  },
}

export const AuthenticatedNoRoles = {
  render: () => (
    <PrivateRoute>
      <div>app content</div>
    </PrivateRoute>
  ),
  parameters: {
    msw: {
      handlers: handlers(
        principal(['anonymous', 'authenticated']),
        principal(['anonymous', 'authenticated'])
      ),
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('anonymous/authenticated roles alone still block the app content', async () => {
      await waitFor(
        () => {
          expect(canvas.getByText('Access Denied')).toBeInTheDocument()
        })
      expect(canvas.queryByText('app content')).not.toBeInTheDocument()
    })
  },
}

export const Authenticated = {
  render: () => (
    <PrivateRoute>
      <div>app content</div>
    </PrivateRoute>
  ),
  parameters: {
    msw: {
      handlers: handlers(
        principal(['anonymous', 'authenticated', 'admin']),
        principal(['anonymous', 'authenticated', 'admin'])
      ),
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('admin role on both auth endpoints renders the app content', async () => {
      await waitFor(
        () => {
          expect(canvas.getByText('app content')).toBeInTheDocument()
        })
    })
  },
}

export const ApiOffline = {
  render: () => (
    <PrivateRoute>
      <div>app content</div>
    </PrivateRoute>
  ),
  parameters: {
    msw: {
      handlers: handlers(principal(['anonymous', 'authenticated', 'admin']), {}, 404),
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('404 from /api/me shows CIPP API Unreachable', async () => {
      await waitFor(
        () => {
          expect(canvas.getByText('CIPP API Unreachable')).toBeInTheDocument()
        })
    })
  },
}
