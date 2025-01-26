import { FormControlLabel, Radio, RadioGroup, Stack, Typography } from '@mui/material';

export const Input4 = () => (
  <Stack
    spacing={2}
    sx={{ p: 3 }}
  >
    <Typography variant="subtitle2">
      Notifications
    </Typography>
    <RadioGroup defaultValue="email">
      <FormControlLabel
        control={<Radio value="email" />}
        label="Email"
      />
      <FormControlLabel
        control={<Radio value="push" />}
        label="Push"
      />
      <FormControlLabel
        control={(
          <Radio
            disabled
            value="sms"
          />
        )}
        label="SMS"
      />
    </RadioGroup>
  </Stack>
);
