import { Fragment, useCallback, useState } from 'react';
import numeral from 'numeral';
import {
  Button,
  Card,
  CardActions,
  CardHeader,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';

const planOptions = [
  {
    id: 'free',
    description: 'Up to 2 team members',
    label: 'Free',
    price: {
      monthly: 0,
      yearly: 0
    }
  },
  {
    id: 'essential',
    description: 'Best for simple projects or applications.',
    label: 'Essential',
    price: {
      monthly: 120,
      yearly: 1320
    }
  },
  {
    id: 'professional',
    description: 'Best for teams and multiple projects that need added security.',
    label: 'Professional',
    price: {
      monthly: 480,
      yearly: 5280
    }
  }
];

export const OrganizationBillingPlan = () => {
  const [plan, setPlan] = useState('essential');
  const [period, setPeriod] = useState('monthly');

  const handlePlanChange = useCallback((event, value) => {
    setPlan(value);
  }, []);

  const handlePeriodChange = useCallback((event, period) => {
    if (period) {
      setPeriod(period);
    }
  }, []);

  return (
    <Card>
      <CardHeader title="Subscription Plan" />
      <Divider />
      <Stack
        alignItems="center"
        direction="row"
        spacing={3}
        sx={{
          px: 3,
          py: 2
        }}
      >
        <Typography variant="subtitle2">
          Billing
        </Typography>
        <ToggleButtonGroup
          exclusive
          onChange={handlePeriodChange}
          size="small"
          value={period}
        >
          <ToggleButton value="monthly">
            Monthly
          </ToggleButton>
          <ToggleButton value="yearly">
            Yearly
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Divider />
      <RadioGroup
        name="plan"
        onChange={handlePlanChange}
        value={plan}
      >
        {planOptions.map((option) => {
          const amount = numeral(option.price[period]).format('$0,0');

          return (
            <Fragment key={option.id}>
              <FormControlLabel
                disableTypography
                control={<Radio />}
                label={(
                  <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    sx={{ width: '100%' }}
                  >
                    <div>
                      <Typography>
                        {option.label}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        variant="caption"
                      >
                        {option.description}
                      </Typography>
                    </div>
                    <Typography variant="h5">
                      {amount}
                    </Typography>
                  </Stack>
                )}
                sx={{
                  m: 0,
                  px: 3,
                  py: 1.5
                }}
                value={option.id}
              />
              <Divider />
            </Fragment>
          );
        })}
      </RadioGroup>
      <CardActions>
        <Button variant="contained">
          Upgrade Plan
        </Button>
      </CardActions>
    </Card>
  );
};
