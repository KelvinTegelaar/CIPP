import React from 'react'
import { within, userEvent, waitFor, expect } from 'storybook/test'
import { Box, Stack, Typography } from '@mui/material'
import { CippTabPicker } from '../../../src/components/CippComponents/CippTabPicker'
import { TabNavigationContext } from '../../../src/layouts/tab-navigation-context'
import { shrinkToPhoneViewport } from '../../viewport'

// tenant/manage — the worst group in the app for label length. 30 characters on the longest.
const TABS = [
  { label: 'Edit Tenant', path: '/tenant/manage/edit', icon: 'Settings' },
  { label: 'Manage Drift', path: '/tenant/manage/drift', icon: 'Sync' },
  { label: 'Configuration Backup', path: '/tenant/manage/backup', icon: 'Backup' },
  { label: 'Applied Standards Report', path: '/tenant/manage/standards', icon: 'Assessment' },
  {
    label: 'Policies and Settings Deployed',
    path: '/tenant/manage/policies',
    icon: 'Assessment',
  },
]

const withTabs =
  (currentPath = '/tenant/manage/policies', tabs = TABS) =>
  (Story) => (
    <TabNavigationContext.Provider
      value={{
        enabled: true,
        tabs,
        currentPath,
        onNavigate: () => {},
        actions: [],
        claim: () => {},
        release: () => {},
        isActionCornerClaimed: false,
      }}
    >
      <Story />
    </TabNavigationContext.Provider>
  )

export default {
  title: 'Components/CippComponents/CippTabPicker',
  component: CippTabPicker,
  tags: ['autodocs'],
}

// The default, and what every tabbed page gets: one full-width control in the slot the
// desktop tab bar occupied. Same control, same place, every page.
export const BlockAtPhoneWidth = {
  decorators: [withTabs()],
  render: () => (
    <Box data-testid="block-host" sx={{ px: 2 }}>
      <CippTabPicker />
    </Box>
  ),
  play: async ({ canvasElement, step }) => {
    const onAPhone = await shrinkToPhoneViewport()
    const canvas = within(canvasElement)
    const picker = canvas.getByRole('button', { name: /switch view/i })

    await step('the trigger names the current view', async () => {
      await expect(picker).toHaveAccessibleName('Policies and Settings Deployed switch view')
    })

    if (!onAPhone) return

    await step('the longest label in the app fits without widening the page', async () => {
      const host = canvasElement.querySelector('[data-testid="block-host"]')
      await waitFor(() => expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth))
      // full width of the gutter box, so the control is unmistakably a control
      const style = getComputedStyle(host)
      const content =
        host.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      await expect(picker.getBoundingClientRect().width).toBeGreaterThan(content - 1)
    })

    // Heading clothes: the chevron rides beside the text like a title's disclosure
    // affordance, not pinned to the far edge like a form field's.
    await step('the chevron sits beside the label, not at the far edge', async () => {
      const chevron = picker.querySelector('svg:last-of-type')
      const labelEl = within(picker).getByText('Policies and Settings Deployed')
      const gapToLabel = chevron.getBoundingClientRect().left - labelEl.getBoundingClientRect().right
      await expect(gapToLabel).toBeLessThan(24)
    })
  },
}

// The one exception: HeaderedTabbedLayout's title row is empty on its right half below md,
// so the picker rides there and navigation costs no vertical space at all.
export const CompactInTitleRow = {
  decorators: [withTabs()],
  render: () => (
    <Box data-testid="title-row-host" sx={{ px: 2 }}>
      <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
        <Stack spacing={1} sx={{ minWidth: 0 }}>
          <Typography variant="h6" noWrap>
            Contoso Manufacturing Holdings GmbH
          </Typography>
        </Stack>
        <CippTabPicker variant="compact" />
      </Stack>
    </Box>
  ),
  play: async ({ canvasElement, step }) => {
    const onAPhone = await shrinkToPhoneViewport()
    if (!onAPhone) return
    const canvas = within(canvasElement)
    const picker = canvas.getByRole('button', { name: /switch view/i })

    await step('a 30-char label beside a long title does not widen the row', async () => {
      const host = canvasElement.querySelector('[data-testid="title-row-host"]')
      await waitFor(() => expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth))
      // and it stays a control rather than eating the heading's half of the row
      await expect(picker.getBoundingClientRect().width).toBeLessThanOrEqual(
        host.clientWidth / 2 + 1
      )
    })
  },
}

// A single destination is not navigation — View Group and View Device have one tab each.
export const SingleTabRendersNothing = {
  decorators: [withTabs('/identity/groups/group', [TABS[0]])],
  render: () => (
    <Box data-testid="empty-host">
      <CippTabPicker />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByRole('button', { name: /switch view/i })).toBeNull()
  },
}

export const OpensTheSheet = {
  decorators: [withTabs('/tenant/manage/edit')],
  render: () => (
    <Box sx={{ px: 2 }}>
      <CippTabPicker />
    </Box>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    // The trigger names the current view and so does its row in the sheet — scope to the
    // sheet, or every current-tab query matches twice.
    let sheet

    await step('every destination is a full-width row, none scrolled off an edge', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /switch view/i }))
      const body = within(document.body)
      await waitFor(() => expect(body.getByText('Views')).toBeInTheDocument())
      sheet = within(body.getByText('Views').closest('.MuiDrawer-paper'))
      await expect(sheet.getByText('Configuration Backup')).toBeInTheDocument()
      await expect(sheet.getByText('Policies and Settings Deployed')).toBeInTheDocument()
    })

    await step('the current view is checked', async () => {
      const current = sheet.getByText('Edit Tenant').closest('[role="button"]')
      await expect(current).toHaveClass('Mui-selected')
    })
  },
}
