// A settings catalog policy is a recursive tree of setting instances rather than a flat object.
// Two things in CIPP already walk that tree: Compare-CIPPIntuneObject (Catalog mode) on the backend
// and CippJSONView on the frontend, both to turn it into label/value pairs. This walks it once more,
// to the same depth, but emits an editable field per value instead of a read-only row - so the
// editor understands exactly as much of a policy as the compare tool does.
//
// The walk records the exact JSON path of every value it can edit. Edits are written back into a
// clone of the original policy at those paths, which means everything the walk does not understand
// travels through untouched - most importantly the @odata.type discriminators Intune rejects a
// policy for missing. Nothing is ever reconstructed from form state.

const ODATA = '@odata.type'

// Intune types a simple value by its @odata.type. Getting this wrong is not cosmetic: writing "300"
// where Intune expects 300 makes the policy fail to deploy.
const valueTypeFromODataType = (odataType) => {
  if (typeof odataType !== 'string') return 'string'
  if (odataType.includes('Integer')) return 'integer'
  if (odataType.includes('Secret')) return 'secret'
  return 'string'
}

// What kind of setting an instance is, is told by which value object it carries - not by whether
// that object has a value yet. Intune emits an unset field as a value object with no `value` at
// all: an ADMX text box left blank, or a setting whose sibling toggle is off, arrives as
// { "@odata.type": "...StringSettingValue" }. Requiring a value here classified those as an
// unknown type, which rendered them read-only and, because applyIntuneSettingEdits skips
// unsupported leaves, left no way to ever fill them in.
const hasSettingValue = (settingValue) =>
  Boolean(settingValue) && typeof settingValue === 'object'

const optionsFromDefinition = (definition) =>
  (Array.isArray(definition?.options) ? definition.options : []).map(
    (option) => ({
      label: option.displayName || option.id,
      value: option.id,
    })
  )

// Settings with no category to sit under, and the label for classic policies whose properties are
// not categorised at all.
export const UNCATEGORISED = 'Other settings'

// Intune presents settings under categories in its own console. The catalog carries the category
// name once Update-IntuneCollection.ps1 has been run against a tenant that can read
// deviceManagement/configurationCategories; until then the namespace inside the setting id is the
// closest stand-in, since that is broadly what the category follows anyway. Grouping therefore
// works before the catalog is regenerated and sharpens afterwards with no code change.
const categoryFromDefinitionId = (definitionId) => {
  if (typeof definitionId !== 'string' || !definitionId) return UNCATEGORISED

  // Most specific first: the admx_ prefix would otherwise swallow every administrative template
  // into one category.
  const namespacePatterns = [
    /^device_vendor_msft_policy_config_admx_([^_]+)_/,
    /^device_vendor_msft_policy_config_([^_]+)_/,
    /^device_vendor_msft_([^_]+)_/,
    /^vendor_msft_([^_]+)_/,
  ]

  for (const pattern of namespacePatterns) {
    const match = definitionId.match(pattern)
    if (match) return match[1]
  }

  return UNCATEGORISED
}

// Resolved once per top-level setting: a nested child belongs in the same category as the setting
// it hangs off, not in one of its own.
export const categoryForSetting = (definition, definitionId) =>
  definition?.categoryName || categoryFromDefinitionId(definitionId)

// Category display names are not unique - Intune has thirteen categories called "Security" - so the
// id is what settings are grouped by, and the name is only what the group is labelled with.
//
// The id is used only when there is a name to go with it. Some categories have an empty display
// name, and some ids settings point at are missing from the category list entirely; grouping those
// by id piles unrelated settings - printers, file explorer, connectivity - into one section under
// whichever heading happened to come first. Without a name they fall back to the id namespace, so
// they group the way they did before any category data existed.
export const categoryKeyForSetting = (definition, definitionId) =>
  definition?.categoryId && definition?.categoryName
    ? definition.categoryId
    : categoryForSetting(definition, definitionId)

