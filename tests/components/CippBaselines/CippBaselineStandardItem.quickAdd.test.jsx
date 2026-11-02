import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import CippBaselineStandardItem from '../../../src/components/CippBaselines/CippBaselineStandardItem'

const baseStandard = {
  cat: 'Intune Standards',
  impact: 'Low Impact',
  helpText: '',
  tag: [],
  recommendedBy: [],
  requiredCapabilities: [],
  variables: {},
}

const multipleStandard = {
  ...baseStandard,
  name: 'IntuneTemplate',
  label: 'Intune Template',
  multiple: true,
  instanceIdentity: 'TemplateList',
}

const singleStandard = {
  ...baseStandard,
  name: 'MailContacts',
  label: 'Set contact e-mails',
}

const Harness = ({ standard, instanceId, onAddInstance, onToggle = () => {} }) => {
  const formControl = useForm({ mode: 'onBlur' })
  return (
    <CippBaselineStandardItem
      standard={standard}
      instanceId={instanceId}
      formControl={formControl}
      expanded={false}
      onToggle={onToggle}
      onRemove={() => {}}
      onAddInstance={onAddInstance}
    />
  )
}

describe('CippBaselineStandardItem quick add', () => {
  it('shows an add-another button for every multi-instance standard', () => {
    renderWithProviders(
      <Harness
        standard={multipleStandard}
        instanceId="IntuneTemplate#abc12345"
        onAddInstance={() => {}}
      />
    )
    expect(
      screen.getByRole('button', { name: 'Add another Intune Template' })
    ).toBeInTheDocument()
  })

  it('does not show the button for single-instance standards', () => {
    renderWithProviders(
      <Harness
        standard={singleStandard}
        instanceId="MailContacts"
        onAddInstance={() => {}}
      />
    )
    expect(
      screen.queryByRole('button', { name: /Add another/ })
    ).not.toBeInTheDocument()
  })

  it('calls onAddInstance with the standard name without toggling the accordion', async () => {
    const user = userEvent.setup()
    const onAddInstance = vi.fn()
    const onToggle = vi.fn()
    renderWithProviders(
      <Harness
        standard={multipleStandard}
        instanceId="IntuneTemplate#abc12345"
        onAddInstance={onAddInstance}
        onToggle={onToggle}
      />
    )
    await user.click(
      screen.getByRole('button', { name: 'Add another Intune Template' })
    )
    expect(onAddInstance).toHaveBeenCalledTimes(1)
    expect(onAddInstance).toHaveBeenCalledWith('IntuneTemplate')
    expect(onToggle).not.toHaveBeenCalled()
  })
})
