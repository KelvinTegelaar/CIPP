import { describe, expect, it } from 'vitest'
import {
  buildSetting,
  buildSettingInstance,
  canAddCollectionEntry,
  canRemoveCollectionEntry,
  childDefinitionIds,
  clearGroupRowValues,
  collectionCountBounds,
  definitionInstanceType,
  mergeSettingInstance,
} from '../../src/utils/intune-setting-builder'
import {
  forceListChildren,
  forceListDefinition,
  forceListEnabled,
  forceListIdsDefinition,
  forceListDisabled,
} from '../mocks/intune-chrome-forcelist'

// The discriminators are the whole point of this module. Intune rejects a policy whose settings do
// not declare their type, and a wrong one is worse than a missing one - it is accepted by the schema
// and then behaves as a different kind of setting. So these assert the exact @odata.type strings
// rather than merely that something was produced.

const PREFIX = '#microsoft.graph.deviceManagementConfiguration'

const choiceDefinition = {
  id: 'device_test_choice',
  '@odata.type': `${PREFIX}ChoiceSettingDefinition`,
  defaultOptionId: 'device_test_choice_1',
  accessTypes: 'add,delete,get,replace',
  options: [
    { id: 'device_test_choice_0', displayName: 'Disabled' },
    { id: 'device_test_choice_1', displayName: 'Enabled' },
  ],
}

const stringDefinition = {
  id: 'device_test_string',
  '@odata.type': `${PREFIX}SimpleSettingDefinition`,
  accessTypes: 'add,replace',
  valueDefinition: { '@odata.type': `${PREFIX}StringSettingValueDefinition` },
}

const integerDefinition = {
  id: 'device_test_integer',
  '@odata.type': `${PREFIX}SimpleSettingDefinition`,
  accessTypes: 'add,replace',
  valueDefinition: {
    '@odata.type': `${PREFIX}IntegerSettingValueDefinition`,
    minimumValue: 0,
    maximumValue: 999,
  },
}

describe('definitionInstanceType', () => {
  it('maps each definition type to the instance that configures it', () => {
    expect(definitionInstanceType(choiceDefinition)).toBe(
      `${PREFIX}ChoiceSettingInstance`
    )
    expect(definitionInstanceType(stringDefinition)).toBe(
      `${PREFIX}SimpleSettingInstance`
    )
  })

  it('returns null for a type it does not know, rather than guessing', () => {
    expect(
      definitionInstanceType({
        '@odata.type': '#microsoft.graph.somethingElse',
      })
    ).toBeNull()
    expect(definitionInstanceType(undefined)).toBeNull()
  })
})

