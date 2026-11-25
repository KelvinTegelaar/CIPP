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
import graphSchema from '../../public/intune-graph-schema.json'
import {
  adobeExclusionsId,
  adobeRuleId,
  asrChildren,
  asrGroupDefinition,
  asrGroupId,
  webshellRuleId,
} from '../mocks/intune-asr-rules'

const definitions = {
  [forceListDefinition.id]: forceListDefinition,
  ...forceListChildren,
  [asrGroupDefinition.id]: asrGroupDefinition,
  ...asrChildren,
}

vi.mock('../../src/hooks/use-intune-collection', async (importOriginal) => ({
  ...(await importOriginal()),
  useIntuneDefinitions: () => ({
    getDefinition: (id) => definitions[id],
    isLoading: false,
    isError: false,
  }),
  fetchIntuneDescendants: vi.fn(async (definition) => {
    if (definition.id.startsWith(asrGroupId)) return asrChildren
    return definition.defaultOptionId === forceListEnabled
      ? forceListChildren
      : {}
  }),
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

  describe('ASR rule exclusions', () => {
    const asrPolicy = (chosen) => ({
      settings: [
        buildSetting(asrGroupDefinition, asrChildren, new Set(chosen)),
      ],
    })
    const rules = (policy) =>
      policy.settings[0].settingInstance.groupSettingCollectionValue[0].children
    const entry = {
      '@odata.type':
        '#microsoft.graph.deviceManagementConfigurationStringSettingValue',
      value: 'C:\\Apps\\reader.exe',
    }
    const auditWithExclusion = () => {
      const policy = asrPolicy([
        adobeRuleId,
        adobeExclusionsId,
        `${adobeRuleId}_audit`,
      ])
      rules(
        policy
      )[0].choiceSettingValue.children[0].simpleSettingCollectionValue = [entry]
      return policy
    }

    it('adds a rule exclusion without moving that rule or any other off its chosen mode', () => {
      const { result } = renderHook(() =>
        useHarness(
          asrPolicy([`${adobeRuleId}_audit`, `${webshellRuleId}_warn`])
        )
      )

      act(() => {
        result.current.editor.addSetting(
          asrGroupDefinition,
          asrChildren,
          new Set([adobeRuleId, adobeExclusionsId])
        )
      })

      const [adobe, webshell] = rules(result.current.policy)
      expect(adobe.choiceSettingValue.value).toBe(`${adobeRuleId}_audit`)
      expect(
        adobe.choiceSettingValue.children.map(
          (child) => child.settingDefinitionId
        )
      ).toEqual([adobeExclusionsId])
      expect(webshell.choiceSettingValue.value).toBe(`${webshellRuleId}_warn`)
    })

    it('keeps the exclusion and its entries when the rule moves to another mode that offers it', async () => {
      const { result } = renderHook(() => useHarness(auditWithExclusion()))

      act(() => {
        result.current.formControl.setValue('settingValues.0', {
          label: 'Warn',
          value: `${adobeRuleId}_warn`,
        })
      })

      await waitFor(() =>
        expect(rules(result.current.policy)[0].choiceSettingValue.value).toBe(
          `${adobeRuleId}_warn`
        )
      )
      expect(
        rules(result.current.policy)[0].choiceSettingValue.children
      ).toEqual([
        expect.objectContaining({
          settingDefinitionId: adobeExclusionsId,
          simpleSettingCollectionValue: [entry],
        }),
      ])
    })

    it('drops the exclusion when the rule is turned off', async () => {
      const { result } = renderHook(() => useHarness(auditWithExclusion()))

      act(() => {
        result.current.formControl.setValue('settingValues.0', {
          label: 'Off',
          value: `${adobeRuleId}_off`,
        })
      })

      await waitFor(() =>
        expect(rules(result.current.policy)[0].choiceSettingValue).toEqual({
          value: `${adobeRuleId}_off`,
          children: [],
        })
      )
    })
  })

  it("stamps the template's references on a setting added to a template-based policy", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        settingTemplates: [
          {
            settingInstanceTemplate: {
              settingDefinitionId: forceListDefinition.id,
              settingInstanceTemplateId: 'instance-template',
              choiceSettingValueTemplate: {
                settingValueTemplateId: 'value-template',
              },
            },
          },
        ],
      }),
    }))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() =>
      useHarness({
        templateReference: { templateId: 'template_1' },
        settings: [],
      })
    )
    await waitFor(() =>
      expect(result.current.editor.templateSettings).toBeTruthy()
    )

    act(() => {
      result.current.editor.addSetting(forceListDefinition, forceListChildren)
    })

    const instance = result.current.policy.settings[0].settingInstance
    expect(fetchMock).toHaveBeenCalledWith('/intune-templates/template_1.json')
    expect(instance.settingInstanceTemplateReference).toEqual({
      settingInstanceTemplateId: 'instance-template',
    })
    expect(instance.choiceSettingValue.settingValueTemplateReference).toEqual({
      settingValueTemplateId: 'value-template',
      useTemplateDefault: false,
    })
    vi.unstubAllGlobals()
  })
})

// The schema is cached for the page once fetched, so the failing fetch runs first.
describe('useIntunePolicyEditor on a classic policy', () => {
  const featureUpdate = {
    displayName: 'Feature update',
    featureUpdateVersion: 'Windows 11, version 26H2',
    installFeatureUpdatesOptional: 'false',
  }
  const useClassicHarness = () => {
    const formControl = useForm()
    const [policy, setPolicy] = useState(featureUpdate)
    return useIntunePolicyEditor({
      policy,
      setPolicy,
      formControl,
      templateType: 'windowsFeatureUpdateProfiles',
    })
  }
  const optionalLeaf = (editor) =>
    editor.leaves.find((leaf) => leaf.definitionId === 'installFeatureUpdatesOptional')

  it('reports a schema that cannot be loaded and keeps the stored types', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404 })))
    const { result } = renderHook(useClassicHarness)
    await waitFor(() => expect(result.current.definitionsError).toBe(true))
    expect(result.current.definitionsLoading).toBe(false)
    expect(optionalLeaf(result.current).kind).toBe('simple')
    vi.unstubAllGlobals()
  })

  it('types the fields from the Graph schema once it has loaded', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => graphSchema }))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(useClassicHarness)
    expect(result.current.definitionsLoading).toBe(true)
    expect(result.current.leaves).toEqual([])
    await waitFor(() => expect(result.current.definitionsLoading).toBe(false))
    expect(fetchMock).toHaveBeenCalledWith('/intune-graph-schema.json')
    expect(optionalLeaf(result.current)).toMatchObject({ kind: 'boolean', value: false })
    expect(result.current.definitionsError).toBe(false)
    vi.unstubAllGlobals()
  })
})
