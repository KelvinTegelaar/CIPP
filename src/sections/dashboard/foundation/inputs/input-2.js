import { Autocomplete, Stack, TextField } from '@mui/material';

export const Input2 = () => (
  <Stack
    spacing={2}
    sx={{
      p: 3,
      maxWidth: 360
    }}
  >
    <Autocomplete
      filterSelectedOptions
      fullWidth
      options={['Javascript', 'Webflow']}
      renderInput={(inputProps) => (
        <TextField
          label="Single Value"
          {...inputProps} />
      )}
    />
    <Autocomplete
      filterSelectedOptions
      fullWidth
      multiple
      options={['Javascript', 'Webflow']}
      renderInput={(inputProps) => (
        <TextField
          label="Multiple Values"
          {...inputProps} />
      )}
    />
  </Stack>
);
