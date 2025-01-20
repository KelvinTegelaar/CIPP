import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import { Breadcrumbs, Button, Link, Stack, SvgIcon, Typography } from '@mui/material';

export const PageHeading3 = () => (
  <Stack
    spacing={2}
    sx={{ p: 4 }}
  >
    <div>
      <Breadcrumbs separator="•">
        <Link
          color="text.secondary"
          href="#"
          underline="hover"
          variant="subtitle2"
        >
          Home
        </Link>
        <Link
          color="text.secondary"
          href="#"
          underline="hover"
          variant="subtitle2"
        >
          Customers
        </Link>
        <Typography variant="body2">
          Pending
        </Typography>
      </Breadcrumbs>
    </div>
    <Stack
      alignItems="center"
      direction="row"
      flexWrap="wrap"
      gap={2}
      justifyContent="space-between"
    >
      <div>
        <Typography variant="h4">
          Natalie Rusell
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
  </Stack>
);
