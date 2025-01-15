import { useCallback } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ArrowRightOnRectangleIcon from "@heroicons/react/24/outline/ArrowRightOnRectangleIcon";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import MoonIcon from "@heroicons/react/24/outline/MoonIcon";
import SunIcon from "@heroicons/react/24/outline/SunIcon";
import {
  Avatar,
  Box,
  FormControlLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Stack,
  SvgIcon,
  Switch,
  Typography,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { usePopover } from "../hooks/use-popover";
import { paths } from "../paths";
import { ApiGetCall } from "../api/ApiCall";
import { CogIcon } from "@heroicons/react/24/outline";

export const AccountPopover = (props) => {
  const {
    direction = "ltr",
    language = "en",
    onThemeSwitch,
    paletteMode = "light",
    ...other
  } = props;
  const router = useRouter();
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const popover = usePopover();

  const orgData = ApiGetCall({
    url: "/.auth/me",
    queryKey: "me",
  });

  const handleLogout = useCallback(async () => {
    try {
      popover.handleClose();

      router.push("/.auth/logout?post_logout_redirect_uri=" + encodeURIComponent(paths.index));
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  }, [router, popover]);

  const defaultAvatar = (
    <Avatar
      sx={{
        height: 40,
        width: 40,
      }}
      variant="rounded"
      src={
        orgData.data?.clientPrincipal?.userDetails
          ? `/api/ListUserPhoto?UserID=${orgData.data?.clientPrincipal?.userDetails}`
          : ""
      }
    >
      {orgData.data?.userDetails?.[0] || ""}
    </Avatar>
  );

  return (
    <>
      <Stack
        alignItems="center"
        direction="row"
        onClick={popover.handleOpen}
        ref={popover.anchorRef}
        spacing={2}
        sx={{ cursor: "pointer" }}
        {...other}
      >
        {defaultAvatar}
        <>
          {!mdDown && (
            <>
              <Box sx={{ minWidth: 100 }}>
                <Typography color="neutral.400" variant="caption">
                  {orgData.data?.Org?.Domain}
                </Typography>
                <Typography color="inherit" variant="subtitle2">
                  {orgData.data?.clientPrincipal?.userDetails ?? "Not logged in"}
                </Typography>
              </Box>
              {orgData.data?.clientPrincipal?.userDetails && (
                <SvgIcon color="action" fontSize="small">
                  <ChevronDownIcon />
                </SvgIcon>
              )}
            </>
          )}
        </>
      </Stack>
      {orgData.data?.clientPrincipal?.userDetails && (
        <Popover
          anchorEl={popover.anchorRef.current}
          anchorOrigin={{
            horizontal: "center",
            vertical: "bottom",
          }}
          disableScrollLock
          onClose={popover.handleClose}
          open={popover.open}
          PaperProps={{ sx: { width: 260 } }}
        >
          <List>
            {mdDown && (
              <>
                <ListItem divider>
                  <ListItemText
                    primary={orgData.data?.clientPrincipal?.userDetails}
                    secondary={orgData?.data?.Org?.Domain}
                  />
                </ListItem>
                <ListItemButton onClick={onThemeSwitch}>
                  <ListItemIcon>
                    <SvgIcon fontSize="small">
                      {paletteMode === "dark" ? <SunIcon /> : <MoonIcon />}
                    </SvgIcon>
                  </ListItemIcon>
                  <ListItemText primary={paletteMode === "dark" ? "Light Mode" : "Dark Mode"} />
                </ListItemButton>
              </>
            )}
            <ListItemButton onClick={() => router.push("/cipp/preferences")}>
              <ListItemIcon>
                <SvgIcon fontSize="small">
                  <CogIcon />
                </SvgIcon>
              </ListItemIcon>
              <ListItemText primary="Preferences" />
            </ListItemButton>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <SvgIcon fontSize="small">
                  <ArrowRightOnRectangleIcon />
                </SvgIcon>
              </ListItemIcon>
              <ListItemText primary="Log out" />
            </ListItemButton>
          </List>
        </Popover>
      )}
    </>
  );
};

AccountPopover.propTypes = {
  onThemeSwitch: PropTypes.func,
  paletteMode: PropTypes.oneOf(["dark", "light"]),
};
