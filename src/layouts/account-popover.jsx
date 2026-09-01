import { useCallback } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";
import ArrowRightOnRectangleIcon from "@heroicons/react/24/outline/ArrowRightOnRectangleIcon";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import MoonIcon from "@heroicons/react/24/outline/MoonIcon";
import SunIcon from "@heroicons/react/24/outline/SunIcon";
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
import { CogIcon, DocumentTextIcon, LifebuoyIcon, TrashIcon } from "@heroicons/react/24/outline";
import ArrowTopRightOnSquareIcon from "@heroicons/react/24/outline/ArrowTopRightOnSquareIcon";
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

  const handleLogout = useCallback(async () => {
    try {
      popover.handleClose();
      // delete query cache and persisted data
      queryClient.clear();

      router.push("/.auth/logout?post_logout_redirect_uri=" + encodeURIComponent(paths.index));
    } catch (err) {
      console.error(err);
      console.log(orgData);
      toast.error("Something went wrong");
    }
  }, [router, popover]);

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
                  {orgData.data?.clientPrincipal?.userDetails?.split("@")?.[1]}
                </Typography>
                <Typography color="inherit" variant="subtitle2">
                  {orgData.data?.clientPrincipal?.userDetails ?? "Not logged in"}
                </Typography>
              </Box>
              {orgData.data?.clientPrincipal?.userDetails && (
                <>
                  {orgData?.isFetching ? (
                    <CircularProgress size={20} color="textPrimary" />
                  ) : (
                    <SvgIcon color="action" fontSize="small">
                      <ChevronDownIcon />
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
          PaperProps={{ sx: { width: 260 } }}
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
                        <MagnifyingGlassIcon />
                      </SvgIcon>
                    </ListItemIcon>
                    <ListItemText primary="Universal Search" />
                  </ListItemButton>
                )}
                <ListItemButton onClick={() => { popover.handleClose(); onThemeSwitch(); }}>
                  <ListItemIcon>
                    <SvgIcon fontSize="small">
                      {paletteMode === "dark" ? <SunIcon /> : <MoonIcon />}
                    </SvgIcon>
                  </ListItemIcon>
                  <ListItemText primary={paletteMode === "dark" ? "Light Mode" : "Dark Mode"} />
                </ListItemButton>
              </>
            )}
            <ListItemButton onClick={() => { popover.handleClose(); router.push("/cipp/preferences"); }}>
              <ListItemIcon>
                <SvgIcon fontSize="small">
                  <CogIcon />
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
                  <DocumentTextIcon />
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
                        <LifebuoyIcon />
                      </SvgIcon>
                    </ListItemIcon>
                    <ListItemText primary={link.name} />
                    <SvgIcon sx={{ fontSize: 16, color: "text.secondary" }}>
                      <ArrowTopRightOnSquareIcon />
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
                      <TrashIcon />
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
                  <ArrowPathIcon />
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
