import React, { useMemo, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Alert,
  Box,
  Collapse,
  Divider,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import { useWatch } from 'react-hook-form'
import CippFormComponent from './CippFormComponent'
import { CippCopyToClipBoard } from './CippCopyToClipboard'
import {
  useIntuneCategories,
  useIntuneDefinitions,
} from '../../hooks/use-intune-collection'
import { collectSettingDefinitionIds } from '../../utils/intune-setting-definition-ids'
import { useCustomVariableOptions } from '../../hooks/use-custom-variables'
import {
  containsVariable,
  UNCATEGORISED,
  unwrap,
} from '../../utils/intune-template-leaves'

const SETTING_GROUP = 'Setting values'

// Offers the CIPP variables below the setting's own options, which is what makes the closed
// selectors complete: everything a setting can legally hold is now in the list, so none of them
// needs free-text entry.
const withVariableOptions = (options, variableOptions) => {
  // CippAutoComplete renders `description` as secondary text under each option, so the raw value
  // rides along in the dropdown. A technician picking an option sees the string it actually writes,
  // which is the string a variable standing in for it has to produce.
  const base = (options || []).map((option) => ({
    ...option,
    description: option.description ?? String(option.value),
    group: SETTING_GROUP,
  }))

  if (!variableOptions?.length) return base
  return [...base, ...variableOptions]
}

const groupOfOption = (option) => option?.group || SETTING_GROUP

// Renders one field per editable leaf produced by src/utils/intune-template-leaves.js. That module
// owns the walk over the policy and the patching of edits back into it; this file only turns leaves
// into fields, so the editor and its round-trip guarantees can be reasoned about separately.

// What a value at this leaf has to look like once written into the policy. This is what a custom
// variable has to resolve to, because Get-CIPPTextReplacement splices the variable's value straight
// into the serialized JSON - a choice needs the option's raw ID, not the friendly name shown here.
const valueRequirementForLeaf = (leaf) => {
  if (leaf.kind === 'boolean') return 'true or false'
  if (leaf.kind === 'choice' || leaf.kind === 'choiceCollection') {
    return 'one of the accepted values below, copied exactly'
  }
  if (leaf.valueType === 'integer') return 'a whole number'
  return 'any text'
}

const acceptedValuesForLeaf = (leaf) => {
  if (leaf.kind === 'boolean') {
    return [
      { label: 'True', value: 'true' },
      { label: 'False', value: 'false' },
    ]
  }
  if (leaf.kind === 'choice' || leaf.kind === 'choiceCollection') {
    return (leaf.options || []).map((option) => ({
      label: option.label,
      value: String(option.value),
    }))
  }
  return []
}

const currentRawValues = (leaf) =>
  (Array.isArray(leaf.value) ? leaf.value : [leaf.value])
    .filter((entry) => entry !== null && entry !== undefined && entry !== '')
    .map((entry) => String(entry))

const valueUsesVariable = (value) =>
  Array.isArray(value)
    ? value.some((entry) => containsVariable(unwrap(entry)))
    : containsVariable(unwrap(value))

// The custom variable type this setting needs. A variable is substituted into the serialized policy
// as its declared type, so an integer setting needs an integer variable - a string one would arrive
// quoted and be rejected.
const expectedVariableTypeForLeaf = (leaf) => {
  if (leaf.kind === 'boolean') return 'boolean'
  if (leaf.valueType === 'integer') return 'integer'
  return 'string'
}

const variablesInValue = (value) =>
  (Array.isArray(value) ? value : [value])
    .map((entry) => unwrap(entry))
    .filter((entry) => containsVariable(entry))

// Variables whose declared type does not match what the setting needs. Checked here rather than at
// deployment because the mismatch is invisible until then - the substitution quietly falls back to
// a quoted string and Intune rejects a policy that looked fine in the editor.
const mismatchedVariables = (value, leaf, variableOptions) => {
  const expected = expectedVariableTypeForLeaf(leaf)
  const byName = new Map(
    (variableOptions || []).map((option) => [option.value, option.variableType])
  )

  return (
    variablesInValue(value)
      .map((name) => ({ name, actual: byName.get(name) }))
      // An unknown variable is not a mismatch: it may be defined for a tenant this list cannot see.
      .filter((entry) => entry.actual && entry.actual !== expected)
      .map((entry) => ({ ...entry, expected }))
  )
}

// The friendly label a selector shows is not what gets written to the policy, so a technician
// setting up a variable has no way to guess the value it needs. This exposes the raw side of the
// setting - its stored value and every value it accepts - and opens itself as soon as a variable is
// in use, which is exactly when that information is needed.
const LeafDetails = ({ leaf, fieldPrefix, formControl, variableOptions }) => {
  const [expandedByUser, setExpandedByUser] = useState(false)
  const current = useWatch({
    control: formControl.control,
    name: `${fieldPrefix}.${leaf.index}`,
  })

  const usesVariable = valueUsesVariable(current)
  const accepted = acceptedValuesForLeaf(leaf)
  const rawValues = currentRawValues(leaf)
  const mismatches = mismatchedVariables(current, leaf, variableOptions)
  const expanded = expandedByUser || usesVariable

  if (!leaf.definitionId && !leaf.helpText && !accepted.length) return null

  return (
    <Box>
      <Stack
        useFlexGap
        direction="row"
        spacing={0.5}
        sx={{
          alignItems: "center",
          flexWrap: "wrap"
        }}>
        <Tooltip
          title={leaf.helpText || leaf.definitionId || ''}
          placement="top"
          arrow
        >
          <Typography
            variant="caption"
            noWrap
            sx={{
              color: "text.secondary",
              maxWidth: '100%'
            }}>
            {leaf.definitionId}
          </Typography>
        </Tooltip>
        <Link
          component="button"
          type="button"
          variant="caption"
          underline="hover"
          onClick={() => setExpandedByUser((open) => !open)}
        >
          {expanded ? 'Hide raw values' : 'Raw values'}
        </Link>
      </Stack>

      <Collapse in={expanded}>
        <Box sx={{ mt: 1, pl: 1, borderLeft: 2, borderColor: 'divider' }}>
          {usesVariable && (
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block"
              }}>
              This setting uses a variable. Set the variable's value to{' '}
              {valueRequirementForLeaf(leaf)}.
            </Typography>
          )}

          {mismatches.map((mismatch) => (
            <Alert
              key={mismatch.name}
              severity="warning"
              variant="outlined"
              sx={{ my: 1 }}
            >
              {mismatch.name} is declared as {mismatch.actual}, but this setting
              needs {mismatch.expected}. Change the variable's type, or pick one
              that is already {mismatch.expected}.
            </Alert>
          ))}

          {!usesVariable && rawValues.length > 0 && (
            <Stack
              useFlexGap
              direction="row"
              spacing={0.5}
              sx={{
                alignItems: "center",
                flexWrap: "wrap",
                mb: accepted.length ? 1 : 0
              }}>
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>
                Stored as:
              </Typography>
              {rawValues.map((value) => (
                <CippCopyToClipBoard key={value} text={value} type="chip" />
              ))}
            </Stack>
          )}

          {accepted.length > 0 && (
            <Box sx={{ mt: usesVariable ? 1 : 0 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "block"
                }}>
                Accepted values — click to copy:
              </Typography>
              <Stack direction="row" spacing={0.5} useFlexGap sx={{
                flexWrap: "wrap"
              }}>
                {accepted.map((option) => (
                  <Tooltip
                    key={option.value}
                    title={option.label}
                    placement="top"
                    arrow
                  >
                    <span>
                      <CippCopyToClipBoard text={option.value} type="chip" />
                    </span>
                  </Tooltip>
                ))}
              </Stack>
            </Box>
          )}

          {!accepted.length && !usesVariable && (
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block"
              }}>
              A variable here must resolve to {valueRequirementForLeaf(leaf)}.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

// Warns when a choice with dependent children is moved off its imported value, because the children
// shown below it belong to the option that was originally selected.
const ChoiceLeafField = ({
  leaf,
  fieldPrefix,
  formControl,
  variableOptions,
}) => {
  const name = `${fieldPrefix}.${leaf.index}`
  const current = useWatch({ control: formControl.control, name })
  const changed = leaf.hasDependentChildren && unwrap(current) !== leaf.value

  return (
    <Stack spacing={1}>
      <CippFormComponent
        type="autoComplete"
        label={leaf.label}
        name={name}
        formControl={formControl}
        options={withVariableOptions(leaf.options, variableOptions)}
        groupBy={variableOptions?.length ? groupOfOption : undefined}
        multiple={false}
        // The list is closed: it holds every option the setting accepts plus every CIPP variable,
        // so free text would only ever produce a value Intune rejects.
        creatable={false}
        disableClearable
      />
      <LeafDetails
        leaf={leaf}
        fieldPrefix={fieldPrefix}
        formControl={formControl}
        variableOptions={variableOptions}
      />
      {changed && (
        <Alert severity="warning" variant="outlined">
          The settings nested under this one belong to the option that was
          originally selected. Check them, or re-import the policy from a tenant
          configured the way you want it.
        </Alert>
      )}
    </Stack>
  )
}

const LeafField = ({ leaf, fieldPrefix, formControl, variableOptions }) => {
  const name = `${fieldPrefix}.${leaf.index}`

  if (leaf.kind === 'unsupported') {
    return (
      <Stack spacing={0.5}>
        <Typography variant="body2">{leaf.label}</Typography>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontStyle: 'italic'
          }}>
          This setting type is not editable here. It is preserved exactly as
          imported.
        </Typography>
        <LeafDetails
          leaf={leaf}
          fieldPrefix={fieldPrefix}
          formControl={formControl}
          variableOptions={variableOptions}
        />
      </Stack>
    );
  }

  if (leaf.kind === 'choice') {
    return (
      <ChoiceLeafField
        leaf={leaf}
        fieldPrefix={fieldPrefix}
        formControl={formControl}
        variableOptions={variableOptions}
      />
    )
  }

  if (leaf.kind === 'boolean') {
    return (
      <Stack spacing={1}>
        <CippFormComponent
          type="autoComplete"
          label={leaf.label}
          name={name}
          formControl={formControl}
          options={withVariableOptions(
            [
              { label: 'True', value: true },
              { label: 'False', value: false },
            ],
            variableOptions
          )}
          groupBy={variableOptions?.length ? groupOfOption : undefined}
          multiple={false}
          creatable={false}
          disableClearable
        />
        <LeafDetails
          leaf={leaf}
          fieldPrefix={fieldPrefix}
          formControl={formControl}
          variableOptions={variableOptions}
        />
      </Stack>
    )
  }

  if (
    leaf.kind === 'choiceCollection' ||
    leaf.kind === 'simpleCollection' ||
    leaf.kind === 'primitiveArray'
  ) {
    return (
      <Stack spacing={1}>
        <CippFormComponent
          type="autoComplete"
          label={leaf.label}
          name={name}
          formControl={formControl}
          options={withVariableOptions(leaf.options, variableOptions)}
          groupBy={variableOptions?.length ? groupOfOption : undefined}
          multiple
          // A choice collection picks from a closed list, so it behaves like the selectors above.
          // The other two are free-text lists with no catalog options of their own - without
          // creatable there would be no way to add an entry at all, variables aside.
          creatable={leaf.kind !== 'choiceCollection'}
        />
        <LeafDetails
          leaf={leaf}
          fieldPrefix={fieldPrefix}
          formControl={formControl}
          variableOptions={variableOptions}
        />
      </Stack>
    )
  }

  // Numeric settings use a text field rather than a number input: a number input cannot hold
  // %tenantname%, and it is the text field that carries the %-triggered variable picker. The value
  // is converted back to a number on save unless it holds a variable.
  const isInteger = leaf.valueType === 'integer'

  return (
    <Stack spacing={1}>
      <CippFormComponent
        type="textField"
        label={leaf.label}
        name={name}
        formControl={formControl}
        includeSystemVariables
        validators={
          isInteger
            ? {
                validate: (value) => {
                  const entered = unwrap(value)
                  if (
                    entered === '' ||
                    entered === null ||
                    entered === undefined
                  )
                    return true
                  if (containsVariable(entered)) return true
                  return (
                    Number.isFinite(Number(entered)) ||
                    'Enter a number or a %variable%'
                  )
                },
              }
            : undefined
        }
      />
      <LeafDetails
        leaf={leaf}
        fieldPrefix={fieldPrefix}
        formControl={formControl}
        variableOptions={variableOptions}
      />
    </Stack>
  )
}

