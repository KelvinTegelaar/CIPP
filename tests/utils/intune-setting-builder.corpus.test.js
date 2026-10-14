import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  buildSettingInstance,
  childDefinitionIds,
} from '../../src/utils/intune-setting-builder'
import { fetchIntuneDescendants } from '../../src/hooks/use-intune-collection'
import {
  DEFINITION_ROOT,
  capturedTemplates,
  catalogFetch,
  deployedPolicies,
  getCatalogDefinition,
  readSearchIndex,
} from '../mocks/intune-catalog'

const childrenOf = (instance) => [
  ...(instance.choiceSettingValue?.children ?? []),
  ...(instance.groupSettingValue?.children ?? []),
  ...(instance.groupSettingCollectionValue?.[0]?.children ?? []),
  ...(instance.choiceSettingCollectionValue?.[0]?.children ?? []),
]

const descendantsOf = (instance, into = new Map()) => {
  for (const child of childrenOf(instance)) {
    into.set(child.settingDefinitionId, child)
    descendantsOf(child, into)
  }
  return into
}

// What the builder decides: instance types, setting ids and chosen options, in a stable order.
const skeleton = (instance) => ({
  type: instance['@odata.type'],
  id: instance.settingDefinitionId,
  option: instance.choiceSettingValue?.value,
  children: childrenOf(instance)
    .map(skeleton)
    .sort((a, b) => a.id.localeCompare(b.id)),
})

// A string with a required length or format has no valid empty value, so the builder leaves it out
// on purpose rather than seed a value Intune rejects; a technician captures those from a tenant.
const unseedable = (id) => {
  const valueDefinition = getCatalogDefinition(id)?.valueDefinition
  if (valueDefinition?.minimumLength > 0) return true
  try {
    return (
      Boolean(valueDefinition?.inputValidationSchema) &&
      !new RegExp(valueDefinition.inputValidationSchema).test('')
    )
  } catch {
    return false
  }
}
const withoutUnseedable = (shape) =>
  unseedable(shape.id)
    ? null
    : {
        ...shape,
        children: shape.children.map(withoutUnseedable).filter(Boolean),
      }

// Rebuilds a real instance from the catalog, on the options the tenant chose and with every setting
// beneath it that the tenant configured.
const rebuild = (real) => {
  const pinned = {}
  const wanted = new Set()
  for (const [id, instance] of descendantsOf(real)) {
    wanted.add(id)
    const definition = getCatalogDefinition(id)
    if (definition)
      pinned[id] = instance.choiceSettingValue
        ? { ...definition, defaultOptionId: instance.choiceSettingValue.value }
        : definition
  }
  const root = getCatalogDefinition(real.settingDefinitionId)
  return buildSettingInstance(
    real.choiceSettingValue
      ? { ...root, defaultOptionId: real.choiceSettingValue.value }
      : root,
    pinned,
    wanted
  )
}

const realSettings = capturedTemplates
  .filter((template) => Array.isArray(template.Policy?.settings))
  .flatMap((template) =>
    template.Policy.settings.map((setting) => [
      template.name,
      setting.settingInstance.settingDefinitionId,
      setting.settingInstance,
    ])
  )

describe('building the settings real tenants configured', () => {
  it('has settings of every instance type to compare against', () => {
    const types = new Set(
      realSettings.flatMap(([, , instance]) =>
        [instance, ...descendantsOf(instance).values()].map(
          (entry) => entry['@odata.type']
        )
      )
    )
    expect(types.size).toBeGreaterThanOrEqual(5)
  })

  it.each(realSettings)(
    '%s: builds %s in the shape Intune holds it',
    (_, __, real) => {
      const built = rebuild(real)
      const expected = withoutUnseedable(skeleton(real))
      expect(built ? skeleton(built) : null).toEqual(expected)
    }
  )
})

const accepted = deployedPolicies.filter((policy) => policy.Intune.Accepted)

const values = (instance) => ({
  ...skeleton(instance),
  simple: instance.simpleSettingValue && [
    instance.simpleSettingValue['@odata.type'],
    instance.simpleSettingValue.value,
  ],
  collection: instance.simpleSettingCollectionValue?.map((entry) => [
    entry['@odata.type'],
    entry.value,
  ]),
  choices: instance.choiceSettingCollectionValue?.map((entry) => entry.value),
  rows: instance.groupSettingCollectionValue?.length,
  children: childrenOf(instance)
    .map(values)
    .sort((a, b) => a.id.localeCompare(b.id)),
})

