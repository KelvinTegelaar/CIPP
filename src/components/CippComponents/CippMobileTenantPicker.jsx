import { useMemo, useState } from "react";
import { CippIcons } from "../../utils/icon-registry";
import {
  Avatar,
  Box,
  ButtonBase,
  Chip,
  Dialog,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { ApiGetCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";
import { useTenantPreferences } from "../../hooks/use-tenant-preferences";

// Mobile replacement for the 400px CippTenantSelector Autocomplete: a top-bar chip opening
// a fullscreen picker (the CippApiDialog fullscreen-on-mobile precedent). Shares the
// "TenantSelector" query cache and the same favourites/recent preference store. Selection
// writes settings + the tenantFilter URL param directly — the desktop selector (which
// normally owns that sync) is not mounted on mobile.
export const CippMobileTenantPicker = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const settings = useSettings();
  const queryClient = useQueryClient();
  const { recent, favorites, trackRecent, toggleFavorite, isFavorite } = useTenantPreferences();

  const tenantList = ApiGetCall({
    url: "/api/listTenants",
    data: { AllTenantSelector: true },
    queryKey: "TenantSelector",
    refetchOnMount: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
  });

  const currentTenant = router.query.tenantFilter ?? settings.currentTenant;

  const tenants = useMemo(
    () => (tenantList.isSuccess && Array.isArray(tenantList.data) ? tenantList.data : []),
    [tenantList.isSuccess, tenantList.data]
  );

  const currentDisplayName = useMemo(() => {
    if (currentTenant === "AllTenants") return "All Tenants";
    const match = tenants.find((t) => t.defaultDomainName === currentTenant);
    return match?.displayName ?? currentTenant ?? "Select tenant";
  }, [tenants, currentTenant]);

  const groups = useMemo(() => {
    const selectable = tenants.filter((t) => t.defaultDomainName !== "AllTenants");
    const query = search.trim().toLowerCase();
    const matches = query
      ? selectable.filter(
          (t) =>
            t.displayName?.toLowerCase().includes(query) ||
            t.defaultDomainName?.toLowerCase().includes(query)
        )
      : selectable;

    const favoriteValues = new Set(favorites.map((f) => f.value));
    const recentValues = recent.map((r) => r.value).filter((v) => !favoriteValues.has(v));
    const byValue = new Map(matches.map((t) => [t.defaultDomainName, t]));

    return {
      favorites: favorites.map((f) => byValue.get(f.value)).filter(Boolean),
      recent: recentValues.map((v) => byValue.get(v)).filter(Boolean),
      // Favorites/Recent are shortcuts, not removals: every tenant stays in "All tenants"
      // so it can still be found in its alphabetical position.
      all: matches
        .slice()
        .sort((a, b) => (a.displayName ?? "").localeCompare(b.displayName ?? "")),
    };
  }, [tenants, favorites, recent, search]);

  const selectTenant = (value, tenant) => {
    // Same contract as the desktop selector's URL watcher: cancel in-flight queries,
    // update settings, and normalize the tenantFilter URL param.
    queryClient.cancelQueries();
    if (tenant) {
      trackRecent({
        value: tenant.defaultDomainName,
        label: `${tenant.displayName} (${tenant.defaultDomainName})`,
        addedFields: {
          defaultDomainName: tenant.defaultDomainName,
          displayName: tenant.displayName,
          customerId: tenant.customerId,
          initialDomainName: tenant.initialDomainName,
        },
      });
    }
    settings.handleUpdate({ currentTenant: value });
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, tenantFilter: value },
      },
      undefined,
      { shallow: true }
    );
    setOpen(false);
    setSearch("");
  };

  // Group-scoped key: a tenant now appears in both Favorites/Recent and "All tenants",
  // and every row is a sibling in the same <List>, so the domain alone would collide.
  const renderTenantRow = (tenant, group) => {
    const value = tenant.defaultDomainName;
    const favorited = isFavorite(value);
    const isCurrent = value === currentTenant;
    return (
      <ListItemButton
        key={`${group}-${value}`}
        onClick={() => selectTenant(value, tenant)}
        sx={{ minHeight: 52, gap: 1.5 }}
      >
        <Avatar
          sx={{
            width: 34,
            height: 34,
            fontSize: 14,
            bgcolor: "primary.alpha12",
            color: "primary.main",
            fontWeight: 700,
          }}
        >
          {(tenant.displayName ?? "?").charAt(0).toUpperCase()}
        </Avatar>
        <ListItemText
          primary={tenant.displayName}
          secondary={value}
          sx={{ minWidth: 0, my: 0 }}
          slotProps={{
            primary: { noWrap: true },
            secondary: { noWrap: true, variant: "caption" }
          }} />
        {isCurrent && (
          <Chip label="Current" size="small" variant="outlined" sx={{ flexShrink: 0, height: 22 }} />
        )}
        <IconButton
          aria-label={favorited ? "Remove favorite" : "Add favorite"}
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite({
              value,
              label: `${tenant.displayName} (${value})`,
            });
          }}
          sx={{
            color: favorited ? "warning.main" : "action.active",
            flexShrink: 0,
            minWidth: 44,
            minHeight: 44,
          }}
        >
          {favorited ? <CippIcons.Star fontSize="small" /> : <CippIcons.StarBorder fontSize="small" />}
        </IconButton>
      </ListItemButton>
    );
  };

  return (
    <>
      <ButtonBase
        onClick={() => setOpen(true)}
        aria-label="Select tenant"
        sx={{
          flex: 1,
          minWidth: 0,
          height: 40,
          px: 1.25,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          justifyContent: "flex-start",
          bgcolor: "rgba(255,255,255,.08)",
          color: "common.white",
        }}
      >
        {currentTenant === "AllTenants" && <CippIcons.Public sx={{ fontSize: 16, flexShrink: 0 }} />}
        <Typography variant="body2" noWrap sx={{ fontWeight: 500, minWidth: 0, flex: 1, textAlign: "left" }}>
          {currentDisplayName}
        </Typography>
        {/* Pinned to the chip's right edge so it reads as the control's affordance rather
            than punctuation trailing whatever the tenant happens to be called */}
        <CippIcons.KeyboardArrowDown sx={{ fontSize: 16, flexShrink: 0, opacity: 0.7, ml: "auto" }} />
      </ButtonBase>

      <Dialog fullScreen open={open} onClose={() => setOpen(false)}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, p: 1, pb: 0 }}>
          <IconButton onClick={() => setOpen(false)} aria-label="Close" sx={{ minWidth: 44, minHeight: 44 }}>
            <CippIcons.Close />
          </IconButton>
          <Typography variant="h6">Select tenant</Typography>
        </Box>
        <Box sx={{ px: 1.5, py: 1 }}>
          <OutlinedInput
            fullWidth
            autoFocus
            type="search"
            placeholder={`Search ${tenants.length ? tenants.length - 1 : ""} tenants…`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{ input: { enterKeyHint: "search", "aria-label": "Search tenants" } }}
            startAdornment={
              <InputAdornment position="start">
                <CippIcons.Search fontSize="small" />
              </InputAdornment>
            }
            sx={{ minHeight: 44 }}
          />
        </Box>
        <Box sx={{ overflowY: "auto", flex: 1, pb: "env(safe-area-inset-bottom)" }}>
          <List disablePadding>
            {!search && (
              <ListItemButton
                onClick={() => selectTenant("AllTenants")}
                sx={{ minHeight: 52, gap: 1.5 }}
              >
                {/* Avatar's default colour is background.default, so setting only bgcolor
                    left the glyph a dark grey sitting on the accent. getContrastText rather
                    than contrastText: the accent is a mid orange, and white on it measures
                    2.6:1 — below the 3:1 a 24px glyph needs. This picks the dark ink. */}
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: "primary.main",
                    color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
                  }}
                >
                  <CippIcons.Public fontSize="small" />
                </Avatar>
                <ListItemText
                  primary="All Tenants"
                  sx={{ my: 0 }}
                  slotProps={{
                    primary: { fontWeight: 600 }
                  }}
                />
                {currentTenant === "AllTenants" && (
                  <Chip label="Current" size="small" variant="outlined" sx={{ height: 22 }} />
                )}
              </ListItemButton>
            )}
            {groups.favorites.length > 0 && (
              <>
                <ListSubheader disableSticky>Favorites</ListSubheader>
                {groups.favorites.map((tenant) => renderTenantRow(tenant, "favorites"))}
              </>
            )}
            {groups.recent.length > 0 && (
              <>
                <ListSubheader disableSticky>Recent</ListSubheader>
                {groups.recent.map((tenant) => renderTenantRow(tenant, "recent"))}
              </>
            )}
            <ListSubheader disableSticky>All tenants</ListSubheader>
            {tenantList.isFetching && groups.all.length === 0 && (
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  px: 2,
                  py: 2
                }}>
                Loading tenants…
              </Typography>
            )}
            {groups.all.map((tenant) => renderTenantRow(tenant, "all"))}
            {!tenantList.isFetching &&
              search &&
              groups.all.length + groups.favorites.length + groups.recent.length === 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    px: 2,
                    py: 2
                  }}>
                  No tenants match “{search}”.
                </Typography>
              )}
          </List>
        </Box>
      </Dialog>
    </>
  );
};
