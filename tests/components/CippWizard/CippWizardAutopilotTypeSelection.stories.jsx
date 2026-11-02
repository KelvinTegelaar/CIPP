import React from 'react'
import { useForm } from 'react-hook-form'
import { CippWizardAutopilotTypeSelection } from '../../../src/components/CippWizard/CippWizardAutopilotTypeSelection'

// Mirrors the add-device wizard's initialState: autopilot is preselected so the
// user can click Next without touching the step.
const Harness = () => {
  const formControl = useForm({
    mode: 'onChange',
    defaultValues: { deploymentType: 'autopilot' },
  })
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

export default {
  title: 'Components/CippWizard/CippWizardAutopilotTypeSelection',
  component: CippWizardAutopilotTypeSelection,
}

export const Default = {
  render: () => <Harness />,
}
