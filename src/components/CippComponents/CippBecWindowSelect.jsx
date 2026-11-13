import { Box } from '@mui/material'
import { CippAutoComplete } from './CippAutocomplete'
import { BEC_WINDOW_OPTIONS, becWindowOption } from '../../utils/bec-objectives'

// How far back the next BEC run looks, picked before it starts. value is a number of days or ''
// (automatic); onChange gets the same. Sits beside the start button on the case page.
export const CippBecWindowSelect = ({ value, onChange, disabled = false }) => (
  <Box sx={{ minWidth: 280 }}>
    <CippAutoComplete
      fullWidth
      multiple={false}
      creatable={false}
      disableClearable
      label="How far back to look"
      options={BEC_WINDOW_OPTIONS}
      value={becWindowOption(value)}
      onChange={(newValue) => onChange(newValue?.value ?? '')}
      disabled={disabled}
    />
  </Box>
)
