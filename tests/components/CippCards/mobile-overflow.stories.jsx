import React, { useRef, useState, useEffect } from 'react'
import { Box, Card } from '@mui/material'
import { within, waitFor, expect } from 'storybook/test'
import { CippChartCard } from '../../../src/components/CippCards/CippChartCard'
import { CippImageCard } from '../../../src/components/CippCards/CippImageCard'
import { CippVariableAutocomplete } from '../../../src/components/CippComponents/CippVariableAutocomplete'
import { PermissionTable } from '../../../src/components/CippSettings/CippSSOSettings'
import { shrinkToPhoneViewport } from '../../viewport'

/**
 * Phone-width overflow checks for the shared components the mobile audit found spilling out
 * of the viewport. Each story renders the component with the hostile content class that
 * broke it — API free text, fixed-width caps — and asserts the page body gained no sideways
 * scroll at 390px.
 */
export default {
  title: 'Components/MobileOverflow',
  tags: ['autodocs'],
}

const noBodyOverflow = () => {
  const doc = document.documentElement
  expect(doc.scrollWidth).toBeLessThanOrEqual(doc.clientWidth)
}

// Legend labels are API free text — recipient addresses, SharePoint library URLs. Without
// minWidth: 0 flexbox refuses to shrink them and the rows push out of the card.
export const ChartLegendWithUrlLabels = {
  render: () => (
    <CippChartCard
      title="Sharing Report"
      chartType="donut"
      isFetching={false}
      chartSeries={[12, 7, 3]}
      labels={[
        'https://contoso.sharepoint.com/sites/finance/Shared%20Documents/Quarterly%20Reports',
        'external-partner-with-a-long-address@partnerorganization.example.com',
        'Internal',
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const onAPhone = await shrinkToPhoneViewport()
    if (!onAPhone) return
    const canvas = within(canvasElement)
    const label = await canvas.findByText(/finance/, { exact: false })
    await waitFor(() => {
      // the count is the row's right-hand cell: an unshrinkable label pushed it past the
      // card's clipped edge, where MUI's overflow: hidden ate it without a trace
      const card = label.closest('.MuiCard-root')
      const count = canvas.getByText('12')
      expect(count.getBoundingClientRect().right).toBeLessThanOrEqual(
        card.getBoundingClientRect().right + 1
      )
      noBodyOverflow()
    })
  },
}

// The headline/illustration pair had no breakpoint and no minWidth: 0 — at 390px the text
// column collapsed against the image's intrinsic width. This is the AllTenants interstitial.
export const ImageCardAtPhoneWidth = {
  render: () => (
    <CippImageCard
      title="This page does not support all tenants"
      text="Select a tenant from the tenant selector to view this page's content for that tenant."
      linkText="Go back"
      link="/"
    />
  ),
  play: async ({ canvasElement }) => {
    const onAPhone = await shrinkToPhoneViewport()
    if (!onAPhone) return
    const canvas = within(canvasElement)
    const title = await canvas.findByText(/does not support/, { exact: false })
    await waitFor(() => {
      // stacked, not squeezed: the old row layout let flexbox settle the fight by
      // collapsing the illustration to zero width — "no overflow" while showing nothing
      const img = canvasElement.querySelector('img')
      const imgBox = img.getBoundingClientRect()
      expect(imgBox.top).toBeGreaterThanOrEqual(title.getBoundingClientRect().bottom)
      expect(imgBox.width).toBeGreaterThanOrEqual(200)
      noBodyOverflow()
    })
  },
}

const LONG_DESCRIPTION =
  'The primary tenant domain name used for routing and identification across all portals, ' +
  'reports and scheduled tasks — substituted at execution time from the tenant record.'

const PopperHost = () => {
  const anchorRef = useRef(null)
  const [anchorEl, setAnchorEl] = useState(null)
  useEffect(() => setAnchorEl(anchorRef.current), [])
  return (
    <Box sx={{ p: 2 }}>
      <div ref={anchorRef} data-testid="anchor" style={{ width: 200, height: 40 }} />
      {anchorEl && (
        <CippVariableAutocomplete
          open
          anchorEl={anchorEl}
          onClose={() => {}}
          onSelect={() => {}}
          customVariables={[
            { variable: 'tenantfilter', description: LONG_DESCRIPTION },
            { variable: 'defaultdomainname', description: LONG_DESCRIPTION },
          ]}
        />
      )}
    </Box>
  )
}

// Sentinel, not a repro: in this browser the absolutely-positioned Paper shrink-to-fits
// inside the viewport even pre-fix, so this story also passed before the clamp. It stands
// guard against a future fixed `width` here. The popper is portaled, so the assertion
// measures against the viewport, not the canvas.
export const VariablePopperStaysOnScreen = {
  render: () => <PopperHost />,
  play: async () => {
    const onAPhone = await shrinkToPhoneViewport()
    if (!onAPhone) return
    await waitFor(() => {
      const paper = document.querySelector('[data-cipp-autocomplete="true"]')
      expect(paper).not.toBeNull()
      const { right, left } = paper.getBoundingClientRect()
      expect(left).toBeGreaterThanOrEqual(0)
      expect(right).toBeLessThanOrEqual(document.documentElement.clientWidth)
    })
    noBodyOverflow()
  },
}

// Sentinel: in this browser the longest name happens to fit a full-width card even without
// the fix (the audited clip came from the settings page's narrower column and other font
// metrics). Guards the invariant that matters — the permission being consented to is
// readable inside the card, whatever this table is later wrapped in.
export const SsoPermissionTableReadable = {
  render: () => (
    <Card sx={{ maxWidth: 390 }}>
      <PermissionTable
        typeLabel="Delegated"
        rows={[
          {
            name: 'Policy.ReadWrite.ApplicationConfiguration',
            reason: 'Exempts CIPP from a tenant app management policy that blocks secrets.',
          },
        ]}
      />
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const onAPhone = await shrinkToPhoneViewport()
    if (!onAPhone) return
    const canvas = within(canvasElement)
    const name = await canvas.findByText(/ApplicationConfiguration/, { exact: false })
    await waitFor(() => {
      // reachable: the name's box ends inside the card, not under its clipped edge
      const card = name.closest('.MuiCard-root')
      expect(name.getBoundingClientRect().right).toBeLessThanOrEqual(
        card.getBoundingClientRect().right + 1
      )
      noBodyOverflow()
    })
  },
}
