import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntuneDefinitionResolver } from '../components/CippComponents/CippIntuneSettingsEditor'
import {
  applyIntuneSettingEdits,
  buildIntunePropertyLeaves,
  buildIntuneSettingLeaves,
  unwrap,
} from '../utils/intune-template-leaves'
import { getCippTranslation } from '../utils/get-cipp-translation'
import {
  fetchIntuneDefinition,
  fetchIntuneDefinitions,
  fetchIntuneDescendants,
} from './use-intune-collection'
import {
  buildSetting,
  buildSettingInstance,
  canAddCollectionEntry,
  childDefinitionIds,
  clearGroupRowValues,
  isGroupCollectionInstance,
  mergeSettingInstance,
} from '../utils/intune-setting-builder'

// Shared by the add and edit screens so both produce identical JSON. Values live in form state,
// addressed by position in the leaf list; structure lives in the policy object. Adding or removing a
// setting shifts every later field, so each structural change folds the form values in first.
export const useIntunePolicyEditor = ({ policy, setPolicy, formControl }) => {
  // Structural edits change no field (and the rebuild resets the form), so pages use this to enable Submit.
  const [structureRevision, setStructureRevision] = useState(0)
  const noteStructuralChange = useCallback(
    () => setStructureRevision((n) => n + 1),
    []
  )

  const {
    getDefinition,
    isLoading: definitionsLoading,
    isError: definitionsError,
  } = useIntuneDefinitionResolver(policy)

  // Administrative templates carry their settings as definition references resolved against a
  // tenant, which cannot be presented as fields.
  const isAdminTemplate =
    Array.isArray(policy?.added) || Array.isArray(policy?.definitionValues)
  const isSettingTree =
    Array.isArray(policy?.settings) || Array.isArray(policy?.omaSettings)

  // Only a settings catalog policy has a settings array to add to or remove from. A classic device
  // configuration is a fixed set of properties, so there is nothing there to add.
  const supportsStructuralEdits = Array.isArray(policy?.settings)

  const leaves = useMemo(() => {
    if (!policy || isAdminTemplate || definitionsLoading) return []
    return isSettingTree
      ? buildIntuneSettingLeaves(policy, getDefinition)
      : buildIntunePropertyLeaves(policy, getCippTranslation)
  }, [
    policy,
    getDefinition,
    isAdminTemplate,
    isSettingTree,
    definitionsLoading,
  ])

  const foldValuesIntoPolicy = useCallback(() => {
    if (!policy || leaves.length === 0) return policy
    return applyIntuneSettingEdits(
      policy,
      leaves,
      formControl.getValues().settingValues
    )
  }, [policy, leaves, formControl])

  // A setting already in the policy is only revisited to reach something beneath it (`wanted`).
  const addSetting = useCallback(
    (definition, childDefinitionsById = {}, wanted = new Set()) => {
      const setting = buildSetting(definition, childDefinitionsById, wanted)
      if (!setting) return false

      const folded = foldValuesIntoPolicy()
      const settings = folded.settings ?? []
      const index = settings.findIndex(
        (entry) => entry?.settingInstance?.settingDefinitionId === definition.id
      )
      if (index !== -1 && wanted.size === 0) return false

      setPolicy({
        ...folded,
        settings:
          index === -1
            ? [...settings, setting]
            : settings.map((entry, i) =>
                i === index
                  ? {
                      ...entry,
                      settingInstance: mergeSettingInstance(
                        entry.settingInstance,
                        setting.settingInstance
                      ),
                    }
                  : entry
              ),
      })
      noteStructuralChange()
      return true
    },
    [foldValuesIntoPolicy, setPolicy, noteStructuralChange]
  )

  // Intune swaps the settings nested under a choice when its option changes, so this does too.
  const leavesRef = useRef(leaves)
  leavesRef.current = leaves
  useEffect(() => {
    if (!supportsStructuralEdits) return undefined
    const subscription = formControl.watch((values, { name }) => {
      const match = /^settingValues\.(\d+)$/.exec(name ?? '')
      const leaf = match && leaves[Number(match[1])]
      if (leaf?.kind !== 'choice') return
      const optionId = unwrap(values.settingValues?.[leaf.index])
      const definition = getDefinition(leaf.definitionId)
      if (
        optionId === leaf.value ||
        !definition?.options?.some((option) => option.id === optionId)
      )
        return

      const pinned = { ...definition, defaultOptionId: optionId }
      fetchIntuneDescendants(pinned).then((byId) => {
        // The policy moved on while the definitions loaded; this leaf's position may no longer be its own.
        if (leavesRef.current !== leaves) return
        const built = buildSettingInstance(pinned, byId)
        if (!built) return
        const folded = foldValuesIntoPolicy()
        const path = leaf.path.slice(0, -2)
        const parent = path
          .slice(0, -1)
          .reduce((node, key) => node?.[key], folded)
        const current = parent?.[path.at(-1)]
        if (!current?.choiceSettingValue) return
        parent[path.at(-1)] = mergeSettingInstance(
          {
            ...current,
            choiceSettingValue: {
              ...current.choiceSettingValue,
              value: leaf.value,
            },
          },
          built
        )
        setPolicy(folded)
        noteStructuralChange()
      })
    })
    return () => subscription.unsubscribe()
  }, [
    supportsStructuralEdits,
    formControl,
    leaves,
    getDefinition,
    foldValuesIntoPolicy,
    setPolicy,
    noteStructuralChange,
  ])

  const removeSetting = useCallback(
    (settingIndex) => {
      const folded = foldValuesIntoPolicy()
      setPolicy({
        ...folded,
        settings: (folded.settings ?? []).filter(
          (_, index) => index !== settingIndex
        ),
      })
      noteStructuralChange()
    },
    [foldValuesIntoPolicy, setPolicy, noteStructuralChange]
  )

  // Group collections are the repeating blocks Intune shows as a table. They produce no leaf of
  // their own, so the field editor can change what is in a row but cannot add or remove one.
  const addGroupRow = useCallback(
    async (settingIndex) => {
      const folded = foldValuesIntoPolicy()
      const instance = folded?.settings?.[settingIndex]?.settingInstance
      if (!isGroupCollectionInstance(instance)) return

      const rows = instance.groupSettingCollectionValue ?? []
      const groupDefinition = await fetchIntuneDefinition(
        instance.settingDefinitionId
      )

      // Intune rejects the whole policy when a collection exceeds its bound, naming only the group,
      // so the row is refused here rather than written and discovered on deploy.
      if (!canAddCollectionEntry(groupDefinition, rows.length)) return

      // A new row built from the catalog, falling back to a cleared copy of the first row, whose
      // captured shape is the most reliable description of what Intune expects.
      const childDefinitions = (
        await fetchIntuneDefinitions(childDefinitionIds(groupDefinition))
      ).filter(Boolean)
      const byId = Object.fromEntries(childDefinitions.map((d) => [d.id, d]))
      const children = childDefinitions
        .map((definition) => buildSettingInstance(definition, byId))
        .filter(Boolean)
      const newRow =
        children.length > 0
          ? { children }
          : rows.length > 0
            ? clearGroupRowValues(rows[0])
            : null
      if (!newRow) return

      setPolicy({
        ...folded,
        settings: folded.settings.map((setting, index) =>
          index === settingIndex
            ? {
                ...setting,
                settingInstance: {
                  ...setting.settingInstance,
                  groupSettingCollectionValue: [...rows, newRow],
                },
              }
            : setting
        ),
      })
      noteStructuralChange()
    },
    [foldValuesIntoPolicy, setPolicy, noteStructuralChange]
  )

  const removeGroupRow = useCallback(
    (settingIndex, rowIndex) => {
      const folded = foldValuesIntoPolicy()
      const instance = folded?.settings?.[settingIndex]?.settingInstance
      if (!isGroupCollectionInstance(instance)) return

      setPolicy({
        ...folded,
        settings: folded.settings.map((setting, index) =>
          index === settingIndex
            ? {
                ...setting,
                settingInstance: {
                  ...setting.settingInstance,
                  groupSettingCollectionValue: (
                    setting.settingInstance.groupSettingCollectionValue ?? []
                  ).filter((_, i) => i !== rowIndex),
                },
              }
            : setting
        ),
      })
      noteStructuralChange()
    },
    [foldValuesIntoPolicy, setPolicy, noteStructuralChange]
  )

  return {
    structureRevision,
    getDefinition,
    definitionsLoading,
    definitionsError,
    leaves,
    isAdminTemplate,
    isSettingTree,
    supportsStructuralEdits,
    foldValuesIntoPolicy,
    addSetting,
    removeSetting,
    addGroupRow,
    removeGroupRow,
  }
}
