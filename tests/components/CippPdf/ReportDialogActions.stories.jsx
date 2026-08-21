import React from 'react'
import { within, waitFor, expect } from 'storybook/test'
import { Box, Button, DialogActions, Typography } from '@mui/material'
import { Download } from '@mui/icons-material'
import { shrinkToPhoneViewport } from '../../viewport'

/**
 * The report dialogs' action row, reproduced — the dialogs themselves need too much data to
 * mount. Below md the caption and two buttons cannot share a line at 390px, so the row stacks;
 * this holds the contract that the buttons then span the same width as each other.
 */
const ActionsRow = () => (
  <Box data-testid="actions-host" sx={{ width: '100%' }}>
    <DialogActions
      sx={{
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        gap: 1,
        flexDirection: { xs: 'column-reverse', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        '& > :not(style) ~ :not(style)': { ml: { xs: 0, md: 1 } },
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Sections enabled: 7 of 9
        </Typography>
      </Box>
      <Button variant="contained" startIcon={<Download />} sx={{ minWidth: 140 }}>
        Download PDF
      </Button>
      <Button variant="outlined">Close</Button>
    </DialogActions>
  </Box>
)

export default {
  title: 'Components/CippPdf/ReportDialogActions',
  tags: ['autodocs'],
}

export const StackedAtPhoneWidth = {
  render: () => <ActionsRow />,
  play: async ({ canvasElement, step }) => {
    const onAPhone = await shrinkToPhoneViewport()
    if (!onAPhone) return
    const canvas = within(canvasElement)
    const host = canvasElement.querySelector('[data-testid="actions-host"]')

    const primary = canvas.getByRole('button', { name: /download pdf/i })
    const secondary = canvas.getByRole('button', { name: /^close$/i })

    await step('the two buttons share one width and one left edge', async () => {
      await waitFor(() => {
        const a = primary.getBoundingClientRect()
        const b = secondary.getBoundingClientRect()
        expect(Math.abs(a.width - b.width)).toBeLessThanOrEqual(1)
        expect(Math.abs(a.left - b.left)).toBeLessThanOrEqual(1)
        expect(Math.abs(a.right - b.right)).toBeLessThanOrEqual(1)
      })
    })

    await step('and nothing pushes the row wider than the screen', async () => {
      await expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth)
    })
  },
}
