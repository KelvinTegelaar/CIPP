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
import { CippIcons } from "../../utils/icon-registry";

const getContent = (notification, textKey) => {
  return (
    <>
      <ListItemIcon>
        <SvgIcon fontSize="small">{notification.icon ? notification.icon : <CippIcons.CubeIcon />}</SvgIcon>
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2" sx={{
            color: "inherit"
          }}>
            <Typography component="span" variant="subtitle2" sx={{
              color: "inherit"
            }}>
              {notification[textKey]}
            </Typography>
          </Typography>
        }
      />
      <ListItemSecondaryAction>
        <IconButton size="small">
          <SvgIcon fontSize="small">
            <CippIcons.ArrowRightIcon />
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
        icon: <CippIcons.UsersIcon />,
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
                    <CippIcons.CubeIcon />
                  </SvgIcon>
                </ListItemIcon>
                <ListItemText>
                  <Typography variant="body2" sx={{
                    color: "inherit"
                  }}>
                    <Skeleton height={30} />
                  </Typography>
                </ListItemText>
                <ListItemSecondaryAction>
                  <IconButton size="small">
                    <SvgIcon fontSize="small">
                      <CippIcons.ArrowRightIcon />
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
                <CippIcons.ArrowRightIcon />
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
