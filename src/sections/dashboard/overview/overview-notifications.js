import PropTypes from "prop-types";
import ArrowRightIcon from "@heroicons/react/24/outline/ArrowRightIcon";
import CubeIcon from "@heroicons/react/24/outline/CubeIcon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import CurrencyDollarIcon from "@heroicons/react/24/outline/CurrencyDollarIcon";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  SvgIcon,
  Typography,
} from "@mui/material";

const getContent = (notification) => {
  switch (notification.type) {
    case "pendingOrders":
      return (
        <>
          <ListItemIcon>
            <SvgIcon fontSize="small">
              <CubeIcon />
            </SvgIcon>
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography color="inherit" variant="body2">
                <Typography color="inherit" component="span" variant="subtitle2">
                  {notification.orders} pending orders
                </Typography>{" "}
                needs your attention.
              </Typography>
            }
          />
          <ListItemSecondaryAction>
            <IconButton size="small">
              <SvgIcon fontSize="small">
                <ArrowRightIcon />
              </SvgIcon>
            </IconButton>
          </ListItemSecondaryAction>
        </>
      );

    case "pendingTransactions":
      return (
        <>
          <ListItemIcon>
            <SvgIcon fontSize="small">
              <CurrencyDollarIcon />
            </SvgIcon>
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography color="inherit" variant="body2">
                <Typography color="inherit" component="span" variant="subtitle2">
                  {notification.transactions} pending transactions
                </Typography>{" "}
                needs your attention.
              </Typography>
            }
          />
          <ListItemSecondaryAction>
            <IconButton size="small">
              <SvgIcon fontSize="small">
                <ArrowRightIcon />
              </SvgIcon>
            </IconButton>
          </ListItemSecondaryAction>
        </>
      );

    case "teamNotes":
      return (
        <>
          <ListItemIcon>
            <SvgIcon fontSize="small">
              <UsersIcon />
            </SvgIcon>
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography color="inherit" variant="body2">
                <Typography color="inherit" component="span" variant="subtitle2">
                  {notification.notes} team notes
                </Typography>{" "}
                at the{" "}
                <Typography color="inherit" component="span" variant="subtitle2">
                  {notification.subject}.
                </Typography>
              </Typography>
            }
          />
          <ListItemSecondaryAction>
            <IconButton size="small">
              <SvgIcon fontSize="small">
                <ArrowRightIcon />
              </SvgIcon>
            </IconButton>
          </ListItemSecondaryAction>
        </>
      );

    default:
      return null;
  }
};

export const OverviewNotifications = (props) => {
  const { notifications = [] } = props;

  return (
    <Card style={{ width: "100%" }}>
      <CardHeader title="Notifications" />
      <Divider />
      <List>
        {notifications.map((notification, index) => {
          const hasDivider = notifications.length > index + 1;

          
          return (
            <ListItem key={notification.id} divider={hasDivider}>
              {getContent(notification)}
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box
        sx={{
          py: 1,
          px: 3,
        }}
      >
        <Button
          color="inherit"
          endIcon={
            <SvgIcon fontSize="small">
              <ArrowRightIcon />
            </SvgIcon>
          }
        >
          See all notifications
        </Button>
      </Box>
    </Card>
  );
};

OverviewNotifications.propTypes = {
  notifications: PropTypes.array,
};
