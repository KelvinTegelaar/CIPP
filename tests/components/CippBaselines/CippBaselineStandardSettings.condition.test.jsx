import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { CippBaselineStandardSettings } from '../../../src/components/CippBaselines/CippBaselineStandardSettings'

// Variables trimmed from the shipped definitions in backend/Config/BaselineStandards.
const fido2Standard = {
  name: 'FIDO2PasskeyProfiles',
  variables: {
    EnforceKeyRestrictions: {
      label: 'Enforce AAGUID Key Restrictions',
      type: 'switch',
      default: false,
    },
    AAGUIDs: {
      label: 'AAGUIDs (comma-separated)',
      omitWhenBlank: true,
      type: 'textField',
      condition: {
        field: 'EnforceKeyRestrictions',
        compareType: 'is',
        compareValue: true,
      },
    },
  },
}

const safeAttachmentStandard = {
  name: 'SafeAttachmentPolicy',
  variables: {
    Redirect: { type: 'switch', label: 'Redirect', default: false },
    RedirectAddress: {
      type: 'textField',
      label: 'Redirect Address',
      omitWhenBlank: true,
      default: '',
      condition: { field: 'Redirect', compareType: 'is', compareValue: true },
      clearOnHide: true,
    },
  },
}

const Harness = ({ standard, initialValues, valuesRef }) => {
  const formControl = useForm({ mode: 'onBlur' })
  React.useEffect(() => {
    valuesRef.current = () => formControl.getValues(`settings.${standard.name}`)
  })
  return (
    <CippBaselineStandardSettings
      standard={standard}
      formControl={formControl}
      namePrefix={`settings.${standard.name}`}
      initialValues={initialValues}
    />
  )
}

const textboxValue = (label) =>
  screen
    .queryAllByRole('textbox')
    .find(
      (input) =>
        input.closest('.MuiFormControl-root')?.querySelector('label')
          ?.textContent === label
    )?.value

describe('CippBaselineStandardSettings conditional variables', () => {
  it('hides a dependent field when its switch turns off but keeps the value for the baseline logic', async () => {
    const user = userEvent.setup()
    const valuesRef = {}
    renderWithProviders(
      <Harness
        standard={fido2Standard}
        initialValues={{
          EnforceKeyRestrictions: true,
          AAGUIDs: 'yubikey-guid',
        }}
        valuesRef={valuesRef}
      />
    )
    await waitFor(() =>
      expect(textboxValue('AAGUIDs (comma-separated)')).toBe('yubikey-guid')
    )

    await user.click(screen.getByRole('switch'))

    await waitFor(() =>
      expect(textboxValue('AAGUIDs (comma-separated)')).toBeUndefined()
    )
    expect(valuesRef.current().AAGUIDs).toBe('yubikey-guid')
  })

  it('clears a clearOnHide field on hide without wiping it when a saved baseline opens', async () => {
    const user = userEvent.setup()
    const valuesRef = {}
    renderWithProviders(
      <Harness
        standard={safeAttachmentStandard}
        initialValues={{ Redirect: true, RedirectAddress: 'soc@contoso.com' }}
        valuesRef={valuesRef}
      />
    )
    await waitFor(() =>
      expect(textboxValue('Redirect Address')).toBe('soc@contoso.com')
    )
    expect(valuesRef.current().RedirectAddress).toBe('soc@contoso.com')

    await user.click(screen.getByRole('switch'))

    await waitFor(() =>
      expect(textboxValue('Redirect Address')).toBeUndefined()
    )
    expect(valuesRef.current().RedirectAddress).toBeNull()
  })
})
