import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import { CippPolicyDiffTable } from '../../../src/components/CippComponents/CippPolicyDiffTable'

describe('CippPolicyDiffTable', () => {
  it('names each side type when text "false" is compared with a true/false false', () => {
    renderWithProviders(
      <CippPolicyDiffTable
        labelA="Baseline"
        labelB="Tenant"
        rows={[
          {
            Property: 'installFeatureUpdatesOptional',
            ExpectedValue: 'false',
            ReceivedValue: false,
          },
        ]}
      />
    )
    expect(screen.getByText('Stored as text')).toBeInTheDocument()
    expect(screen.getByText('Stored as true/false')).toBeInTheDocument()
    expect(screen.getByText('Different type')).toBeInTheDocument()
  })

  it('shows no type when both sides are the same type', () => {
    renderWithProviders(
      <CippPolicyDiffTable
        rows={[{ Property: 'deferral', ExpectedValue: 7, ReceivedValue: 14 }]}
      />
    )
    expect(screen.queryByText(/^Stored as/)).not.toBeInTheDocument()
    expect(screen.getByText('Different')).toBeInTheDocument()
  })
})
