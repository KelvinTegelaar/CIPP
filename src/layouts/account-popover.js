import { useCallback } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ArrowRightOnRectangleIcon from "@heroicons/react/24/outline/ArrowRightOnRectangleIcon";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import UserIcon from "@heroicons/react/24/outline/UserIcon";
import {
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
        <>
          {mdDown && (
            <SvgIcon color="action" fontSize="small">
              <UserIcon />
            </SvgIcon>
          )}
          {!mdDown && (
            <>
              <SvgIcon color="action" fontSize="small">
                <UserIcon />
              </SvgIcon>
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
              <ListItem divider>
                <ListItemText
                  primary={orgData.data?.clientPrincipal?.userDetails}
                  secondary={orgData?.data?.Org?.Domain}
                />
              </ListItem>
            )}
            <li>
              <List disablePadding>
                {mdDown && (
                  <ListItem sx={{ py: 0 }}>
                    <FormControlLabel
                      control={<Switch checked={paletteMode === "dark"} onChange={onThemeSwitch} />}
                      label="Dark Mode"
                    />
                  </ListItem>
                )}
              </List>
            </li>
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