const CippIntuneSettingsEditor = ({
  leaves,
  formControl,
  fieldPrefix = 'settingValues',
}) => {
  // Fetched once for the whole editor rather than per field. Text fields keep the %-triggered
  // picker they already had; the selectors list the same variables as options.
  const { options: allVariableOptions } = useCustomVariableOptions()

  // A json variable stands for an object or an array, so it cannot fill any of the scalar settings
  // these selectors edit. Left out of the lists rather than offered and then flagged as a mismatch;
  // it is still reachable from the text fields through the %-triggered picker.
  const variableOptions = useMemo(
    () => allVariableOptions.filter((option) => option.variableType !== 'json'),
    [allVariableOptions]
  )

  // Descriptive only, so it is fetched without gating anything: a section that has not resolved its
  // category yet is labelled and grouped correctly, it just has no path under the heading.
  const categories = useIntuneCategories({
    enabled: (leaves || []).some((leaf) => leaf.categoryKey),
  })

  // One section per category, ordered by where the category first appears in the policy. Settings
  // keep their policy order inside it, which is what keeps a nested child directly beneath the
  // setting it hangs off - children carry their parent's category rather than starting a section
  // of their own.
  //
  // Grouped by the category id rather than its name. Intune reuses names heavily - thirteen
  // separate categories are called "Security" - so grouping by name silently fused Event Log
  // Service's settings with Remote Desktop's under one heading.
  const sections = useMemo(() => {
    const byCategory = new Map()
    ;(leaves || []).forEach((leaf) => {
      const key = leaf.categoryKey || leaf.category || UNCATEGORISED
      if (!byCategory.has(key)) {
        byCategory.set(key, {
          key,
          heading: leaf.category || UNCATEGORISED,
          leaves: [],
        })
      }
      byCategory.get(key).leaves.push(leaf)
    })
    return Array.from(byCategory.values())
  }, [leaves])

  // Collapsed sections are tracked rather than expanded ones, so a policy opens fully expanded and
  // a section the walk has not seen before is open by default.
  const [collapsed, setCollapsed] = useState(() => new Set())

  const toggleSection = (heading) =>
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(heading)) next.delete(heading)
      else next.add(heading)
      return next
    })

  const allCollapsed = collapsed.size >= sections.length && sections.length > 0

  if (!leaves?.length) {
    return (
      <Alert severity="info">
        This policy has no settings CIPP can present as fields. Use the JSON
        view to edit it.
      </Alert>
    )
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} sx={{
        alignItems: "center"
      }}>
        <Typography variant="caption" sx={{
          color: "text.secondary"
        }}>
          {sections.length} categories, {leaves.length} settings
        </Typography>
        <Link
          component="button"
          type="button"
          variant="caption"
          underline="hover"
          onClick={() =>
            setCollapsed(
              allCollapsed
                ? new Set()
                : new Set(sections.map((section) => section.key))
            )
          }
        >
          {allCollapsed ? 'Expand all' : 'Collapse all'}
        </Link>
      </Stack>

      {sections.map((section) => {
        const isCollapsed = collapsed.has(section.key)
        // Intune's own path for the category. Shown only when it says more than the heading
        // already does, which is what tells two categories of the same name apart.
        const path = categories.get(section.key)?.description
        const showPath = path && path !== section.heading
        return (
          <Box key={`section-${section.key}`}>
            <Stack
              direction="row"
              spacing={1}
              onClick={() => toggleSection(section.key)}
              sx={{
                alignItems: "center",
                cursor: 'pointer',
                userSelect: 'none'
              }}>
              <CippIcons.KeyboardArrowDown
                fontSize="small"
                sx={{
                  transition: 'transform 150ms',
                  transform: isCollapsed ? 'rotate(-90deg)' : 'none',
                }}
              />
              <Typography variant="subtitle2">{section.heading}</Typography>
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>
                {section.leaves.length}
              </Typography>
              {showPath && (
                <Typography
                  variant="caption"
                  noWrap
                  sx={{
                    color: "text.secondary",
                    minWidth: 0,
                    opacity: 0.8
                  }}>
                  {path}
                </Typography>
              )}
            </Stack>
            <Divider sx={{ mb: 2, mt: 1 }} />

            <Collapse in={!isCollapsed} unmountOnExit>
              <Grid container spacing={2} sx={{ pb: 1 }}>
                {section.leaves.map((leaf) => (
                  <Grid
                    size={{ xs: 12, md: leaf.kind === 'unsupported' ? 12 : 6 }}
                    key={`leaf-${leaf.index}`}
                    sx={{ pl: leaf.depth > 0 ? leaf.depth * 2 : 0 }}
                  >
                    <LeafField
                      leaf={leaf}
                      fieldPrefix={fieldPrefix}
                      formControl={formControl}
                      variableOptions={variableOptions}
                    />
                  </Grid>
                ))}
              </Grid>
            </Collapse>
          </Box>
        );
      })}
    </Stack>
  );
}

