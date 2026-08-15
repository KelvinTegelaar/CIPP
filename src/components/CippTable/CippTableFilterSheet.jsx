import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Stack,
} from "@mui/material";
import {
  Check,
  DataObject,
  FileDownload,
  FilterList,
  PictureAsPdf,
  RestartAlt,
  Sync,
} from "@mui/icons-material";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { CippBottomSheet } from "../CippComponents/CippBottomSheet";

// Shared filter bottom sheet — presets, then the table utilities (refresh, export, reset),
// then field visibility. Used by the mobile card list and the mobile/compact table toolbar,
// one code path for both.
export const CippTableFilterSheet = (props) => {
  const {
    open,
    onClose,
    onExited,
    run,
    tablePresetItems = [],
    graphPresetItems = [],
    activeFilters = { graph: null, table: null },
    presetKey,
    onPresetClick,
    columnItems = [],
    onToggleColumn,
    onResetFilters,
    onEditGraphFilters,
    exportEnabled = false,
    onExportCsv,
    onExportPdf,
    onViewApiResponse,
    onRefresh,
    isRefreshing = false,
    // section renders only when onPageSizeChange is provided (the table-view sheet)
    pageSize,
    onPageSizeChange,
    pageSizeOptions = [],
    dataSourceControls,
  } = props;

  const renderPresetChips = (items, layer) => (
    <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ px: 2.25, py: 1 }}>
      {items.map((filter) => {
        const key = presetKey(filter);
        const active = activeFilters[layer]?.id === key;
        return (
          <Chip
            key={key}
            label={filter.filterName}
            color={active ? "primary" : "default"}
            variant={active ? "filled" : "outlined"}
            icon={active ? <Check /> : undefined}
            onClick={() => onPresetClick(filter)}
            sx={{ height: 36, borderRadius: 999 }}
          />
        );
      })}
    </Stack>
  );

  return (
    <CippBottomSheet
      open={open}
      onClose={onClose}
      onExited={onExited}
      title="Filters"
      footer={
        <Button fullWidth variant="contained" sx={{ minHeight: 44 }} onClick={onClose}>
          Done
        </Button>
      }
    >
      {dataSourceControls && (
        <>
          <ListSubheader disableSticky sx={{ bgcolor: "transparent" }}>
            Data source
          </ListSubheader>
          <Box sx={{ px: 2.25, py: 1 }}>{dataSourceControls}</Box>
        </>
      )}
      {tablePresetItems.length > 0 && (
        <>
          <ListSubheader disableSticky sx={{ bgcolor: "transparent" }}>
            Presets
          </ListSubheader>
          {renderPresetChips(tablePresetItems, "table")}
        </>
      )}
      {graphPresetItems.length > 0 && (
        <>
          <ListSubheader disableSticky sx={{ bgcolor: "transparent" }}>
            Graph filters
          </ListSubheader>
          {renderPresetChips(graphPresetItems, "graph")}
        </>
      )}
      {/* Utilities above the field list: "Fields shown" is a checkbox per column — a dozen
          rows on a wide table — so anything below it starts a long scroll down, and refresh,
          export and reset are what this sheet gets opened for far more often. */}
      <Divider sx={{ my: 1 }} />
      <ListItemButton
        onClick={() => {
          onResetFilters();
          onClose();
        }}
        sx={{ minHeight: 48 }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          <RestartAlt fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Reset all filters" />
      </ListItemButton>
      {onEditGraphFilters && (
        <ListItemButton onClick={() => run(onEditGraphFilters)} sx={{ minHeight: 48 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <FilterList fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit graph filters" />
        </ListItemButton>
      )}
      {exportEnabled && (
        <>
          <ListItemButton onClick={onExportCsv} sx={{ minHeight: 48 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <FileDownload fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Export to CSV" />
          </ListItemButton>
          <ListItemButton onClick={onExportPdf} sx={{ minHeight: 48 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <PictureAsPdf fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Export to PDF" />
          </ListItemButton>
        </>
      )}
      <ListItemButton onClick={() => run(onViewApiResponse)} sx={{ minHeight: 48 }}>
        <ListItemIcon sx={{ minWidth: 40 }}>
          <DataObject fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="View API response" />
      </ListItemButton>
      <ListItemButton
        disabled={isRefreshing}
        onClick={() => {
          onRefresh();
          onClose();
        }}
        sx={{ minHeight: 48 }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          <Sync fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={isRefreshing ? "Refreshing…" : "Refresh data"} />
      </ListItemButton>
      {columnItems.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <ListSubheader disableSticky sx={{ bgcolor: "transparent" }}>
            Fields shown
          </ListSubheader>
          {columnItems.map((column) => (
            <ListItemButton
              key={column.id}
              dense
              onClick={() => onToggleColumn(column.id, column.visible)}
              sx={{ minHeight: 44, py: 0 }}
            >
              <Checkbox checked={column.visible} size="small" sx={{ mr: 1 }} tabIndex={-1} />
              <ListItemText primary={getCippTranslation(column.id)} />
            </ListItemButton>
          ))}
        </>
      )}
      {onPageSizeChange && pageSizeOptions.length > 0 && (
        <>
          <ListSubheader disableSticky sx={{ bgcolor: "transparent" }}>
            Rows per page
          </ListSubheader>
          <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ px: 2.25, py: 1 }}>
            {pageSizeOptions.map((option) => {
              const active = option === pageSize;
              return (
                <Chip
                  key={option}
                  label={String(option)}
                  color={active ? "primary" : "default"}
                  variant={active ? "filled" : "outlined"}
                  icon={active ? <Check /> : undefined}
                  onClick={() => onPageSizeChange(option)}
                  sx={{ height: 36, borderRadius: 999 }}
                />
              );
            })}
          </Stack>
        </>
      )}
    </CippBottomSheet>
  );
};
