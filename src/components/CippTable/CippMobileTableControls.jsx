import { useState } from "react";
import { CippIcons } from "../../utils/icon-registry";
import {
  Badge,
  Box,
  Button,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SvgIcon,
  Typography,
} from "@mui/material";
import {
  ModernSearchContainer,
  ModernSearchInput,
  ModernButton,
  ModernIconButton,
} from "./toolbar-primitives";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { CippBottomSheet } from "../CippComponents/CippBottomSheet";
import { CippTableFilterSheet } from "./CippTableFilterSheet";
import { useSheetHandoff } from "../../hooks/use-sheet-handoff";

// Presentational mobile controls for the card list. All filter/sort/visibility state and
// handlers are owned by CIPPTableToptoolbar (the same instance the desktop toolbar uses),
// so persistence, presets, and graph filters flow through exactly one code path.
export const CippMobileTableControls = (props) => {
  const {
    table,
    searchValue,
    onSearchChange,
    onRefresh,
    isRefreshing = false,
    selectionEnabled = false,
    selectMode = false,
    onSelectModeChange,
    selectModeLocked = false,
    onViewToggle,
    customBulkActions = [],
    onBulkAction,
    graphPresetItems = [],
    tablePresetItems = [],
    activeFilters = { graph: null, table: null },
    activeSlotCount = 0,
    presetKey,
    onPresetClick,
    onResetFilters,
    onEditGraphFilters,
    columnItems = [],
    onToggleColumn,
    exportEnabled = false,
    onExportCsv,
    onExportPdf,
    onViewApiResponse,
    fixedChrome = true,
    embedded = false,
    queueTracker,
    dataSourceControls,
  } = props;

  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  // Graph filters, the API-response drawer and bulk dialogs are all Modals; let the sheet
  // finish closing before they mount (see useSheetHandoff).
  const filterSheet = useSheetHandoff(() => setFilterOpen(false));
  const bulkSheet = useSheetHandoff(() => setBulkOpen(false));

  const sorting = table.getState().sorting ?? [];
  const sortableColumns = table
    .getAllColumns()
    .filter((column) => !column.id.startsWith("mrt-") && column.getCanSort());

  // Tap cycles: none -> asc -> desc -> none. Single-column sort — replaces, not appends.
  const cycleSort = (columnId) => {
    const current = sorting.find((s) => s.id === columnId);
    if (!current) {
      table.setSorting([{ id: columnId, desc: false }]);
    } else if (!current.desc) {
      table.setSorting([{ id: columnId, desc: true }]);
    } else {
      table.setSorting([]);
    }
  };

  const selectedCount = table.getSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;
  const enabledBulkActions = customBulkActions.filter((action) => !action.disabled);

  return (
    <>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          px: embedded ? 0 : 1,
          py: 1,
          // matches the card-view paper surface it sticks over
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {/* Search keeps a legible floor and the controls wrap below it when the row no longer
            fits. The sizing sits on this wrapper: ModernSearchContainer's own down('md') rule
            (flex: 1, minWidth: 0) outranks an sx prop on it. */}
        <Box sx={{ display: "flex", flex: "1 1 180px", minWidth: 160 }}>
          <ModernSearchContainer elevation={0} sx={{ height: 44 }}>
            <CippIcons.Search fontSize="small" sx={{ color: "text.secondary" }} />
            <ModernSearchInput
              type="search"
              placeholder="Search…"
              value={searchValue}
              onChange={onSearchChange}
              slotProps={{ input: { enterKeyHint: "search", "aria-label": "Search" } }}
            />
          </ModernSearchContainer>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0, ml: "auto" }}>
          {selectionEnabled && !selectModeLocked && (
            <ModernButton
              onClick={() => onSelectModeChange?.(!selectMode)}
              sx={{ height: 44, flexShrink: 0 }}
            >
              {selectMode ? "Cancel" : "Select"}
            </ModernButton>
          )}
          <ModernIconButton
            aria-label="Sort"
            onClick={() => setSortOpen(true)}
            sx={sorting.length ? { borderColor: "primary.main", color: "primary.main" } : undefined}
          >
            <CippIcons.SwapVert fontSize="small" />
          </ModernIconButton>
          {/* kebab, the sheet is a grab-bag (presets, fields, export, refresh), not just filters */}
          <ModernIconButton
            aria-label="Table options"
            onClick={() => setFilterOpen(true)}
            sx={
              activeSlotCount > 0
                ? { borderColor: "primary.main", color: "primary.main" }
                : undefined
            }
          >
            <Badge badgeContent={activeSlotCount} color="primary">
              <CippIcons.MoreVert fontSize="small" />
            </Badge>
          </ModernIconButton>
          {onViewToggle && (
            <ModernIconButton
              aria-label="Toggle table view"
              aria-pressed={false}
              onClick={onViewToggle}
            >
              {/* destination icon: tapping here opens the table */}
              <CippIcons.TableChart fontSize="small" />
            </ModernIconButton>
          )}
        </Box>
      </Box>
      {queueTracker && <Box sx={{ px: 1.5, py: 0.5 }}>{queueTracker}</Box>}

      {/* Sort sheet — net-new on mobile: cards have no column headers to click */}
      <CippBottomSheet
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        title="Sort by"
        footer={
          <Button fullWidth variant="contained" sx={{ minHeight: 44 }} onClick={() => setSortOpen(false)}>
            Done
          </Button>
        }
      >
        {sortableColumns.map((column) => {
          const current = sorting.find((s) => s.id === column.id);
          return (
            <ListItemButton
              key={column.id}
              onClick={() => cycleSort(column.id)}
              sx={{ minHeight: 48, color: current ? "primary.main" : "inherit" }}
            >
              <ListItemText
                primary={getCippTranslation(column.id)}
                slotProps={{
                  primary: { fontWeight: current ? 600 : 400 }
                }}
              />
              {current && (
                <SvgIcon fontSize="small" color="primary">
                  {current.desc ? <CippIcons.ArrowDownward /> : <CippIcons.ArrowUpward />}
                </SvgIcon>
              )}
            </ListItemButton>
          );
        })}
        {sorting.length > 0 && (
          <>
            <Divider />
            <ListItemButton onClick={() => table.setSorting([])} sx={{ minHeight: 48 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <CippIcons.RestartAlt fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Clear sorting" />
            </ListItemButton>
          </>
        )}
      </CippBottomSheet>

      {/* Filter sheet — presets first, then table utilities, then card fields */}
      <CippTableFilterSheet
        open={filterOpen}
        onClose={filterSheet.cancel}
        onExited={filterSheet.handleExited}
        run={filterSheet.run}
        tablePresetItems={tablePresetItems}
        graphPresetItems={graphPresetItems}
        activeFilters={activeFilters}
        presetKey={presetKey}
        onPresetClick={onPresetClick}
        columnItems={columnItems}
        onToggleColumn={onToggleColumn}
        onResetFilters={onResetFilters}
        onEditGraphFilters={onEditGraphFilters}
        exportEnabled={exportEnabled}
        onExportCsv={onExportCsv}
        onExportPdf={onExportPdf}
        onViewApiResponse={onViewApiResponse}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        dataSourceControls={dataSourceControls}
      />

      {/* Bulk action bar — bottom, in thumb reach, instead of the desktop top-toolbar strip */}
      {selectMode && selectionEnabled && (
        <Box
          sx={{
            position: fixedChrome ? "fixed" : "sticky",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: (theme) => theme.zIndex.speedDial,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            pt: 1.25,
            pb: "calc(env(safe-area-inset-bottom) + 12px)",
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" aria-live="polite" sx={{ flexShrink: 0 }}>
            {selectedCount} selected
          </Typography>
          <Button
            size="small"
            onClick={() => table.toggleAllRowsSelected(true)}
            sx={{ mr: "auto", flexShrink: 0 }}
          >
            Select all ({totalCount})
          </Button>
          {customBulkActions.length > 0 && (
            <Button
              variant="contained"
              disabled={selectedCount === 0 || enabledBulkActions.length === 0}
              onClick={() => setBulkOpen(true)}
              sx={{ minHeight: 40 }}
            >
              Actions
            </Button>
          )}
          {!selectModeLocked && (
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => onSelectModeChange?.(false)}
              sx={{ minHeight: 40, borderColor: "divider" }}
            >
              Done
            </Button>
          )}
        </Box>
      )}

      {/* Bulk actions sheet — the same customBulkActions + dispatch as the desktop menu */}
      <CippBottomSheet
        open={bulkOpen}
        onClose={bulkSheet.cancel}
        onExited={bulkSheet.handleExited}
        title={`${selectedCount} selected · Bulk actions`}
      >
        {customBulkActions.map((action, index) => (
          <ListItemButton
            key={`mobile-bulk-${index}`}
            disabled={action.disabled}
            onClick={() => bulkSheet.run(() => onBulkAction(action))}
            sx={{ minHeight: 48 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SvgIcon fontSize="small">{action.icon}</SvgIcon>
            </ListItemIcon>
            <ListItemText primary={action.label} />
          </ListItemButton>
        ))}
      </CippBottomSheet>
    </>
  );
};
