import React from 'react'
import { within, expect, userEvent, waitFor, fn } from 'storybook/test'
import {
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  Typography,
} from '@mui/material'
import { Add, Assessment, Public, Summarize } from '@mui/icons-material'
import { CippPageActionsFab } from '../../../src/components/CippComponents/CippPageActionsFab'
import { TabNavigationContext } from '../../../src/layouts/tab-navigation-context'

const TABS = [
  { label: 'Edit Tenant', path: '/tenant/manage/edit', icon: 'Settings' },
  { label: 'Manage Drift', path: '/tenant/manage/drift', icon: 'Sync' },
  { label: 'Configuration Backup', path: '/tenant/manage/backup', icon: 'Backup' },
]

const LAYOUT_ACTIONS = [{ label: 'Reset Password', onClick: () => {} }]

// Stands in for a headered tabbed layout: below md its header Actions menu is clipped, so
// those actions ride in whichever FAB owns the corner. Its tabs do not — those live in the
// title row (CippTabPicker), which is why this sheet never shows a "Views" section.
const withLayoutActions = (Story) => (
  <TabNavigationContext.Provider
    value={{
      enabled: true,
      tabs: TABS,
      currentPath: '/tenant/manage/edit',
      onNavigate: () => {},
      actions: LAYOUT_ACTIONS,
      claim: () => {},
      release: () => {},
      isActionCornerClaimed: false,
    }}
  >
    <Story />
  </TabNavigationContext.Provider>
)

export default {
  title: 'Components/CippComponents/CippPageActionsFab',
  component: CippPageActionsFab,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ minHeight: 320, position: 'relative' }}>
        <Typography variant="body2" color="text.secondary">
          Page content. The FAB is fixed to the viewport's bottom-right corner — below md
          that corner belongs to page actions (CippSpeedDial hides itself there).
        </Typography>
        <Story />
      </Box>
    ),
  ],
}

// How table pages use it: cardButton is an arbitrary Box of drawer triggers laid out for a
// desktop CardHeader, restacked vertically by the primitive's descendant CSS.
export const RestackedCardButton = {
  render: () => (
    <CippPageActionsFab>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" startIcon={<Add />}>
          Add User
        </Button>
        <Button variant="outlined">Bulk Add</Button>
        <Button variant="outlined">Invite Guest</Button>
      </Box>
    </CippPageActionsFab>
  ),
  play: async ({ step }) => {
    const body = within(document.body)

    await step('opens the sheet from the FAB', async () => {
      await userEvent.click(body.getByRole('button', { name: 'Page actions' }))
      await waitFor(() => expect(body.getByText('Actions')).toBeInTheDocument())
    })

    await step('children are restacked to full width', async () => {
      const addButton = body.getByRole('button', { name: 'Add User' })
      expect(window.getComputedStyle(addButton).justifyContent).toBe('flex-start')
    })

    await step('tapping an action closes the sheet', async () => {
      await userEvent.click(body.getByRole('button', { name: 'Bulk Add' }))
      // keepMounted: a cardButton child owns its own drawer, so the sheet hides rather
      // than unmounting — otherwise that drawer would vanish the moment it opened.
      await waitFor(() => expect(body.getByText('Actions')).not.toBeVisible())
    })
  },
}

// How the dashboard uses it: purpose-built list rows, so restacking is off.
export const DashboardSections = {
  render: (args) => (
    <CippPageActionsFab
      title="Dashboard actions"
      restackButtons={false}
      sheetProps={{ ModalProps: { keepMounted: true } }}
    >
      <List
        sx={{ py: 0 }}
        subheader={
          <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>
            Portals
          </ListSubheader>
        }
      >
        {['M365', 'Exchange', 'Entra'].map((label) => (
          <ListItemButton
            key={label}
            component="a"
            href={`https://example.test/${label}`}
            target="_blank"
            rel="noreferrer"
            sx={{ minHeight: 48 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Public fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ my: 0.5 }} />
      <List
        sx={{ py: 0 }}
        subheader={
          <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>
            Reports
          </ListSubheader>
        }
      >
        {/* ExecutiveReportButton renders exactly this: a MenuItem, not a Button */}
        <MenuItem onClick={args.onExecutiveSummary} sx={{ minHeight: 48 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Summarize fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Executive Summary" />
        </MenuItem>
        <ListItemButton sx={{ minHeight: 48 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Assessment fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Report Builder" />
        </ListItemButton>
      </List>
    </CippPageActionsFab>
  ),
  args: {
    onExecutiveSummary: fn(),
  },
  play: async ({ args, step }) => {
    const body = within(document.body)

    await step('sections render under their subheaders', async () => {
      await userEvent.click(body.getByRole('button', { name: 'Page actions' }))
      await waitFor(() => expect(body.getByText('Dashboard actions')).toBeInTheDocument())
      expect(body.getByText('Portals')).toBeInTheDocument()
      expect(body.getByText('Reports')).toBeInTheDocument()
    })

    await step('a MenuItem child fires its handler and closes the sheet', async () => {
      await userEvent.click(body.getByRole('menuitem', { name: 'Executive Summary' }))
      expect(args.onExecutiveSummary).toHaveBeenCalled()
      // keepMounted leaves the sheet in the DOM (so ExecutiveReportButton's own preview
      // Dialog survives) — closed means hidden here, not unmounted.
      await waitFor(() => expect(body.getByText('Dashboard actions')).not.toBeVisible())
    })
  },
}

// Under a headered tabbed layout the sheet carries the page's own action and the layout's
// header actions, labelled as two sections. Every page-actions FAB uses the same neutral
// glyph — a "+" only ever told the truth on pages whose sheet creates things.
export const PageAndLayoutActions = {
  decorators: [withLayoutActions],
  render: () => (
    <CippPageActionsFab>
      <Button variant="contained" startIcon={<Add />}>
        Add Variable
      </Button>
    </CippPageActionsFab>
  ),
  play: async ({ step }) => {
    const body = within(document.body)

    await step('the FAB carries the one shared glyph', async () => {
      const fab = body.getByRole('button', { name: 'Page actions' })
      expect(within(fab).queryByTestId('AddIcon')).toBeNull()
      expect(within(fab).getByTestId('MoreHorizIcon')).toBeInTheDocument()
    })

    await step('one sheet holds both kinds of action', async () => {
      await userEvent.click(body.getByRole('button', { name: 'Page actions' }))
      await waitFor(() => expect(body.getByText('Actions')).toBeInTheDocument())
      expect(body.getByRole('button', { name: 'Add Variable' })).toBeInTheDocument()
      expect(body.getByText('Reset Password')).toBeInTheDocument()
    })

    // Destinations moved to the title row; a FAB is for a screen's primary action.
    await step('and no destinations', async () => {
      expect(body.queryByText('Views')).toBeNull()
      expect(body.queryByText('Manage Drift')).toBeNull()
      expect(body.queryByText('Configuration Backup')).toBeNull()
    })
  },
}
