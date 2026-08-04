import React, { useMemo, useState } from 'react'
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
import { useIntuneCollectionState } from '../../hooks/use-intune-collection'
import { useCustomVariableOptions } from '../../hooks/use-custom-variables'
import { containsVariable, unwrap } from '../../utils/intune-template-leaves'

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
      <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
        <Tooltip
          title={leaf.helpText || leaf.definitionId || ''}
          placement="top"
          arrow
        >
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ maxWidth: '100%' }}
          >
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
              color="text.secondary"
              display="block"
            >
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
              direction="row"
              spacing={0.5}
              alignItems="center"
              flexWrap="wrap"
              sx={{ mb: accepted.length ? 1 : 0 }}
            >
              <Typography variant="caption" color="text.secondary">
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
                color="text.secondary"
                display="block"
              >
                Accepted values — click to copy:
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
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
              color="text.secondary"
              display="block"
            >
              A variable here must resolve to {valueRequirementForLeaf(leaf)}.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  )
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
          color="text.secondary"
          sx={{ fontStyle: 'italic' }}
        >
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
    )
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

  if (!leaves?.length) {
    return (
      <Alert severity="info">
        This policy has no settings CIPP can present as fields. Use the JSON
        view to edit it.
      </Alert>
    )
  }

  // Group headings come from the group collection a setting sits under, matching how the same
  // policy reads in the compare view.
  const sections = []
  leaves.forEach((leaf) => {
    const heading = leaf.groupLabel || null
    const last = sections[sections.length - 1]
    if (last && last.heading === heading) {
      last.leaves.push(leaf)
    } else {
      sections.push({ heading, leaves: [leaf] })
    }
  })

  return (
    <Stack spacing={3}>
      {sections.map((section, sectionIndex) => (
        <Box key={`section-${sectionIndex}`}>
          {section.heading && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {section.heading}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </>
          )}
          <Grid container spacing={2}>
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
        </Box>
      ))}
    </Stack>
  )
}

// Resolves setting definitions the way CippJSONView does: definitions shipped inline with the policy
// win over the bundled catalog, because they came from the tenant the policy was read from.
//
// Reports the catalog's load state alongside the resolver. Only a setting tree needs the catalog -
// a classic device configuration policy names its own properties - so the 17MB download is skipped
// for policies that would gain nothing from it.
export const useIntuneDefinitionResolver = (policy) => {
  const needsCatalog =
    Array.isArray(policy?.settings) && policy.settings.length > 0
  const {
    data: intuneCollection,
    isLoading,
    isError,
  } = useIntuneCollectionState({
    enabled: needsCatalog,
  })

  const getDefinition = useMemo(() => {
    const catalog = new Map(
      (intuneCollection || [])
        .filter((item) => item?.id)
        .map((item) => [item.id, item])
    )
    const inline = new Map()
    ;(Array.isArray(policy?.settings) ? policy.settings : []).forEach(
      (setting) => {
        ;(setting?.settingDefinitions || []).forEach((definition) => {
          if (definition?.id) inline.set(definition.id, definition)
        })
      }
    )

    return (definitionId) =>
      definitionId
        ? inline.get(definitionId) || catalog.get(definitionId)
        : undefined
  }, [intuneCollection, policy])

  return { getDefinition, isLoading, isError }
}

export default CippIntuneSettingsEditor
