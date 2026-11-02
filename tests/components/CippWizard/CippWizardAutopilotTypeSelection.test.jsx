import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { CippWizardAutopilotTypeSelection } from '../../../src/components/CippWizard/CippWizardAutopilotTypeSelection'

const Harness = ({ onForm, defaultValues }) => {
  const formControl = useForm({
    mode: 'onChange',
    // Mirrors the add-device wizard's initialState
    defaultValues: { deploymentType: 'autopilot', ...defaultValues },
  })
  onForm?.(formControl)
  return (
    <CippWizardAutopilotTypeSelection
      formControl={formControl}
      currentStep={0}
      lastStep={2}
      onNextStep={() => {}}
      onPreviousStep={() => {}}
    />
  )
}

describe('CippWizardAutopilotTypeSelection', () => {
  it('preselects autopilot so Next is enabled without a click', async () => {
    let form
    renderWithProviders(<Harness onForm={(f) => (form = f)} />)

    expect(form.getValues('deploymentType')).toBe('autopilot')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next step/i })).toBeEnabled()
    })
  })

  it('switches to device prep and clears the autopilot fields', async () => {
    const user = userEvent.setup()
    let form
    renderWithProviders(
      <Harness
        onForm={(f) => (form = f)}
        defaultValues={{ autopilotData: [{ SerialNumber: 'SN1' }], GroupName: 'group' }}
      />
    )

    await user.click(screen.getByText('Device Preparation (Corporate Identifiers)'))

    expect(form.getValues('deploymentType')).toBe('devicePrep')
    expect(form.getValues('autopilotData')).toBeUndefined()
    expect(form.getValues('GroupName')).toBeUndefined()
  })

  it('switches back to autopilot and clears the device prep fields', async () => {
    const user = userEvent.setup()
    let form
    renderWithProviders(
      <Harness
        onForm={(f) => (form = f)}
        defaultValues={{
          deploymentType: 'devicePrep',
          devicePrepData: [{ manufacturer: 'Dell', model: 'XPS', serialNumber: 'SN1' }],
          overwriteExisting: true,
        }}
      />
    )

    await user.click(screen.getByText('Windows Autopilot'))

    expect(form.getValues('deploymentType')).toBe('autopilot')
    expect(form.getValues('devicePrepData')).toBeUndefined()
    expect(form.getValues('overwriteExisting')).toBeUndefined()
  })
})
