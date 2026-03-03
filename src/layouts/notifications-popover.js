import BellIcon from "@heroicons/react/24/outline/BellIcon";
import SparklesIcon from "@heroicons/react/24/outline/SparklesIcon";
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Popover,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { usePopover } from "../hooks/use-popover";
import { Error, Update, Close as CloseIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { closeToast, resetToast } from "../store/toasts";
import { useEffect, useState } from "react";
import ReactTimeAgo from "react-time-ago";

const getContent = (notification) => {
  return (
    <>
      <Stack alignItems="center" direction="row" spacing={2}>
        <SvgIcon
          color={
            notification.type === "error"
              ? "warning"
              : notification.type === "update"
              ? "info"
              : "indigo"
          }
          fontSize="small"
        >
          {notification.type === "update" ? (
            <Update />
          ) : notification.type === "error" ? (
            <Error />
          ) : (
            <SparklesIcon />
          )}
        </SvgIcon>
        <Typography variant="subtitle2">{notification.subtitle}</Typography>
      </Stack>
      {notification.content && (
        <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
          {notification.content}
        </Typography>
      )}
    </>
  );
};

export const NotificationsPopover = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.toasts.toasts);
  const [page, setPage] = useState(0);

  // Map toasts to notifications
  const notifications = toasts.map((toast) => {
    return {
      id: toast.index, // Ensure that 'id' corresponds to the identifier used in your store
      type: toast.toastError?.type || "error",
      subtitle: toast.title,
      content: toast.message,
      createdAt: toast.date,
      link: toast.toastError?.link,
    };
  });

  // Reverse the array so the most recent notifications are at the top
  notifications.reverse();
  const notificationsToShow = notifications.slice(0, (page + 1) * 5);

  const popover = usePopover();

  const BadgeColour = notifications.some((notification) => notification.type === "error")
    ? "warning"
    : notifications.some((notification) => notification.type === "update")
    ? "primary"
    : "info";

  useEffect(() => {
    if (notifications.length === 0 && popover.open) {
      popover.handleClose();
    }
  }, [notifications, popover]);

  return (
    <>
      <Badge color={BadgeColour} variant="dot" invisible={notifications.length === 0}>
        <IconButton color="inherit" onClick={popover.handleOpen} ref={popover.anchorRef}>
          <SvgIcon color="action" fontSize="small">
            <BellIcon />
          </SvgIcon>
        </IconButton>
      </Badge>
      <Popover
        anchorEl={popover.anchorRef.current}
        anchorOrigin={{
          horizontal: "center",
          vertical: "bottom",
        }}
        disableScrollLock
        onClose={popover.handleClose}
        open={popover.open}
        PaperProps={{
          sx: { width: 320 },
        }}
      >
        <Box
          sx={{
            pt: 2,
            px: 2,
          }}
        >
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Stack
          divider={<Divider />}
          sx={{
            listStyle: "none",
            m: 0,
            p: 0,
          }}
        >
          {notificationsToShow.map((notification) => {
            const createdAt = <ReactTimeAgo date={notification.createdAt} />;

            return (
              <Stack key={notification.id} spacing={1} sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    {getContent(notification)}
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                      <Typography color="text.secondary" variant="caption">
                        {createdAt}
                      </Typography>
                      {notification.link && (
                        <Button
                          size="small"
                          onClick={() => {
                            window.open(notification.link, "_blank");
                          }}
                        >
                          More Info
                        </Button>
                      )}
                    </Stack>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => dispatch(closeToast({ index: notification.id }))}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
        <Stack sx={{ pb: 1 }} spacing={1} direction="row" justifyContent="center">
          {notifications.length > notificationsToShow.length && (
            <Button onClick={() => setPage(page + 1)} variant="contained" size="small">
              Load More
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              dispatch(resetToast());
              popover.handleClose();
            }}
            startIcon={
              <SvgIcon fontSize="small">
                <CloseIcon />
              </SvgIcon>
            }
          >
            Clear All
          </Button>
        </Stack>
      </Popover>
    </>
  );
};