describe('policies the builder made and Intune accepted', () => {
  beforeAll(() => {
    vi.stubGlobal('fetch', catalogFetch)
  })
  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('include every instance type the builder makes', () => {
    const types = new Set(
      accepted.flatMap((policy) =>
        policy.Built.settings.flatMap((setting) =>
          [
            setting.settingInstance,
            ...descendantsOf(setting.settingInstance).values(),
          ].map((instance) => instance['@odata.type'].split('Configuration')[1])
        )
      )
    )
    expect(types).toEqual(
      new Set([
        'ChoiceSettingInstance',
        'SimpleSettingInstance',
        'SimpleSettingCollectionInstance',
        'ChoiceSettingCollectionInstance',
        'GroupSettingCollectionInstance',
      ])
    )
  })

  const settings = accepted.flatMap((policy) =>
    policy.Built.settings.map((setting) => [
      policy.name,
      setting.settingInstance.settingDefinitionId,
      setting.settingInstance,
      policy.Recaptured.settings.find(
        (entry) =>
          entry.settingInstance.settingDefinitionId ===
          setting.settingInstance.settingDefinitionId
      )?.settingInstance,
    ])
  )

  it.each(settings)(
    '%s: Intune stored %s exactly as it was built',
    (_, __, built, recaptured) => {
      expect(values(recaptured)).toEqual(values(built))
    }
  )

  it.each(settings)(
    '%s: the builder still builds %s that way',
    async (_, __, built) => {
      const wanted = new Set(descendantsOf(built).keys())
      const definition = getCatalogDefinition(built.settingDefinitionId)
      const rebuilt = buildSettingInstance(
        definition,
        await fetchIntuneDescendants(definition, wanted),
        wanted
      )
      expect(skeleton(rebuilt)).toEqual(skeleton(built))
    }
  )
})

// The catalog files are generated, so these pin the generator's output rather than the code reading it.
describe('the shipped catalog', () => {
  const definitions = fs
    .readdirSync(DEFINITION_ROOT)
    .filter((file) => /^[0-9a-f]{2}\.json$/.test(file))
    .flatMap((file) =>
      Object.values(
        JSON.parse(fs.readFileSync(path.join(DEFINITION_ROOT, file), 'utf8'))
      )
    )

  it.each(['options', 'childIds', 'dependedOnBy', 'dependentOn'])(
    'stores every %s as a list, never a bare object',
    (field) => {
      const unwrapped = definitions
        .filter((definition) => definition[field] != null)
        .filter((definition) => !Array.isArray(definition[field]))
        .map((definition) => definition.id)
      expect(unwrapped).toEqual([])
    }
  )

  it('builds a choice that has a single option', () => {
    const definition = getCatalogDefinition(
      'linux_mdatp_managed_edr_tags_item_key'
    )
    expect(buildSettingInstance(definition)?.choiceSettingValue.value).toBe(
      'linux_mdatp_managed_edr_tags_item_key_0'
    )
  })

  it.each(['windows10', 'macos', 'linux', 'ios'])(
    'gives every nested %s search row a parent chain that ends at a top-level setting',
    (platform) => {
      const rows = new Map(
        readSearchIndex(platform).map((row) => [row.id, row])
      )
      const broken = [...rows.values()]
        .filter((row) => row.parentId)
        .filter((row) => {
          let current = row
          for (let depth = 0; depth < 8 && current?.parentId; depth += 1)
            current = rows.get(current.parentId)
          return !current || current.parentId
        })
        .map((row) => row.id)
      expect(broken).toEqual([])
    }
  )

  it('lists a group member under its group, which links back only through childIds', () => {
    const rows = new Map(readSearchIndex('linux').map((row) => [row.id, row]))
    const group = getCatalogDefinition('linux_mdatp_managed_edr_tags')
    for (const id of childDefinitionIds(group))
      expect(rows.get(id)?.parentId).toBe(group.id)
  })
})
