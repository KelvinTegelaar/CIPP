import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import { Box, Button, Stack, SvgIcon, Typography } from '@mui/material';

export const PageHeading1 = () => (
  <Box sx={{ p: 4 }}>
    <Stack
      alignItems="center"
      direction="row"
      flexWrap="wrap"
      gap={2}
      justifyContent="space-between"
    >
      <div>
        <Typography variant="h4">
          Customers
        </Typography>
      </div>
      <div>
        <Button
          startIcon={(
            <SvgIcon fontSize="small">
              <PlusIcon />
            </SvgIcon>
          )}
          variant="contained"
          size="large"
        >
          Add
        </Button>
      </div>
    </Stack>
  </Box>
);
