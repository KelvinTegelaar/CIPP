import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { CippBaselineStandardSettings } from '../../../src/components/CippBaselines/CippBaselineStandardSettings'

// Trimmed from backend/Config/BaselineStandards/Entra (AAD) Standards/FIDO2PasskeyProfiles.json.
// AAGUIDs was a comma-separated textField before it became this picker.
const fido2Standard = {
  name: 'FIDO2PasskeyProfiles',
  variables: {
    EnforceKeyRestrictions: {
      label: 'Enforce AAGUID Key Restrictions',
      type: 'switch',
      default: false,
    },
    AAGUIDs: {
      label: 'AAGUIDs',
      omitWhenBlank: true,
      type: 'autoComplete',
      multiple: true,
      creatable: true,
      options: [
        {
          label: 'YubiKey 5 Series (cb69481e-8ff7-4039-93ec-0a2729a154a8)',
          value: 'cb69481e-8ff7-4039-93ec-0a2729a154a8',
        },
        {
          label: 'YubiKey 5 Series (ee882879-721c-4913-9775-3dfcce97072a)',
          value: 'ee882879-721c-4913-9775-3dfcce97072a',
        },
      ],
      condition: {
        field: 'EnforceKeyRestrictions',
        compareType: 'is',
        compareValue: true,
      },
    },
  },
}

const Harness = ({ initialValues, valuesRef }) => {
  const formControl = useForm({ mode: 'onBlur' })
  React.useEffect(() => {
    valuesRef.current = () =>
      formControl.getValues('settings.FIDO2PasskeyProfiles')
  })
  return (
    <CippBaselineStandardSettings
      standard={fido2Standard}
      formControl={formControl}
      namePrefix="settings.FIDO2PasskeyProfiles"
      initialValues={initialValues}
    />
  )
}

const saved = [
  {
    label: 'YubiKey 5 Series (cb69481e-8ff7-4039-93ec-0a2729a154a8)',
    value: 'cb69481e-8ff7-4039-93ec-0a2729a154a8',
  },
  {
    label: '11111111-2222-3333-4444-555555555555',
    value: '11111111-2222-3333-4444-555555555555',
  },
]

describe('CippBaselineStandardSettings list variables saved as a comma-separated string', () => {
  it('opens a legacy comma-separated value as one chip per entry and resaves it as picker options', async () => {
    const valuesRef = {}
    renderWithProviders(
      <Harness
        initialValues={{
          EnforceKeyRestrictions: true,
          AAGUIDs:
            'cb69481e-8ff7-4039-93ec-0a2729a154a8, 11111111-2222-3333-4444-555555555555',
        }}
        valuesRef={valuesRef}
      />
    )
    await waitFor(() =>
      expect(
        screen.getByText(
          'YubiKey 5 Series (cb69481e-8ff7-4039-93ec-0a2729a154a8)'
        )
      ).toBeTruthy()
    )
    expect(
      screen.getByText('11111111-2222-3333-4444-555555555555')
    ).toBeTruthy()
    expect(valuesRef.current().AAGUIDs).toEqual(saved)
  })

  it('opens a value already saved by the picker unchanged', async () => {
    const valuesRef = {}
    renderWithProviders(
      <Harness
        initialValues={{ EnforceKeyRestrictions: true, AAGUIDs: saved }}
        valuesRef={valuesRef}
      />
    )
    await waitFor(() =>
      expect(
        screen.getByText('11111111-2222-3333-4444-555555555555')
      ).toBeTruthy()
    )
    expect(valuesRef.current().AAGUIDs).toEqual(saved)
  })
})
