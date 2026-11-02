import { describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useIntunePolicyEditor } from '../../src/hooks/use-intune-policy-editor'
import { buildSetting } from '../../src/utils/intune-setting-builder'
import {
  forceListChildren,
  forceListDefinition,
  forceListDisabled,
  forceListEnabled,
  forceListIdsDefinition,
} from '../mocks/intune-chrome-forcelist'

const definitions = {
  [forceListDefinition.id]: forceListDefinition,
  ...forceListChildren,
}

vi.mock('../../src/hooks/use-intune-collection', async (importOriginal) => ({
  ...(await importOriginal()),
  useIntuneDefinitions: () => ({
    getDefinition: (id) => definitions[id],
    isLoading: false,
    isError: false,
  }),
  fetchIntuneDescendants: vi.fn(async (definition) =>
    definition.defaultOptionId === forceListEnabled ? forceListChildren : {}
  ),
}))

const useHarness = (initial) => {
  const formControl = useForm()
  const [policy, setPolicy] = useState(initial)
  const editor = useIntunePolicyEditor({ policy, setPolicy, formControl })
  return { formControl, policy, editor }
}

const disabledPolicy = () => ({
  settings: [buildSetting(forceListDefinition, forceListChildren)],
})

const enabledValue = (policy) =>
  policy.settings[0].settingInstance.choiceSettingValue

describe('useIntunePolicyEditor', () => {
  it('adds the settings an option requires when the choice is moved onto it', async () => {
    const { result } = renderHook(() => useHarness(disabledPolicy()))

    act(() => {
      result.current.formControl.setValue('settingValues.0', {
        label: 'Enabled',
        value: forceListEnabled,
      })
    })

    await waitFor(() =>
      expect(enabledValue(result.current.policy).value).toBe(forceListEnabled)
    )
    expect(
      enabledValue(result.current.policy).children.map(
        (child) => child.settingDefinitionId
      )
    ).toEqual([forceListIdsDefinition.id])
  })

  it('reaches a nested setting through a parent the policy already has', () => {
    const { result } = renderHook(() => useHarness(disabledPolicy()))

    let added
    act(() => {
      added = result.current.editor.addSetting(
        forceListDefinition,
        forceListChildren,
        new Set([forceListIdsDefinition.id])
      )
    })

    expect(added).toBe(true)
    expect(result.current.policy.settings).toHaveLength(1)
    expect(enabledValue(result.current.policy).value).toBe(forceListEnabled)
    expect(enabledValue(result.current.policy).children).toHaveLength(1)
  })

  it('still refuses to add a top-level setting twice', () => {
    const { result } = renderHook(() => useHarness(disabledPolicy()))

    let added
    act(() => {
      added = result.current.editor.addSetting(
        forceListDefinition,
        forceListChildren
      )
    })

    expect(added).toBe(false)
    expect(enabledValue(result.current.policy).value).toBe(forceListDisabled)
  })
})