// Builds the ordered list of editable leaves. Order is stable for a given policy, which is what lets
// the form address them by index instead of by a path containing '@odata.' - a string react-hook-form
// would otherwise split into a nested object and corrupt.
export const buildIntuneSettingLeaves = (policy, getDefinition) => {
  const leaves = []
  if (!policy || typeof policy !== 'object') return leaves

  const pushLeaf = (leaf) => {
    leaves.push({ ...leaf, index: leaves.length })
  }

  const walkInstance = (instance, path, depth, groupLabel, category) => {
    if (!instance || typeof instance !== 'object') return

    const definitionId = instance.settingDefinitionId
    const definition = getDefinition(definitionId)
    const label = definition?.displayName || definitionId || 'Setting'
    const common = {
      label,
      definitionId,
      depth,
      groupLabel,
      category: category?.name,
      categoryKey: category?.key,
      helpText: definition?.helpText || definition?.description || null,
      infoUrls: Array.isArray(definition?.infoUrls) ? definition.infoUrls : [],
    }

    // A group collection holds no value of its own; every editable thing is in its children.
    if (Array.isArray(instance.groupSettingCollectionValue)) {
      instance.groupSettingCollectionValue.forEach((groupValue, groupIndex) => {
        const children = Array.isArray(groupValue?.children)
          ? groupValue.children
          : []
        children.forEach((child, childIndex) => {
          walkInstance(
            child,
            [
              ...path,
              'groupSettingCollectionValue',
              groupIndex,
              'children',
              childIndex,
            ],
            depth + 1,
            label,
            category
          )
        })
      })
      return
    }

    if (hasSettingValue(instance.simpleSettingValue)) {
      pushLeaf({
        ...common,
        kind: 'simple',
        path: [...path, 'simpleSettingValue', 'value'],
        valueType: valueTypeFromODataType(instance.simpleSettingValue[ODATA]),
        value: instance.simpleSettingValue.value,
      })
      return
    }

    if (hasSettingValue(instance.choiceSettingValue)) {
      const children = Array.isArray(instance.choiceSettingValue.children)
        ? instance.choiceSettingValue.children
        : []

      pushLeaf({
        ...common,
        kind: 'choice',
        path: [...path, 'choiceSettingValue', 'value'],
        options: optionsFromDefinition(definition),
        value: instance.choiceSettingValue.value,
        // Intune swaps the child settings when the selected option changes. CIPP has no dependency
        // data to do the same, so the children below stay as they were and the field says so.
        hasDependentChildren: children.length > 0,
      })

      children.forEach((child, childIndex) => {
        walkInstance(
          child,
          [...path, 'choiceSettingValue', 'children', childIndex],
          depth + 1,
          label,
          category
        )
      })
      return
    }

    if (Array.isArray(instance.choiceSettingCollectionValue)) {
      pushLeaf({
        ...common,
        kind: 'choiceCollection',
        // Points at the array, not a value inside it, because editing can change its length.
        path: [...path, 'choiceSettingCollectionValue'],
        options: optionsFromDefinition(definition),
        items: instance.choiceSettingCollectionValue,
        value: instance.choiceSettingCollectionValue.map((item) => item?.value),
      })
      return
    }

    if (Array.isArray(instance.simpleSettingCollectionValue)) {
      pushLeaf({
        ...common,
        kind: 'simpleCollection',
        path: [...path, 'simpleSettingCollectionValue'],
        items: instance.simpleSettingCollectionValue,
        valueType: valueTypeFromODataType(
          instance.simpleSettingCollectionValue[0]?.[ODATA]
        ),
        value: instance.simpleSettingCollectionValue.map((item) => item?.value),
      })
      return
    }

    // Rendered read-only rather than dropped, so a policy never looks emptier than it is.
    pushLeaf({ ...common, kind: 'unsupported' })
  }

  if (Array.isArray(policy.settings)) {
    policy.settings.forEach((setting, index) => {
      const instance = setting?.settingInstance
      const definition = getDefinition(instance?.settingDefinitionId)
      walkInstance(instance, ['settings', index, 'settingInstance'], 0, null, {
        name: categoryForSetting(definition, instance?.settingDefinitionId),
        key: categoryKeyForSetting(definition, instance?.settingDefinitionId),
      })
    })
  }

  if (Array.isArray(policy.omaSettings)) {
    policy.omaSettings.forEach((omaSetting, index) => {
      pushLeaf({
        kind: 'oma',
        label:
          omaSetting?.displayName ||
          omaSetting?.omaUri ||
          `OMA setting ${index + 1}`,
        definitionId: omaSetting?.omaUri,
        depth: 0,
        groupLabel: null,
        category: 'OMA-URI settings',
        categoryKey: 'OMA-URI settings',
        helpText: omaSetting?.description || null,
        infoUrls: [],
        path: ['omaSettings', index, 'value'],
        valueType: omaSetting?.[ODATA]?.includes('Integer')
          ? 'integer'
          : 'string',
        value: omaSetting?.value,
      })
    })
  }

  return leaves
}

