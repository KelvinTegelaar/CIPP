import { DeveloperMode, Sync, ViewColumn } from "@mui/icons-material";
import {
  Button,
  Checkbox,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { MRT_GlobalFilterTextField, MRT_ToggleFiltersButton } from "material-react-table";
import { PDFExportButton } from "../pdfExportButton";
import {
  ChevronDownIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
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

export const CIPPTableToptoolbar = ({
  api,
  setApi,
  simpleColumns,
  setSimpleColumns,
  queryKey,
  setQueryKey,
  table,
  getRequestData,
  usedColumns,
  usedData,
  columnVisibility,
  setColumnVisibility,
  title,
  actions,
  filters,
  exportEnabled,
  refreshFunction,
  queryKeys,
  data,
}) => {
  const popover = usePopover();
  const columnPopover = usePopover();
  const filterPopover = usePopover();

  const settings = useSettings();
  const router = useRouter();
  const createDialog = useDialog();
  const [actionData, setActionData] = useState({ data: {}, action: {}, ready: false });
  const [offcanvasVisible, setOffcanvasVisible] = useState(false);
  const [filterList, setFilterList] = useState(filters);
  const [originalApiData, setOriginalApiData] = useState(api.data);
  const [originalSimpleColumns, setOriginalSimpleColumns] = useState(simpleColumns);
  const [originalQueryKey, setOriginalQueryKey] = useState(queryKey);

  const pageName = router.pathname.split("/").slice(1).join("/");

  //useEffect to set the column visibility to the preferred columns if they exist
  useEffect(() => {
    if (settings?.columnDefaults?.[pageName]) {
      setColumnVisibility(settings?.columnDefaults?.[pageName]);
    }
  }, [settings?.columnDefaults?.[pageName], router, usedColumns]);

  const presetList = ApiGetCall({
    url: "/api/ListGraphExplorerPresets",
    queryKey: "ListGraphExplorerPresets",
  });

  const resetToDefaultVisibility = () => {
    settings.handleUpdate({
      columnDefaults: {
        ...settings?.columnDefaults,
        [pageName]: false,
      },
    });
  };

  const resetToPreferedVisibility = () => {
    if (settings?.columnDefaults?.[pageName]) {
      setColumnVisibility(settings?.columnDefaults?.[pageName]);
    } else {
      setColumnVisibility((prevVisibility) => {
        const updatedVisibility = {};
        for (const col in prevVisibility) {
          updatedVisibility[col] = originalSimpleColumns.includes(col);
        }
        return updatedVisibility;
      });
    }
  };

  const saveAsPreferedColumns = () => {
    settings.handleUpdate({
      columnDefaults: {
        ...settings?.columnDefaults,
        [pageName]: columnVisibility,
      },
    });
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
        setApi({ ...api, data: originalApiData });
        setQueryKey(originalQueryKey);
        setSimpleColumns(originalSimpleColumns);
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
      setApi({ ...api, data: mergeCaseInsensitive(api.data, graphFilter) });

      if (filter?.$select) {
        setSimpleColumns(filter.$select.split(","));
      }
      setQueryKey(originalQueryKey + "-" + filterName);
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
  }, [presetList?.isSuccess]);

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
        <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
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
                    console.log(getRequestData);
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
                  <MagnifyingGlassIcon />
                </SvgIcon>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={filterPopover.anchorRef.current}
              open={filterPopover.open}
              onClose={filterPopover.handleClose}
              MenuListProps={{ dense: true }}
            >
              <MenuItem onClick={() => setTableFilter("", "reset", "")}>
                <ListItemText primary="Reset all filters" />
              </MenuItem>
              {filterList?.map((filter) => (
                <MenuItem
                  key={filter.id}
                  onClick={() => setTableFilter(filter.value, filter.type, filter.filterName)}
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
                />
              </Stack>
            </CippOffCanvas>
          </>
        </Box>
        <Box>
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            {actions && (table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) && (
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
                  {actions
                    ?.filter((action) => !action.link)
                    .map((action, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => {
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
    </>
  );
};
