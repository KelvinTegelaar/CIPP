import { Checkbox, FormControlLabel, FormGroup, Stack, Typography } from '@mui/material';

export const Input3 = () => (
  <Stack
    spacing={2}
    sx={{ p: 3 }}
  >
    <Typography variant="subtitle2">
      Notifications
    </Typography>
    <FormGroup>
      <FormControlLabel
        control={<Checkbox defaultChecked />}
        label="Email"
      />
      <FormControlLabel
        control={<Checkbox />}
        label="Push"
      />
      <FormControlLabel
        control={<Checkbox disabled />}
        label="SMS"
      />
    </FormGroup>
  </Stack>
);
