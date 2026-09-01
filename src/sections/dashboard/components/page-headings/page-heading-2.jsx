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
      direction="row"
      sx={{
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        justifyContent: "space-between"
      }}>
      <Stack spacing={1}>
        <Typography variant="h4">
          Natalie Rusell
        </Typography>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            flexWrap: "wrap",
            gap: 3
          }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center"
            }}
          >
            <SvgIcon fontSize="small">
              <CalendarIcon />
            </SvgIcon>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary"
              }}
            >
              Since 14 Feb 2023
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center"
            }}
          >
            <SvgIcon fontSize="small">
              <BuildingOfficeIcon />
            </SvgIcon>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary"
              }}
            >
              Berlin, Germany
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center"
            }}
          >
            <SvgIcon fontSize="small">
              <LinkIcon />
            </SvgIcon>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                ml: 0.5
              }}>
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
