import { InputAdornment, Stack, TextField } from '@mui/material';

export const Input1 = () => (
  <Stack
    spacing={2}
    sx={{
      p: 3,
      maxWidth: 360
    }}
  >
    <TextField
      fullWidth
      label="Label"
    />
    <TextField
      disabled
      fullWidth
      label="Disabled"
    />
    <TextField
      fullWidth
      label="With Prefix"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            https://
          </InputAdornment>
        )
      }}
    />
  </Stack>
);
