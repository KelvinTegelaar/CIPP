import React from 'react'
import { within, waitFor, expect } from 'storybook/test'
import { Avatar, Badge, IconButton, Stack, SvgIcon } from '@mui/material'
import BellIcon from '@heroicons/react/24/outline/BellIcon'
import { shrinkToPhoneViewport, growToDesktopViewport } from '../viewport'

/**
 * The top bar's right-hand cluster, reproduced — `TopNav` itself pulls in the router, the
 * tenant list and half a dozen API hooks. Keep this in step with `notifications-popover.js`
 * and `top-nav.js`; it exists to hold one thing, which is that the notification dot belongs
 * to the bell and not to the avatar beside it.
 */
const Cluster = ({ mobile }) => (
  <Stack
    data-testid="nav-cluster"
    direction="row"
    spacing={mobile ? 1 : 1.5}
    sx={{
      alignItems: "center",
      p: 1,
      bgcolor: 'background.paper'
    }}>
    <Badge
      color="error"
      variant="dot"
      sx={{
        '& .MuiBadge-badge': {
          top: { xs: 7, md: 0 },
          right: { xs: 7, md: 0 },
          transform: { xs: 'none', md: 'scale(1) translate(50%, -50%)' },
        },
      }}
    >
      <IconButton color="inherit" aria-label="Notifications">
        <SvgIcon color="action" fontSize="small">
          <BellIcon />
        </SvgIcon>
      </IconButton>
    </Badge>
    <Avatar data-testid="account-avatar" sx={{ width: 40, height: 40 }}>
      J
    </Avatar>
  </Stack>
)

export default {
  title: 'Layouts/TopNav/NotificationBadge',
  tags: ['autodocs'],
}

const dotAndAvatar = (canvasElement) => ({
  bell: canvasElement.querySelector('.MuiBadge-root'),
  dot: canvasElement.querySelector('.MuiBadge-badge'),
  avatar: canvasElement.querySelector('[data-testid="account-avatar"]'),
})

export const DotStaysWithTheBellOnAPhone = {
  render: () => <Cluster mobile />,
  play: async ({ canvasElement, step }) => {
    const onAPhone = await shrinkToPhoneViewport()
    if (!onAPhone) return
    const { bell, dot, avatar } = dotAndAvatar(canvasElement)

    await step('the dot sits inside the bell, not over the gap to the avatar', async () => {
      await waitFor(() => {
        const d = dot.getBoundingClientRect()
        const b = bell.getBoundingClientRect()
        const a = avatar.getBoundingClientRect()
        expect(d.right).toBeLessThanOrEqual(b.right + 0.5)
        expect(d.top).toBeGreaterThanOrEqual(b.top - 0.5)
        // and there is real space left between it and the avatar
        expect(a.left - d.right).toBeGreaterThan(4)
      })
    })
  },
}

// The md values are MUI's own, so the badge keeps hanging off the corner above the breakpoint.
export const DotKeepsItsCornerOnDesktop = {
  render: () => <Cluster />,
  play: async ({ canvasElement, step }) => {
    const onDesktop = await growToDesktopViewport()
    if (!onDesktop) return
    const { bell, dot } = dotAndAvatar(canvasElement)

    await step('the dot still overhangs the button', async () => {
      await waitFor(() => {
        const d = dot.getBoundingClientRect()
        const b = bell.getBoundingClientRect()
        expect(d.right).toBeGreaterThan(b.right)
      })
    })
  },
}
