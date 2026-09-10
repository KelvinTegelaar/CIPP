// Values stored in a template come back in whatever shape they were saved in: option objects
// ({label, value}), bare strings, or a single item where a list is expected. An autoComplete field
// only renders {label, value} objects, so anything else silently shows up as an empty field.
// Normalise to the array MUI needs, resolving labels from the field's own options when possible.
export const toAutoCompleteOptions = (value, options = []) => {
  if (value === undefined || value === null || value === '') return []

  return (Array.isArray(value) ? value : [value])
    .filter((item) => item !== undefined && item !== null && item !== '')
    .map((item) => {
      if (typeof item === 'object') {
        if (item.label !== undefined && item.value !== undefined) return item
        const resolved = options.find((option) => option.value === item.value)
        return resolved ?? { ...item, label: item.label ?? item.value, value: item.value }
      }
      return options.find((option) => option.value === item) ?? { label: item, value: item }
    })
    .filter((item) => item.value !== undefined)
}
