import { FormControlLabel, FormGroup, Stack, Switch, Typography } from '@mui/material';

export const Input5 = () => (
  <Stack
    spacing={2}
    sx={{ p: 3 }}
  >
    <Typography variant="subtitle2">
      Notifications
    </Typography>
    <FormGroup>
      <FormControlLabel
        control={<Switch defaultChecked />}
        label="Email"
      />
      <FormControlLabel
        control={<Switch />}
        label="Push"
      />
      <FormControlLabel
        control={<Switch disabled />}
        label="SMS"
      />
    </FormGroup>
  </Stack>
);
