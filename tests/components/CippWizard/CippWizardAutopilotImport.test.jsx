import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { CippWizardAutopilotImport } from '../../../src/components/CippWizard/CippWizardAutopilotImport'

// jsdom has no width-based matchMedia, so the mobile branch is driven by mocking the hook
const layoutState = vi.hoisted(() => ({ isMobile: false }))
// partial mock: real module spread first, so new exports keep working here
vi.mock('../../../src/hooks/use-breakpoint', async (importOriginal) => ({
  ...(await importOriginal()),
  useIsMobileLayout: () => layoutState.isMobile,
  useIsTabletLayout: () => false,
  useTableViewMode: () => 'table',
}))

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(() => ({ data: undefined, isFetching: false, isSuccess: false })),
  ApiPostCall: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  ApiGetCallWithPagination: vi.fn(() => ({ data: undefined, isFetching: false })),
}))

// The six the real autopilot wizard passes — the count is the point.
const fields = [
  { friendlyName: 'Serialnumber', propertyName: 'SerialNumber' },
  { friendlyName: 'Manufacturer', propertyName: 'oemManufacturerName' },
  { friendlyName: 'Model', propertyName: 'modelName' },
  { friendlyName: 'Product ID', propertyName: 'productKey' },
  { friendlyName: 'Hardware hash', propertyName: 'hardwareHash' },
  { friendlyName: 'Group Tag', propertyName: 'groupTag' },
]

const Harness = () => {
  const formControl = useForm({ mode: 'onChange', defaultValues: { autopilotData: [] } })
  return (
    <CippWizardAutopilotImport
      formControl={formControl}
      name="autopilotData"
      fields={fields}
      currentStep={1}
      lastStep={2}
      onNextStep={() => {}}
      onPreviousStep={() => {}}
    />
  )
}

const openManualImport = async () => {
  const user = userEvent.setup()
  renderWithProviders(<Harness />)
  await user.click(await screen.findByRole('button', { name: /manual import/i }))
  return within(await screen.findByRole('dialog'))
}

beforeEach(() => {
  layoutState.isMobile = false
})

describe('CippWizardAutopilotImport manual entry', () => {
  // Six 150px fields plus an index badge and a delete button come to ~1010px, which on a
  // phone was reachable only by scrolling a nested container inside a full-screen dialog.
  it('gives each device its own card on a phone', async () => {
    layoutState.isMobile = true
    const dialog = await openManualImport()

    expect(dialog.getByText('Device 1')).toBeInTheDocument()
    expect(dialog.getByRole('button', { name: 'Remove device 1' })).toBeInTheDocument()
    // every field still there, just stacked
    fields.forEach((field) => {
      expect(dialog.getByLabelText(field.friendlyName)).toBeInTheDocument()
    })
  })

  it('keeps the single scrolling row on desktop', async () => {
    const dialog = await openManualImport()

    expect(dialog.queryByText('Device 1')).not.toBeInTheDocument()
    expect(dialog.queryByRole('button', { name: 'Remove device 1' })).not.toBeInTheDocument()
    fields.forEach((field) => {
      expect(dialog.getByLabelText(field.friendlyName)).toBeInTheDocument()
    })
  })
})
