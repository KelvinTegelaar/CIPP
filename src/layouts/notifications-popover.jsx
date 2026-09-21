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
import { CippIcons } from "../utils/icon-registry";
import { usePopover } from "../hooks/use-popover";
import { useDispatch, useSelector } from "react-redux";
import { closeToast, resetToast } from "../store/toasts";
import { useEffect, useState } from "react";
import ReactTimeAgo from "react-time-ago";

const getContent = (notification) => {
  return (
    <>
      <Stack direction="row" spacing={2} sx={{
        alignItems: "center"
      }}>
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
            <CippIcons.Update />
          ) : notification.type === "error" ? (
            <CippIcons.Error />
          ) : (
            <CippIcons.SparklesIcon />
          )}
        </SvgIcon>
        <Typography variant="subtitle2">{notification.subtitle}</Typography>
      </Stack>
      {notification.content && (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mt: 1
          }}>
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
      <Badge
        color={BadgeColour}
        variant="dot"
        invisible={notifications.length === 0}
        sx={{
          // The dot hangs off the button's top-right corner by default. On a phone the
          // account avatar sits a few pixels to the right of that corner, so the dot reads as
          // attached to the avatar rather than the bell. Tuck it inside the button below md;
          // the md values are MUI's own, so desktop is unchanged.
          "& .MuiBadge-badge": {
            top: { xs: 7, md: 0 },
            right: { xs: 7, md: 0 },
            transform: { xs: "none", md: "scale(1) translate(50%, -50%)" },
          },
        }}
      >
        <IconButton
          color="inherit"
          onClick={popover.handleOpen}
          ref={popover.anchorRef}
          aria-label="Notifications"
          title="Notifications"
        >
          <SvgIcon color="action" fontSize="small">
            <CippIcons.BellIcon />
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
        slotProps={{
          paper: {
            sx: { width: 320 },
          }
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
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "flex-start"
                  }}>
                  <Box>
                    {getContent(notification)}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: "center",
                        mt: 1
                      }}>
                      <Typography variant="caption" sx={{
                        color: "text.secondary"
                      }}>
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
                    aria-label="Dismiss notification"
                    title="Dismiss notification"
                  >
                    <CippIcons.Close fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
        <Stack
          spacing={1}
          direction="row"
          sx={{
            justifyContent: "center",
            pb: 1
          }}>
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
                <CippIcons.Close />
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
