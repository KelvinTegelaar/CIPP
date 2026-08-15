import React from 'react'
import { http, HttpResponse } from 'msw'
import { within, expect, userEvent } from 'storybook/test'
import { useForm } from 'react-hook-form'
import { CippWizardAutopilotImport } from '../../../src/components/CippWizard/CippWizardAutopilotImport'
import { shrinkToPhoneViewport } from '../../viewport'

// The six the real autopilot wizard passes — the count is what made the row overflow.
const fields = [
  { friendlyName: 'Serialnumber', propertyName: 'SerialNumber' },
  { friendlyName: 'Manufacturer', propertyName: 'oemManufacturerName' },
  { friendlyName: 'Model', propertyName: 'modelName' },
  { friendlyName: 'Product ID', propertyName: 'productKey' },
  { friendlyName: 'Hardware hash', propertyName: 'hardwareHash' },
  { friendlyName: 'Group Tag', propertyName: 'groupTag' },
]

const handlers = [
  http.get('*/api/ListGraphRequest', () => HttpResponse.json({ Results: [] })),
  http.get('*/api/ListGraphExplorerPresets', () => HttpResponse.json({ Results: [] })),
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

export default {
  title: 'Components/CippWizard/CippWizardAutopilotImport',
  component: CippWizardAutopilotImport,
  parameters: { msw: { handlers } },
}

// A 32px badge, six 150px fields and a 48px delete came to ~1010px in a row whose only
// concession was overflowX:auto — a nested sideways scroller inside a full-screen dialog.
// Whether it fits now is a claim only a real browser can settle.
export const PhoneWidth = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const onAPhone = await shrinkToPhoneViewport()
    const body = within(document.body)

    // At phone width the table is a card list, so the import buttons are behind the FAB
    // rather than in a card header — the same route a user takes.
    if (onAPhone) {
      await userEvent.click(await body.findByRole('button', { name: 'Page actions' }))
    }
    await userEvent.click(await body.findByRole('button', { name: /manual import/i }))
    const dialog = await body.findByRole('dialog')
    if (!onAPhone) return

    const rows = dialog.querySelectorAll('[data-testid="manual-row"]')
    expect(rows.length).toBeGreaterThan(0)
    rows.forEach((row) => {
      expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth)
    })

    // and the fields are stacked, not side by side
    const inputs = rows[0].querySelectorAll('input')
    expect(inputs.length).toBe(fields.length)
    expect(inputs[1].getBoundingClientRect().top).toBeGreaterThan(
      inputs[0].getBoundingClientRect().bottom
    )
  },
}
