import {
  applyIntuneSettingEdits,
  buildIntunePropertyLeaves,
  buildIntuneSettingLeaves,
  categoryForSetting,
  categoryKeyForSetting,
  containsVariable,
  defaultValueForLeaf,
  UNCATEGORISED,
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

// Intune emits a field that has never been filled in as a value object with no `value` at all -
// an ADMX text box left blank, or one whose sibling toggle is off. Point and Print Restrictions'
// trusted-server list arrives exactly like this. Deciding the setting's type from whether it had
// a value classified those as unknown, so they rendered read-only and could never be filled in.
describe('settings with no value yet', () => {
  const emptyPolicy = () => ({
    name: 'Point and Print',
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
              '#microsoft.graph.deviceManagementConfigurationStringSettingValue',
          },
        },
      },
    ],
  })

  it('treats a value-less string setting as editable rather than unsupported', () => {
    const leaves = buildIntuneSettingLeaves(emptyPolicy(), getDefinition)

    expect(leaves).toHaveLength(1)
    expect(leaves[0].kind).toBe('simple')
    expect(leaves[0].valueType).toBe('string')
    expect(leaves[0].label).toBe('Machine inactivity limit')
  })

  it('leaves the policy untouched when the empty field is not edited', () => {
    const original = emptyPolicy()
    const leaves = buildIntuneSettingLeaves(original, getDefinition)
    const edited = applyIntuneSettingEdits(
      original,
      leaves,
      leaves.map(defaultValueForLeaf)
    )

    // No invented "value": "" - an untouched field round-trips exactly as imported.
    expect(edited).toEqual(original)
    expect(
      'value' in edited.settings[0].settingInstance.simpleSettingValue
    ).toBe(false)
  })

  it('writes a value into the empty field once one is entered', () => {
    const original = emptyPolicy()
    const leaves = buildIntuneSettingLeaves(original, getDefinition)
    const edited = applyIntuneSettingEdits(original, leaves, ['print1;print2'])

    expect(edited.settings[0].settingInstance.simpleSettingValue).toEqual({
      '@odata.type':
        '#microsoft.graph.deviceManagementConfigurationStringSettingValue',
      value: 'print1;print2',
    })
  })
})

// The same absent-value shape reaches choice settings. Treating them as editable is right, but a
// choice has no sensible blank: Intune expects an option id, so an untouched empty selector must
// not serialise as "value": "".
describe('choice settings with no option selected', () => {
  const emptyChoicePolicy = () => ({
    name: 'Empty choice',
    settings: [
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
          },
        },
      },
    ],
  })

  it('exposes the selector with its options and nothing selected', () => {
    const leaves = buildIntuneSettingLeaves(emptyChoicePolicy(), getDefinition)

    expect(leaves[0].kind).toBe('choice')
    expect(leaves[0].options).toHaveLength(2)
    expect(defaultValueForLeaf(leaves[0])).toBeUndefined()
  })

  it('does not invent an empty value when the selector is left alone', () => {
    const original = emptyChoicePolicy()
    const leaves = buildIntuneSettingLeaves(original, getDefinition)
    const edited = applyIntuneSettingEdits(
      original,
      leaves,
      leaves.map(defaultValueForLeaf)
    )

    expect(
      'value' in edited.settings[0].settingInstance.choiceSettingValue
    ).toBe(false)
    expect(edited).toEqual(original)
  })

  it('writes the option id once one is chosen', () => {
    const original = emptyChoicePolicy()
    const leaves = buildIntuneSettingLeaves(original, getDefinition)
    const edited = applyIntuneSettingEdits(original, leaves, [
      {
        label: 'Enabled',
        value:
          'device_vendor_msft_policy_config_defender_allowrealtimemonitoring_1',
      },
    ])

    expect(edited.settings[0].settingInstance.choiceSettingValue.value).toBe(
      'device_vendor_msft_policy_config_defender_allowrealtimemonitoring_1'
    )
  })
})