// Properties that are Intune's to set, not a template's to carry. Kept out of the editor so an
// operator cannot edit a value that deployment overwrites anyway.
const READ_ONLY_PROPERTIES = [
  'id',
  'createdDateTime',
  'lastModifiedDateTime',
  'modifiedDateTime',
  'version',
  'supportsScopeTags',
  'roleScopeTagIds',
  'isAssigned',
  'settingCount',
  'creationSource',
  'priorityMetaData',
  'deviceManagementApplicabilityRuleOsEdition',
  'deviceManagementApplicabilityRuleOsVersion',
  'deviceManagementApplicabilityRuleDeviceMode',
  'deviceStatusOverview',
  'deviceSettingStateSummaries',
  'assignments',
  'templateReference',
]

// The name and description are edited as template metadata at the top of the page, and the backend
// syncs them back into the policy body, so they must not also appear as body fields.
const IDENTITY_PROPERTIES = ['name', 'displayName', 'description']

// Classic device configuration policies are a flat object of typed properties rather than a setting
// tree. They get the same leaf treatment for the same reason: patching by path is what keeps their
// root @odata.type - the property that decides which Graph endpoint they deploy to - intact.
export const buildIntunePropertyLeaves = (policy, translate = (key) => key) => {
  const leaves = []
  if (!policy || typeof policy !== 'object') return leaves

  const pushLeaf = (leaf) => {
    leaves.push({ ...leaf, index: leaves.length })
  }

  const walk = (node, path, depth, groupLabel) => {
    Object.entries(node).forEach(([key, value]) => {
      if (key.includes(ODATA) || key.includes('@odata') || key.startsWith('#'))
        return
      if (READ_ONLY_PROPERTIES.includes(key)) return
      if (depth === 0 && IDENTITY_PROPERTIES.includes(key)) return
      if (value === null || value === undefined) return

      const nextPath = [...path, key]
      const common = {
        label: translate(key),
        definitionId: nextPath.join('.'),
        depth,
        groupLabel,
        // A classic policy has no setting catalog behind it, so the nested object a property sits
        // under is the only grouping there is; top-level properties fall back to the shared label.
        category: groupLabel || UNCATEGORISED,
        categoryKey: groupLabel || UNCATEGORISED,
        helpText: null,
        infoUrls: [],
        path: nextPath,
      }

      if (typeof value === 'boolean') {
        pushLeaf({ ...common, kind: 'boolean', valueType: 'boolean', value })
        return
      }

      if (typeof value === 'number') {
        pushLeaf({ ...common, kind: 'simple', valueType: 'integer', value })
        return
      }

      if (typeof value === 'string') {
        pushLeaf({ ...common, kind: 'simple', valueType: 'string', value })
        return
      }

      if (Array.isArray(value)) {
        if (
          value.every(
            (item) => typeof item === 'string' || typeof item === 'number'
          )
        ) {
          pushLeaf({
            ...common,
            kind: 'primitiveArray',
            valueType: value.every((item) => typeof item === 'number')
              ? 'integer'
              : 'string',
            value,
          })
          return
        }
        value.forEach((item, itemIndex) => {
          if (item && typeof item === 'object') {
            walk(
              item,
              [...nextPath, itemIndex],
              depth + 1,
              `${translate(key)} ${itemIndex + 1}`
            )
          }
        })
        return
      }

      if (typeof value === 'object') {
        walk(value, nextPath, depth + 1, translate(key))
      }
    })
  }

  walk(policy, [], 0, null)
  return leaves
}

