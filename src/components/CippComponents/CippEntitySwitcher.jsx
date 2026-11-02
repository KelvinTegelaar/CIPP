import { useMemo, useRef, useState } from "react";
import { CippIcons } from "../../utils/icon-registry";
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
import { ApiGetCall } from "../../api/ApiCall";
import { CippBottomSheet } from "./CippBottomSheet";
import { useIsMobileLayout } from "../../hooks/use-breakpoint";

/**
 * A detail page's title as a switcher: the entity's name in heading clothes with a chevron,
 * opening a searchable list of sibling entities to jump straight to another one without going
 * back through the table. Selection swaps only `queryParamKey` in the current route, so
 * whatever tab you are on stays the tab you land on. Mount via HeaderedTabbedLayout's
 * titleControl slot; per-entity presets (CippUserSwitcher and friends) wrap this.
 *
 * Same trigger both breakpoints; the list rides in a Popover on desktop and the house
 * bottom sheet on phones. The list loads when first opened, not with the page — pass
 * `eager` only when the query is already cached app-wide (e.g. the tenant selector's).
 */
export const CippEntitySwitcher = ({
  title,
  currentId,
  queryParamKey,
  api,
  entityName,
  entityNamePlural = `${entityName}s`,
  getOptions = (data) => data?.Results ?? [],
  getId = (row) => row.id,
  getPrimary = (row) => row.displayName,
  getSecondary,
  // For endpoints without server-side ordering (Intune, ListGDAPRelationships).
  sortByPrimary = false,
  eager = false,
}) => {
  const router = useRouter();
  const isMobile = useIsMobileLayout();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const anchorRef = useRef(null);

  const listRequest = ApiGetCall({
    ...api,
    waiting: open || eager,
  });

  const filtered = useMemo(() => {
    let rows = getOptions(listRequest.data) ?? [];
    if (sortByPrimary) {
      rows = [...rows].sort((a, b) =>
        String(getPrimary(a) ?? "").localeCompare(String(getPrimary(b) ?? ""), undefined, {
          sensitivity: "base",
        })
      );
    }
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (row) =>
        String(getPrimary(row) ?? "").toLowerCase().includes(needle) ||
        String(getSecondary?.(row) ?? "").toLowerCase().includes(needle)
    );
  }, [listRequest.data, search, sortByPrimary, getOptions, getId, getPrimary, getSecondary]);

  const handleClose = () => {
    setOpen(false);
    setSearch("");
  };

  const handleSelect = (row) => {
    handleClose();
    if (getId(row) === currentId) return;
    router.push({
      pathname: router.pathname,
      query: { ...router.query, [queryParamKey]: getId(row) },
    });
  };

  const sheetTitle = entityNamePlural.charAt(0).toUpperCase() + entityNamePlural.slice(1);

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
          placeholder={`Search ${entityNamePlural}...`}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <CippIcons.Search fontSize="small" />
                </InputAdornment>
              ),
            }
          }}
        />
      </Box>
      {/* Dense two-line rows in the tenant selector's clothes — the first cut used the
          default List metrics and read as a page of loosely scattered names. */}
      <List dense disablePadding sx={{ overflowY: "auto", maxHeight: isMobile ? "55vh" : 340, pb: 1 }}>
        {listRequest.isFetching &&
          [...Array(6)].map((_, index) => (
            <Box key={index} sx={{ px: 2, py: 0.75 }}>
              <Skeleton variant="text" width="45%" height={18} />
              <Skeleton variant="text" width="65%" height={13} />
            </Box>
          ))}
        {!listRequest.isFetching && filtered.length === 0 && (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              px: 2,
              py: 2
            }}>
            No {entityNamePlural} match.
          </Typography>
        )}
        {!listRequest.isFetching &&
          filtered.map((row) => (
            <ListItemButton
              key={getId(row)}
              selected={getId(row) === currentId}
              onClick={() => handleSelect(row)}
              sx={{ minHeight: 44, py: 0.5, px: 2, gap: 1 }}
            >
              <ListItemText
                primary={getPrimary(row)}
                secondary={getSecondary?.(row)}
                sx={{ my: 0, minWidth: 0 }}
                slotProps={{
                  primary: { noWrap: true, variant: "body2", fontWeight: 500 },
                  secondary: { noWrap: true, variant: "caption" }
                }} />
              {getId(row) === currentId && (
                <CippIcons.Check fontSize="small" color="primary" sx={{ flexShrink: 0 }} />
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
        {/* Same wrap rule as the layout's plain title: truncate on mobile, wrap on desktop.
            When the title wraps, its box fills the row, so a sibling chevron ends up
            stranded at the far edge — on desktop the chevron rides inline after the last
            word instead. Mobile keeps the sibling: inline would be clipped by noWrap. */}
        {isMobile ? (
          <>
            <Typography variant="h6" noWrap sx={{ minWidth: 0 }}>
              {title}
            </Typography>
            {/* Extends the accessible name instead of replacing it, so voice control can
                still activate the trigger by the visible name (same rule as CippTabPicker). */}
            <Box component="span" sx={visuallyHidden}>
              switch {entityName}
            </Box>
            <CippIcons.KeyboardArrowDown sx={{ flexShrink: 0, opacity: 0.7, fontSize: 20 }} />
          </>
        ) : (
          <>
            <Typography variant="h4" sx={{ minWidth: 0 }}>
              {title}
              <CippIcons.KeyboardArrowDown
                sx={{ opacity: 0.7, fontSize: 24, verticalAlign: "middle", ml: 0.75 }}
              />
            </Typography>
            {/* Sibling of the heading, not inside it: inline nodes concatenate without a
                space in the accessible name, gluing the title to "switch". */}
            <Box component="span" sx={visuallyHidden}>
              switch {entityName}
            </Box>
          </>
        )}
      </ButtonBase>
      {isMobile ? (
        <CippBottomSheet open={open} onClose={handleClose} title={sheetTitle}>
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
