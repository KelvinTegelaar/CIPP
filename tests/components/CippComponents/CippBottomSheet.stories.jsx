import React from 'react'
import { within, expect, userEvent, waitFor } from 'storybook/test'
import {
  Button,
  Dialog,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material'
import { CippBottomSheet } from '../../../src/components/CippComponents/CippBottomSheet'
import { shrinkToPhoneViewport } from '../../viewport'

// The mobile stand-in for a desktop Menu: every place the app opens a Menu on a pointer
// device opens one of these below md instead.
const SheetHarness = ({ children, triggerLabel = 'Open sheet', ...sheetProps }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <CippBottomSheet open={open} onClose={() => setOpen(false)} {...sheetProps}>
        {children}
      </CippBottomSheet>
    </>
  )
}

const actionRows = ['Edit user', 'Reset password', 'Block sign-in'].map((label) => (
  <ListItemButton key={label} sx={{ minHeight: 48 }}>
    <ListItemText primary={label} />
  </ListItemButton>
))

export default {
  title: 'Components/CippComponents/CippBottomSheet',
  component: CippBottomSheet,
  tags: ['autodocs'],
}

export const WithTitle = {
  render: () => (
    <SheetHarness title="Row actions">
      <List sx={{ py: 0 }}>{actionRows}</List>
    </SheetHarness>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    await step('opens on tap and shows its rows', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Open sheet' }))
      await waitFor(() => expect(body.getByText('Row actions')).toBeInTheDocument())
      expect(body.getByText('Reset password')).toBeInTheDocument()
    })

    await step('closes on backdrop tap', async () => {
      await userEvent.click(document.querySelector('.MuiBackdrop-root'))
      await waitFor(() => expect(body.queryByText('Row actions')).not.toBeInTheDocument())
    })
  },
}

export const WithFooter = {
  render: () => (
    <SheetHarness
      title="Bulk actions"
      footer={
        <Button fullWidth variant="contained">
          Apply to 12 selected
        </Button>
      }
    >
      <List sx={{ py: 0 }}>{actionRows}</List>
    </SheetHarness>
  ),
}

export const LongContentScrolls = {
  render: () => (
    <SheetHarness title="Fields shown">
      <List sx={{ py: 0 }}>
        {Array.from({ length: 30 }, (_, i) => (
          <ListItemButton key={i} sx={{ minHeight: 48 }}>
            <ListItemText primary={`Column ${i + 1}`} />
          </ListItemButton>
        ))}
      </List>
    </SheetHarness>
  ),
}

// Regression guard for the live bug: popout table dialogs sit at zIndex.modal (1300), so a
// plain Drawer (1200) opened from inside one is invisible. The sheet claims modal + 1.
export const OverADialog = {
  render: () => {
    const [dialogOpen, setDialogOpen] = React.useState(true)
    return (
      <>
        <Button variant="outlined" onClick={() => setDialogOpen(true)}>
          Reopen dialog
        </Button>
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              A popout table lives here. Its filter sheet must layer above this dialog.
            </Typography>
            <SheetHarness title="Filters" triggerLabel="Open filters">
              <List sx={{ py: 0 }}>{actionRows}</List>
            </SheetHarness>
          </DialogContent>
        </Dialog>
      </>
    )
  },
  play: async ({ step }) => {
    const body = within(document.body)

    await step('sheet renders above the dialog', async () => {
      await userEvent.click(body.getByRole('button', { name: 'Open filters' }))
      const sheetRoot = await waitFor(() => {
        const title = body.getByText('Filters')
        return title.closest('.MuiDrawer-root')
      })
      const dialogRoot = document.querySelector('.MuiDialog-root')
      const sheetZ = Number(window.getComputedStyle(sheetRoot).zIndex)
      const dialogZ = Number(window.getComputedStyle(dialogRoot).zIndex)
      expect(sheetZ).toBeGreaterThan(dialogZ)
    })
  },
}

// The grab handle used to be decoration — a 36x4 bar that promised a gesture nothing
// implemented. Only a real browser can settle whether the drag works: jsdom has no layout,
// so the paper's height is 0 and the swipe distance the gesture is measured against is
// meaningless there.
export const DragHandleDismisses = {
  render: () => (
    <SheetHarness title="Row actions">
      <List sx={{ py: 0 }}>{actionRows}</List>
    </SheetHarness>
  ),
  play: async ({ canvasElement }) => {
    const onAPhone = await shrinkToPhoneViewport()
    const canvas = within(canvasElement)
    const body = within(document.body)

    await userEvent.click(canvas.getByRole('button', { name: 'Open sheet' }))
    await body.findByText('Reset password')
    if (!onAPhone) return

    const paper = document.querySelector('.MuiDrawer-paper')
    const handle = paper.firstElementChild
    const start = handle.getBoundingClientRect()

    // A real touch drag down the screen, starting on the handle.
    const at = (clientY) =>
      new Touch({
        identifier: 1,
        target: handle,
        clientX: start.x + start.width / 2,
        clientY,
      })
    // Dispatched ON the handle and left to bubble: MUI reads event.target to decide the
    // gesture started inside the paper, so firing at the document would bail immediately.
    const fire = (type, clientY) =>
      handle.dispatchEvent(
        new TouchEvent(type, {
          bubbles: true,
          cancelable: true,
          touches: type === 'touchend' ? [] : [at(clientY)],
          changedTouches: [at(clientY)],
        })
      )

    // MUI flags "maybe swiping" in React state on touchstart and ignores moves until that
    // has been applied, so the gesture has to be spread across ticks like a real one.
    const tick = () => new Promise((resolve) => setTimeout(resolve, 30))
    const from = start.y + start.height / 2
    fire('touchstart', from)
    await tick()
    for (const dy of [20, 60, 120, 200, 260]) {
      fire('touchmove', from + dy)
      await tick()
    }
    const draggedTo = new DOMMatrixReadOnly(getComputedStyle(paper).transform).m42
    expect(draggedTo).toBeGreaterThan(100)
    fire('touchend', from + 260)

    // The exit has to continue from where the finger let go. Slide probes the paper's
    // untranslated position when the exit starts (Slide.js getTranslateValue), and the browser
    // takes that probe as the transition's start, which puts the sheet back at full height for
    // the length of the close.
    const firstExitFrame = await new Promise((resolve) => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          resolve(new DOMMatrixReadOnly(getComputedStyle(paper).transform).m42)
        )
      )
    })
    expect(firstExitFrame).toBeGreaterThan(draggedTo * 0.6)

    await waitFor(() => expect(body.queryByText('Reset password')).not.toBeInTheDocument())
  },
}