// The form value for a leaf, in the shape the field that renders it hands back.
export const defaultValueForLeaf = (leaf) => {
  const asOption = (value, options) => {
    const match = (options || []).find((option) => option.value === value)
    return { label: match?.label ?? String(value ?? ''), value }
  }

  switch (leaf.kind) {
    case 'choice':
      // A choice that has never been set has no option selected, and Intune expects an option id
      // rather than a blank. Handing back undefined keeps it out of applyIntuneSettingEdits, so it
      // round-trips as imported instead of gaining a "value": "" the policy never had.
      return leaf.value === undefined || leaf.value === null
        ? undefined
        : asOption(leaf.value, leaf.options)
    case 'choiceCollection':
      return (leaf.value || []).map((value) => asOption(value, leaf.options))
    case 'simpleCollection':
    case 'primitiveArray':
      return (leaf.value || []).map((value) => ({
        label: String(value ?? ''),
        value,
      }))
    case 'boolean':
      return { label: leaf.value ? 'True' : 'False', value: leaf.value }
    case 'unsupported':
      return undefined
    default:
      // Numbers are handed over as text: the shared text field renders `value || ''`, which would
      // blank out a legitimate 0. Coercion converts it back on save.
      return typeof leaf.value === 'number' ? String(leaf.value) : leaf.value
  }
}

export const unwrap = (value) =>
  value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  'value' in value
    ? value.value
    : value

// Templates can hold CIPP variables such as %tenantname% in place of a literal value; they are
// substituted into the serialized policy at deployment time by Get-CIPPTextReplacement.
export const containsVariable = (value) =>
  typeof value === 'string' && /%[^%\s]+%/.test(value)

const coerceScalar = (raw, valueType, fallback) => {
  const value = unwrap(raw)

  // A variable stands in for the value and is only resolved at deployment, so it is stored verbatim
  // whatever the setting's declared type is. Without this the type coercion below would read it as
  // an unparseable number or a non-boolean and quietly restore the old value instead.
  if (containsVariable(value)) return value

  if (valueType === 'boolean') {
    if (typeof value === 'boolean') return value
    if (value === 'true' || value === 'True') return true
    if (value === 'false' || value === 'False') return false
    return fallback
  }
  if (valueType !== 'integer') return value ?? ''
  if (value === '' || value === null || value === undefined) return fallback
  const asNumber = Number(value)
  // An unparseable number would deploy as NaN, so the stored value wins instead.
  return Number.isFinite(asNumber) ? asNumber : fallback
}

const setAtPath = (target, path, value) => {
  let node = target
  for (let i = 0; i < path.length - 1; i += 1) {
    if (node === null || typeof node !== 'object') return
    node = node[path[i]]
  }
  if (node === null || typeof node !== 'object') return
  node[path[path.length - 1]] = value
}

// Writes the edited values into a clone of the original policy. The clone is the point: every
// property not addressed by a leaf path survives exactly as imported.
export const applyIntuneSettingEdits = (originalPolicy, leaves, formValues) => {
  const patched = structuredClone(originalPolicy)
  const values = Array.isArray(formValues) ? formValues : []

  leaves.forEach((leaf) => {
    if (leaf.kind === 'unsupported') return

    const raw = values[leaf.index]
    if (raw === undefined) return

    // A plain array of scalars on a classic policy - no per-item wrapper object to preserve.
    if (leaf.kind === 'primitiveArray') {
      const entries = Array.isArray(raw) ? raw : []
      setAtPath(
        patched,
        leaf.path,
        entries.map((entry) =>
          coerceScalar(entry, leaf.valueType, unwrap(entry))
        )
      )
      return
    }

    if (leaf.kind === 'choiceCollection' || leaf.kind === 'simpleCollection') {
      const entries = Array.isArray(raw) ? raw : []
      const next = entries.map((entry, entryIndex) => {
        // Reuse the original item so its @odata.type and any other properties carry over; new
        // entries inherit the shape of the first existing one.
        const template = leaf.items?.[entryIndex] ?? leaf.items?.[0] ?? {}
        return {
          ...structuredClone(template),
          value: coerceScalar(entry, leaf.valueType, unwrap(entry)),
        }
      })
      setAtPath(patched, leaf.path, next)
      return
    }

    setAtPath(patched, leaf.path, coerceScalar(raw, leaf.valueType, leaf.value))
  })

  return patched
}