// The type of an unset field comes from the @odata.type on its value object, which Intune sends
// whether or not a value is present - so an empty integer stays an integer rather than defaulting
// to a string field that would write "" back over a numeric setting.
describe('unset settings keep their declared type', () => {
  const emptyOfType = (valueODataType) => ({
    name: 'Typed',
    settings: [
      {
        '@odata.type': '#microsoft.graph.deviceManagementConfigurationSetting',
        settingInstance: {
          '@odata.type':
            '#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance',
          settingDefinitionId: 'collection_setting',
          simpleSettingValue: { '@odata.type': valueODataType },
        },
      },
    ],
  })

  it.each([
    ['StringSettingValue', 'string'],
    ['IntegerSettingValue', 'integer'],
    ['SecretSettingValue', 'secret'],
  ])('reads %s as %s', (odataSuffix, expected) => {
    const leaves = buildIntuneSettingLeaves(
      emptyOfType(
        `#microsoft.graph.deviceManagementConfiguration${odataSuffix}`
      ),
      getDefinition
    )

    expect(leaves[0].kind).toBe('simple')
    expect(leaves[0].valueType).toBe(expected)
  })
})

// The editor groups settings into collapsible categories. A regenerated catalog carries Intune's
// own category name; until then the namespace inside the setting id stands in, so grouping works
// either way and sharpens when the catalog is refreshed.
describe('setting categories', () => {
  it('prefers the catalog category name over the id namespace', () => {
    expect(
      categoryForSetting(
        { categoryName: 'Local Policies Security Options' },
        'device_vendor_msft_policy_config_localpoliciessecurityoptions_accounts_x'
      )
    ).toBe('Local Policies Security Options')
  })

  it('falls back to the id namespace when the catalog has no category', () => {
    expect(
      categoryForSetting(
        {},
        'device_vendor_msft_policy_config_localpoliciessecurityoptions_accounts_x'
      )
    ).toBe('localpoliciessecurityoptions')
    // admx_ is matched ahead of the generic policy_config_ rule, or every administrative template
    // would collapse into a single "admx" category.
    expect(
      categoryForSetting(
        {},
        'device_vendor_msft_policy_config_admx_eventlog_x_y'
      )
    ).toBe('eventlog')
    expect(categoryForSetting({}, 'device_vendor_msft_bitlocker_x_y')).toBe(
      'bitlocker'
    )
    expect(
      categoryForSetting({}, 'vendor_msft_firewall_mdmstore_domainprofile_x')
    ).toBe('firewall')
  })

  it('never leaves a setting without a category', () => {
    expect(categoryForSetting(undefined, 'totally_unexpected')).toBe(
      UNCATEGORISED
    )
    expect(categoryForSetting(undefined, null)).toBe(UNCATEGORISED)
  })

  it('puts a nested child in its parent category rather than one of its own', () => {
    const leaves = buildIntuneSettingLeaves(catalogPolicy(), getDefinition)
    const choice = leaves[1]
    const nestedChild = leaves[2]

    expect(nestedChild.depth).toBe(1)
    expect(nestedChild.category).toBe(choice.category)
  })

  it('gives every leaf of a policy a category', () => {
    const leaves = buildIntuneSettingLeaves(catalogPolicy(), getDefinition)
    expect(leaves.every((leaf) => Boolean(leaf.category))).toBe(true)
  })
})

// Sections are keyed on the category id, not its name: Intune has thirteen categories called
// "Security", and grouping by name fused Event Log Service's settings with Remote Desktop's.
describe('category keys', () => {
  it('separates same-named categories by id', () => {
    const eventLog = { categoryId: 'cat-a', categoryName: 'Security' }
    const remoteDesktop = { categoryId: 'cat-b', categoryName: 'Security' }

    expect(categoryForSetting(eventLog, 'x')).toBe(
      categoryForSetting(remoteDesktop, 'x')
    )
    expect(categoryKeyForSetting(eventLog, 'x')).not.toBe(
      categoryKeyForSetting(remoteDesktop, 'x')
    )
  })

  it('ignores a category id that has no name, so unrelated settings do not fuse', () => {
    // One real category ships with an empty display name and some ids settings point at are
    // missing from the category list. Keying on those piled printers, file explorer and
    // connectivity into a single section under whichever heading came first.
    const nameless = { categoryId: 'shared-nameless-id' }

    expect(
      categoryKeyForSetting(
        nameless,
        'device_vendor_msft_policy_config_printers_x'
      )
    ).toBe('printers')
    expect(
      categoryKeyForSetting(
        nameless,
        'device_vendor_msft_policy_config_fileexplorer_x'
      )
    ).toBe('fileexplorer')
  })

  it('gives every leaf a key, and keeps a nested child on its parent key', () => {
    const leaves = buildIntuneSettingLeaves(catalogPolicy(), getDefinition)

    expect(leaves.every((leaf) => Boolean(leaf.categoryKey))).toBe(true)
    expect(leaves[2].categoryKey).toBe(leaves[1].categoryKey)
  })
})
