import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  IconButton,
  LinearProgress,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { flexRender } from "material-react-table";
import { Info, MoreVert, MoreHoriz, SearchOff } from "@mui/icons-material";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { renderUrlValue } from "../../utils/render-url-value";
import { getMobileCardSlots } from "./util-mobile-card-slots";
import { CippBottomSheet } from "../CippComponents/CippBottomSheet";
import { CippPageActionsFab } from "../CippComponents/CippPageActionsFab";
import { useActionCornerClaim } from "../../layouts/tab-navigation-context";
import { useSheetHandoff } from "../../hooks/use-sheet-handoff";

// Mobile card pageSize ceiling: a desktop tablePageSize of 250/500 must not become
// 250 unvirtualized cards. "Load more" grows pageSize from here in steps of LOAD_STEP.
const MOBILE_PAGE_SIZE_CAP = 50;
const LOAD_STEP = 50;

// Chip values that say nothing without their field name beside them.
const MUTE_ALONE = new Set(["high", "medium", "low", "critical", "informational"]);

// Render one column's value for a row. Generated columns (util-columnsFromAPI) only use
// { row } in their Cell, but page-supplied columns may expect fuller MRT context, so we
// hand over the real cell context when the cell exists.
const renderCellValue = (row, column, table) => {
  const columnDef = column?.columnDef ?? column;
  try {
    const cell = row.getAllCells().find((c) => c.column.id === column.id);
    // A portal cell is a bare icon — legible under its column header, not on a card row
    // that only carries a label. Spell the link out from the raw value instead.
    const linked = renderUrlValue(row.original?.[column.id], column.id);
    if (linked) return linked;
    if (typeof columnDef?.Cell === "function") {
      return flexRender(columnDef.Cell, {
        row,
        cell,
        column: cell?.column ?? column,
        table,
        renderedCellValue: cell ? cell.getValue() : row.getValue(column.id),
      });
    }
    return cell ? cell.getValue() : row.getValue(column.id);
  } catch {
    return null;
  }
};

// String form for the card title/subtitle: the accessorFn output (getCippFormatting text
// mode for generated columns) — never a React node inside noWrap Typography.
const textValue = (row, column) => {
  if (!column) return null;
  try {
    const value = row.getValue(column.id);
    return typeof value === "string" || typeof value === "number" ? String(value) : null;
  } catch {
    return null;
  }
};

const SkeletonCard = () => (
  <Card variant="outlined" sx={{ p: 1.5 }}>
    <Skeleton variant="text" width="55%" height={24} />
    <Skeleton variant="text" width="75%" height={18} />
    <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
      <Skeleton variant="rounded" width={70} height={22} sx={{ borderRadius: 999 }} />
      <Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: 999 }} />
    </Stack>
    <Stack spacing={0.5} sx={{ mt: 1.25 }}>
      <Skeleton variant="text" width="88%" height={16} />
      <Skeleton variant="text" width="64%" height={16} />
      <Skeleton variant="text" width="72%" height={16} />
    </Stack>
  </Card>
);

