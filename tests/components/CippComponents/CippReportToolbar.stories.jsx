import React from 'react'
import { http, HttpResponse } from 'msw'
import { within, expect, userEvent, waitFor } from 'storybook/test'
import { Box } from '@mui/material'
import { CippReportToolbar } from '../../../src/components/CippComponents/CippReportToolbar'

const testSuites = [
  {
    id: 'ztna',
    name: 'Zero Trust Network Access Tests',
    description: "Microsoft's comprehensive security assessment",
    type: 'builtin',
    source: 'file',
  },
  {
    id: 'custom-1',
    name: 'My Custom Suite',
    description: 'A tenant-specific suite',
    type: 'custom',
    source: 'table',
  },
]

const handlers = [
  http.get('*/api/ListTestReports', () => HttpResponse.json(testSuites)),
  http.get('*/api/ListAvailableTests', () =>
    HttpResponse.json({ IdentityTests: [], DevicesTests: [], CustomTests: [] })
  ),
]

export default {
  title: 'Components/CippComponents/CippReportToolbar',
  component: CippReportToolbar,
  tags: ['autodocs'],
  parameters: { msw: { handlers } },
  decorators: [
    (Story) => (
      <Box sx={{ p: 2 }}>
        <Story />
      </Box>
    ),
  ],
}

// The toolbar picks its layout from useIsMobileLayout (a media query), and no story in this
// repo sets a viewport — so the mobile variant is shown by constraining the container and
// documenting the difference rather than by faking the breakpoint.
export const Desktop = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('every suite action is an inline button', async () => {
      await waitFor(() =>
        expect(canvas.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
      )
      expect(canvas.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
      expect(canvas.getByRole('button', { name: 'Create Suite' })).toBeInTheDocument()
      expect(canvas.getByRole('button', { name: 'Refresh test suites' })).toBeInTheDocument()
      expect(canvas.queryByRole('button', { name: 'Test suite actions' })).toBeNull()
    })
  },
}

// Regression guard for the overflow this refactor fixed: the selector must be allowed to
// shrink (minWidth: 0) so the trailing Delete button stays inside the row.
export const NarrowDesktopKeepsButtonsInView = {
  decorators: [
    (Story) => (
      <Box sx={{ p: 2, width: 900 }}>
        <Story />
      </Box>
    ),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('the last button is not pushed past the container edge', async () => {
      const deleteButton = await waitFor(() => canvas.getByRole('button', { name: 'Delete' }))
      const row = deleteButton.closest('div[class*="MuiBox"]').parentElement
      expect(deleteButton.getBoundingClientRect().right).toBeLessThanOrEqual(
        Math.ceil(row.getBoundingClientRect().right) + 1
      )
    })
  },
}

export const SuiteSelection = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('the default suite is selected once the list loads', async () => {
      // Opening the popper is left to CippAutocomplete's own stories — driving it from here
      // crashes the browser tab in this harness.
      await waitFor(() =>
        expect(canvas.getByRole('combobox')).toHaveValue('Zero Trust Network Access Tests')
      )
    })
  },
}
