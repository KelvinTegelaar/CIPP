import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import {
  CippBaselineStandardSettings,
  switchVariableProblem,
} from '../../../src/components/CippBaselines/CippBaselineStandardSettings'

const variableOptions = [
  { label: '%AllowIt%', value: '%AllowIt%', variableType: 'boolean' },
  { label: '%SiteName%', value: '%SiteName%', variableType: 'string' },
]
vi.mock('../../../src/hooks/use-custom-variables', () => ({
  useCustomVariableOptions: () => ({
    options: variableOptions,
    isLoading: false,
    isError: false,
  }),
}))

const standard = {
  name: 'Probe',
  variables: {
    enabled: { type: 'switch', label: 'Feature enabled', default: false },
  },
}

const Harness = ({ initialValues, valuesRef }) => {
  const formControl = useForm({ mode: 'onChange' })
  React.useEffect(() => {
    valuesRef.current = () => formControl.getValues('settings.Probe.enabled')
  })
  return (
    <CippBaselineStandardSettings
      standard={standard}
      formControl={formControl}
      namePrefix="settings.Probe"
      initialValues={initialValues}
    />
  )
}

describe('switchVariableProblem', () => {
  it.each([
    [true, null],
    ['', null],
    [
      null,
      'no custom variable is picked. Pick one, or switch back to a fixed value',
    ],
    ['%AllowIt%', null],
    [{ label: '%AllowIt%', value: '%AllowIt%' }, null],
    [
      '%SiteName%',
      '%SiteName% is a string variable, but a switch needs a boolean one',
    ],
    ['%Gone%', '%Gone% is not a custom variable'],
  ])('%j -> %j', (value, expected) => {
    expect(switchVariableProblem(value, variableOptions)).toBe(expected)
  })
})

describe('CippBaselineStandardSettings switch bound to a custom variable', () => {
  it('opens a saved variable in variable mode', async () => {
    const valuesRef = {}
    renderWithProviders(
      <Harness initialValues={{ enabled: '%AllowIt%' }} valuesRef={valuesRef} />
    )
    expect(
      screen.getByRole('combobox', { name: 'Feature enabled' })
    ).toHaveValue('%AllowIt%')
    expect(screen.queryByRole('switch')).toBeNull()
    await waitFor(() =>
      expect(valuesRef.current()?.value ?? valuesRef.current()).toBe(
        '%AllowIt%'
      )
    )
  })

  it('offers only boolean variables, and swaps back to a fixed value', async () => {
    const user = userEvent.setup()
    const valuesRef = {}
    renderWithProviders(
      <Harness initialValues={{ enabled: true }} valuesRef={valuesRef} />
    )
    expect(
      screen.getByRole('switch', { name: /Feature enabled/ })
    ).toBeChecked()

    await user.click(
      screen.getByRole('button', { name: 'Use a custom variable' })
    )
    await user.click(screen.getByRole('combobox', { name: 'Feature enabled' }))
    expect(screen.queryByRole('option', { name: /%SiteName%/ })).toBeNull()
    await user.click(await screen.findByRole('option', { name: /%AllowIt%/ }))
    expect(valuesRef.current()?.value).toBe('%AllowIt%')

    await user.click(screen.getByRole('button', { name: 'Use a fixed value' }))
    expect(valuesRef.current()).toBe(false)
    expect(
      screen.getByRole('switch', { name: /Feature enabled/ })
    ).not.toBeChecked()
  })

  it('keeps a locked switch fixed with no variable option', () => {
    const lockedStandard = {
      name: 'Probe',
      variables: { enabled: { ...standard.variables.enabled, locked: true } },
    }
    const LockedHarness = () => {
      const formControl = useForm()
      return (
        <CippBaselineStandardSettings
          standard={lockedStandard}
          formControl={formControl}
          namePrefix="settings.Probe"
        />
      )
    }
    renderWithProviders(<LockedHarness />)
    expect(
      screen.getByRole('switch', { name: /Feature enabled/ })
    ).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Use a custom variable' })
    ).toBeNull()
  })
})
