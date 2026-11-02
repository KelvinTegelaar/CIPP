import React, { useState } from 'react'
import { within, expect, userEvent, waitFor } from 'storybook/test'
import { Box, Button } from '@mui/material'
import { MobileNav } from '../../src/layouts/mobile-nav'
import { shrinkToPhoneViewport } from '../viewport'

const items = [
  { title: 'Dashboard', path: '/' },
  {
    title: 'Identity Management',
    path: '/identity',
    items: [
      { title: 'Users', path: '/identity/administration/users' },
      { title: 'Groups', path: '/identity/administration/groups' },
      { title: 'Devices', path: '/identity/administration/devices' },
    ],
  },
  {
    title: 'Tenant Administration',
    path: '/tenant',
    items: [
      { title: 'Tenants', path: '/tenant/administration/tenants' },
      { title: 'Alerts', path: '/tenant/administration/alert-configuration' },
    ],
  },
  { title: 'Tools', path: '/tools' },
  { title: 'Settings', path: '/cipp/settings' },
]

// Mirrors the open/close state Layout owns (layouts/index.js useMobileNav), so the drawer
// behaves here exactly as it does in the app.
const Harness = (props) => {
  const [open, setOpen] = useState(false)
  return (
    <Box sx={{ p: 2 }}>
      <Button variant="contained" data-testid="open-nav" onClick={() => setOpen(true)}>
        Open nav
      </Button>
      <MobileNav
        items={items}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        {...props}
      />
    </Box>
  )
}

export default {
  title: 'Layouts/MobileNav',
  component: MobileNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export const Default = {
  render: () => <Harness />,
}

// Only a real browser can settle this: jsdom runs no transitions, so the frame the close
// animation starts from does not exist there.
export const DragClosesFromWhereItWasLeft = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const onAPhone = await shrinkToPhoneViewport()
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByTestId('open-nav'))
    const paper = await waitFor(() => {
      const node = document.querySelector('.MuiDrawer-paper')
      expect(node).not.toBeNull()
      return node
    })
    if (!onAPhone) {
      return
    }
    await waitFor(() =>
      expect(new DOMMatrixReadOnly(getComputedStyle(paper).transform).m41).toBe(0)
    )

    // Dispatched on a node inside the paper and left to bubble: MUI reads event.target to
    // decide the gesture started in the drawer, so firing at the document bails immediately.
    const target = paper.querySelector('nav') ?? paper
    const at = (clientX) =>
      new Touch({ identifier: 1, target, clientX, clientY: 400, pageX: clientX, pageY: 400 })
    const fire = (type, clientX) =>
      target.dispatchEvent(
        new TouchEvent(type, {
          bubbles: true,
          cancelable: true,
          touches: type === 'touchend' ? [] : [at(clientX)],
          changedTouches: [at(clientX)],
        })
      )

    // MUI flags "maybe swiping" in React state on touchstart and ignores moves until that has
    // been applied, so the gesture has to be spread across ticks like a real one.
    const tick = () => new Promise((resolve) => setTimeout(resolve, 30))
    fire('touchstart', 300)
    await tick()
    for (const x of [285, 230, 160, 80, 40]) {
      fire('touchmove', x)
      await tick()
    }

    const draggedTo = new DOMMatrixReadOnly(getComputedStyle(paper).transform).m41
    expect(draggedTo).toBeLessThan(-100)
    fire('touchend', 40)

    // The exit has to continue from where the finger let go. Slide probes the paper's
    // untranslated position when the exit starts (Slide.js getTranslateValue), and the browser
    // takes that probe as the transition's start, which snaps the drawer wide open first.
    const firstExitFrame = await new Promise((resolve) => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          resolve(new DOMMatrixReadOnly(getComputedStyle(paper).transform).m41)
        )
      )
    })
    expect(firstExitFrame).toBeLessThan(draggedTo * 0.6)

    await waitFor(() =>
      expect(document.querySelector('.MuiDrawer-root').getAttribute('aria-hidden')).toBe('true')
    )
  },
}

// enough rows to overflow a phone-height drawer once the group is expanded
const tallItems = [
  { title: 'Dashboard', path: '/' },
  {
    title: 'CIPP',
    path: '/cipp',
    items: [
      { title: 'Custom Data', path: '/cipp/custom-data' },
      {
        title: 'Advanced',
        path: '/cipp/advanced',
        items: [
          { title: 'Super Admin', path: '/cipp/advanced/super-admin/tenant-mode' },
          { title: 'Container Management', path: '/cipp/advanced/container-management/status' },
          { title: 'Authentication', path: '/cipp/advanced/authentication' },
          { title: 'Timers', path: '/cipp/advanced/timers' },
        ],
      },
      { title: 'Settings', path: '/cipp/settings' },
      { title: 'Preferences', path: '/cipp/preferences' },
    ],
  },
  ...Array.from({ length: 14 }, (_, index) => ({
    title: `Section ${index + 1}`,
    path: `/section-${index + 1}`,
  })),
]

export const NavListIsTheOnlyScroller = {
  render: () => <Harness items={tallItems} />,
  play: async ({ canvasElement }) => {
    const onAPhone = await shrinkToPhoneViewport()
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByTestId('open-nav'))
    const paper = await waitFor(() => {
      const node = document.querySelector('.MuiDrawer-paper')
      expect(node).not.toBeNull()
      return node
    })
    if (!onAPhone) {
      return
    }
    await waitFor(() =>
      expect(new DOMMatrixReadOnly(getComputedStyle(paper).transform).m41).toBe(0)
    )

    await userEvent.click(await within(paper).findByText('CIPP'))

    // the list has to overflow, or the paper assertion below would pass for the wrong reason
    const scroller = paper.querySelector('.simplebar-content-wrapper')
    await waitFor(() =>
      expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight + 200)
    )

    // a scrollable paper carries the pinned sponsor up with it and leaves blank drawer below
    expect(paper.scrollHeight).toBeLessThanOrEqual(paper.clientHeight + 1)
  },
}
