import { format, subHours, subMinutes } from 'date-fns';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import SpeakerWaveIcon from '@heroicons/react/24/outline/SpeakerWaveIcon';
import {
  Badge,
  Box,
  Divider,
  IconButton,
  Popover,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';
import { usePopover } from '../../hooks/use-popover';

const now = new Date();

const notifications = [
  {
    id: 'cf61492ca564264b53db0717',
    createdAt: subMinutes(now, 15).getTime(),
    type: 'newCustomer'
  },
  {
    id: '260bbcfa0a682e94bbda6ee3',
    createdAt: subHours(subMinutes(now, 42), 1).getTime(),
    content: 'You can now edit your resources without leaving the page',
    title: 'Inline Edit is now available',
    type: 'newFeature'
  },
  {
    id: '266a0d67c47eaafbf0790472',
    content: 'Version 5.0 comes Custom DNS feature',
    createdAt: subHours(subMinutes(now, 26), 4).getTime(),
    title: 'Beta Custom DNS',
    type: 'newFeature'
  }
];

const getContent = (notification) => {
  switch (notification.type) {
    case 'newCustomer':
      return (
        <>
          <Stack
            alignItems="center"
            direction="row"
            spacing={2}
          >
            <SvgIcon
              color="warning"
              fontSize="small"
            >
              <SparklesIcon />
            </SvgIcon>
            <Typography variant="subtitle2">
              New Customer
            </Typography>
          </Stack>
        </>
      );

    case 'newFeature':
      return (
        <>
          <Stack
            alignItems="center"
            direction="row"
            spacing={2}
          >
            <SvgIcon
              color="info"
              fontSize="small"
            >
              <SpeakerWaveIcon />
            </SvgIcon>
            <Typography variant="subtitle2">
              {notification.title}
            </Typography>
          </Stack>
          {notification.content && (
            <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
              variant="body2"
            >
              {notification.content}
            </Typography>
          )}
        </>
      );

    default:
      return null;
  }
};

export const NotificationsPopover = () => {
  const popover = usePopover();

  return (
    <>
      <Badge
        color="success"
        variant="dot"
      >
        <IconButton
          color="inherit"
          onClick={popover.handleOpen}
          ref={popover.anchorRef}
        >
          <SvgIcon
            color="action"
            fontSize="small"
          >
            <BellIcon />
          </SvgIcon>
        </IconButton>
      </Badge>
      <Popover
        anchorEl={popover.anchorRef.current}
        anchorOrigin={{
          horizontal: 'center',
          vertical: 'bottom'
        }}
        disableScrollLock
        onClose={popover.handleClose}
        open={popover.open}
        PaperProps={{
          sx: { width: 320 }
        }}
      >
        <Box
          sx={{
            pt: 2,
            px: 2
          }}
        >
          <Typography variant="h6">
            Notifications
          </Typography>
        </Box>
        <Stack
          divider={<Divider />}
          sx={{
            listStyle: 'none',
            m: 0,
            p: 0
          }}
        >
          {notifications.map((notification) => {
            const createdAt = format(notification.createdAt, 'MMM dd, yyyy');

            return (
              <Stack
                key={notification.id}
                spacing={1}
                sx={{ p: 2 }}
              >
                {getContent(notification)}
                <Typography
                  color="text.secondary"
                  variant="caption"
                >
                  {createdAt}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Popover>
    </>
  );
};
