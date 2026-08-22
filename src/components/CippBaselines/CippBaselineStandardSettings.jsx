import { useEffect } from 'react'
import { Stack, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import { Lock } from '@mui/icons-material'
import CippFormComponent from '../CippComponents/CippFormComponent'

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
    const seed =
      initialValues?.[key] ?? definition.recommended ?? definition.default
    if (seed === undefined) return undefined
    return definition.type === 'autoComplete'
      ? (definition.options?.find((option) => option.value === seed) ?? seed)
      : seed
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
      <Typography variant="caption" color="text.secondary">
        This standard has no configurable settings - it enforces a fixed value.
      </Typography>
    )
  }

  return (
    <Grid container spacing={2}>
      {variableEntries.map(([key, definition]) => (
        <Grid key={key} size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type={definition.type}
            name={`${namePrefix}.${key}`}
            label={definition.label}
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
            // A required variable has no safe fallback: saving without it leaves the
            // raw %token% in the baseline, which the engine refuses to compare or apply.
            validators={
              definition.required
                ? { required: `${definition.label} is required` }
                : undefined
            }
          />
          {definition.locked && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Lock sx={{ fontSize: 14 }} color="disabled" />
              <Typography variant="caption" color="text.secondary">
                Enforced by the standard definition and cannot be changed.
              </Typography>
            </Stack>
          )}
        </Grid>
      ))}
    </Grid>
  )
}

export default CippBaselineStandardSettings
