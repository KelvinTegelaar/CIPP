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
          href="#"
          underline="hover"
          variant="subtitle2"
          sx={{
            color: "text.secondary"
          }}
        >
          Home
        </Link>
        <Link
          href="#"
          underline="hover"
          variant="subtitle2"
          sx={{
            color: "text.secondary"
          }}
        >
          Customers
        </Link>
        <Typography variant="body2">
          Pending
        </Typography>
      </Breadcrumbs>
    </div>
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        justifyContent: "space-between"
      }}>
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
