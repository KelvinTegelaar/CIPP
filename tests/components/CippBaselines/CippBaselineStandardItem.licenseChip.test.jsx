import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import CippBaselineStandardItem from '../../../src/components/CippBaselines/CippBaselineStandardItem'

const standardWith = (requiredCapabilities) => ({
  name: 'MessageEncryption',
  label: 'Enable Purview Message Encryption',
  cat: 'Exchange Standards',
  impact: 'Low Impact',
  helpText: '',
  tag: [],
  recommendedBy: [],
  requiredCapabilities,
  variables: {},
})

const Harness = ({ standard }) => {
  const formControl = useForm({ mode: 'onBlur' })
  return (
    <CippBaselineStandardItem
      standard={standard}
      instanceId={standard.name}
      formControl={formControl}
      expanded
      onToggle={() => {}}
      onRemove={() => {}}
    />
  )
}

describe('CippBaselineStandardItem license chip', () => {
  it('joins a flat capability list with or', () => {
    renderWithProviders(
      <Harness standard={standardWith(['PLAN_A', 'PLAN_B'])} />
    )
    expect(screen.getByText('Requires: PLAN_A or PLAN_B')).toBeInTheDocument()
  })

  it('joins nested capability groups with and', () => {
    renderWithProviders(
      <Harness standard={standardWith([['PLAN_A', 'PLAN_B'], ['PLAN_C']])} />
    )
    expect(
      screen.getByText('Requires: PLAN_A or PLAN_B and PLAN_C')
    ).toBeInTheDocument()
  })
})
