import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import EllipsisVerticalIcon from '@heroicons/react/24/outline/EllipsisVerticalIcon';
import {
  Button,
  Card,
  CardHeader,
  cardHeaderClasses,
  IconButton,
  Stack,
  SvgIcon
} from '@mui/material';

export const CardHeading3 = () => (
  <Card>
    <CardHeader
      action={(
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
        >
          <Button
            color="inherit"
            endIcon={(
              <SvgIcon fontSize="small">
                <ChevronDownIcon />
              </SvgIcon>
            )}
            size="small"
            variant="text"
          >
            Most recent
          </Button>
          <IconButton size="small">
            <SvgIcon fontSize="small">
              <EllipsisVerticalIcon />
            </SvgIcon>
          </IconButton>
        </Stack>
      )}
      subheader="List of the latest orders"
      sx={{
        [`& .${cardHeaderClasses.action}`]: {
          alignSelf: 'center'
        }
      }}
      title="Orders"
    />
  </Card>
);
