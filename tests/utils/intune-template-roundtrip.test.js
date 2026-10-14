import { describe, expect, it } from 'vitest'
import {
  applyIntuneSettingEdits,
  buildIntunePropertyLeaves,
  buildIntuneSettingLeaves,
  defaultValueForLeaf,
} from '../../src/utils/intune-template-leaves'
import {
  capturedTemplates,
  deployedPolicies,
  getCatalogDefinition,
} from '../mocks/intune-catalog'

// Opening a template in the editor and saving it without touching a field must give back exactly the
// JSON that was opened, byte for byte: the editor is used on templates captured from tenants, and a
// key it drops, reorders or retypes is a silent change to what every later deployment sends to Intune.

const isAdminTemplate = (policy) =>
  Array.isArray(policy?.added) || Array.isArray(policy?.definitionValues)

// Same choice of leaf builder as src/hooks/use-intune-policy-editor.js.
const leavesFor = (policy, getDefinition = getCatalogDefinition) =>
  Array.isArray(policy?.settings) || Array.isArray(policy?.omaSettings)
    ? buildIntuneSettingLeaves(policy, getDefinition)
    : buildIntunePropertyLeaves(policy)

const saveUnchanged = (policy, getDefinition) => {
  const leaves = leavesFor(policy, getDefinition)
  return applyIntuneSettingEdits(
    policy,
    leaves,
    leaves.map(defaultValueForLeaf)
  )
}

const diffPaths = (a, b, path = []) => {
  if (JSON.stringify(a) === JSON.stringify(b)) return []
  if (
    a &&
    b &&
    typeof a === 'object' &&
    typeof b === 'object' &&
    Array.isArray(a) === Array.isArray(b)
  ) {
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((key) =>
      diffPaths(a[key], b[key], [...path, key])
    )
  }
  return [path.join('.')]
}

const editable = capturedTemplates.filter(
  (template) => !isAdminTemplate(template.Policy)
)
const catalog = capturedTemplates.filter((template) =>
  Array.isArray(template.Policy?.settings)
)

const instancesOf = (policy) => {
  const found = []
  const visit = (node) => {
    if (Array.isArray(node)) return node.forEach(visit)
    if (!node || typeof node !== 'object') return
    if (node.settingDefinitionId) found.push(node)
    Object.values(node).forEach(visit)
  }
  visit(policy)
  return found
}

// Every setting from every Windows catalog template in one policy, the size of a large baseline.
const largePolicy = {
  name: 'Every captured Windows setting',
  platforms: 'windows10',
  technologies: 'mdm',
  settings: [
    ...new Map(
      catalog
        .filter((template) => template.Policy.platforms === 'windows10')
        .flatMap((template) => template.Policy.settings)
        .map((setting) => [
          setting.settingInstance.settingDefinitionId,
          setting,
        ])
    ).values(),
  ],
}

describe('the template corpus', () => {
  it('covers small and large templates of every editable kind', () => {
    const counts = catalog.map(
      (template) => instancesOf(template.Policy).length
    )
    expect(Math.min(...counts)).toBeLessThanOrEqual(2)
    expect(Math.max(...counts)).toBeGreaterThanOrEqual(30)
    expect(instancesOf(largePolicy).length).toBeGreaterThanOrEqual(150)
    expect(new Set(editable.map((template) => template.Type))).toEqual(
      new Set([
        'Catalog',
        'Device',
        'deviceCompliancePolicies',
        'AppProtection',
      ])
    )
  })
})

describe('saving a template unchanged', () => {
  it.each(editable.map((template) => [template.name, template.Policy]))(
    'gives back %s exactly',
    (_, policy) => {
      expect(JSON.stringify(saveUnchanged(policy))).toBe(JSON.stringify(policy))
    }
  )

  it('gives back a policy holding every captured Windows setting exactly', () => {
    expect(JSON.stringify(saveUnchanged(largePolicy))).toBe(
      JSON.stringify(largePolicy)
    )
  })

  it.each(
    deployedPolicies
      .filter((policy) => policy.Recaptured)
      .map((policy) => [policy.name, policy.Recaptured])
  )('gives back the %s policy as Intune returned it', (_, policy) => {
    expect(JSON.stringify(saveUnchanged(policy))).toBe(JSON.stringify(policy))
  })

  it('does not modify the template it was handed', () => {
    const policy = structuredClone(largePolicy)
    saveUnchanged(policy)
    expect(policy).toEqual(largePolicy)
  })
})

