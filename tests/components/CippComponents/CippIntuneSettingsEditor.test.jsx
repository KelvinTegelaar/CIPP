import {
  applyIntuneSettingEdits,
  buildIntunePropertyLeaves,
  buildIntuneSettingLeaves,
  containsVariable,
  defaultValueForLeaf,
} from '../../../src/utils/intune-template-leaves'

// Definitions the editor would normally read from intuneCollection.json.
const definitions = {
  device_vendor_msft_policy_config_localpoliciessecurityoptions_interactivelogon_machineinactivitylimit_v2:
    { id: 'inactivity', displayName: 'Machine inactivity limit' },
  device_vendor_msft_policy_config_defender_allowrealtimemonitoring: {
    id: 'rtp',
    displayName: 'Allow realtime monitoring',
    options: [
      {
        id: 'device_vendor_msft_policy_config_defender_allowrealtimemonitoring_0',
        displayName: 'Disabled',
      },
      {
        id: 'device_vendor_msft_policy_config_defender_allowrealtimemonitoring_1',
        displayName: 'Enabled',
      },
    ],
  },
  group_child_setting: {
    id: 'group_child_setting',
    displayName: 'Nested child',
  },
  collection_setting: { id: 'collection_setting', displayName: 'Allowed apps' },
}
const getDefinition = (id) => definitions[id]

// A settings catalog policy exercising every shape the walk handles: an integer simple setting, a
// choice with a nested child, a simple collection, and a group setting collection.
const catalogPolicy = () => ({
  name: 'Baseline',
  description: '',
  platforms: 'windows10',
  technologies: 'mdm',
  roleScopeTagIds: ['0'],
  settings: [
    {
      '@odata.type': '#microsoft.graph.deviceManagementConfigurationSetting',
      settingInstance: {
        '@odata.type':
          '#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance',
        settingDefinitionId:
          'device_vendor_msft_policy_config_localpoliciessecurityoptions_interactivelogon_machineinactivitylimit_v2',
        simpleSettingValue: {
          '@odata.type':
            '#microsoft.graph.deviceManagementConfigurationIntegerSettingValue',
          value: 300,
        },
      },
    },
    {
      '@odata.type': '#microsoft.graph.deviceManagementConfigurationSetting',
      settingInstance: {
        '@odata.type':
          '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
        settingDefinitionId:
          'device_vendor_msft_policy_config_defender_allowrealtimemonitoring',
        choiceSettingValue: {
          '@odata.type':
            '#microsoft.graph.deviceManagementConfigurationChoiceSettingValue',
          value:
            'device_vendor_msft_policy_config_defender_allowrealtimemonitoring_1',
          children: [
            {
              '@odata.type':
                '#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance',
              settingDefinitionId: 'group_child_setting',
              simpleSettingValue: {
                '@odata.type':
                  '#microsoft.graph.deviceManagementConfigurationStringSettingValue',
                value: 'child-value',
              },
            },
          ],
        },
      },
    },
    {
      '@odata.type': '#microsoft.graph.deviceManagementConfigurationSetting',
      settingInstance: {
        '@odata.type':
          '#microsoft.graph.deviceManagementConfigurationSimpleSettingCollectionInstance',
        settingDefinitionId: 'collection_setting',
        simpleSettingCollectionValue: [
          {
            '@odata.type':
              '#microsoft.graph.deviceManagementConfigurationStringSettingValue',
            value: 'app-one',
          },
        ],
      },
    },
    {
      '@odata.type': '#microsoft.graph.deviceManagementConfigurationSetting',
      settingInstance: {
        '@odata.type':
          '#microsoft.graph.deviceManagementConfigurationGroupSettingCollectionInstance',
        settingDefinitionId: 'group_parent',
        groupSettingCollectionValue: [
          {
            '@odata.type':
              '#microsoft.graph.deviceManagementConfigurationGroupSettingValue',
            children: [
              {
                '@odata.type':
                  '#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance',
                settingDefinitionId: 'group_child_setting',
                simpleSettingValue: {
                  '@odata.type':
                    '#microsoft.graph.deviceManagementConfigurationStringSettingValue',
                  value: 'grouped',
                },
              },
            ],
          },
        ],
      },
    },
  ],
})

