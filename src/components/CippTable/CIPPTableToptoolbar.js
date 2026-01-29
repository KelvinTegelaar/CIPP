import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  InputBase,
  Paper,
  Checkbox,
  SvgIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ViewColumn as ViewColumnIcon,
  FileDownload as ExportIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Code as CodeIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  SevereCold,
  Sync,
  Check as CheckIcon,
  MoreVert as MoreVertIcon,
  Fullscreen as FullscreenIcon,
} from "@mui/icons-material";
import { ExclamationCircleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { styled, alpha } from "@mui/material/styles";
import { PDFExportButton, exportRowsToPdf } from "../pdfExportButton";
import { CSVExportButton, exportRowsToCsv } from "../csvExportButton";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { useMediaQuery } from "@mui/material";
import { CippQueueTracker } from "./CippQueueTracker";
import { usePopover } from "../../hooks/use-popover";
import { useDialog } from "../../hooks/use-dialog";
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import { useSettings } from "../../hooks/use-settings";
import { useRouter } from "next/router";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import { CippCodeBlock } from "../CippComponents/CippCodeBlock";
import { ApiGetCall } from "../../api/ApiCall";
import GraphExplorerPresets from "../../data/GraphExplorerPresets.json";
import CippGraphExplorerFilter from "./CippGraphExplorerFilter";
import { Stack } from "@mui/system";

// Styled components for modern design
const ModernSearchContainer = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  maxWidth: "300px",
  minWidth: "200px",
  height: "40px",
  backgroundColor: theme.palette.mode === "dark" ? "#2A2D3A" : "#F8F9FA",
  border: `1px solid ${theme.palette.mode === "dark" ? "#404040" : "#E0E0E0"}`,
  borderRadius: "8px",
  padding: "0 12px",
  "&:hover": {
    borderColor: theme.palette.primary.main,
  },
  "&:focus-within": {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  [theme.breakpoints.down("md")]: {
    minWidth: "0",
    maxWidth: "none",
    flex: 1,
  },
}));

const ModernSearchInput = styled(InputBase)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  flex: 1,
  fontSize: "14px",
  "& .MuiInputBase-input": {
    padding: "8px 0",
    "&::placeholder": {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    },
  },
}));

const ModernButton = styled(Button)(({ theme }) => ({
  height: "40px",
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: 500,
  fontSize: "14px",
  padding: "8px 16px",
  backgroundColor: theme.palette.mode === "dark" ? "#2A2D3A" : "#F8F9FA",
  border: `1px solid ${theme.palette.mode === "dark" ? "#404040" : "#E0E0E0"}`,
  color: theme.palette.text.primary,
  minWidth: "auto",
  whiteSpace: "nowrap",
  "&:hover": {
    backgroundColor: theme.palette.mode === "dark" ? "#363A4A" : "#F0F0F0",
    borderColor: theme.palette.primary.main,
  },
  "& .MuiButton-startIcon": {
    marginRight: "8px",
  },
  "& .MuiButton-endIcon": {
    marginLeft: "8px",
  },
  [theme.breakpoints.down("md")]: {
    padding: "8px 12px",
    fontSize: "13px",
    "& .MuiButton-startIcon": {
      marginRight: "6px",
    },
    "& .MuiButton-endIcon": {
      marginLeft: "6px",
    },
  },
  [theme.breakpoints.down("sm")]: {
    padding: "8px 10px",
    fontSize: "12px",
    "& .MuiButton-startIcon": {
      marginRight: "4px",
    },
    "& .MuiButton-endIcon": {
      marginLeft: "4px",
    },
  },
}));

const RefreshButton = styled(IconButton)(({ theme }) => ({}));