describe('buildSettingInstance', () => {
  it('builds a choice setting on its default option', () => {
    const instance = buildSettingInstance(choiceDefinition)
    expect(instance['@odata.type']).toBe(`${PREFIX}ChoiceSettingInstance`)
    expect(instance.settingDefinitionId).toBe('device_test_choice')
    expect(instance.choiceSettingValue.value).toBe('device_test_choice_1')
  })

  it('always gives a choice a children array, which Intune requires even when empty', () => {
    expect(
      buildSettingInstance(choiceDefinition).choiceSettingValue.children
    ).toEqual([])
  })

  it('falls back to the first option when no default is marked', () => {
    const instance = buildSettingInstance({
      ...choiceDefinition,
      defaultOptionId: undefined,
    })
    expect(instance.choiceSettingValue.value).toBe('device_test_choice_0')
  })

  it('types a string setting value as a string', () => {
    const instance = buildSettingInstance(stringDefinition)
    expect(instance.simpleSettingValue['@odata.type']).toBe(
      `${PREFIX}StringSettingValue`
    )
    expect(instance.simpleSettingValue.value).toBe('')
  })

  it('types an integer setting value as an integer', () => {
    const instance = buildSettingInstance(integerDefinition)
    expect(instance.simpleSettingValue['@odata.type']).toBe(
      `${PREFIX}IntegerSettingValue`
    )
    expect(instance.simpleSettingValue.value).toBe(0)
  })

  it('starts an integer at the bottom of its own range, not at zero', () => {
    // Zero is outside the allowed range here, so a policy starting there would be rejected the
    // moment it was saved.
    const instance = buildSettingInstance({
      ...integerDefinition,
      valueDefinition: {
        '@odata.type': `${PREFIX}IntegerSettingValueDefinition`,
        minimumValue: 15,
        maximumValue: 60,
      },
    })
    expect(instance.simpleSettingValue.value).toBe(15)
  })

  it('marks a secret value as not encrypted so Intune knows to encrypt it', () => {
    const instance = buildSettingInstance({
      ...stringDefinition,
      valueDefinition: {
        '@odata.type': `${PREFIX}SecretSettingValueDefinition`,
      },
    })
    expect(instance.simpleSettingValue['@odata.type']).toBe(
      `${PREFIX}SecretSettingValue`
    )
    expect(instance.simpleSettingValue.valueState).toBe('notEncrypted')
  })

  it('starts a simple collection empty, so no blank entry deploys if it is left untouched', () => {
    const instance = buildSettingInstance({
      ...stringDefinition,
      '@odata.type': `${PREFIX}SimpleSettingCollectionDefinition`,
    })
    expect(instance['@odata.type']).toBe(
      `${PREFIX}SimpleSettingCollectionInstance`
    )
    expect(instance.simpleSettingCollectionValue).toEqual([])
  })

  it('refuses a group with no children, because Intune rejects an empty group', () => {
    // "SettingGroupValue should not be empty" - the whole policy is rejected, not just the group,
    // and the message names only the group. Refusing to build keeps it out of the picker instead.
    expect(
      buildSettingInstance({
        id: 'device_test_group',
        '@odata.type': `${PREFIX}SettingGroupCollectionDefinition`,
      })
    ).toBeNull()
  })

  it('builds a group collection row from the group children', () => {
    const instance = buildSettingInstance(
      {
        id: 'device_test_group',
        '@odata.type': `${PREFIX}SettingGroupCollectionDefinition`,
        childIds: ['device_test_string'],
      },
      { device_test_string: stringDefinition }
    )
    expect(instance['@odata.type']).toBe(
      `${PREFIX}GroupSettingCollectionInstance`
    )
    expect(instance.groupSettingCollectionValue).toHaveLength(1)
    expect(instance.groupSettingCollectionValue[0].children).toHaveLength(1)
    expect(
      instance.groupSettingCollectionValue[0].children[0].settingDefinitionId
    ).toBe('device_test_string')
  })

  it('refuses a string whose required format an empty value cannot satisfy', () => {
    // A PLMNID must match ^[0-9]{5,6}$. Seeding it with '' produces a policy Intune refuses, so
    // there is no correct way to create this setting blank.
    expect(
      buildSettingInstance({
        ...stringDefinition,
        valueDefinition: {
          '@odata.type': `${PREFIX}StringSettingValueDefinition`,
          format: 'regEx',
          inputValidationSchema: '^[0-9]{5,6}$',
        },
      })
    ).toBeNull()
  })

  it('still builds a string with no format requirement', () => {
    expect(
      buildSettingInstance(stringDefinition).simpleSettingValue.value
    ).toBe('')
  })

  it('refuses a simple setting whose value type it cannot determine', () => {
    // Writing a string where Intune wants an integer is accepted here and rejected at deploy time,
    // which is the surprise this whole feature exists to prevent.
    expect(
      buildSettingInstance({ ...stringDefinition, valueDefinition: undefined })
    ).toBeNull()
    expect(
      buildSettingInstance({
        ...stringDefinition,
        valueDefinition: {
          '@odata.type': `${PREFIX}MysterySettingValueDefinition`,
        },
      })
    ).toBeNull()
  })

  it('refuses a choice with no options to choose from', () => {
    expect(
      buildSettingInstance({ ...choiceDefinition, options: [] })
    ).toBeNull()
  })

  it('refuses a definition with no id', () => {
    expect(
      buildSettingInstance({ ...choiceDefinition, id: undefined })
    ).toBeNull()
  })
})

describe('buildSetting', () => {
  it('wraps the instance the way a policy settings array expects', () => {
    const setting = buildSetting(choiceDefinition)
    expect(setting['@odata.type']).toBe(`${PREFIX}Setting`)
    expect(setting.settingInstance.settingDefinitionId).toBe(
      'device_test_choice'
    )
  })

  it('is null when the instance cannot be built, so nothing half-formed reaches the policy', () => {
    expect(
      buildSetting({ ...stringDefinition, valueDefinition: undefined })
    ).toBeNull()
  })
})

describe('collection count bounds', () => {
  // The ASR rules group allows exactly one row. Adding a second builds a policy that validates
  // structurally and is then rejected outright by Graph with a bounds error naming only the group,
  // so the limit has to be known before the row is offered.
  const boundedGroup = {
    id: 'device_test_group',
    '@odata.type': `${PREFIX}SettingGroupCollectionDefinition`,
    minimumCount: 0,
    maximumCount: 1,
  }

  it('reads the stated bounds', () => {
    expect(collectionCountBounds(boundedGroup)).toEqual({
      minimum: 0,
      maximum: 1,
    })
  })

  it('treats an unstated maximum as unbounded rather than zero', () => {
    expect(collectionCountBounds({}).maximum).toBe(Infinity)
    expect(collectionCountBounds({}).minimum).toBe(0)
  })

  it('refuses a row that would exceed the maximum', () => {
    expect(canAddCollectionEntry(boundedGroup, 0)).toBe(true)
    expect(canAddCollectionEntry(boundedGroup, 1)).toBe(false)
  })

  it('refuses a removal that would fall below the minimum', () => {
    const requiresOne = { ...boundedGroup, minimumCount: 1, maximumCount: 5 }
    expect(canRemoveCollectionEntry(requiresOne, 2)).toBe(true)
    expect(canRemoveCollectionEntry(requiresOne, 1)).toBe(false)
  })
})

