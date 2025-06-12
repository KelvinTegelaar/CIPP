import { Box, Typography, Unstable_Grid2 as Grid } from '@mui/material';

const data = [
  {
    label: 'Pending',
    value: 2
  },
  {
    label: 'Ongoing',
    value: 2
  },
  {
    label: 'In progress',
    value: 6
  },
  {
    label: 'Complete',
    value: 21
  }
];

export const Stats2 = () => (
  <Box sx={{ p: 3 }}>
    <Grid
      container
      spacing={3}
    >
      {data.map((item) => (
        <Grid
          size={{ md: 3, sm: 6, xs: 12 }}
          key={item.label}
        >
          <Box
            sx={{
              alignItems: 'center',
              backgroundColor: (theme) => theme.palette.mode === 'dark'
                ? 'neutral.900'
                : 'neutral.50',
              borderRadius: 1,
              p: 2
            }}
          >
            <Typography
              color="text.secondary"
              variant="overline"
            >
              {item.label}
            </Typography>
            <Typography variant="h6">
              {item.value}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Box>
);
