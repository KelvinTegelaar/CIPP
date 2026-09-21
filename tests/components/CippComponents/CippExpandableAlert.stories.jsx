import React from 'react'
import { within, waitFor, expect } from 'storybook/test'
import { userEvent } from 'storybook/test'
import { CippExpandableAlert } from '../../../src/components/CippComponents/CippExpandableAlert'
import { shrinkToPhoneViewport, growToDesktopViewport } from '../../viewport'

export default {
  title: 'Components/CippComponents/CippExpandableAlert',
  component: CippExpandableAlert,
  tags: ['autodocs'],
}

const LONG_TEXT =
  "Custom roles can be used to restrict permissions for users with the 'editor' or " +
  "'readonly' roles in CIPP. They can be limited to a subset of tenants and API permissions. " +
  'Built-in and custom roles can be assigned to Entra security groups for granular access ' +
  'control. This sentence pads the message past any phone clamp so the toggle must appear.'

const SHORT_TEXT = 'Nothing here needs a second look.'

// A page-intro alert used to fill most of the first phone screen; the clamp keeps it to a
// few lines and hands the rest to a toggle.
export const ClampsLongMessagesOnAPhone = {
  render: () => <CippExpandableAlert severity="info">{LONG_TEXT}</CippExpandableAlert>,
  play: async ({ canvasElement, step }) => {
    const onAPhone = await shrinkToPhoneViewport()
    if (!onAPhone) return
    const canvas = within(canvasElement)

    await step('the message is clipped and offers Show more', async () => {
      const toggle = await canvas.findByRole('button', { name: /show more/i })
      const message = canvas.getByText(/Custom roles/, { exact: false })
      expect(message.scrollHeight).toBeGreaterThan(message.clientHeight)
      expect(toggle).toBeInTheDocument()
    })

    await step('expanding shows everything and offers Show less', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /show more/i }))
      const message = canvas.getByText(/Custom roles/, { exact: false })
      await waitFor(() => {
        expect(message.scrollHeight).toBeLessThanOrEqual(message.clientHeight + 1)
        expect(canvas.getByRole('button', { name: /show less/i })).toBeInTheDocument()
      })
    })
  },
}

// Measured, not assumed: a message that fits its clamp renders as a plain alert.
export const LeavesShortMessagesAlone = {
  render: () => <CippExpandableAlert severity="info">{SHORT_TEXT}</CippExpandableAlert>,
  play: async ({ canvasElement, step }) => {
    const onAPhone = await shrinkToPhoneViewport()
    if (!onAPhone) return
    const canvas = within(canvasElement)

    await step('no toggle for a message that already fits', async () => {
      await canvas.findByText(SHORT_TEXT)
      await waitFor(() => {
        expect(canvas.queryByRole('button', { name: /show more/i })).not.toBeInTheDocument()
      })
    })
  },
}

export const NeverClampsOnDesktop = {
  render: () => <CippExpandableAlert severity="info">{LONG_TEXT}</CippExpandableAlert>,
  play: async ({ canvasElement, step }) => {
    const onDesktop = await growToDesktopViewport()
    if (!onDesktop) return
    const canvas = within(canvasElement)

    await step('full message, no toggle', async () => {
      const message = await canvas.findByText(/Custom roles/, { exact: false })
      await waitFor(() => {
        expect(message.scrollHeight).toBeLessThanOrEqual(message.clientHeight + 1)
        expect(canvas.queryByRole('button', { name: /show more/i })).not.toBeInTheDocument()
      })
    })
  },
}
