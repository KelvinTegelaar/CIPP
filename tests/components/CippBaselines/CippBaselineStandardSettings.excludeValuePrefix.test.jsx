import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { CippBaselineStandardSettings } from '../../../src/components/CippBaselines/CippBaselineStandardSettings'

const captured = {}
vi.mock('../../../src/components/CippComponents/CippFormComponent', () => ({
  default: (props) => {
    captured[props.name] = props
    return null
  },
}))

// Trimmed from backend/Config/BaselineStandards/Global Standards/SecureScoreRemediation.json.
const standard = {
  name: 'SecureScoreRemediation',
  variables: {
    ThirdParty: {
      label: 'Controls resolved by third party',
      type: 'autoComplete',
      creatable: true,
      multiple: true,
      api: {
        url: '/secureScore.json',
        labelField: 'title',
        valueField: 'id',
        excludeValuePrefix: 'scid_',
      },
    },
    Ignored: {
      label: 'Controls to mark Ignored',
      type: 'autoComplete',
      multiple: true,
      api: { url: '/secureScore.json', labelField: 'title', valueField: 'id' },
    },
  },
}

const Harness = () => {
  const formControl = useForm({ mode: 'onBlur' })
  return (
    <CippBaselineStandardSettings
      standard={standard}
      formControl={formControl}
      namePrefix="settings.SecureScoreRemediation"
    />
  )
}

describe('CippBaselineStandardSettings api.excludeValuePrefix', () => {
  it('drops options whose value starts with the prefix and leaves other pickers unfiltered', () => {
    renderWithProviders(<Harness />)
    const filtered = captured['settings.SecureScoreRemediation.ThirdParty'].api
    expect(
      filtered
        .dataFilter([
          { value: 'AdminMFAV2' },
          { value: 'scid_2513' },
          { value: 'scid_2507' },
        ])
        .map((option) => option.value)
    ).toEqual(['AdminMFAV2'])
    expect(filtered.url).toBe('/secureScore.json')
    expect(
      captured['settings.SecureScoreRemediation.Ignored'].api.dataFilter
    ).toBeUndefined()
  })
})
