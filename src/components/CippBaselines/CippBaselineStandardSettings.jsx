import { useEffect, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import { IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import CippFormComponent from '../CippComponents/CippFormComponent'
import { CippFormCondition } from '../CippComponents/CippFormCondition'
import { useCustomVariableOptions } from '../../hooks/use-custom-variables'

// Map an effective expected value back onto the standard's variables, so forms can be
// pre-filled with what is currently applied (e.g. when creating a tenant override).
export const variableValuesFromExpected = (standard, expectedValue) => {
  const values = {}
  Object.entries(standard?.expected ?? {}).forEach(([key, template]) => {
    if (typeof template === 'string') {
      const match = template.match(/^%(\w+)%$/)
      if (match && expectedValue?.[key] !== undefined) {
        values[match[1]] = expectedValue[key]
      }
    }
  })
  return values
}

// Why a switch's value cannot run, or null when it can. A custom variable (%name%) must exist
// and be typed boolean; null is variable mode with nothing picked.
export const switchVariableProblem = (value, variableOptions) => {
  const text = value?.value ?? value
  if (text === null)
    return 'no custom variable is picked. Pick one, or switch back to a fixed value'
  if (typeof text !== 'string' || text === '') return null
  const known = variableOptions.find((option) => option.value === text)
  if (!known) return `${text} is not a custom variable`
  if (known.variableType !== 'boolean')
    return `${text} is a ${known.variableType} variable, but a switch needs a boolean one`
  return null
}

// A switch can hold a custom variable (%name%) instead of true/false, so each tenant can resolve
// it to its own value. The engine turns the tenant's value into a bool at run time.
const CippBaselineSwitchField = ({
  name,
  definition,
  formControl,
  defaultValue,
}) => {
  const seedText = defaultValue?.value ?? defaultValue
  const [bound, setBound] = useState(
    typeof seedText === 'string' && seedText.startsWith('%')
  )
  const {
    options: variableOptions,
    isLoading,
    isError,
  } = useCustomVariableOptions({ enabled: bound })
  const booleanOptions = variableOptions
    .filter((option) => option.variableType === 'boolean')
    .map(({ label, value, description }) => ({ label, value, description }))
  const toggle = () => {
    formControl.setValue(name, bound ? (definition.default ?? false) : null, {
      shouldDirty: true,
    })
    setBound(!bound)
  }
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Stack sx={{ flex: 1 }}>
        {bound ? (
          <CippFormComponent
            type="autoComplete"
            name={name}
            label={definition.label}
            formControl={formControl}
            defaultValue={
              typeof seedText === 'string'
                ? { label: seedText, value: seedText }
                : undefined
            }
            options={booleanOptions}
            multiple={false}
            creatable={false}
            isFetching={isLoading}
            helperText={
              !isLoading && booleanOptions.length === 0
                ? 'No boolean custom variables yet. Add one with the Boolean type under Global Variables or on a tenant.'
                : 'Only boolean custom variables are listed. Each tenant uses its own value, or the all-tenants one.'
            }
            validators={{
              required: 'Pick a custom variable',
              validate: (value) =>
                isLoading ||
                isError ||
                switchVariableProblem(value, variableOptions) ||
                true,
            }}
          />
        ) : (
          <CippFormComponent
            type="switch"
            name={name}
            label={definition.label}
            helperText={definition.helperText}
            formControl={formControl}
            defaultValue={defaultValue}
          />
        )}
      </Stack>
      <Tooltip title={bound ? 'Use a fixed value' : 'Use a custom variable'}>
        <IconButton
          size="small"
          aria-label={bound ? 'Use a fixed value' : 'Use a custom variable'}
          onClick={toggle}
        >
          {bound ? <CippIcons.ToggleOn /> : <CippIcons.DataObject />}
        </IconButton>
      </Tooltip>
    </Stack>
  )
}

// The configurable settings of a baseline standard, rendered as real form fields from the
// definition's `variables`. Used by the template editor and the tenant-override dialog —
// users always configure standards through the same fields, never raw JSON.
export const CippBaselineStandardSettings = ({
  standard,
  formControl,
  namePrefix,
  initialValues,
}) => {
  const variableEntries = Object.entries(standard?.variables ?? {})

  // Seed value per field: current applied value > recommended > default. Api-driven
  // autoCompletes (e.g. the CA template picker) seed with a bare value; the
  // autocomplete resolves the label once its option list loads.
  const resolveSeed = (key, definition) => {
    // Locked variables run with the definition's value whatever was saved, so show that.
    const seed = definition.locked
      ? (definition.default ?? definition.recommended)
      : (initialValues?.[key] ?? definition.recommended ?? definition.default)
    if (seed === undefined) return undefined
    // List pickers that replaced a comma-separated text field still load the old string.
    if (
      definition.type === 'autoComplete' &&
      definition.multiple === true &&
      typeof seed === 'string'
    ) {
      return seed
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .map(
          (value) =>
            definition.options?.find((option) => option.value === value) ?? {
              label: value,
              value,
            }
        )
    }
    return definition.type === 'autoComplete'
      ? (definition.options?.find((option) => option.value === seed) ?? seed)
      : seed
  }

  // Definitions carry the API's real constraints as JSON validators. Map them into
  // react-hook-form rules: min/max/maxLength pass through as {value, message}, pattern
  // compiles its string into a RegExp (JSON cannot hold one - react-hook-form silently
  // ignores string patterns), and lessThanOrEqual/greaterThanOrEqual compare against a
  // sibling variable of the same standard (e.g. TAP's minimum lifetime must not exceed
  // its maximum). Blank values always pass the cross-field rules - omitWhenBlank fields
  // express no opinion, and react-hook-form itself skips empties for the built-ins.
  const resolveValidators = (definition) => {
    const rules = definition.required
      ? { required: `${definition.label} is required` }
      : {}
    const declared = definition.validators ?? {}
    ;['min', 'max', 'maxLength'].forEach((rule) => {
      if (declared[rule]) rules[rule] = declared[rule]
    })
    if (declared.pattern) {
      rules.pattern = {
        value: new RegExp(declared.pattern.value),
        message: declared.pattern.message,
      }
    }
    ;[
      ['lessThanOrEqual', (value, sibling) => Number(value) <= Number(sibling)],
      ['greaterThanOrEqual', (value, sibling) => Number(value) >= Number(sibling)],
    ].forEach(([rule, satisfies]) => {
      if (!declared[rule]) return
      rules.validate = {
        ...rules.validate,
        [rule]: (value) => {
          if (value === undefined || value === null || value === '') return true
          const sibling = formControl.getValues(
            `${namePrefix}.${declared[rule].field}`,
          )
          if (sibling === undefined || sibling === null || sibling === '')
            return true
          return satisfies(value, sibling) || declared[rule].message
        },
      }
    })
    return Object.keys(rules).length > 0 ? rules : undefined
  }

  // The seed is ALSO passed as each field's defaultValue below - that is the load-bearing
  // path. CippFormComponent's Controllers register with defaultValue '' during render, so
  // by the time this effect runs on a lazily-mounted details pane (accordion expand), the
  // form already holds '' for every field and a plain undefined-check never seeds. That is
  // exactly how a saved baseline's variables rendered blank in the editor. The effect stays
  // for values a Controller default cannot reach (a form reset that wipes mounted fields):
  // it re-seeds untouched empties but never overwrites a value the operator typed.
  useEffect(() => {
    variableEntries.forEach(([key, definition]) => {
      const name = `${namePrefix}.${key}`
      const seedValue = resolveSeed(key, definition)
      if (seedValue === undefined || seedValue === '') return
      const currentValue = formControl.getValues(name)
      const untouched = !formControl.getFieldState(name).isDirty
      if (currentValue === undefined || (currentValue === '' && untouched)) {
        formControl.setValue(name, seedValue)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namePrefix, standard?.name])

  if (variableEntries.length === 0) {
    return (
      <Typography variant="caption" sx={{
        color: "text.secondary"
      }}>This standard has no configurable settings - it enforces a fixed value.
              </Typography>
    );
  }

  return (
    <Grid container spacing={2}>
      {variableEntries.map(([key, definition]) => {
        const field = (
          <Grid key={key} size={{ xs: 12, md: 6 }}>
            {definition.type === 'switch' && !definition.locked ? (
              <CippBaselineSwitchField
                name={`${namePrefix}.${key}`}
                definition={definition}
                formControl={formControl}
                defaultValue={resolveSeed(key, definition)}
              />
            ) : (
              <CippFormComponent
                type={definition.type}
                name={`${namePrefix}.${key}`}
                label={definition.label}
                // Per-field guidance from the definition (e.g. an example version format).
                // Renders below the field for text/number/select inputs.
                helperText={definition.helperText}
                formControl={formControl}
                // Saved/recommended value rides the Controller's own defaultValue so a
                // lazily-mounted field initializes correctly regardless of effect order.
                defaultValue={resolveSeed(key, definition)}
                options={definition.options}
                // Definitions may source options from an API instead of a static list
                // (e.g. the CA template picker) - CippFormComponent handles the fetch.
                api={definition.api}
                // Identity pickers are always single-select (the catalog tests enforce it);
                // list-shaped variables (allowed domains, IP ranges) declare multiple:true.
                multiple={definition.multiple === true}
                creatable={definition.creatable === true}
                disabled={definition.locked === true}
                // Required-ness plus the definition's declared API constraints. A required
                // variable has no safe fallback: saving without it leaves the raw %token% in
                // the baseline, which the engine refuses to compare or apply - and a value
                // outside the API's real bounds saves fine but fails at remediation time.
                validators={resolveValidators(definition)}
              />
            )}
            {definition.locked && (
              <Stack direction="row" spacing={0.5} sx={{
                alignItems: "center"
              }}>
                <CippIcons.Lock sx={{ fontSize: 14 }} color="disabled" />
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>
                  Enforced by the standard definition and cannot be changed.
                </Typography>
              </Stack>
            )}
          </Grid>
        )
        // Hidden values are kept unless the definition opts into clearOnHide: the
        // baseline logic, not the editor, decides what a dependent value means.
        return definition.condition ? (
          <CippFormCondition
            key={key}
            {...definition.condition}
            field={`${namePrefix}.${definition.condition.field}`}
            formControl={formControl}
            clearOnHide={definition.clearOnHide === true}
            clearFields={[`${namePrefix}.${key}`]}
          >
            {field}
          </CippFormCondition>
        ) : (
          field
        )
      })}
    </Grid>
  );
}

export default CippBaselineStandardSettings