// One shared reference for the nothing-to-resolve case, so the hook below is not handed a fresh
// array on every render.
const EMPTY_IDS = []

// Resolves setting definitions the way CippJSONView does: definitions shipped inline with the policy
// win over the bundled catalog, because they came from the tenant the policy was read from.
//
// Reports the catalog's load state alongside the resolver. Only a setting tree needs the catalog -
// a classic device configuration policy names its own properties - so nothing is fetched for
// policies that would gain nothing from it.
export const useIntuneDefinitionResolver = (policy) => {
  const needsCatalog =
    Array.isArray(policy?.settings) && policy.settings.length > 0

  const inline = useMemo(() => {
    const definitions = new Map()
    ;(Array.isArray(policy?.settings) ? policy.settings : []).forEach(
      (setting) => {
        ;(setting?.settingDefinitions || []).forEach((definition) => {
          if (definition?.id) definitions.set(definition.id, definition)
        })
      }
    )
    return definitions
  }, [policy])

  // Only the ids the policy actually references are requested, and only those the policy did not
  // already carry a definition for - a policy read back from a tenant may need nothing at all.
  const wantedIds = useMemo(
    () =>
      needsCatalog
        ? Array.from(collectSettingDefinitionIds(policy)).filter(
            (id) => !inline.has(id)
          )
        : EMPTY_IDS,
    [policy, inline, needsCatalog]
  )

  const {
    getDefinition: getCatalogDefinition,
    isLoading,
    isError,
  } = useIntuneDefinitions(wantedIds, { enabled: needsCatalog })

  const getDefinition = useMemo(
    () => (definitionId) =>
      definitionId
        ? inline.get(definitionId) || getCatalogDefinition(definitionId)
        : undefined,
    [inline, getCatalogDefinition]
  )

  return { getDefinition, isLoading, isError }
}

export default CippIntuneSettingsEditor
