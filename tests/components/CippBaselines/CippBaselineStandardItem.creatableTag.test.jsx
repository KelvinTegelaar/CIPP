import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import CippBaselineStandardItem from '../../../src/components/CippBaselines/CippBaselineStandardItem'

// A quarantine tag picker as the Defender policy definitions declare it: a select with a
// fixed option list that must also take a tenant's own policy name.
const tagStandard = (creatable) => ({
  name: 'SpamFilterPolicy',
  label: 'Default Anti-Spam Policy',
  cat: 'Defender Standards',
  impact: 'Low Impact',
  helpText: 'Sets the spam filter policy.',
  tag: [],
  recommendedBy: [],
  requiredCapabilities: [],
  compare: 'subset',
  variables: {
    SpamQuarantineTag: {
      type: 'select',
      multiple: false,
      ...(creatable ? { creatable: true } : {}),
      label: 'Spam quarantine tag',
      required: true,
      options: [
        { label: 'AdminOnlyAccessPolicy', value: 'AdminOnlyAccessPolicy' },
        { label: 'DefaultFullAccessPolicy', value: 'DefaultFullAccessPolicy' },
      ],
      default: 'DefaultFullAccessPolicy',
    },
  },
})

const Harness = ({ creatable }) => {
  const formControl = useForm({ mode: 'onBlur' })
  return (
    <CippBaselineStandardItem
      standard={tagStandard(creatable)}
      instanceId="SpamFilterPolicy"
      savedConfig={null}
      formControl={formControl}
      expanded={true}
      onToggle={() => {}}
      onRemove={() => {}}
    />
  )
}

const typeCustomTag = async (user) => {
  const input = await screen.findByRole('combobox')
  await user.click(input)
  // The field seeds with the definition's default; select it all so the typed name replaces it.
  await user.type(input, 'MyCustomTag', {
    initialSelectionStart: 0,
    initialSelectionEnd: input.value.length,
  })
}

describe('CippBaselineStandardItem quarantine tag picker', () => {
  it('offers to add a custom policy name when the variable is creatable', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness creatable={true} />)
    await typeCustomTag(user)
    await waitFor(() => expect(screen.getByText('Add option: "MyCustomTag"')).toBeInTheDocument())
  }, 30000)

  it('keeps a fixed list when the variable is not creatable', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness creatable={false} />)
    await typeCustomTag(user)
    await waitFor(() => expect(screen.queryByText('Add option: "MyCustomTag"')).not.toBeInTheDocument())
  }, 30000)
})