// Every @odata.type in the object, by JSON path — the properties Intune rejects a policy for losing.
const collectODataTypes = (node, path = '', found = {}) => {
  if (Array.isArray(node)) {
    node.forEach((item, index) =>
      collectODataTypes(item, `${path}[${index}]`, found)
    )
    return found
  }
  if (node && typeof node === 'object') {
    Object.entries(node).forEach(([key, value]) => {
      if (key === '@odata.type') found[`${path}.${key}`] = value
      else collectODataTypes(value, `${path}.${key}`, found)
    })
  }
  return found
}

describe('buildIntuneSettingLeaves', () => {
  it('walks simple, choice, nested child, collection and group settings', () => {
    const leaves = buildIntuneSettingLeaves(catalogPolicy(), getDefinition)

    expect(leaves.map((leaf) => leaf.kind)).toEqual([
      'simple',
      'choice',
      'simple', // the choice's nested child
      'simpleCollection',
      'simple', // the group collection's child
    ])
    expect(leaves[0].valueType).toBe('integer')
    expect(leaves[1].label).toBe('Allow realtime monitoring')
    expect(leaves[1].options).toHaveLength(2)
    expect(leaves[1].hasDependentChildren).toBe(true)
    expect(leaves[2].depth).toBe(1)
    expect(leaves[4].groupLabel).toBeTruthy()
  })

  it('falls back to the setting definition id when the catalog has no entry', () => {
    const leaves = buildIntuneSettingLeaves(catalogPolicy(), () => undefined)
    expect(leaves[0].label).toContain('machineinactivitylimit')
  })
})

describe('applyIntuneSettingEdits', () => {
  it('preserves every @odata.type when values are edited (issue #54)', () => {
    const original = catalogPolicy()
    const leaves = buildIntuneSettingLeaves(original, getDefinition)

    const edited = applyIntuneSettingEdits(original, leaves, [
      600,
      {
        label: 'Disabled',
        value:
          'device_vendor_msft_policy_config_defender_allowrealtimemonitoring_0',
      },
      'new-child-value',
      [
        { label: 'app-one', value: 'app-one' },
        { label: 'app-two', value: 'app-two' },
      ],
      'grouped-edited',
    ])

    // Every discriminator the stored policy had is still there, unchanged and at the same path.
    // The edited policy may hold more of them - the extra collection entry adds one - but never
    // fewer, which is the failure that made edited templates undeployable.
    const before = collectODataTypes(original)
    const after = collectODataTypes(edited)
    Object.entries(before).forEach(([path, value]) => {
      expect(after[path]).toBe(value)
    })
  })

  it('keeps integer settings numeric and applies edited values at the right paths', () => {
    const original = catalogPolicy()
    const leaves = buildIntuneSettingLeaves(original, getDefinition)

    const edited = applyIntuneSettingEdits(original, leaves, [
      '600', // a number field hands back a string
      {
        value:
          'device_vendor_msft_policy_config_defender_allowrealtimemonitoring_0',
      },
      'new-child-value',
      [{ value: 'app-one' }, { value: 'app-two' }],
      'grouped-edited',
    ])

    expect(edited.settings[0].settingInstance.simpleSettingValue.value).toBe(
      600
    )
    expect(edited.settings[1].settingInstance.choiceSettingValue.value).toBe(
      'device_vendor_msft_policy_config_defender_allowrealtimemonitoring_0'
    )
    expect(
      edited.settings[1].settingInstance.choiceSettingValue.children[0]
        .simpleSettingValue.value
    ).toBe('new-child-value')
    expect(
      edited.settings[2].settingInstance.simpleSettingCollectionValue.map(
        (item) => item.value
      )
    ).toEqual(['app-one', 'app-two'])
    expect(
      edited.settings[3].settingInstance.groupSettingCollectionValue[0]
        .children[0].simpleSettingValue.value
    ).toBe('grouped-edited')
  })

  it('adds collection entries with the @odata.type of the existing ones', () => {
    const original = catalogPolicy()
    const leaves = buildIntuneSettingLeaves(original, getDefinition)
    const collectionLeaf = leaves.find(
      (leaf) => leaf.kind === 'simpleCollection'
    )

    const values = leaves.map(defaultValueForLeaf)
    values[collectionLeaf.index] = [{ value: 'app-one' }, { value: 'app-two' }]

    const edited = applyIntuneSettingEdits(original, leaves, values)
    const collection =
      edited.settings[2].settingInstance.simpleSettingCollectionValue

    expect(collection).toHaveLength(2)
    expect(collection[1]['@odata.type']).toBe(
      '#microsoft.graph.deviceManagementConfigurationStringSettingValue'
    )
  })

  it('leaves the policy untouched when the form is submitted unchanged', () => {
    const original = catalogPolicy()
    const leaves = buildIntuneSettingLeaves(original, getDefinition)
    const edited = applyIntuneSettingEdits(
      original,
      leaves,
      leaves.map(defaultValueForLeaf)
    )

    expect(edited).toEqual(original)
  })

  it('does not mutate the original policy', () => {
    const original = catalogPolicy()
    const snapshot = JSON.parse(JSON.stringify(original))
    const leaves = buildIntuneSettingLeaves(original, getDefinition)

    applyIntuneSettingEdits(original, leaves, [999, undefined, 'x', [], 'y'])
    expect(original).toEqual(snapshot)
  })

  it('falls back to the stored value when a number field is cleared', () => {
    const original = catalogPolicy()
    const leaves = buildIntuneSettingLeaves(original, getDefinition)
    const edited = applyIntuneSettingEdits(original, leaves, [
      '',
      undefined,
      undefined,
      undefined,
      undefined,
    ])

    expect(edited.settings[0].settingInstance.simpleSettingValue.value).toBe(
      300
    )
  })
})

