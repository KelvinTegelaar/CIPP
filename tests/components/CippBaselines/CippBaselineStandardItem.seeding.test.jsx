import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import CippBaselineStandardItem from '../../../src/components/CippBaselines/CippBaselineStandardItem'

// The MailContacts definition as ListBaselineStandards serves it (fields trimmed to what
// the editor consumes).
const mailContactsStandard = {
  name: 'MailContacts',
  label: 'Set contact e-mails',
  cat: 'Global Standards',
  impact: 'Low Impact',
  helpText: 'Sets the organization notification contacts.',
  tag: [],
  recommendedBy: [],
  requiredCapabilities: [],
  compare: 'subset',
  prepare: 'Get-CIPPBaselineMailContactsState',
  variables: {
    GeneralContact: { type: 'textField', label: 'General/privacy contact email', omitWhenBlank: true },
    SecurityContact: { type: 'textField', label: 'Security contact email', omitWhenBlank: true },
    MarketingContact: { type: 'textField', label: 'Marketing contact email', omitWhenBlank: true },
    TechContact: { type: 'textField', label: 'Technical contact email', omitWhenBlank: true },
  },
}

// The saved instance config exactly as ListBaselines returns it for the migrated
// '.Baseline - Tenant' (verified against the live API).
const savedConfig = {
  standard: 'MailContacts',
  instance: 'MailContacts',
  variables: {
    SecurityContact: 'support@bezalu.com',
    TechContact: 'support@bezalu.com',
    GeneralContact: 'support@bezalu.com',
    MarketingContact: '',
  },
  remediateEnabled: false,
  alertEnabled: false,
  alertOnRemediate: false,
}

const Harness = ({ config, startExpanded = true }) => {
  const formControl = useForm({ mode: 'onBlur' })
  const [expanded, setExpanded] = React.useState(startExpanded)
  return (
    <CippBaselineStandardItem
      standard={mailContactsStandard}
      instanceId="MailContacts"
      savedConfig={config}
      formControl={formControl}
      expanded={expanded}
      onToggle={() => setExpanded((prev) => !prev)}
      onRemove={() => {}}
    />
  )
}

// MUI's filled TextField in this tree doesn't associate label->input the way
// getByLabelText needs, so assertions read the inputs and map to their labels.
const fieldValues = () => {
  const byLabel = {}
  for (const input of screen.queryAllByRole('textbox')) {
    const label = input.closest('.MuiFormControl-root')?.querySelector('label')?.textContent
    if (label) byLabel[label] = input.value
  }
  return byLabel
}

const expectSeeded = () => {
  const values = fieldValues()
  expect(values['Security contact email']).toBe('support@bezalu.com')
  expect(values['Technical contact email']).toBe('support@bezalu.com')
  expect(values['General/privacy contact email']).toBe('support@bezalu.com')
  expect(values['Marketing contact email']).toBe('')
}

describe('CippBaselineStandardItem saved-variable seeding', () => {
  it('seeds the settings fields from savedConfig.variables when mounted expanded', async () => {
    renderWithProviders(<Harness config={savedConfig} />)
    await waitFor(expectSeeded)
  })

  it('seeds the settings fields when expanded LATER (details mount lazily)', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    renderWithProviders(<Harness config={savedConfig} startExpanded={false} />)
    await user.click(screen.getByText('Set contact e-mails'))
    await waitFor(expectSeeded)
  })
})
