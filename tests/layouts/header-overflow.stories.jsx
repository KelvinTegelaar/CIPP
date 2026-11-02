import React from 'react'
import { within, waitFor, expect } from 'storybook/test'
import { Box, Stack, SvgIcon, Typography } from '@mui/material'
import { Mail, Fingerprint, CalendarToday } from '@mui/icons-material'
import { CippCopyToClipBoard } from '../../src/components/CippComponents/CippCopyToClipboard'
import { shrinkToPhoneViewport } from '../viewport'

/**
 * Reproduces HeaderedTabbedLayout's mobile header markup — it cannot render the layout
 * itself, which needs next/router and this Storybook runs on @storybook/react-vite. Keep the
 * two in step: this exists to hold the CSS contract that lets a copy-chip truncate.
 *
 * A guest UPN is the worst case in the app: `user_domain.onmicrosoft.com#EXT#@tenant...` is
 * one unbreakable token, roughly 60 characters, and it ran off the right edge of the screen.
 */
const GUEST_UPN = 'jduprey_7ngn50.onmicrosoft.com#EXT#@1h81wz.onmicrosoft.com'

const SubtitleItem = ({ icon, children }) => (
  <Stack
    direction="row"
    spacing={1}
    sx={{
      alignItems: "center",
      minWidth: 0,
      maxWidth: '100%'
    }}>
    <SvgIcon fontSize="small" sx={{ flexShrink: 0 }}>
      {icon}
    </SvgIcon>
    <Typography
      variant="body2"
      sx={{
        color: "text.secondary",
        minWidth: 0,
        '& .MuiChip-root': { maxWidth: '100%' }
      }}>
      {children}
    </Typography>
  </Stack>
)

export default {
  title: 'Layouts/HeaderedTabbedLayout/MobileHeader',
  tags: ['autodocs'],
}

export const GuestUpnDoesNotSpill = {
  render: () => (
    <Box data-testid="header-host" sx={{ px: 2, overflowX: 'visible' }}>
      <Stack spacing={1}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            justifyContent: "space-between"
          }}>
          <Stack spacing={1} sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              jduprey
            </Typography>
          </Stack>
        </Stack>
        <Stack
          useFlexGap
          direction="row"
          sx={{
            alignItems: "center",
            flexWrap: "wrap",
            columnGap: 2,
            rowGap: 0.5,
            minWidth: 0
          }}>
          <SubtitleItem icon={<Mail />}>
            <CippCopyToClipBoard type="chip" text={GUEST_UPN} />
          </SubtitleItem>
          <SubtitleItem icon={<Fingerprint />}>
            <CippCopyToClipBoard type="chip" text="c9bcc4d2-87c0-4c14-a614-920a1b233fc6" />
          </SubtitleItem>
          <SubtitleItem icon={<CalendarToday />}>Created: 1 month ago</SubtitleItem>
        </Stack>
      </Stack>
    </Box>
  ),
  play: async ({ canvasElement, step }) => {
    const onAPhone = await shrinkToPhoneViewport()
    if (!onAPhone) return
    const canvas = within(canvasElement)

    await step('the guest UPN chip truncates instead of widening the page', async () => {
      const host = canvasElement.querySelector('[data-testid="header-host"]')
      await waitFor(() => expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth))
      await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
        document.documentElement.clientWidth
      )
    })

    await step('and it is still the full value on the clipboard, not a truncated one', async () => {
      // the label is elided in CSS only — the text node keeps the whole UPN
      await expect(canvas.getByText(GUEST_UPN)).toBeInTheDocument()
    })
  },
}
