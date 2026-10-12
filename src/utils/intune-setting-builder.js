// Builds a settings catalog settingInstance from a setting definition (see
// build/tools/Update-IntuneCollection.ps1 for the construction fields it reads). Anything that
// cannot be built faithfully returns null rather than guessing: a setting with the wrong
// discriminator saves cleanly and is rejected on deploy.

const PREFIX = '#microsoft.graph.deviceManagementConfiguration'

const INSTANCE_TYPE_BY_DEFINITION = {
  [`${PREFIX}ChoiceSettingDefinition`]: `${PREFIX}ChoiceSettingInstance`,
  [`${PREFIX}SimpleSettingDefinition`]: `${PREFIX}SimpleSettingInstance`,
  [`${PREFIX}ChoiceSettingCollectionDefinition`]: `${PREFIX}ChoiceSettingCollectionInstance`,
  [`${PREFIX}SimpleSettingCollectionDefinition`]: `${PREFIX}SimpleSettingCollectionInstance`,
  [`${PREFIX}SettingGroupDefinition`]: `${PREFIX}GroupSettingInstance`,
  [`${PREFIX}SettingGroupCollectionDefinition`]: `${PREFIX}GroupSettingCollectionInstance`,
}

const SIMPLE_VALUE_BY_DEFINITION = {
  [`${PREFIX}IntegerSettingValueDefinition`]: {
    type: `${PREFIX}IntegerSettingValue`,
    empty: 0,
  },
  [`${PREFIX}StringSettingValueDefinition`]: {
    type: `${PREFIX}StringSettingValue`,
    empty: '',
  },
  [`${PREFIX}SecretSettingValueDefinition`]: {
    type: `${PREFIX}SecretSettingValue`,
    empty: '',
  },
}

export const definitionInstanceType = (definition) =>
  INSTANCE_TYPE_BY_DEFINITION[definition?.['@odata.type']] ?? null

const simpleValueFor = (definition) => {
  const valueDefinition = definition?.valueDefinition
  const spec = SIMPLE_VALUE_BY_DEFINITION[valueDefinition?.['@odata.type']]
  if (!spec) return null

  const empty =
    spec.type === `${PREFIX}IntegerSettingValue` &&
    typeof valueDefinition.minimumValue === 'number'
      ? valueDefinition.minimumValue
      : spec.empty

  // A string with a required length or format has no valid empty value, so it cannot be seeded.
  if (typeof empty === 'string') {
    if (
      typeof valueDefinition.minimumLength === 'number' &&
      empty.length < valueDefinition.minimumLength
    )
      return null
    if (valueDefinition.inputValidationSchema) {
      try {
        if (!new RegExp(valueDefinition.inputValidationSchema).test(empty))
          return null
      } catch {
        // An unparseable schema is not grounds to refuse the setting.
      }
    }
  }

  const value = { '@odata.type': spec.type, value: empty }
  if (spec.type === `${PREFIX}SecretSettingValue`)
    value.valueState = 'notEncrypted'
  return value
}

const defaultOptionFor = (definition) => {
  const options = Array.isArray(definition?.options) ? definition.options : []
  return (
    options.find((option) => option.id === definition.defaultOptionId) ??
    options[0] ??
    null
  )
}

// Settings an option requires. The link is recorded only on the parent's option.
export const requiredChildIds = (definition, optionId) => {
  const options = Array.isArray(definition?.options) ? definition.options : []
  const option = options.find((candidate) => candidate.id === optionId)
  return (option?.dependedOnBy ?? [])
    .filter((link) => link?.required)
    .map((link) => link?.dependedOnBy)
    .filter(Boolean)
}

// Members of a group: childIds, falling back to the group's own dependedOnBy links.
export const childDefinitionIds = (definition) => {
  if (Array.isArray(definition?.childIds) && definition.childIds.length > 0) {
    return definition.childIds
  }
  return (
    Array.isArray(definition?.dependedOnBy) ? definition.dependedOnBy : []
  )
    .map((link) => link?.dependedOnBy)
    .filter(Boolean)
}

const buildChildren = (ids, childDefinitionsById) =>
  ids
    .map((childId) =>
      buildSettingInstance(childDefinitionsById[childId], childDefinitionsById)
    )
    .filter(Boolean)

