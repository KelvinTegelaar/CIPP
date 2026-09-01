import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import BuildingOfficeIcon from '@heroicons/react/24/outline/BuildingOfficeIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import LinkIcon from '@heroicons/react/24/outline/LinkIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import { Button, Stack, SvgIcon, Typography } from '@mui/material';

export const PageHeading2 = () => (
  <Stack
    spacing={2}
    sx={{ p: 4 }}
  >
    <div>
      <Button
        startIcon={(
          <SvgIcon fontSize="small">
            <ArrowLeftIcon />
          </SvgIcon>
        )}
      >
        Back
      </Button>
    </div>
    <Stack
      alignItems="center"
      direction="row"
      flexWrap="wrap"
      gap={2}
      justifyContent="space-between"
    >
      <Stack spacing={1}>
        <Typography variant="h4">
          Natalie Rusell
        </Typography>
        <Stack
          alignItems="center"
          direction="row"
          flexWrap="wrap"
          gap={3}
        >
          <Stack
            alignItems="center"
            direction="row"
            spacing={1}
          >
            <SvgIcon fontSize="small">
              <CalendarIcon />
            </SvgIcon>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Since 14 Feb 2023
            </Typography>
          </Stack>
          <Stack
            alignItems="center"
            direction="row"
            spacing={1}
          >
            <SvgIcon fontSize="small">
              <BuildingOfficeIcon />
            </SvgIcon>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Berlin, Germany
            </Typography>
          </Stack>
          <Stack
            alignItems="center"
            direction="row"
            spacing={1}
          >
            <SvgIcon fontSize="small">
              <LinkIcon />
            </SvgIcon>
            <Typography
              color="text.secondary"
              sx={{ ml: 0.5 }}
              variant="body2"
            >
              Twitter
            </Typography>
          </Stack>
        </Stack>
      </Stack>
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