// Damage a template can arrive with: an old capture, a hand-edited import, a setting Intune has since
// retired, or a catalog that failed to load. None of it is the editor's to repair, so it must pass
// through untouched.
const damage = {
  'the catalog cannot be loaded': (policy) => [policy, () => undefined],
  'a setting has been retired from the catalog': (policy) => {
    policy.settings[0].settingInstance.settingDefinitionId =
      'device_vendor_msft_retired_setting'
    return [policy]
  },
  'instances have lost their @odata.type': (policy) => {
    instancesOf(policy).forEach((instance, index) => {
      if (index % 2 === 0) delete instance['@odata.type']
    })
    return [policy]
  },
  'an instance has a type this version does not know': (policy) => {
    policy.settings[0].settingInstance = {
      '@odata.type':
        '#microsoft.graph.deviceManagementConfigurationFutureSettingInstance',
      settingDefinitionId:
        policy.settings[0].settingInstance.settingDefinitionId,
      futureSettingValue: { shape: ['unknown', { nested: null }] },
    }
    return [policy]
  },
  'values are null': (policy) => {
    instancesOf(policy).forEach((instance) => {
      if (instance.choiceSettingValue) instance.choiceSettingValue.value = null
      if (instance.simpleSettingValue) instance.simpleSettingValue.value = null
    })
    return [policy]
  },
  'choices have no children array': (policy) => {
    instancesOf(policy).forEach((instance) => {
      if (instance.choiceSettingValue)
        delete instance.choiceSettingValue.children
    })
    return [policy]
  },
  'collections are empty': (policy) => {
    instancesOf(policy).forEach((instance) => {
      if (instance.simpleSettingCollectionValue)
        instance.simpleSettingCollectionValue = []
      if (instance.choiceSettingCollectionValue)
        instance.choiceSettingCollectionValue = []
      if (instance.groupSettingCollectionValue)
        instance.groupSettingCollectionValue = []
    })
    return [policy]
  },
  'properties this version does not know are present': (policy) => {
    policy.cippFutureProperty = { list: [1, 'two', { three: null }] }
    instancesOf(policy).forEach((instance) => {
      instance.settingInstanceTemplateReference ??= { unknown: true }
    })
    return [policy]
  },
  'values hold CIPP variables': (policy) => {
    instancesOf(policy).forEach((instance) => {
      if (instance.simpleSettingValue)
        instance.simpleSettingValue.value = '%tenantid%'
      if (instance.choiceSettingValue)
        instance.choiceSettingValue.value = '%choicevariable%'
    })
    return [policy]
  },
  'a settings entry is empty or has no instance': (policy) => {
    policy.settings.push(null, {}, { settingInstance: null })
    return [policy]
  },
}

describe('saving a damaged template unchanged', () => {
  const cases = Object.entries(damage).flatMap(([damageName, apply]) =>
    [
      ...catalog.map((t) => [t.name, t.Policy]),
      ['the large policy', largePolicy],
    ].map(([name, policy]) => [damageName, name, apply, policy])
  )

  it.each(cases)(
    'gives it back exactly when %s (%s)',
    (_, __, apply, policy) => {
      const [damaged, getDefinition] = apply(structuredClone(policy))
      const expected = JSON.stringify(damaged)
      expect(JSON.stringify(saveUnchanged(damaged, getDefinition))).toBe(
        expected
      )
    }
  )

  it.each(
    editable
      .filter((template) => !Array.isArray(template.Policy?.settings))
      .map((template) => [template.name, template.Policy])
  )(
    'gives back %s exactly with nulls and unknown properties added',
    (_, policy) => {
      const damaged = structuredClone(policy)
      damaged.cippFutureProperty = { nested: [null, { deeper: [] }] }
      for (const key of Object.keys(damaged)) {
        if (typeof damaged[key] === 'string' && key !== '@odata.type')
          damaged[key] = null
      }
      const expected = JSON.stringify(damaged)
      expect(JSON.stringify(saveUnchanged(damaged))).toBe(expected)
    }
  )
})

// The edit a technician makes lands where they made it and nowhere else.
describe('editing one field of a template', () => {
  const editFor = (leaf) => {
    if (leaf.kind === 'choice') {
      const other = leaf.options?.find((option) => option.value !== leaf.value)
      return other && { label: other.label, value: other.value }
    }
    if (leaf.kind === 'simple' && leaf.valueType === 'integer')
      return String(Number(leaf.value ?? 0) + 1)
    if (leaf.kind === 'simple' && leaf.valueType !== 'integer')
      return `${leaf.value ?? ''}-edited`
    return undefined
  }

  const cases = editable.flatMap((template) => {
    const leaves = leavesFor(template.Policy)
    return leaves
      .filter((leaf) => editFor(leaf) !== undefined)
      .slice(0, 3)
      .map((leaf) => [template.name, leaf.label, template.Policy, leaf.index])
  })

  it('has edits to make in most templates', () => {
    expect(new Set(cases.map(([name]) => name)).size).toBeGreaterThanOrEqual(
      editable.length - 5
    )
  })

  it.each(cases)(
    '%s: changing "%s" touches only its own value',
    (_, __, policy, index) => {
      const leaves = leavesFor(policy)
      const values = leaves.map(defaultValueForLeaf)
      values[index] = editFor(leaves[index])
      const saved = applyIntuneSettingEdits(policy, leaves, values)
      expect(diffPaths(policy, saved)).toEqual([leaves[index].path.join('.')])
    }
  )
})