describe('buildIntunePropertyLeaves', () => {
  // Classic device configuration policies are a flat object, and their root @odata.type decides
  // which Graph endpoint they deploy to.
  const devicePolicy = () => ({
    '@odata.type': '#microsoft.graph.windows10GeneralConfiguration',
    displayName: 'Device baseline',
    description: 'desc',
    id: 'should-be-ignored',
    version: 4,
    passwordRequired: true,
    passwordMinimumLength: 8,
    passwordBlockSimple: false,
    edgeHomepageUrls: ['https://example.test'],
    roleScopeTagIds: ['0'],
  })

  it('emits leaves for editable properties and skips identity and Intune-managed ones', () => {
    const leaves = buildIntunePropertyLeaves(devicePolicy())
    const paths = leaves.map((leaf) => leaf.path.join('.'))

    expect(paths).toContain('passwordRequired')
    expect(paths).toContain('passwordMinimumLength')
    expect(paths).toContain('edgeHomepageUrls')
    // Edited as template metadata, or owned by Intune.
    expect(paths).not.toContain('displayName')
    expect(paths).not.toContain('description')
    expect(paths).not.toContain('id')
    expect(paths).not.toContain('version')
    expect(paths).not.toContain('roleScopeTagIds')
  })

  it('preserves the root @odata.type and property types through a round-trip', () => {
    const original = devicePolicy()
    const leaves = buildIntunePropertyLeaves(original)

    const values = leaves.map(defaultValueForLeaf)
    values[
      leaves.find(
        (leaf) => leaf.path.join('.') === 'passwordMinimumLength'
      ).index
    ] = '12'
    values[
      leaves.find((leaf) => leaf.path.join('.') === 'passwordRequired').index
    ] = {
      label: 'False',
      value: false,
    }

    const edited = applyIntuneSettingEdits(original, leaves, values)

    expect(edited['@odata.type']).toBe(
      '#microsoft.graph.windows10GeneralConfiguration'
    )
    expect(edited.passwordMinimumLength).toBe(12)
    expect(edited.passwordRequired).toBe(false)
    expect(edited.passwordBlockSimple).toBe(false)
    expect(edited.edgeHomepageUrls).toEqual(['https://example.test'])
    // Untouched because no field is bound to it.
    expect(edited.roleScopeTagIds).toEqual(['0'])
  })
})

