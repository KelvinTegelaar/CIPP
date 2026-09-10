import React from 'react'
import { within, expect, waitFor } from 'storybook/test'
import { http, HttpResponse } from 'msw'
import UnauthenticatedPage from '../../src/pages/unauthenticated'

export default {
  title: 'Pages/Unauthenticated',
  component: UnauthenticatedPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

const authHandlers = (me, swa) => [
  http.get('/api/me', () => HttpResponse.json(me)),
  http.get('/.auth/me', () => HttpResponse.json(swa)),
  http.get('*/api/me', () => HttpResponse.json(me)),
  http.get('*/.auth/me', () => HttpResponse.json(swa)),
]

// a real identity CIPP won't let through
export const AccessDenied = {
  render: () => <UnauthenticatedPage reason="permissions" />,
  parameters: {
    msw: {
      handlers: authHandlers({ message: 'Permission Denied' }, { clientPrincipal: null }),
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('access denied page renders with a Login link', async () => {
      await waitFor(() => {
        expect(canvas.getByText('Access Denied')).toBeInTheDocument()
      })
      await expect(canvas.getByText('Permission Denied')).toBeInTheDocument()
      await expect(canvas.getByRole('link', { name: /Login/i })).toBeInTheDocument()
    })
  },
}

export const AccessDeniedNamedAccount = {
  render: () => <UnauthenticatedPage reason="permissions" />,
  parameters: {
    msw: {
      handlers: authHandlers(
        {
          clientPrincipal: {
            userRoles: ['anonymous', 'authenticated', 'admin'],
          },
        },
        { clientPrincipal: { userDetails: 'john@contoso.com' } }
      ),
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('the denied account is named and switching is offered', async () => {
      await waitFor(() => {
        expect(canvas.getByText('john@contoso.com')).toBeInTheDocument()
      })
      await expect(
        canvas.getByRole('link', { name: 'Sign in with a different account' })
      ).toBeInTheDocument()
      await expect(canvas.getByRole('link', { name: /Return to Home/i })).toBeInTheDocument()
    })
  },
}

// no identity at all, which is a sign-in prompt rather than a denial
export const SignIn = {
  render: () => <UnauthenticatedPage reason="session" />,
  parameters: {
    msw: { handlers: authHandlers({}, { clientPrincipal: null }) },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('sign-in page renders without any denial language', async () => {
      await waitFor(() => {
        expect(canvas.getByText('Sign in to CIPP')).toBeInTheDocument()
      })
      await expect(canvas.queryByText('Access Denied')).not.toBeInTheDocument()
      await expect(
        canvas.getByRole('link', { name: /Sign in with Microsoft/i })
      ).toBeInTheDocument()
    })
  },
}

export const SignInDark = {
  ...SignIn,
  globals: { theme: 'dark' },
}
