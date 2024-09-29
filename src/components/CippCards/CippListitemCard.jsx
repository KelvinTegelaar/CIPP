import ArrowRightIcon from "@heroicons/react/24/outline/ArrowRightIcon";
import CubeIcon from "@heroicons/react/24/outline/CubeIcon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
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
  Skeleton,
  SvgIcon,
  Typography,
} from "@mui/material";

const getContent = (notification, textKey) => {
  return (
    <>
      <ListItemIcon>
        <SvgIcon fontSize="small">{notification.icon ? notification.icon : <CubeIcon />}</SvgIcon>
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography color="inherit" variant="body2">
            <Typography color="inherit" component="span" variant="subtitle2">
              {notification[textKey]}
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
};

export const CippListItemCard = ({
  isFetching,
  title,
  listitems = [],
  textKey,
  seeAllLink,
  seeAllText,
}) => {
  //if listitems is a blank array, null, or undefined, set it an array with 1 item. "No messages found. You're good to go!"
  if (!listitems || listitems.length === 0) {
    listitems = [
      {
        id: "no-messages",
        icon: <UsersIcon />,
        [textKey]: "No messages found. You're good to go!",
      },
    ];
  }
  return (
    <Card style={{ width: "100%" }}>
      <CardHeader title={title} />
      <Divider />
      <List>
        {isFetching
          ? [0, 1, 2, 3].map((index) => (
              <ListItem divider key={`listitem-placeholder-${index}`}>
                <ListItemIcon>
                  <SvgIcon fontSize="small">
                    <CubeIcon />
                  </SvgIcon>
                </ListItemIcon>
                <ListItemText>
                  <Typography color="inherit" variant="body2">
                    <Skeleton height={30} />
                  </Typography>
                </ListItemText>
                <ListItemSecondaryAction>
                  <IconButton size="small">
                    <SvgIcon fontSize="small">
                      <ArrowRightIcon />
                    </SvgIcon>
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          : listitems.map((notification, index) => {
              const hasDivider = listitems.length > index + 1;
              return (
                <ListItem key={`listitem-${index}`} divider={hasDivider}>
                  {getContent(notification, textKey)}
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
        {listitems.length > 1 && (
          <Button
            href={seeAllLink}
            color="inherit"
            endIcon={
              <SvgIcon fontSize="small">
                <ArrowRightIcon />
              </SvgIcon>
            }
          >
            {seeAllText}
          </Button>
        )}
      </Box>
    </Card>
  );
};
