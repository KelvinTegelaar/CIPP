import { useCallback } from "react";
import { CippIcons } from "../utils/icon-registry";
import PropTypes from "prop-types";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { usePopover } from "../hooks/use-popover";
import { useIsMobileLayout } from "../hooks/use-breakpoint";
import { useDialog } from "../hooks/use-dialog";
import { paths } from "../paths";
import { ApiGetCall } from "../api/ApiCall";
import { CippApiDialog } from "../components/CippComponents/CippApiDialog";
import { useReleaseNotes } from "../contexts/release-notes-context";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { Divider } from "@mui/material";
import { getHelpLinks, clearCippCache } from "../utils/help-links";

export const AccountPopover = (props) => {
  const {
    direction = "ltr",
    language = "en",
    onThemeSwitch,
    onOpenSearch,
    paletteMode = "light",
    ...other
  } = props;
  const router = useRouter();
  const pathname = usePathname();
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const navCollapsed = useIsMobileLayout();
  const popover = usePopover();
  const queryClient = useQueryClient();
  const { openReleaseNotes } = useReleaseNotes();
  const orgData = ApiGetCall({
    url: "/api/me",
    queryKey: "authmecipp",
  });

  const userDetails = orgData.data?.clientPrincipal?.userDetails;

  // Cache user photo with user-specific key
  const userPhoto = ApiGetCall({
    url: "/api/ListUserPhoto",
    data: { UserID: userDetails },
    queryKey: `userPhoto-${userDetails}`,
    waiting: !!userDetails,
    staleTime: Infinity,
    responseType: "blob",
    convertToDataUrl: true,
  });

  // Re-checks Entra group membership server-side, then refetches /api/me so a role granted
  // through a just-activated PIM group applies without waiting out the role cache. Runs
  // through the standard confirm dialog, which also renders the API result.
  const refreshAccessDialog = useDialog();

  const handleLogout = useCallback(() => {
    const logoutUrl =
      "/.auth/logout?post_logout_redirect_uri=" + encodeURIComponent(paths.index);
    try {
      popover.handleClose();
      // delete query cache and persisted data
      queryClient.clear();

      router.push(logoutUrl);
    } catch (err) {
      console.error(err);
      // Fall back to a hard navigation so a router failure still logs the user out.
      window.location.href = logoutUrl;
    }
  }, [router, popover, queryClient]);

  const defaultAvatar = (
    <Avatar
      sx={{
        height: 40,
        width: 40,
        fontSize: 20,
      }}
      variant="rounded"
      src={userPhoto.data && !userPhoto.isError ? userPhoto.data : undefined}
    >
      {userDetails?.[0]?.toUpperCase() || ""}
    </Avatar>
  );

  return (
    <>
      <Stack
        direction="row"
        onClick={popover.handleOpen}
        ref={popover.anchorRef}
        spacing={2}
        {...other}
        sx={[{
          alignItems: "center",
          cursor: "pointer"
        }, ...(Array.isArray(other.sx) ? other.sx : [other.sx])]}>
        {defaultAvatar}
        <>
          {!mdDown && (
            <>
              <Box sx={{ minWidth: 100 }}>
                <Typography variant="caption" sx={{
                  color: "neutral.400"
                }}>
                  {orgData.data?.clientPrincipal?.userDetails?.split("@")?.[1]}
                </Typography>
                <Typography variant="subtitle2" sx={{
                  color: "inherit"
                }}>
                  {orgData.data?.clientPrincipal?.userDetails ?? "Not logged in"}
                </Typography>
              </Box>
              {orgData.data?.clientPrincipal?.userDetails && (
                <>
                  {orgData?.isFetching ? (
                    <CircularProgress size={20} color="textPrimary" />
                  ) : (
                    <SvgIcon color="action" fontSize="small">
                      <CippIcons.ChevronDownIcon />
                    </SvgIcon>
                  )}
                </>
              )}
            </>
          )}
        </>
      </Stack>
      {orgData.data?.clientPrincipal?.userDetails && (
        <CippApiDialog
          title="Refresh My Access"
          createDialog={refreshAccessDialog}
          api={{
            url: "/api/ExecRefreshMyAccess",
            type: "POST",
            data: {},
            confirmText:
              "Re-check your Entra group membership and refresh your CIPP roles? Use this after activating a role-mapped group through PIM.",
            relatedQueryKeys: ["authmecipp"],
          }}
        />
      )}
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
          slotProps={{
            paper: { sx: { width: 260 } }
          }}
        >
          <List>
            {/* Pairs with the trigger above: the identity is either beside the avatar or here. */}
            {mdDown && (
              <ListItem divider>
                <ListItemText
                  primary={orgData.data?.clientPrincipal?.userDetails}
                  secondary={orgData?.data?.Org?.Domain}
                />
              </ListItem>
            )}
            {/* Home for the two bar icons top-nav drops at navCollapsed (useIsMobileLayout),
                so they stay reachable wherever the bar isn't showing them. */}
            {navCollapsed && (
              <>
                {onOpenSearch && (
                  <ListItemButton
                    onClick={() => {
                      popover.handleClose();
                      onOpenSearch();
                    }}
                  >
                    <ListItemIcon>
                      <SvgIcon fontSize="small">
                        <CippIcons.MagnifyingGlassIcon />
                      </SvgIcon>
                    </ListItemIcon>
                    <ListItemText primary="Universal Search" />
                  </ListItemButton>
                )}
                <ListItemButton onClick={() => { popover.handleClose(); onThemeSwitch(); }}>
                  <ListItemIcon>
                    <SvgIcon fontSize="small">
                      {paletteMode === "dark" ? <CippIcons.SunIcon /> : <CippIcons.MoonIcon />}
                    </SvgIcon>
                  </ListItemIcon>
                  <ListItemText primary={paletteMode === "dark" ? "Light Mode" : "Dark Mode"} />
                </ListItemButton>
              </>
            )}
            <ListItemButton onClick={() => { popover.handleClose(); router.push("/cipp/preferences"); }}>
              <ListItemIcon>
                <SvgIcon fontSize="small">
                  <CippIcons.CogIcon />
                </SvgIcon>
              </ListItemIcon>
              <ListItemText primary="Preferences" />
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                popover.handleClose();
                openReleaseNotes();
              }}
            >
              <ListItemIcon>
                <SvgIcon fontSize="small">
                  <CippIcons.DocumentTextIcon />
                </SvgIcon>
              </ListItemIcon>
              <ListItemText primary="View release notes" />
            </ListItemButton>
            {/* Mobile home for the help SpeedDial's destinations — its FAB corner belongs
                to page actions there (the SpeedDial hides itself below md). */}
            {mdDown && (
              <>
                <Divider sx={{ my: 0.5 }} />
                {getHelpLinks(pathname ?? "").map((link) => (
                  <ListItemButton
                    key={link.id}
                    onClick={() => {
                      popover.handleClose();
                      window.open(link.href, "_blank");
                    }}
                  >
                    <ListItemIcon>
                      <SvgIcon fontSize="small">
                        <CippIcons.LifebuoyIcon />
                      </SvgIcon>
                    </ListItemIcon>
                    <ListItemText primary={link.name} />
                    <SvgIcon sx={{ fontSize: 16, color: "text.secondary" }}>
                      <CippIcons.ArrowTopRightOnSquareIcon />
                    </SvgIcon>
                  </ListItemButton>
                ))}
                <ListItemButton
                  onClick={() => {
                    popover.handleClose();
                    clearCippCache(queryClient);
                  }}
                >
                  <ListItemIcon>
                    <SvgIcon fontSize="small">
                      <CippIcons.TrashIcon />
                    </SvgIcon>
                  </ListItemIcon>
                  <ListItemText primary="Clear Cache and Reload" />
                </ListItemButton>
                <Divider sx={{ my: 0.5 }} />
              </>
            )}
            <ListItemButton
              onClick={() => {
                popover.handleClose();
                refreshAccessDialog.handleOpen();
              }}
            >
              <ListItemIcon>
                <SvgIcon fontSize="small">
                  <CippIcons.ArrowPathIcon />
                </SvgIcon>
              </ListItemIcon>
              <ListItemText
                primary="Refresh my access"
                secondary="Re-check role group membership"
              />
            </ListItemButton>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <SvgIcon fontSize="small">
                  <CippIcons.ArrowRightOnRectangleIcon />
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
