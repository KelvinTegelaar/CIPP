import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  ButtonBase,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { Check, KeyboardArrowDown, Search } from "@mui/icons-material";
import { ApiGetCall } from "../../api/ApiCall";
import { CippBottomSheet } from "./CippBottomSheet";
import { useIsMobileLayout } from "../../hooks/use-breakpoint";

/**
 * The View User header's title as a switcher: the user's name in heading clothes with a
 * chevron, opening the tenant's user list to jump straight to another user without going
 * back through the table. Selection swaps only the userId in the current route, so whatever
 * tab you are on (View, Edit, Exchange…) stays the tab you land on.
 *
 * Same trigger both breakpoints; the list rides in a Popover on desktop and the house
 * bottom sheet on phones. The user list loads when first opened, not with the page.
 */
export const CippUserSwitcher = ({ title, currentUserId, tenantFilter }) => {
  const router = useRouter();
  const isMobile = useIsMobileLayout();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const anchorRef = useRef(null);

  const usersRequest = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: "users",
      tenantFilter: tenantFilter,
      $select: "id,displayName,userPrincipalName",
      $count: true,
      $orderby: "displayName",
      $top: 999,
    },
    queryKey: `UserSwitcher-${tenantFilter}`,
    waiting: open,
  });

  const filtered = useMemo(() => {
    const users = usersRequest.data?.Results ?? [];
    const needle = search.trim().toLowerCase();
    if (!needle) return users;
    return users.filter(
      (user) =>
        user.displayName?.toLowerCase().includes(needle) ||
        user.userPrincipalName?.toLowerCase().includes(needle)
    );
  }, [usersRequest.data, search]);

  const handleClose = () => {
    setOpen(false);
    setSearch("");
  };

  const handleSelect = (user) => {
    handleClose();
    if (user.id === currentUserId) return;
    router.push({ pathname: router.pathname, query: { ...router.query, userId: user.id } });
  };

  const listBody = (
    <>
      <Box sx={{ px: 2, pb: 1, pt: isMobile ? 0 : 1.5 }}>
        <TextField
          fullWidth
          size="small"
          // The theme defaults TextField to the filled variant, which reserves label space
          // and sinks the start adornment below center when there is no label.
          variant="outlined"
          autoFocus={!isMobile}
          placeholder="Search users..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {/* Dense two-line rows in the tenant selector's clothes — the first cut used the
          default List metrics and read as a page of loosely scattered names. */}
      <List dense disablePadding sx={{ overflowY: "auto", maxHeight: isMobile ? "55vh" : 340, pb: 1 }}>
        {usersRequest.isFetching &&
          [...Array(6)].map((_, index) => (
            <Box key={index} sx={{ px: 2, py: 0.75 }}>
              <Skeleton variant="text" width="45%" height={18} />
              <Skeleton variant="text" width="65%" height={13} />
            </Box>
          ))}
        {!usersRequest.isFetching && filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2 }}>
            No users match.
          </Typography>
        )}
        {!usersRequest.isFetching &&
          filtered.map((user) => (
            <ListItemButton
              key={user.id}
              selected={user.id === currentUserId}
              onClick={() => handleSelect(user)}
              sx={{ minHeight: 44, py: 0.5, px: 2, gap: 1 }}
            >
              <ListItemText
                primary={user.displayName}
                secondary={user.userPrincipalName}
                primaryTypographyProps={{ noWrap: true, variant: "body2", fontWeight: 500 }}
                secondaryTypographyProps={{ noWrap: true, variant: "caption" }}
                sx={{ my: 0, minWidth: 0 }}
              />
              {user.id === currentUserId && (
                <Check fontSize="small" color="primary" sx={{ flexShrink: 0 }} />
              )}
            </ListItemButton>
          ))}
      </List>
    </>
  );

  return (
    <>
      <ButtonBase
        ref={anchorRef}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        sx={{
          minWidth: 0,
          maxWidth: "100%",
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          borderRadius: 1,
          textAlign: "left",
          justifyContent: "flex-start",
        }}
      >
        <Typography variant={isMobile ? "h6" : "h4"} noWrap sx={{ minWidth: 0 }}>
          {title}
        </Typography>
        {/* Extends the accessible name instead of replacing it, so voice control can still
            activate the trigger by the visible name (same rule as CippTabPicker). */}
        <Box component="span" sx={visuallyHidden}>
          switch user
        </Box>
        <KeyboardArrowDown sx={{ flexShrink: 0, opacity: 0.7, fontSize: isMobile ? 20 : 24 }} />
      </ButtonBase>
      {isMobile ? (
        <CippBottomSheet open={open} onClose={handleClose} title="Users">
          {listBody}
        </CippBottomSheet>
      ) : (
        <Popover
          open={open}
          onClose={handleClose}
          anchorEl={anchorRef.current}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          slotProps={{
            paper: { sx: { width: 320, maxWidth: "calc(100vw - 32px)", borderRadius: 1.5, mt: 0.5 } },
          }}
        >
          {listBody}
        </Popover>
      )}
    </>
  );
};
