import React from 'react'
import { http, HttpResponse } from 'msw'
import { within, expect, userEvent, waitFor } from 'storybook/test'
import { Box, Paper, Stack } from '@mui/material'
import { CippMobileTenantPicker } from '../../../src/components/CippComponents/CippMobileTenantPicker'

const tenants = [
  { customerId: 'all', displayName: 'All Tenants', defaultDomainName: 'AllTenants' },
  { customerId: 't-1', displayName: 'Contoso Ltd', defaultDomainName: 'contoso.com' },
  { customerId: 't-2', displayName: 'Fabrikam Inc', defaultDomainName: 'fabrikam.com' },
  { customerId: 't-3', displayName: 'Northwind Traders', defaultDomainName: 'northwind.com' },
  { customerId: 't-4', displayName: 'Adventure Works', defaultDomainName: 'adventure-works.com' },
]

export default {
  title: 'Components/CippComponents/CippMobileTenantPicker',
  component: CippMobileTenantPicker,
  tags: ['autodocs'],
  parameters: {
    msw: {
      handlers: [http.get('*/api/listTenants', () => HttpResponse.json(tenants))],
    },
  },
  decorators: [
    (Story) => (
      // Stands in for the mobile top bar, where the chip takes the width a search icon
      // used to occupy (universal search moved into the account menu).
      <Paper sx={{ maxWidth: 390, p: 1 }}>
        <Stack direction="row" spacing={1} sx={{
          alignItems: "center"
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Story />
          </Box>
        </Stack>
      </Paper>
    ),
  ],
}

export const Chip = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('chip shows the current tenant name', async () => {
      await waitFor(() => expect(canvasElement.textContent).toContain('testdomain.com'))
    })
  },
}

export const PickerOpen = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    await step('the chip opens a fullscreen picker listing every tenant', async () => {
      await userEvent.click(canvas.getByRole('button'))
      await waitFor(() => expect(body.getByText('Contoso Ltd')).toBeInTheDocument())
      expect(body.getByText('Fabrikam Inc')).toBeInTheDocument()
      expect(body.getByText('All Tenants')).toBeInTheDocument()
    })

    // Avatar's default colour is background.default, so setting only bgcolor leaves the
    // globe a dark grey sitting on the accent. Real browser: read what actually painted.
    await step('the All Tenants glyph contrasts with the accent behind it', async () => {
      const avatar = body
        .getByText('All Tenants')
        .closest('[role="button"]')
        .querySelector('.MuiAvatar-root')
      const style = getComputedStyle(avatar)
      expect(style.backgroundColor).not.toBe(style.color)

      const luminance = (rgb) => {
        const [r, g, b] = rgb.match(/\d+/g).map(Number)
        const channel = (c) => {
          const v = c / 255
          return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
        }
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
      }
      const a = luminance(style.color)
      const b = luminance(style.backgroundColor)
      const contrast = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
      expect(contrast).toBeGreaterThan(3)
    })
  },
}

export const SearchFiltersTheList = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    await userEvent.click(canvas.getByRole('button'))
    await waitFor(() => expect(body.getByText('Contoso Ltd')).toBeInTheDocument())

    await step('search narrows by display name', async () => {
      await userEvent.type(body.getByPlaceholderText(/search/i), 'north')
      await waitFor(() => expect(body.queryByText('Contoso Ltd')).toBeNull())
      expect(body.getByText('Northwind Traders')).toBeInTheDocument()
    })
  },
}

export const FavoritingATenant = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    await userEvent.click(canvas.getByRole('button'))
    await waitFor(() => expect(body.getByText('Fabrikam Inc')).toBeInTheDocument())

    await step('favoriting promotes the tenant into a Favorites section', async () => {
      const favoriteButtons = body.getAllByRole('button', { name: /favorite/i })
      await userEvent.click(favoriteButtons[1])
      await waitFor(() => expect(body.getByText('Favorites')).toBeInTheDocument())
    })
  },
}
