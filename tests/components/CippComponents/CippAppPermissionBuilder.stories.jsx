import React from 'react'
import { http, HttpResponse } from 'msw'
import { within, expect, waitFor } from 'storybook/test'
import { Box } from '@mui/material'
import { useForm } from 'react-hook-form'
import { shrinkToPhoneViewport } from '../../viewport'
import CippAppPermissionBuilder from '../../../src/components/CippComponents/CippAppPermissionBuilder'

// The summary row carries a 36-character app id, so this is where the overflow shows up.
const graph = {
  id: 'sp-graph',
  appId: '00000003-0000-0000-c000-000000000000',
  displayName: 'Microsoft Graph',
  appRoles: [],
  publishedPermissionScopes: [],
}

const servicePrincipals = { Metadata: { Success: true }, Results: [graph] }

// The same route serves the list and, with ?Id=, one principal's detail — where Results is
// an object rather than an array.
const handlers = [
  http.get('*/api/ExecServicePrincipals', ({ request }) => {
    const id = new URL(request.url).searchParams.get('Id')
    return HttpResponse.json(
      id ? { Metadata: { Success: true }, Results: graph } : servicePrincipals
    )
  }),
]

const Harness = (props) => {
  const formControl = useForm({ mode: 'onChange', defaultValues: { servicePrincipal: null } })
  return (
    <CippAppPermissionBuilder
      formControl={formControl}
      onSubmit={() => {}}
      updatePermissions={{ isPending: false, isSuccess: false, isError: false }}
      currentPermissions={{
        Permissions: {
          '00000003-0000-0000-c000-000000000000': {
            applicationPermissions: [{ id: '1', value: 'Application.ReadWrite.All' }],
            delegatedPermissions: [{ id: '2', value: 'User.Read' }],
          },
        },
      }}
      {...props}
    />
  )
}

export default {
  title: 'Components/CippComponents/CippAppPermissionBuilder',
  component: CippAppPermissionBuilder,
  parameters: { msw: { handlers } },
}

// jsdom has no layout engine, so overflow is invisible to the unit tests — this is the one
// place a real browser can measure it. 390px is an iPhone 14/15 in portrait.
//
// The VIEWPORT has to shrink, not a wrapper: MUI's breakpoints are media queries, so a
// 390px-wide Box inside a desktop-width iframe still renders every `md` branch.
export const PhoneWidth = {
  render: () => (
    <Box data-testid="phone">
      <Harness />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const onAPhone = await shrinkToPhoneViewport()
    const canvas = within(canvasElement)
    await canvas.findByText('Microsoft Graph', {}, { timeout: 10000 })
    // Opened in the Storybook app rather than the test runner: the layout is on show, but
    // measuring it against a desktop-width iframe would only assert the wrong thing.
    if (!onAPhone) return

    // The app-id chip used to force the row wider than the phone, pushing the service
    // principal's name off the left edge — the row scrolled, the name was unreachable.
    await waitFor(() => {
      const rows = canvasElement.querySelectorAll('.MuiAccordionSummary-root')
      expect(rows.length).toBeGreaterThan(0)
      rows.forEach((row) => {
        expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth)
      })
    })

    // and the name is inside the viewport, not off to the left of it
    const name = canvas.getByText('Microsoft Graph')
    const phone = canvasElement.querySelector('[data-testid="phone"]')
    expect(name.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      phone.getBoundingClientRect().left
    )
  },
}