describe('childDefinitionIds', () => {
  it('prefers childIds, which states membership directly', () => {
    expect(
      childDefinitionIds({
        childIds: ['a', 'b'],
        dependedOnBy: [{ dependedOnBy: 'c' }],
      })
    ).toEqual(['a', 'b'])
  })

  it('falls back to dependedOnBy when there is no child list', () => {
    expect(
      childDefinitionIds({
        dependedOnBy: [{ dependedOnBy: 'c' }, { dependedOnBy: 'd' }],
      })
    ).toEqual(['c', 'd'])
  })

  it('returns nothing for a definition with neither', () => {
    expect(childDefinitionIds({})).toEqual([])
  })
})

describe('clearGroupRowValues', () => {
  const row = {
    children: [
      {
        '@odata.type': `${PREFIX}SimpleSettingInstance`,
        settingDefinitionId: 'child_string',
        simpleSettingValue: {
          '@odata.type': `${PREFIX}StringSettingValue`,
          value: 'keep shape',
        },
      },
      {
        '@odata.type': `${PREFIX}SimpleSettingInstance`,
        settingDefinitionId: 'child_int',
        simpleSettingValue: {
          '@odata.type': `${PREFIX}IntegerSettingValue`,
          value: 42,
        },
      },
      {
        '@odata.type': `${PREFIX}ChoiceSettingInstance`,
        settingDefinitionId: 'child_choice',
        choiceSettingValue: { value: 'child_choice_1', children: [] },
      },
    ],
  }

  it('keeps every discriminator and definition id', () => {
    const cleared = clearGroupRowValues(row)
    expect(cleared.children.map((c) => c['@odata.type'])).toEqual(
      row.children.map((c) => c['@odata.type'])
    )
    expect(cleared.children.map((c) => c.settingDefinitionId)).toEqual([
      'child_string',
      'child_int',
      'child_choice',
    ])
  })

  it('clears scalar values by type', () => {
    const cleared = clearGroupRowValues(row)
    expect(cleared.children[0].simpleSettingValue.value).toBe('')
    expect(cleared.children[1].simpleSettingValue.value).toBe(0)
  })

  it('leaves a choice on its option, because there is no unset choice', () => {
    expect(clearGroupRowValues(row).children[2].choiceSettingValue.value).toBe(
      'child_choice_1'
    )
  })

  it('does not mutate the row it copies', () => {
    clearGroupRowValues(row)
    expect(row.children[1].simpleSettingValue.value).toBe(42)
  })
})

describe('building towards a nested setting', () => {
  it('picks the option a wanted child sits under, and builds that child', () => {
    const instance = buildSettingInstance(
      forceListDefinition,
      forceListChildren,
      new Set([forceListIdsDefinition.id])
    )
    expect(instance.choiceSettingValue.value).toBe(forceListEnabled)
    expect(instance.choiceSettingValue.children).toEqual([
      {
        '@odata.type': `${PREFIX}SimpleSettingCollectionInstance`,
        settingDefinitionId: forceListIdsDefinition.id,
        simpleSettingCollectionValue: [],
      },
    ])
  })

  it('still builds the default option when nothing beneath is wanted', () => {
    const instance = buildSettingInstance(
      forceListDefinition,
      forceListChildren
    )
    expect(instance.choiceSettingValue).toEqual({
      value: forceListDisabled,
      children: [],
    })
  })
})

describe('mergeSettingInstance', () => {
  const enabled = buildSettingInstance(
    forceListDefinition,
    forceListChildren,
    new Set([forceListIdsDefinition.id])
  )
  const disabled = buildSettingInstance(forceListDefinition, forceListChildren)

  it('moves an existing parent onto the option that carries the child', () => {
    expect(mergeSettingInstance(disabled, enabled)).toEqual(enabled)
  })

  it('keeps values already entered when the option is unchanged', () => {
    const filled = structuredClone(enabled)
    filled.choiceSettingValue.children[0].simpleSettingCollectionValue = [
      {
        '@odata.type': `${PREFIX}StringSettingValue`,
        value: 'abcdefghijklmnop',
      },
    ]
    expect(mergeSettingInstance(filled, enabled)).toEqual(filled)
  })

  it('drops the children of an option that is no longer selected', () => {
    expect(mergeSettingInstance(enabled, disabled)).toEqual(disabled)
  })
})