export const CippMobileCardList = (props) => {
  const {
    table,
    actions,
    hasOffCanvas = false,
    onRowAction,
    onMoreInfo,
    isActionDisabled,
    getActionRow = (row) => row,
    selectMode = false,
    cardButton,
    mobileCard,
    fixedChrome = true,
    onClearFilters,
    isStreaming = false,
    queueMessage,
  } = props;

  const [actionSheetRow, setActionSheetRow] = useState(null);
  // Row actions and More info both open a Modal — hand the sheet off rather than racing it
  const rowSheet = useSheetHandoff(() => setActionSheetRow(null));

  // Select mode's bulk bar owns the bottom of the screen, so the page FAB steps aside. Hold
  // the corner through it anyway: a headered layout would otherwise drop its actions FAB in
  // behind the bulk bar. Navigation is unaffected — the tab picker is in the title row.
  useActionCornerClaim(fixedChrome && selectMode);

  // A desktop tablePageSize above the cap would render that many unvirtualized cards.
  useEffect(() => {
    if (table.getState().pagination.pageSize > MOBILE_PAGE_SIZE_CAP) {
      table.setPageSize(MOBILE_PAGE_SIZE_CAP);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = table.getRowModel().rows;
  const totalFiltered = table.getFilteredRowModel().rows.length;
  const showSkeletons = table.getState().showSkeletons;
  const { globalFilter, columnFilters } = table.getState();
  const hasActiveFilter = Boolean(globalFilter) || (columnFilters?.length ?? 0) > 0;

  const visibleColumns = table.getVisibleLeafColumns();
  const slots = useMemo(
    () => getMobileCardSlots(visibleColumns, mobileCard),
    // visibleColumns is a fresh array each call — key on the ids it contains
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleColumns.map((c) => c.id).join(","), mobileCard]
  );

  const rowActionItems = (row) =>
    (actions ?? []).filter(
      (action) =>
        typeof action.hideCondition !== "function" || !action.hideCondition(getActionRow(row.original))
    );

  // Detail rows that would waste space: empty values, or values already shown as the
  // card's title/subtitle (e.g. mail duplicating the UPN on most user rows).
  const visibleDetailColumns = (row) => {
    const shown = [textValue(row, slots.primary), slots.secondary && textValue(row, slots.secondary)]
      .filter(Boolean)
      .map((v) => v.toLowerCase());
    return slots.details.filter((col) => {
      let raw;
      try {
        raw = row.getValue(col.id);
      } catch {
        return true;
      }
      if (raw === null || raw === undefined || raw === "") return false;
      if (Array.isArray(raw) && raw.length === 0) return false;
      if (typeof raw === "string" && shown.includes(raw.toLowerCase())) return false;
      return true;
    });
  };

  const handleCardTap = (event, row) => {
    if (
      event.target?.closest?.(
        'button, a, input, textarea, select, [role="button"], [role="menuitem"], [data-no-row-click="true"]'
      )
    ) {
      return;
    }
    if (selectMode) {
      row.toggleSelected();
      return;
    }
    if (hasOffCanvas) {
      onMoreInfo?.(row.original);
    }
  };

  const handleLoadMore = () => {
    table.setPageSize(table.getState().pagination.pageSize + LOAD_STEP);
  };

  const loadedCount = Math.min(rows.length, totalFiltered);

  return (
    <Box data-testid="cipp-mobile-card-list">
      {isStreaming && !showSkeletons && <LinearProgress sx={{ height: 3 }} />}
      {/* pb clears the fixed FAB / bulk bar — chrome an embedded (noCard/dialog) list does
          not have, so it pays a normal gap instead of 80px of blank card. */}
      <Stack
        spacing={1}
        sx={{ px: fixedChrome ? 1 : 0, pt: 0.75, pb: fixedChrome ? (selectMode ? 12 : 10) : 1 }}
      >
        {showSkeletons ? (
          Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} />)
        ) : totalFiltered === 0 ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <SvgIcon sx={{ fontSize: 36, color: "text.secondary" }}>
              {queueMessage ? <Info /> : <SearchOff />}
            </SvgIcon>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              {queueMessage ?? "No results"}
            </Typography>
            {hasActiveFilter && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Nothing matches the current search and filters.
                </Typography>
                <Button variant="contained" sx={{ mt: 2, minHeight: 44 }} onClick={onClearFilters}>
                  Clear filters
                </Button>
              </>
            )}
          </Box>
        ) : (
          <>
            {rows.map((row) => {
              const selected = row.getIsSelected();
              const detailColumns = visibleDetailColumns(row);
              return (
                <Card
                  key={row.id}
                  variant="outlined"
                  onClick={(event) => handleCardTap(event, row)}
                  sx={{
                    p: 2,
                    display: "flex",
                    gap: 1.25,
                    position: "relative",
                    cursor: selectMode || hasOffCanvas ? "pointer" : "default",
                    ...(selected && {
                      borderColor: "primary.main",
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(247,127,0,.08)"
                          : "primary.alpha8",
                    }),
                  }}
                >
                  {selectMode && (
                    <Checkbox
                      checked={selected}
                      onChange={() => row.toggleSelected()}
                      sx={{ alignSelf: "flex-start", p: 1, m: -0.5 }}
                      inputProps={{ "aria-label": `Select ${textValue(row, slots.primary) ?? row.id}` }}
                    />
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle1"
                      noWrap
                      sx={{ fontWeight: 600, pr: actions?.length || hasOffCanvas ? 4.5 : 0 }}
                    >
                      {textValue(row, slots.primary) ?? "—"}
                    </Typography>
                    {slots.secondary && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {textValue(row, slots.secondary)}
                      </Typography>
                    )}
                    {slots.chips.length > 0 && (
                      <Stack
                        direction="row"
                        spacing={0.75}
                        useFlexGap
                        flexWrap="wrap"
                        sx={{ mt: 1, alignItems: "center" }}
                      >
                        {slots.chips.map((col) => {
                          // Booleans format as a bare ✓/✕ icon — meaningful under a column
                          // header, meaningless floating on a card. Give those chips their
                          // field name in a labeled pill ("Primary ✓", "Account Enabled ✕").
                          // Severity words are just as mute alone: a "High" chip beside a
                          // "Passed" chip doesn't say what is high, so those keep their field
                          // name too — as a caption, since the chip is its own container.
                          const text = textValue(row, col);
                          const isBareBoolean = text === "Yes" || text === "No";
                          const isMuteAlone = MUTE_ALONE.has(String(text ?? "").toLowerCase());
                          return (
                            <Box
                              key={col.id}
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.5,
                                ...(isBareBoolean && {
                                  border: 1,
                                  borderColor: "divider",
                                  borderRadius: 999,
                                  px: 1,
                                  py: 0.25,
                                }),
                              }}
                            >
                              {(isBareBoolean || isMuteAlone) && (
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {getCippTranslation(col.id)}
                                </Typography>
                              )}
                              {renderCellValue(row, col, table)}
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                    {detailColumns.length > 0 && (
                      // Grid so every label shares the width of the longest one — no fixed
                      // label column truncating "Business Phones" while values sit half-empty.
                      <Box
                        sx={{
                          mt: 1.25,
                          display: "grid",
                          gridTemplateColumns: "minmax(56px, max-content) 1fr",
                          columnGap: 1.5,
                          rowGap: 0.75,
                          alignItems: "baseline",
                        }}
                      >
                        {detailColumns.map((col) => (
                          <Box key={col.id} sx={{ display: "contents" }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              sx={{ maxWidth: 150 }}
                            >
                              {getCippTranslation(col.id)}
                            </Typography>
                            <Box
                              sx={{
                                minWidth: 0,
                                overflow: "hidden",
                                fontSize: 13,
                                "& > *": { verticalAlign: "middle" },
                              }}
                            >
                              {renderCellValue(row, col, table)}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                    {slots.restCount > 0 && hasOffCanvas && (
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{ mt: 0.75, fontWeight: 600 }}
                        onClick={(event) => {
                          event.stopPropagation();
                          onMoreInfo?.(row.original);
                        }}
                        role="button"
                      >
                        +{slots.restCount} more field{slots.restCount === 1 ? "" : "s"}
                      </Typography>
                    )}
                  </Box>
                  {(actions?.length > 0 || hasOffCanvas) && !selectMode && (
                    <IconButton
                      aria-label="Row actions"
                      onClick={(event) => {
                        event.stopPropagation();
                        setActionSheetRow(row);
                      }}
                      sx={{ position: "absolute", top: 4, right: 4, minWidth: 44, minHeight: 44 }}
                    >
                      <MoreVert />
                    </IconButton>
                  )}
                </Card>
              );
            })}
            <Box sx={{ textAlign: "center", pt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Showing {loadedCount} of {totalFiltered}
                {isStreaming ? " (loading…)" : ""}
              </Typography>
              {loadedCount < totalFiltered && (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleLoadMore}
                  sx={{ mt: 1, minHeight: 44 }}
                >
                  Load {Math.min(LOAD_STEP, totalFiltered - loadedCount)} more
                </Button>
              )}
            </Box>
          </>
        )}
      </Stack>

      {/* Page-level add actions: the cardButton children, stacked in a sheet behind one FAB */}
      {cardButton && fixedChrome && !selectMode && (
        <CippPageActionsFab title="Actions">{cardButton}</CippPageActionsFab>
      )}

      {/* Row actions sheet — same actions array, same dispatch as the desktop row menu */}
      <CippBottomSheet
        open={Boolean(actionSheetRow)}
        onClose={rowSheet.cancel}
        onExited={rowSheet.handleExited}
        title={actionSheetRow ? (textValue(actionSheetRow, slots.primary) ?? "Row actions") : ""}
      >
        {actionSheetRow &&
          rowActionItems(actionSheetRow).map((action, index) => {
            const disabled = isActionDisabled?.(actionSheetRow.original, action) ?? false;
            return (
              <ListItemButton
                key={`mobile-row-action-${index}`}
                disabled={disabled}
                onClick={() =>
                  rowSheet.run(() => onRowAction?.(action, actionSheetRow.original))
                }
                sx={{ minHeight: 48, color: action.color }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <SvgIcon fontSize="small">{action.icon}</SvgIcon>
                </ListItemIcon>
                <ListItemText primary={action.label} />
              </ListItemButton>
            );
          })}
        {actionSheetRow && hasOffCanvas && (
          <ListItemButton
            onClick={() => rowSheet.run(() => onMoreInfo?.(actionSheetRow.original))}
            sx={{ minHeight: 48 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SvgIcon fontSize="small">
                <MoreHoriz />
              </SvgIcon>
            </ListItemIcon>
            <ListItemText primary="More Info" />
          </ListItemButton>
        )}
      </CippBottomSheet>
    </Box>
  );
};
