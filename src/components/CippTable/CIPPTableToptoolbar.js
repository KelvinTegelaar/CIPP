import { DeveloperMode, SevereCold, Sync, Tune, ViewColumn } from "@mui/icons-material";
import {
  Button,
  Checkbox,
  Divider,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import {
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
} from "material-react-table";
import { PDFExportButton } from "../pdfExportButton";
import { ChevronDownIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { usePopover } from "../../hooks/use-popover";
import { CSVExportButton } from "../csvExportButton";
import { useDialog } from "../../hooks/use-dialog";
import { useEffect, useState } from "react";
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { useSettings } from "../../hooks/use-settings";
import { useRouter } from "next/router";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import { CippCodeBlock } from "../CippComponents/CippCodeBlock";
import { ApiGetCall } from "../../api/ApiCall";
import GraphExplorerPresets from "/src/data/GraphExplorerPresets.json";
import CippGraphExplorerFilter from "./CippGraphExplorerFilter";
import { useMediaQuery } from "@mui/material";

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
}) => {
  const popover = usePopover();
  const columnPopover = usePopover();
  const filterPopover = usePopover();

  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const settings = useSettings();
  const router = useRouter();
  const createDialog = useDialog();
  const [actionData, setActionData] = useState({ data: {}, action: {}, ready: false });
  const [offcanvasVisible, setOffcanvasVisible] = useState(false);
  const [filterList, setFilterList] = useState(filters);
  const [originalSimpleColumns, setOriginalSimpleColumns] = useState(simpleColumns);
  const [filterCanvasVisible, setFilterCanvasVisible] = useState(false);
  const pageName = router.pathname.split("/").slice(1).join("/");
  const currentTenant = useSettings()?.currentTenant;

  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const handleActionMenuOpen = (event) => setActionMenuAnchor(event.currentTarget);
  const handleActionMenuClose = () => setActionMenuAnchor(null);

  const getBulkActions = (actions, selectedRows) => {
    return actions?.filter((action) => !action.link && !action?.hideBulk)?.map(action => ({
      ...action,
      disabled: action.condition ? !selectedRows.every(row => action.condition(row.original)) : false
    })) || [];
  };

  useEffect(() => {
    //if usedData changes, deselect all rows
    table.toggleAllRowsSelected(false);
  }, [usedData]);
  //if the currentTenant Switches, remove Graph filters
  useEffect(() => {
    if (currentTenant) {
      setGraphFilterData({});
    }
  }, [currentTenant]);

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

  const presetList = ApiGetCall({
    url: "/api/ListGraphExplorerPresets",
    queryKey: `ListGraphExplorerPresets${api?.data?.Endpoint ?? ""}`,
    data: {
      Endpoint: api?.data?.Endpoint ?? "",
    },
    waiting: api?.data?.Endpoint ? true : false,
  });

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
    columnPopover.handleClose();
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
    columnPopover.handleClose();
  };

  const saveAsPreferedColumns = () => {
    settings.handleUpdate({
      columnDefaults: {
        ...settings?.columnDefaults,
        [pageName]: columnVisibility,
      },
    });
    columnPopover.handleClose();
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

  const setTableFilter = (filter, filterType, filterName) => {
    if (filterType === "global" || filterType === undefined) {
      table.setGlobalFilter(filter);
    }
    if (filterType === "column") {
      table.setShowColumnFilters(true);
      table.setColumnFilters(filter);
    }
    if (filterType === "reset") {
      table.resetGlobalFilter();
      table.resetColumnFilters();
      if (api?.data) {
        setGraphFilterData({});
        resetToDefaultVisibility();
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
      setGraphFilterData({
        data: { ...mergeCaseInsensitive(api.data, graphFilter) },
        queryKey: `${queryKey ? queryKey : title}-${filterName}`,
      });
      if (filter?.$select) {
        let selectedColumns = [];
        if (Array.isArray(filter?.$select)) {
          selectedColumns = filter?.$select;
        } else {
          selectedColumns = filter?.$select.split(",");
        }
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
        sx={(theme) => ({
          display: "flex",
          gap: "0.5rem",
          p: "8px",
          justifyContent: "space-between",
        })}
      >
        <Box
          sx={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          <>
            <Tooltip
              title={
                getRequestData?.isFetchNextPageError
                  ? "Could not retrieve all data. Click to try again."
                  : getRequestData?.isFetching
                  ? "Retrieving more data..."
                  : "Refresh data"
              }
            >
              <div
                onClick={() => {
                  if (typeof refreshFunction === "object") {
                    refreshFunction.refetch();
                  } else if (typeof refreshFunction === "function") {
                    refreshFunction();
                  } else if (data && !getRequestData.isFetched) {
                    //do nothing because data was sent native.
                  } else if (getRequestData) {
                    getRequestData.refetch();
                  }
                }}
              >
                <IconButton
                  className="MuiIconButton"
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
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  >
                    {getRequestData?.isFetchNextPageError ? (
                      <ExclamationCircleIcon color="red" />
                    ) : (
                      <Sync />
                    )}
                  </SvgIcon>
                </IconButton>
              </div>
            </Tooltip>
            <MRT_GlobalFilterTextField table={table} />
            <Tooltip title="Preset Filters">
              <IconButton onClick={filterPopover.handleOpen} ref={filterPopover.anchorRef}>
                <SvgIcon>
                  <Tune />
                </SvgIcon>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={filterPopover.anchorRef.current}
              open={filterPopover.open}
              onClose={filterPopover.handleClose}
              MenuListProps={{ dense: true }}
            >
              <MenuItem key="reset-filters" onClick={() => setTableFilter("", "reset", "")}>
                <ListItemText primary="Reset all filters" />
              </MenuItem>
              {api?.url === "/api/ListGraphRequest" && (
                <MenuItem
                  key="custom-filter"
                  onClick={() => {
                    filterPopover.handleClose();
                    setFilterCanvasVisible(true);
                  }}
                >
                  <ListItemText primary="Edit filters" />
                </MenuItem>
              )}
              <Divider />
              {filterList?.map((filter) => (
                <MenuItem
                  key={filter.id}
                  onClick={() => {
                    filterPopover.handleClose();
                    setTableFilter(filter.value, filter.type, filter.filterName);
                  }}
                >
                  <ListItemText primary={filter.filterName} />
                </MenuItem>
              ))}
            </Menu>
            <MRT_ToggleFiltersButton table={table} />
            <Tooltip title="Toggle Column Visibility">
              <IconButton onClick={columnPopover.handleOpen} ref={columnPopover.anchorRef}>
                <ViewColumn />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={columnPopover.anchorRef.current}
              open={columnPopover.open}
              onClose={columnPopover.handleClose}
              MenuListProps={{ dense: true }}
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
                    <Checkbox checked={column.getIsVisible()} />
                    <ListItemText primary={getCippTranslation(column.id)} />
                  </MenuItem>
                ))}
            </Menu>

            <>
              {exportEnabled && (
                <>
                  <PDFExportButton
                    rows={table.getFilteredRowModel().rows}
                    columns={usedColumns}
                    reportName={title}
                    columnVisibility={columnVisibility}
                  />
                  <CSVExportButton
                    reportName={title}
                    columnVisibility={columnVisibility}
                    rows={table.getFilteredRowModel().rows}
                    columns={usedColumns}
                  />
                </>
              )}
              <Tooltip title="View API Response">
                <IconButton onClick={() => setOffcanvasVisible(true)}>
                  <DeveloperMode />
                </IconButton>
              </Tooltip>
              {mdDown && <MRT_ToggleFullScreenButton table={table} />}
            </>
            {
              //add a little icon with how many rows are selected
              (table.getIsAllRowsSelected() || table.getIsSomeRowsSelected()) && (
                <Typography variant="body2" sx={{ alignSelf: "center" }}>
                  {table.getSelectedRowModel().rows.length} rows selected
                </Typography>
              )
            }
            <CippOffCanvas
              size="xl"
              title="API Response"
              visible={offcanvasVisible}
              onClose={() => {
                setOffcanvasVisible(false);
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h4">API Response</Typography>
                <CippCodeBlock
                  type="editor"
                  code={JSON.stringify(usedData, null, 2)}
                  editorHeight="1000px"
                  showLineNumbers={!mdDown}
                />
              </Stack>
            </CippOffCanvas>
          </>
        </Box>
        <Box>
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            {getRequestData?.data?.pages?.[0].Metadata?.ColdStart === true && (
              <Tooltip title="Function App cold start was detected, data takes a little longer to retrieve on first load.">
                <SevereCold />
              </Tooltip>
            )}
            {actions && getBulkActions(actions, table.getSelectedRowModel().rows).length > 0 && (table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) && (
              <>
                <Button
                  onClick={popover.handleOpen}
                  ref={popover.anchorRef}
                  startIcon={
                    <SvgIcon fontSize="small">
                      <ChevronDownIcon />
                    </SvgIcon>
                  }
                  variant="outlined"
                  sx={{
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  Bulk Actions
                </Button>
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
                  {getBulkActions(actions, table.getSelectedRowModel().rows).map((action, index) => (
                    <MenuItem
                      key={index}
                      disabled={action.disabled}
                      onClick={() => {
                        if (action.disabled) return;
                        setActionData({
                          data: table.getSelectedRowModel().rows.map((row) => row.original),
                          action: action,
                          ready: true,
                        });

                        if (action?.noConfirm && action.customFunction) {
                          table
                            .getSelectedRowModel()
                            .rows.map((row) =>
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
              </>
            )}
          </Box>
        </Box>
      </Box>
      <Box>
        {actionData.ready && (
          <CippApiDialog
            createDialog={createDialog}
            title="Confirmation"
            fields={actionData.action?.fields}
            api={actionData.action}
            row={actionData.data}
            relatedQueryKeys={queryKeys}
          />
        )}
      </Box>
      <CippOffCanvas
        size="md"
        title="Edit Filters"
        visible={filterCanvasVisible}
        onClose={() => setFilterCanvasVisible(!filterCanvasVisible)}
      >
        <CippGraphExplorerFilter
          endpointFilter={api?.data?.Endpoint}
          onSubmitFilter={(filter) => {
            setTableFilter(filter, "graph", "Custom Filter");
            if (filter?.$select) {
              let selectedColumns = [];
              if (Array.isArray(filter?.$select)) {
                selectedColumns = filter?.$select;
              } else {
                selectedColumns = filter?.$select.split(",");
              }
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
    </>
  );
};
