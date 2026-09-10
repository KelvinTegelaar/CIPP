import React from 'react'
import { within, waitFor, expect } from 'storybook/test'
import { CippUniversalSearchV2 } from '../../../src/components/CippCards/CippUniversalSearchV2'
import { shrinkToPhoneViewport, growToDesktopViewport } from '../../viewport'

export default {
  title: 'Components/CippCards/CippUniversalSearchV2',
  component: CippUniversalSearchV2,
  tags: ['autodocs'],
}

// Desktop: the scope button, field and search button are one joined bordered control. The
// theme defaults TextField to the filled variant, whose own rounded border ignores every
// join rule (they target .MuiOutlinedInput-root) — which once rendered the scope button and
// field as two separate boxes.
export const JoinedControlOnDesktop = {
  render: () => (
    <CippUniversalSearchV2 maxResults={12} autoFocus={false} defaultSearchType="Pages" />
  ),
  play: async ({ canvasElement, step }) => {
    const onDesktop = await growToDesktopViewport()
    if (!onDesktop) return
    const canvas = within(canvasElement)

    await step('the scope button and the field share one border, no gap', async () => {
      const scope = canvas.getByRole('button', { name: /pages/i })
      const field = canvasElement.querySelector('.MuiOutlinedInput-root')
      await waitFor(() => {
        expect(field).not.toBeNull()
        const gap = field.getBoundingClientRect().left - scope.getBoundingClientRect().right
        expect(Math.abs(gap)).toBeLessThanOrEqual(1)
        expect(getComputedStyle(field).borderTopLeftRadius).toBe('0px')
        expect(getComputedStyle(scope).borderTopRightRadius).toBe('0px')
      })
    })
  },
}

// Phones: no scope button in the group — the field spans the row and each scope is a chip,
// one tap away, so entity search has a direct entry point.
export const ScopeChipsAtPhoneWidth = {
  render: () => (
    <CippUniversalSearchV2 maxResults={12} autoFocus={false} defaultSearchType="Pages" />
  ),
  play: async ({ canvasElement, step }) => {
    const onAPhone = await shrinkToPhoneViewport()
    if (!onAPhone) return
    const canvas = within(canvasElement)

    await step('the field takes the full row and every scope is a visible chip', async () => {
      const field = canvasElement.querySelector('.MuiOutlinedInput-root')
      await waitFor(() => {
        expect(field).not.toBeNull()
        for (const label of ['Users', 'Groups', 'Applications', 'Licenses', 'BitLocker', 'Pages']) {
          expect(canvas.getByText(label)).toBeInTheDocument()
        }
      })
      const host = canvasElement
      expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth)
    })
  },
}