export const CIPPTableToptoolbar = ({
  api,
  simpleColumns,
  queryKey,
  table,
  getRequestData,
  usedColumns,
  usedData,
  columnVisibility,
  setColumnVisibility,
  title,
  actions,
  filters = [],
  exportEnabled,
  refreshFunction,
  queryKeys,
  data,
  setGraphFilterData,
  setConfiguredSimpleColumns,
  queueMetadata,
  isInDialog = false,
  showBulkExportAction = true,
}) => {
  const popover = usePopover();
  const [filtersAnchor, setFiltersAnchor] = useState(null);
  const [columnsAnchor, setColumnsAnchor] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const settings = useSettings();
  const router = useRouter();
  const createDialog = useDialog();
  const [actionData, setActionData] = useState({ data: {}, action: {}, ready: false });
  const [offcanvasVisible, setOffcanvasVisible] = useState(false);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false); // For dialog-based JSON view
  const [filterList, setFilterList] = useState(filters);
  const [currentEffectiveQueryKey, setCurrentEffectiveQueryKey] = useState(queryKey || title);
  const [originalSimpleColumns, setOriginalSimpleColumns] = useState(simpleColumns);
  const [filterCanvasVisible, setFilterCanvasVisible] = useState(false);
  const [activeFilterName, setActiveFilterName] = useState(null);
  const pageName = router.pathname.split("/").slice(1).join("/");
  const currentTenant = settings?.currentTenant;
  const [useCompactMode, setUseCompactMode] = useState(false);
  const toolbarRef = useRef(null);
  const leftContainerRef = useRef(null);
  const actionsContainerRef = useRef(null);

  const getBulkActions = (actions, selectedRows) => {
    return (
      actions
        ?.filter((action) => !action.link && !action?.hideBulk)
        ?.map((action) => ({
          ...action,
          disabled: action.condition
            ? !selectedRows.every((row) => action.condition(row.original))
            : false,
        })) || []
    );
  };

  const selectedRows = table.getSelectedRowModel().rows;
  const hasSelection = table.getIsSomeRowsSelected() || table.getIsAllRowsSelected();
  // Built-in export actions should only appear when the page opts in and rows are selected.
  const builtInBulkExportAvailable =
    showBulkExportAction && exportEnabled && selectedRows.length > 0;
  const customBulkActions = getBulkActions(actions, selectedRows);
  const showBulkActionsButton = hasSelection && customBulkActions.length > 0;

  const handleExportSelectedToCsv = () => {
    if (!selectedRows.length) {
      return;
    }
    exportRowsToCsv({
      rows: selectedRows,
      columns: usedColumns,
      reportName: `${title}`,
      columnVisibility,
    });
  };

  const handleExportSelectedToPdf = () => {
    if (!selectedRows.length) {
      return;
    }
    exportRowsToPdf({
      rows: selectedRows,
      columns: usedColumns,
      reportName: `${title}`,
      columnVisibility,
      brandingSettings: settings?.customBranding,
    });
  };

  // Track if we've restored filters for this page to prevent infinite loops
  const restoredFiltersRef = useRef(new Set());

  useEffect(() => {
    //if usedData changes, deselect all rows
    table.toggleAllRowsSelected(false);
  }, [usedData]);

  // Sync currentEffectiveQueryKey with queryKey prop changes (e.g., tenant changes)
  useEffect(() => {
    setCurrentEffectiveQueryKey(queryKey || title);
    // Clear active filter name when query key changes (page load, tenant change, etc.)
    setActiveFilterName(null);
  }, [queryKey, title]);

  //if the currentTenant Switches, remove Graph filters
  useEffect(() => {
    if (currentTenant) {
      setGraphFilterData({});
      // Clear active filter name when tenant changes
      setActiveFilterName(null);
      // Clear restoration tracking so saved filters can be re-applied
      const restorationKey = `${pageName}-graph`;
      restoredFiltersRef.current.delete(restorationKey);
    }
  }, [currentTenant, pageName]);

  //useEffect to set the column visibility to the preferred columns if they exist
  useEffect(() => {
    if (
      settings?.columnDefaults?.[pageName] &&
      Object.keys(settings?.columnDefaults?.[pageName]).length > 0
    ) {
      setColumnVisibility(settings?.columnDefaults?.[pageName]);
    }
  }, [settings?.columnDefaults?.[pageName], router, usedColumns]);

  useEffect(() => {
    setOriginalSimpleColumns(simpleColumns);
  }, [simpleColumns]);

  // Early restoration of graph filters (before API call) - run only once per page
  useEffect(() => {
    const restorationKey = `${pageName}-graph`;

    if (
      settings.persistFilters &&
      settings.lastUsedFilters &&
      settings.lastUsedFilters[pageName] &&
      api?.url === "/api/ListGraphRequest" && // Only for graph requests
      !restoredFiltersRef.current.has(restorationKey) // Only if not already restored
    ) {
      const last = settings.lastUsedFilters[pageName];
      if (last.type === "graph") {
        // Mark as restored to prevent infinite loops
        restoredFiltersRef.current.add(restorationKey);

        // Directly set the graph filter data without calling setTableFilter to avoid loops
        const filterProps = [
          "$filter",
          "$select",
          "$expand",
          "$orderby",
          "$count",
          "$search",
          "ReverseTenantLookup",
          "ReverseTenantLookupProperty",
          "AsApp",
        ];
        const graphFilter = filterProps.reduce((acc, prop) => {
          if (last.value[prop]) {
            acc[prop] = last.value[prop];
          }
          return acc;
        }, {});

        const newQueryKey = `${queryKey ? queryKey : title}-${last.name}`;
        setGraphFilterData({
          data: { ...mergeCaseInsensitive(api.data, graphFilter) },
          queryKey: newQueryKey,
        });
        setCurrentEffectiveQueryKey(newQueryKey);
        setActiveFilterName(last.name);

        if (last.value?.$select) {
          let selectColumns = [];
          if (Array.isArray(last.value.$select)) {
            selectColumns = last.value.$select;
          } else if (typeof last.value.$select === "string") {
            selectColumns = last.value.$select
              .split(",")
              .map((col) => col.trim())
              .filter((col) => usedColumns.includes(col));
          }
          if (selectColumns.length > 0) {
            setConfiguredSimpleColumns(selectColumns);
          }
        }
      }
    }
  }, [settings.persistFilters, settings.lastUsedFilters, pageName, api?.url, queryKey, title]);

  // Clear restoration tracking when page changes
  useEffect(() => {
    restoredFiltersRef.current.clear();
  }, [pageName]);

  // Detect overflow and switch to compact mode
  useEffect(() => {
    const checkOverflow = () => {
      if (!leftContainerRef.current || !actionsContainerRef.current) {
        return;
      }

      const leftContainerWidth = leftContainerRef.current.offsetWidth;
      const leftContainerScrollWidth = leftContainerRef.current.scrollWidth;
      const actionsWidth = actionsContainerRef.current.scrollWidth;
      const isOverflowing = leftContainerScrollWidth > leftContainerWidth;
      const shouldBeCompact = isOverflowing || actionsWidth > leftContainerWidth * 0.6; // Actions taking > 60% of left container

      setUseCompactMode(shouldBeCompact);
    };

    // Check immediately on mount and when dependencies change
    checkOverflow();

    // Also check after a brief delay to ensure elements are fully rendered
    const timeoutId = setTimeout(checkOverflow, 100);

    const resizeObserver = new ResizeObserver(checkOverflow);
    if (leftContainerRef.current) {
      resizeObserver.observe(leftContainerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [hasSelection, customBulkActions.length, exportEnabled, filters?.length, usedColumns?.length]);

  // Restore last used filter on mount if persistFilters is enabled (non-graph filters)
  useEffect(() => {
    // Wait for table to be initialized and data to be available
    if (
      settings.persistFilters &&
      settings.lastUsedFilters &&
      settings.lastUsedFilters[pageName] &&
      table &&
      usedColumns.length > 0 &&
      !getRequestData?.isFetching
    ) {
      // Use setTimeout to ensure the table is fully rendered
      const timeoutId = setTimeout(() => {
        const last = settings.lastUsedFilters[pageName];

        if (last.type === "global") {
          table.setGlobalFilter(last.value);
          setActiveFilterName(last.name);
        } else if (last.type === "column") {
          // Only apply if all filter columns exist in the current table
          const allColumns = table.getAllColumns().map((col) => col.id);
          const filterColumns = Array.isArray(last.value) ? last.value.map((f) => f.id) : [];
          const allExist = filterColumns.every((colId) => allColumns.includes(colId));
          if (allExist) {
            table.setShowColumnFilters(true);
            table.setColumnFilters(last.value);
            setActiveFilterName(last.name);
          }
        }
        // Note: graph filters are handled in the earlier useEffect
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [
    settings.persistFilters,
    settings.lastUsedFilters,
    pageName,
    table,
    usedColumns,
    getRequestData?.isFetching,
  ]);

  const presetList = ApiGetCall({
    url: "/api/ListGraphExplorerPresets",
    queryKey: `ListGraphExplorerPresets${api?.data?.Endpoint ?? ""}`,
    data: {
      Endpoint: api?.data?.Endpoint ?? "",
    },
    waiting: !!api?.data?.Endpoint,
  });

  // Handle search input changes
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchValue(value);
    table.setGlobalFilter(value);
  };

  // Handle column filters toggle
  const handleColumnFiltersToggle = () => {
    const currentState = table.getState().showColumnFilters;
    table.setShowColumnFilters(!currentState);
  };

  const resetToDefaultVisibility = () => {
    setColumnVisibility((prevVisibility) => {
      const updatedVisibility = {};
      for (const col in prevVisibility) {
        if (Array.isArray(originalSimpleColumns)) {
          updatedVisibility[col] = originalSimpleColumns.includes(col);
        }
      }
      return updatedVisibility;
    });
    settings.handleUpdate({
      columnDefaults: {
        ...settings?.columnDefaults,
        [pageName]: {},
      },
    });
    setColumnsAnchor(null);
  };

  const resetToPreferedVisibility = () => {
    if (
      settings?.columnDefaults?.[pageName] &&
      Object.keys(settings?.columnDefaults?.[pageName]).length > 0
    ) {
      setColumnVisibility(settings?.columnDefaults?.[pageName]);
    } else {
      setColumnVisibility((prevVisibility) => {
        const updatedVisibility = {};
        for (const col in prevVisibility) {
          if (Array.isArray(originalSimpleColumns)) {
            updatedVisibility[col] = originalSimpleColumns.includes(col);
          }
        }
        return updatedVisibility;
      });
    }
    setColumnsAnchor(null);
  };

  const saveAsPreferedColumns = () => {
    settings.handleUpdate({
      columnDefaults: {
        ...settings?.columnDefaults,
        [pageName]: columnVisibility,
      },
    });
    setColumnsAnchor(null);
  };

  const mergeCaseInsensitive = (obj1, obj2) => {
    const merged = { ...obj1 };
    for (const key in obj2) {
      const lowerCaseKey = key.toLowerCase();
      const existingKey = Object.keys(merged).find((k) => k.toLowerCase() === lowerCaseKey);
      if (existingKey) {
        merged[existingKey] = obj2[key];
      } else {
        merged[key] = obj2[key];
      }
    }
    return merged;
  };

  // Shared function for setting nested column visibility
  const setNestedVisibility = (col) => {
    if (typeof col === "object" && col !== null) {
      Object.keys(col).forEach((key) => {
        if (usedColumns.includes(key.trim())) {
          setColumnVisibility((prev) => ({ ...prev, [key.trim()]: true }));
          setNestedVisibility(col[key]);
        }
      });
    } else {
      if (usedColumns.includes(col.trim())) {
        setColumnVisibility((prev) => ({ ...prev, [col.trim()]: true }));
      }
    }
  };

  const setTableFilter = (filter, filterType, filterName) => {
    if (filterType === "global" || filterType === undefined) {
      table.setGlobalFilter(filter);
      setActiveFilterName(filterName);
      if (settings.persistFilters && settings.setLastUsedFilter) {
        settings.setLastUsedFilter(pageName, { type: "global", value: filter, name: filterName });
      }
    }
    if (filterType === "column") {
      table.setShowColumnFilters(true);
      table.setColumnFilters(filter);
      setActiveFilterName(filterName);
      if (settings.persistFilters && settings.setLastUsedFilter) {
        settings.setLastUsedFilter(pageName, { type: "column", value: filter, name: filterName });
      }
    }
    if (filterType === "reset") {
      table.resetGlobalFilter();
      table.resetColumnFilters();
      if (api?.data) {
        setGraphFilterData({});
        resetToDefaultVisibility();
      }
      setCurrentEffectiveQueryKey(queryKey || title); // Reset to original query key
      setActiveFilterName(null); // Clear active filter
      if (settings.persistFilters && settings.setLastUsedFilter) {
        settings.setLastUsedFilter(pageName, { type: "reset", value: null, name: null });
      }
    }
    if (filterType === "graph") {
      const filterProps = [
        "$filter",
        "$select",
        "$expand",
        "$orderby",
        "$count",
        "$search",
        "ReverseTenantLookup",
        "ReverseTenantLookupProperty",
        "AsApp",
      ];
      const graphFilter = filterProps.reduce((acc, prop) => {
        if (filter[prop]) {
          acc[prop] = filter[prop];
        }
        return acc;
      }, {});
      table.resetGlobalFilter();
      table.resetColumnFilters();
      //get api.data, merge with graphFilter, set api.data
      const newQueryKey = `${queryKey ? queryKey : title}-${filterName}`;
      setGraphFilterData({
        data: { ...mergeCaseInsensitive(api.data, graphFilter) },
        queryKey: newQueryKey,
      });
      setCurrentEffectiveQueryKey(newQueryKey);
      setActiveFilterName(filterName); // Track active graph filter
      if (settings.persistFilters && settings.setLastUsedFilter) {
        settings.setLastUsedFilter(pageName, { type: "graph", value: filter, name: filterName });
      }
      if (filter?.$select) {
        let selectedColumns = [];
        if (Array.isArray(filter?.$select)) {
          selectedColumns = filter?.$select;
        } else if (typeof filter?.$select === "string") {
          selectedColumns = filter.$select.split(",");
        }
        if (selectedColumns.length > 0) {
          setConfiguredSimpleColumns(selectedColumns);
          selectedColumns.forEach((col) => {
            setNestedVisibility(col);
          });
        }
      }
    }
  };

  useEffect(() => {
    if (api?.url === "/api/ListGraphRequest" && presetList.isSuccess) {
      var endpoint = api?.data?.Endpoint?.replace(/^\//, "");
      var graphPresetList = [];
      GraphExplorerPresets.map((preset) => {
        var presetEndpoint = preset?.params?.endpoint?.replace(/^\//, "");
        if (presetEndpoint === endpoint) {
          graphPresetList.push({
            id: preset?.id,
            filterName: preset?.name,
            value: preset?.params,
            type: "graph",
          });
        }
      });

      presetList?.data?.Results?.map((preset) => {
        var customPresetEndpoint = preset?.params?.endpoint?.replace(/^\//, "");
        if (customPresetEndpoint === endpoint) {
          graphPresetList.push({
            id: preset?.id,
            filterName: preset?.name,
            value: preset?.params,
            type: "graph",
          });
        }
      });

      // update filters to include graph explorer presets
      setFilterList([...filters, ...graphPresetList]);
    }
  }, [presetList?.isSuccess, simpleColumns]);

  return (
    <>
      <Box
        ref={toolbarRef}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 1, md: 2 },
          px: 0.5,
          pb: 2,
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          backgroundColor: "background.paper",
        }}
      >
        {/* Left side - Main controls */}
        <Box
          ref={leftContainerRef}
          sx={{
            display: "flex",
            gap: { xs: 1, md: 2 },
            alignItems: "center",
            flex: 1,
            flexWrap: { xs: "nowrap", md: "nowrap" },
            minWidth: 0,
          }}
        >
          {/* Refresh Button */}
          <Tooltip
            title={
              getRequestData?.isFetchNextPageError
                ? "Could not retrieve all data. Click to try again."
                : getRequestData?.isFetching
                ? "Retrieving more data..."
                : "Refresh data"
            }
          >
            <RefreshButton
              onClick={() => {
                if (typeof refreshFunction === "object") {
                  refreshFunction.refetch();
                } else if (typeof refreshFunction === "function") {
                  refreshFunction();
                } else if (data && !getRequestData.isFetched) {
                  // do nothing because data was sent native.
                } else if (getRequestData) {
                  getRequestData.refetch();
                }
              }}
              disabled={
                getRequestData?.isLoading ||
                getRequestData?.isFetching ||
                refreshFunction?.isFetching
              }
            >
              <SvgIcon
                fontSize="small"
                sx={{
                  animation:
                    getRequestData?.isFetching || refreshFunction?.isFetching
                      ? "spin 1s linear infinite"
                      : "none",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(-360deg)" },
                  },
                }}
              >
                {getRequestData?.isFetchNextPageError ? (
                  <ExclamationCircleIcon color="red" />
                ) : (
                  <Sync />
                )}
              </SvgIcon>
            </RefreshButton>
          </Tooltip>

          {/* Search Input */}
          <ModernSearchContainer elevation={0}>
            <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            <ModernSearchInput
              placeholder="Search input"
              value={searchValue}
              onChange={handleSearchChange}
            />
          </ModernSearchContainer>

          {/* Desktop Buttons - always render for measurement, hide when in compact mode */}
          {!mdDown && (
            <Box
              ref={actionsContainerRef}
              sx={{
                display: "flex",
                gap: 2,
                flexShrink: 0,
                mt: 0.5,
                ...(useCompactMode && {
                  position: "absolute",
                  visibility: "hidden",
                  pointerEvents: "none",
                }),
              }}
            >
              {/* Filters Button */}
              <ModernButton
                startIcon={<FilterListIcon />}
                endIcon={<ArrowDownIcon />}
                onClick={(event) => setFiltersAnchor(event.currentTarget)}
                sx={{
                  color: activeFilterName ? "primary.main" : "text.primary",
                  borderColor: activeFilterName ? "primary.main" : undefined,
                }}
              >
                Filters
              </ModernButton>
              <Menu
                anchorEl={filtersAnchor}
                open={Boolean(filtersAnchor)}
                onClose={() => setFiltersAnchor(null)}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    minWidth: 200,
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleColumnFiltersToggle();
                    setFiltersAnchor(null);
                  }}
                >
                  <ListItemText>
                    {table.getState().showColumnFilters
                      ? "Hide Column Filters"
                      : "Show Column Filters"}
                  </ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => setTableFilter("", "reset", "")}>
                  <ListItemText primary="Reset all filters" />
                </MenuItem>
                {api?.url === "/api/ListGraphRequest" && (
                  <MenuItem
                    onClick={() => {
                      setFiltersAnchor(null);
                      setFilterCanvasVisible(true);
                    }}
                  >
                    <ListItemText primary="Edit filters" />
                  </MenuItem>
                )}
                {filterList?.length > 0 && <Divider />}
                {filterList?.map((filter) => (
                  <MenuItem
                    key={filter.id}
                    onClick={() => {
                      setFiltersAnchor(null);
                      setTableFilter(filter.value, filter.type, filter.filterName);
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {activeFilterName === filter.filterName && (
                            <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} />
                          )}
                          {filter.filterName}
                        </Box>
                      }
                    />
                  </MenuItem>
                ))}
              </Menu>

              {/* Columns Button */}
              <ModernButton
                startIcon={<ViewColumnIcon />}
                endIcon={<ArrowDownIcon />}
                onClick={(event) => setColumnsAnchor(event.currentTarget)}
              >
                Columns
              </ModernButton>
              <Menu
                anchorEl={columnsAnchor}
                open={Boolean(columnsAnchor)}
                onClose={() => setColumnsAnchor(null)}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    minWidth: 250,
                    maxHeight: 400,
                  },
                }}
              >
                <MenuItem onClick={resetToPreferedVisibility}>
                  <ListItemText primary="Reset to preferred columns" />
                </MenuItem>
                <MenuItem onClick={saveAsPreferedColumns}>
                  <ListItemText primary="Save as preferred columns" />
                </MenuItem>
                <MenuItem onClick={resetToDefaultVisibility}>
                  <ListItemText primary="Delete preferred columns" />
                </MenuItem>
                <Divider />
                {table
                  .getAllColumns()
                  .filter((column) => !column.id.startsWith("mrt-"))
                  .map((column) => (
                    <MenuItem
                      key={column.id}
                      onClick={() =>
                        setColumnVisibility({
                          ...columnVisibility,
                          [column.id]: !column.getIsVisible(),
                        })
                      }
                    >
                      <Checkbox checked={Boolean(column.getIsVisible())} size="small" />
                      <ListItemText primary={getCippTranslation(column.id)} />
                    </MenuItem>
                  ))}
              </Menu>

              {/* Export Button */}
              {exportEnabled && (
                <ModernButton
                  startIcon={<ExportIcon />}
                  endIcon={<ArrowDownIcon />}
                  onClick={(event) => setExportAnchor(event.currentTarget)}
                >
                  Export
                </ModernButton>
              )}
            </Box>
          )}

          {/* Mobile/Compact Action Button */}
          {(mdDown || useCompactMode) && !hasSelection && (
            <IconButton
              onClick={(event) => setActionMenuAnchor(event.currentTarget)}
              sx={{ flexShrink: 0 }}
            >
              <MoreVertIcon />
            </IconButton>
          )}

          {/* Mobile Action Menu */}
          <Menu
            anchorEl={actionMenuAnchor}
            open={Boolean(actionMenuAnchor)}
            onClose={() => setActionMenuAnchor(null)}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                minWidth: 180,
              },
            }}
          >
            <MenuItem
              onClick={(event) => {
                setFiltersAnchor(event.currentTarget);
                setActionMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <FilterListIcon />
              </ListItemIcon>
              <ListItemText>Filters</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={(event) => {
                setColumnsAnchor(event.currentTarget);
                setActionMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <ViewColumnIcon />
              </ListItemIcon>
              <ListItemText>Columns</ListItemText>
            </MenuItem>
            {exportEnabled && (
              <MenuItem
                onClick={(event) => {
                  setExportAnchor(event.currentTarget);
                  setActionMenuAnchor(null);
                }}
              >
                <ListItemIcon>
                  <ExportIcon />
                </ListItemIcon>
                <ListItemText>Export</ListItemText>
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                table.setIsFullScreen(!table.getState().isFullScreen);
                setActionMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <FullscreenIcon />
              </ListItemIcon>
              <ListItemText>
                {table.getState().isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
              </ListItemText>
            </MenuItem>
          </Menu>

          {/* Filters Menu */}
          <Menu
            anchorEl={filtersAnchor}
            open={Boolean(filtersAnchor)}
            onClose={() => setFiltersAnchor(null)}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                minWidth: 200,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleColumnFiltersToggle();
                setFiltersAnchor(null);
              }}
            >
              <ListItemText>
                {table.getState().showColumnFilters ? "Hide Column Filters" : "Show Column Filters"}
              </ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => setTableFilter("", "reset", "")}>
              <ListItemText primary="Reset all filters" />
            </MenuItem>
            {api?.url === "/api/ListGraphRequest" && (
              <MenuItem
                onClick={() => {
                  setFiltersAnchor(null);
                  setFilterCanvasVisible(true);
                }}
              >
                <ListItemText primary="Edit filters" />
              </MenuItem>
            )}
            {filterList?.length > 0 && <Divider />}
            {filterList?.map((filter) => (
              <MenuItem
                key={filter.id}
                onClick={() => {
                  setFiltersAnchor(null);
                  setTableFilter(filter.value, filter.type, filter.filterName);
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {activeFilterName === filter.filterName && (
                        <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} />
                      )}
                      {filter.filterName}
                    </Box>
                  }
                />
              </MenuItem>
            ))}
          </Menu>

          {/* Columns Menu */}
          <Menu
            anchorEl={columnsAnchor}
            open={Boolean(columnsAnchor)}
            onClose={() => setColumnsAnchor(null)}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                minWidth: 250,
                maxHeight: 400,
              },
            }}
          >
            <MenuItem onClick={resetToPreferedVisibility}>
              <ListItemText primary="Reset to preferred columns" />
            </MenuItem>
            <MenuItem onClick={saveAsPreferedColumns}>
              <ListItemText primary="Save as preferred columns" />
            </MenuItem>
            <MenuItem onClick={resetToDefaultVisibility}>
              <ListItemText primary="Delete preferred columns" />
            </MenuItem>
            <Divider />
            {table
              .getAllColumns()
              .filter((column) => !column.id.startsWith("mrt-"))
              .map((column) => (
                <MenuItem
                  key={column.id}
                  onClick={() =>
                    setColumnVisibility({
                      ...columnVisibility,
                      [column.id]: !column.getIsVisible(),
                    })
                  }
                >
                  <Checkbox checked={Boolean(column.getIsVisible())} size="small" />
                  <ListItemText primary={getCippTranslation(column.id)} />
                </MenuItem>
              ))}
          </Menu>

          {/* Export Menu */}
          {exportEnabled && (
            <Menu
              anchorEl={exportAnchor}
              open={Boolean(exportAnchor)}
              onClose={() => setExportAnchor(null)}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  minWidth: 180,
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  // Trigger CSV export
                  const csvButton = document.querySelector("[data-csv-export]");
                  if (csvButton) csvButton.click();
                  setExportAnchor(null);
                }}
              >
                <ListItemIcon>
                  <CsvIcon />
                </ListItemIcon>
                <ListItemText primary="Export to CSV" />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  // Trigger PDF export
                  const pdfButton = document.querySelector("[data-pdf-export]");
                  if (pdfButton) pdfButton.click();
                  setExportAnchor(null);
                }}
              >
                <ListItemIcon>
                  <PdfIcon />
                </ListItemIcon>
                <ListItemText primary="Export to PDF" />
              </MenuItem>
              {builtInBulkExportAvailable && (
                <>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem
                    onClick={() => {
                      handleExportSelectedToCsv();
                      setExportAnchor(null);
                    }}
                  >
                    <ListItemIcon>
                      <CsvIcon />
                    </ListItemIcon>
                    <ListItemText primary="Export Selected to CSV" />
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleExportSelectedToPdf();
                      setExportAnchor(null);
                    }}
                  >
                    <ListItemIcon>
                      <PdfIcon />
                    </ListItemIcon>
                    <ListItemText primary="Export Selected to PDF" />
                  </MenuItem>
                </>
              )}
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={() => {
                  if (isInDialog) {
                    setJsonDialogOpen(true);
                  } else {
                    setOffcanvasVisible(true);
                  }
                  setExportAnchor(null);
                }}
              >
                <ListItemIcon>
                  <CodeIcon />
                </ListItemIcon>
                <ListItemText primary="View API Response" />
              </MenuItem>
            </Menu>
          )}
        </Box>

        {/* Right side - Additional controls */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexShrink: 0,
            flexWrap: "nowrap",
            justifyContent: { xs: "space-between", md: "flex-end" },
            width: { xs: "100%", md: "auto" },
            mt: { xs: 1, md: 0 },
          }}
        >
          {/* Selected rows indicator */}
          {(table.getIsAllRowsSelected() || table.getIsSomeRowsSelected()) && (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "12px", md: "14px" },
                whiteSpace: "nowrap",
                mr: 1,
              }}
            >
              {table.getSelectedRowModel().rows.length} rows selected
            </Typography>
          )}

          {/* Bulk Actions - inline with toolbar */}
          {showBulkActionsButton && (
            <Button
              onClick={popover.handleOpen}
              ref={popover.anchorRef}
              startIcon={
                <SvgIcon fontSize="small">
                  <ChevronDownIcon />
                </SvgIcon>
              }
              variant="outlined"
              size="small"
              sx={{
                flexShrink: 0,
                whiteSpace: "nowrap",
                minWidth: "auto",
                height: "32px",
                fontSize: { xs: "12px", md: "14px" },
                mr: 1,
              }}
            >
              Bulk Actions
            </Button>
          )}

          {/* Cold start indicator */}
          {getRequestData?.data?.pages?.[0].Metadata?.ColdStart === true && (
            <Tooltip title="Function App cold start was detected, data takes a little longer to retrieve on first load.">
              <SevereCold />
            </Tooltip>
          )}

          {/* Queue tracker */}
          <CippQueueTracker
            queueId={queueMetadata?.QueueId}
            queryKey={currentEffectiveQueryKey}
            title={title}
          />
        </Box>

        {/* Hidden export buttons for triggering */}
        <Box sx={{ display: "none" }}>
          <PDFExportButton
            rows={table.getFilteredRowModel().rows}
            columns={usedColumns}
            reportName={title}
            columnVisibility={columnVisibility}
            data-pdf-export
          />
          <CSVExportButton
            reportName={title}
            columnVisibility={columnVisibility}
            rows={table.getFilteredRowModel().rows}
            columns={usedColumns}
            data-csv-export
          />
        </Box>
      </Box>

      {/* Bulk Actions Menu - now inline with toolbar */}
      <Menu
        anchorEl={popover.anchorRef.current}
        anchorOrigin={{
          horizontal: "right",
          vertical: "bottom",
        }}
        MenuListProps={{
          dense: true,
          sx: { p: 1 },
        }}
        onClose={popover.handleClose}
        open={popover.open}
        transformOrigin={{
          horizontal: "right",
          vertical: "top",
        }}
      >
        {actions &&
          customBulkActions.map((action, index) => (
            <MenuItem
              key={index}
              disabled={action.disabled}
              onClick={() => {
                if (action.disabled) {
                  return;
                }

                const selectedRows = table.getSelectedRowModel().rows;
                const selectedData = selectedRows.map((row) => row.original);

                if (typeof action.customBulkHandler === "function") {
                  action.customBulkHandler({
                    rows: selectedRows,
                    data: selectedData,
                    closeMenu: popover.handleClose,
                    clearSelection: () => table.toggleAllRowsSelected(false),
                  });
                  popover.handleClose();
                  return;
                }

                setActionData({
                  data: selectedData,
                  action: action,
                  ready: true,
                });

                if (action?.noConfirm && action.customFunction) {
                  selectedRows.map((row) =>
                    action.customFunction(row.original.original, action, {})
                  );
                } else {
                  createDialog.handleOpen();
                  popover.handleClose();
                }
              }}
            >
              <SvgIcon fontSize="small" sx={{ minWidth: "30px" }}>
                {action.icon}
              </SvgIcon>
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          ))}
      </Menu>

      {/* API Response Off-Canvas - only show when not in dialog mode */}
      {!isInDialog && (
        <CippOffCanvas
          size="xl"
          title="API Response"
          visible={offcanvasVisible}
          onClose={() => {
            setOffcanvasVisible(false);
          }}
        >
          <Stack spacing={2}>
            <CippCodeBlock
              type="editor"
              code={JSON.stringify(usedData, null, 2)}
              editorHeight="1000px"
              showLineNumbers={!mdDown}
            />
          </Stack>
        </CippOffCanvas>
      )}

      {/* Action Dialog */}
      {actionData.ready && (
        <CippApiDialog
          createDialog={createDialog}
          title="Confirmation"
          fields={actionData.action?.fields}
          api={actionData.action}
          row={actionData.data}
          relatedQueryKeys={queryKeys}
          {...actionData.action}
        />
      )}

      {/* Graph Filter Off-Canvas */}
      <CippOffCanvas
        size="md"
        title="Edit Filters"
        visible={filterCanvasVisible}
        onClose={() => setFilterCanvasVisible(!filterCanvasVisible)}
      >
        <CippGraphExplorerFilter
          endpointFilter={api?.data?.Endpoint}
          relatedQueryKeys={[queryKey, currentEffectiveQueryKey].filter(Boolean)}
          onSubmitFilter={(filter) => {
            setTableFilter(filter, "graph", "Custom Filter");
            if (filter?.$select) {
              let selectedColumns = [];
              if (Array.isArray(filter?.$select)) {
                selectedColumns = filter?.$select;
              } else if (typeof filter?.$select === "string") {
                selectedColumns = filter.$select.split(",");
              }
              if (selectedColumns.length > 0) {
                setConfiguredSimpleColumns(selectedColumns);
                selectedColumns.forEach((col) => {
                  setNestedVisibility(col);
                });
              }
            } else {
              setConfiguredSimpleColumns(originalSimpleColumns);
            }
            setFilterCanvasVisible(!filterCanvasVisible);
          }}
          component="card"
        />
      </CippOffCanvas>

      {/* JSON Dialog for when in dialog mode */}
      {isInDialog && (
        <Dialog
          fullWidth
          maxWidth="xl"
          open={jsonDialogOpen}
          onClose={() => setJsonDialogOpen(false)}
          sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
        >
          <DialogTitle>API Response</DialogTitle>
          <DialogContent>
            <CippCodeBlock
              type="editor"
              code={JSON.stringify(usedData, null, 2)}
              editorHeight="600px"
              showLineNumbers={!mdDown}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setJsonDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