describe('custom variables', () => {
  it('recognises CIPP variables and ignores bare percent signs', () => {
    expect(containsVariable('%tenantname%')).toBe(true)
    expect(containsVariable('prefix-%tenantid%-suffix')).toBe(true)
    expect(containsVariable('100%')).toBe(false)
    expect(containsVariable('50% off, 20% more')).toBe(false)
    expect(containsVariable('%not a variable%')).toBe(false)
    expect(containsVariable(300)).toBe(false)
  })

  it('stores a variable verbatim in an integer setting instead of reverting it', () => {
    const original = catalogPolicy()
    const leaves = buildIntuneSettingLeaves(original, getDefinition)
    const values = leaves.map(defaultValueForLeaf)
    values[0] = '%lockoutseconds%'

    const edited = applyIntuneSettingEdits(original, leaves, values)

    expect(edited.settings[0].settingInstance.simpleSettingValue.value).toBe(
      '%lockoutseconds%'
    )
    // The value type is what the variable resolves to at deployment, so the declared type stays put.
    expect(
      edited.settings[0].settingInstance.simpleSettingValue['@odata.type']
    ).toBe('#microsoft.graph.deviceManagementConfigurationIntegerSettingValue')
  })

  it('stores a variable typed into a choice selector', () => {
    const original = catalogPolicy()
    const leaves = buildIntuneSettingLeaves(original, getDefinition)
    const values = leaves.map(defaultValueForLeaf)
    values[1] = { label: '%defendermode%', value: '%defendermode%' }

    const edited = applyIntuneSettingEdits(original, leaves, values)
    expect(edited.settings[1].settingInstance.choiceSettingValue.value).toBe(
      '%defendermode%'
    )
  })

  it('stores variables inside a collection alongside literal entries', () => {
    const original = catalogPolicy()
    const leaves = buildIntuneSettingLeaves(original, getDefinition)
    const collection = leaves.find((leaf) => leaf.kind === 'simpleCollection')
    const values = leaves.map(defaultValueForLeaf)
    values[collection.index] = [{ value: 'app-one' }, { value: '%allowedapp%' }]

    const edited = applyIntuneSettingEdits(original, leaves, values)
    const entries =
      edited.settings[2].settingInstance.simpleSettingCollectionValue

    expect(entries.map((entry) => entry.value)).toEqual([
      'app-one',
      '%allowedapp%',
    ])
    expect(entries[1]['@odata.type']).toBe(
      '#microsoft.graph.deviceManagementConfigurationStringSettingValue'
    )
  })

  it('stores a variable typed into a boolean selector on a classic policy', () => {
    const original = {
      '@odata.type': '#microsoft.graph.windows10GeneralConfiguration',
      passwordRequired: true,
      passwordMinimumLength: 8,
    }
    const leaves = buildIntunePropertyLeaves(original)
    const values = leaves.map(defaultValueForLeaf)
    values[
      leaves.find((leaf) => leaf.path.join('.') === 'passwordRequired').index
    ] = {
      label: '%requirepassword%',
      value: '%requirepassword%',
    }

    const edited = applyIntuneSettingEdits(original, leaves, values)
    expect(edited.passwordRequired).toBe('%requirepassword%')
  })

  it('still coerces plain values to their declared type', () => {
    const original = catalogPolicy()
    const leaves = buildIntuneSettingLeaves(original, getDefinition)
    const values = leaves.map(defaultValueForLeaf)
    values[0] = '450'

    const edited = applyIntuneSettingEdits(original, leaves, values)
    expect(edited.settings[0].settingInstance.simpleSettingValue.value).toBe(
      450
    )
  })

  it('replaces a stored variable with a literal number when it is typed over', () => {
    const original = catalogPolicy()
    original.settings[0].settingInstance.simpleSettingValue.value =
      '%lockoutseconds%'
    const leaves = buildIntuneSettingLeaves(original, getDefinition)
    const values = leaves.map(defaultValueForLeaf)
    values[0] = '900'

    const edited = applyIntuneSettingEdits(original, leaves, values)
    expect(edited.settings[0].settingInstance.simpleSettingValue.value).toBe(
      900
    )
  })
})

describe('numeric settings in a text field', () => {
  const zeroPolicy = () => ({
    name: 'Zero',
    settings: [
      {
        '@odata.type': '#microsoft.graph.deviceManagementConfigurationSetting',
        settingInstance: {
          '@odata.type':
            '#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance',
          settingDefinitionId: 'collection_setting',
          simpleSettingValue: {
            '@odata.type':
              '#microsoft.graph.deviceManagementConfigurationIntegerSettingValue',
            value: 0,
          },
        },
      },
    ],
  })

  it('hands 0 to the form as text so it is not rendered as an empty field', () => {
    const leaves = buildIntuneSettingLeaves(zeroPolicy(), getDefinition)
    expect(defaultValueForLeaf(leaves[0])).toBe('0')
  })

  it('writes 0 back as a number', () => {
    const original = zeroPolicy()
    const leaves = buildIntuneSettingLeaves(original, getDefinition)
    const edited = applyIntuneSettingEdits(
      original,
      leaves,
      leaves.map(defaultValueForLeaf)
    )

    expect(edited.settings[0].settingInstance.simpleSettingValue.value).toBe(0)
    expect(edited).toEqual(original)
  })
})