export const buildSettingInstance = (definition, childDefinitionsById = {}) => {
  const instanceType = definitionInstanceType(definition)
  if (!instanceType || !definition?.id) return null

  const instance = {
    '@odata.type': instanceType,
    settingDefinitionId: definition.id,
  }

  switch (instanceType) {
    case `${PREFIX}ChoiceSettingInstance`: {
      const option = defaultOptionFor(definition)
      if (!option) return null
      instance.choiceSettingValue = {
        value: option.id,
        children: buildChildren(
          requiredChildIds(definition, option.id),
          childDefinitionsById
        ),
      }
      return instance
    }
    case `${PREFIX}SimpleSettingInstance`: {
      const value = simpleValueFor(definition)
      if (!value) return null
      instance.simpleSettingValue = value
      return instance
    }
    case `${PREFIX}ChoiceSettingCollectionInstance`: {
      const option = defaultOptionFor(definition)
      if (!option) return null
      instance.choiceSettingCollectionValue = [
        { value: option.id, children: [] },
      ]
      return instance
    }
    case `${PREFIX}SimpleSettingCollectionInstance`: {
      const value = simpleValueFor(definition)
      if (!value) return null
      instance.simpleSettingCollectionValue = [value]
      return instance
    }
    // Intune rejects an empty group ("SettingGroupValue should not be empty").
    case `${PREFIX}GroupSettingInstance`: {
      const children = buildChildren(
        childDefinitionIds(definition),
        childDefinitionsById
      )
      if (children.length === 0) return null
      instance.groupSettingValue = { children }
      return instance
    }
    case `${PREFIX}GroupSettingCollectionInstance`: {
      const children = buildChildren(
        childDefinitionIds(definition),
        childDefinitionsById
      )
      if (children.length === 0) return null
      instance.groupSettingCollectionValue = [{ children }]
      return instance
    }
    default:
      return null
  }
}

export const buildSetting = (definition, childDefinitionsById = {}) => {
  const instance = buildSettingInstance(definition, childDefinitionsById)
  return instance
    ? { '@odata.type': `${PREFIX}Setting`, settingInstance: instance }
    : null
}

export const policyHasSetting = (policy, definitionId) =>
  (policy?.settings ?? []).some(
    (setting) => setting?.settingInstance?.settingDefinitionId === definitionId
  )

// Intune rejects the whole policy when a collection exceeds its bounds (the ASR rules group allows one row).
export const collectionCountBounds = (definition) => ({
  minimum:
    typeof definition?.minimumCount === 'number' ? definition.minimumCount : 0,
  maximum:
    typeof definition?.maximumCount === 'number'
      ? definition.maximumCount
      : Infinity,
})

export const canAddCollectionEntry = (definition, currentCount) =>
  currentCount < collectionCountBounds(definition).maximum

export const canRemoveCollectionEntry = (definition, currentCount) =>
  currentCount > collectionCountBounds(definition).minimum

// A copy of a group collection row with values cleared; structure and discriminators kept. Choices
// keep their option, since an unset choice is not a value Intune accepts.
export const clearGroupRowValues = (row) => {
  const emptyFor = (value) =>
    value?.['@odata.type'] === `${PREFIX}IntegerSettingValue` ? 0 : ''
  const clearInstance = (instance) => {
    if (!instance || typeof instance !== 'object') return instance
    const copy = { ...instance }
    if (copy.simpleSettingValue) {
      copy.simpleSettingValue = {
        ...copy.simpleSettingValue,
        value: emptyFor(copy.simpleSettingValue),
      }
    }
    if (copy.simpleSettingCollectionValue) {
      copy.simpleSettingCollectionValue = copy.simpleSettingCollectionValue.map(
        (entry) => ({
          ...entry,
          value: emptyFor(entry),
        })
      )
    }
    if (copy.choiceSettingValue) {
      copy.choiceSettingValue = {
        ...copy.choiceSettingValue,
        children: (copy.choiceSettingValue.children ?? []).map(clearInstance),
      }
    }
    if (copy.groupSettingCollectionValue) {
      copy.groupSettingCollectionValue = copy.groupSettingCollectionValue.map(
        (entry) => ({
          ...entry,
          children: (entry?.children ?? []).map(clearInstance),
        })
      )
    }
    return copy
  }
  return { ...row, children: (row?.children ?? []).map(clearInstance) }
}

export const isGroupCollectionInstance = (instance) =>
  instance?.['@odata.type'] === `${PREFIX}GroupSettingCollectionInstance`
