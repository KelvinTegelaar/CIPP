import React from 'react'
import { within, expect } from 'storybook/test'
import { CippErrorState } from '../../../src/components/CippComponents/CippErrorState'

export default {
  title: 'Components/CippErrorState',
  component: CippErrorState,
  tags: ['autodocs'],
}

export const NotFound = {
  args: {
    code: '404',
    title: 'Page not found',
    description:
      "This page doesn't exist, or it has moved. Head back to the dashboard and pick up from there.",
    imageUrl: '/cippy-404.png',
    actionText: 'Return to Home',
    actionHref: '/',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  },
}

export const NotFoundDark = {
  ...NotFound,
  globals: { theme: 'dark' },
}

export const ServerError = {
  args: {
    code: '500',
    title: 'Something went wrong',
    description:
      'Head back to the dashboard — and if it keeps happening, clearing the cached data usually shakes it loose.',
    detail: "TypeError: Cannot read properties of undefined (reading 'clientPrincipal')",
    imageUrl: '/cippy-500.png',
    actionText: 'Return to Home',
    actionHref: '/',
    secondaryText: 'Clear cache & reload',
    onSecondaryClick: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('link', { name: 'Return to Home' })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Clear cache & reload' })).toBeInTheDocument()
  },
}

export const ServerErrorDark = {
  ...ServerError,
  globals: { theme: 'dark' },
}

export const NotAllowed = {
  args: {
    code: '401',
    title: 'Not allowed',
    description:
      "Your account doesn't have permission to view this page. Head back to the dashboard, or ask an administrator to grant you access.",
    imageUrl: '/cippy-401.png',
    actionText: 'Return to Home',
    actionHref: '/',
  },
}
