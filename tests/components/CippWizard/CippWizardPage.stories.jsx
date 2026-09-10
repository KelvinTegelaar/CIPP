import React from 'react'
import { within, expect, userEvent, waitFor } from 'storybook/test'
import { Typography } from '@mui/material'
import CippWizardPage from '../../../src/components/CippWizard/CippWizardPage'
import { CippWizardStepButtons } from '../../../src/components/CippWizard/CippWizardStepButtons'
import { shrinkToPhoneViewport, growToDesktopViewport } from '../../viewport'

// A step that renders nothing but the shared button row — the layout under test is the
// wizard shell, not any particular step's form.
const Step = (props) => (
  <>
    <Typography variant="body2">Step content</Typography>
    <CippWizardStepButtons {...props} />
  </>
)

// Five steps with the real wizards' label lengths; vacation mode is exactly this shape.
const steps = [
  { title: 'tenant', description: 'Tenant Selection', component: Step },
  { title: 'user', description: 'User Selection', component: Step },
  { title: 'actions', description: 'Vacation Actions', component: Step },
  { title: 'schedule', description: 'Schedule', component: Step },
  { title: 'review', description: 'Review & Submit', component: Step },
]

export default {
  title: 'Components/CippWizard/CippWizardPage',
  component: CippWizardPage,
  parameters: { msw: { handlers: [] } },
}

const args = { postUrl: '/api/AddVacationMode', wizardTitle: 'Vacation Mode', steps }

// jsdom has no layout engine, so overflow and stacking order are invisible to the unit
// tests. This is the only place they can be measured.
export const PhoneWidth = {
  render: () => <CippWizardPage {...args} />,
  play: async ({ canvasElement }) => {
    const onAPhone = await shrinkToPhoneViewport()
    const canvas = within(canvasElement)
    await canvas.findByText('Step content')
    if (!onAPhone) return

    // the stepper is replaced, not merely restyled. findBy, not getBy: useMediaQuery reacts to
    // the resize on a later tick, and "Step content" is in both branches so it settles nothing
    await canvas.findByText('Step 1 of 5')
    expect(canvasElement.querySelector('.MuiStepper-root')).toBeNull()

    // nothing in the card reaches past the screen
    const card = canvasElement.querySelector('.MuiCard-root')
    expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth)

    // advancing moves the bar
    await userEvent.click(canvas.getByRole('button', { name: /next step/i }))
    await waitFor(() => expect(canvas.getByText('Step 2 of 5')).toBeInTheDocument())

    // column-reverse: the primary action sits above Back, and both span the card
    const next = canvas.getByRole('button', { name: /next step/i })
    const back = canvas.getByRole('button', { name: /^back$/i })
    expect(back.getBoundingClientRect().top).toBeGreaterThan(next.getBoundingClientRect().top)
    expect(next.getBoundingClientRect().width).toBeGreaterThan(
      card.getBoundingClientRect().width * 0.7
    )
  },
}

// The other half of the contract: none of this reaches desktop.
export const DesktopWidth = {
  render: () => <CippWizardPage {...args} />,
  play: async ({ canvasElement }) => {
    // Claim the width rather than inherit it — PhoneWidth shares this page and shrinks it.
    await growToDesktopViewport()
    const canvas = within(canvasElement)
    await canvas.findByText('Step content')

    await waitFor(() => expect(canvasElement.querySelector('.MuiStepper-root')).not.toBeNull())
    expect(canvas.queryByRole('progressbar')).toBeNull()
    expect(canvas.queryByText('Step 1 of 5')).toBeNull()

    const card = canvasElement.querySelector('.MuiCard-root')
    expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth)
  },
}
