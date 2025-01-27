import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  SvgIcon,
} from "@mui/material";
import { ResourceUnavailable } from "../resource-unavailable";
import { ResourceError } from "../resource-error";
import { Scrollbar } from "../scrollbar";
import React, { useEffect, useMemo, useState } from "react";
import { ApiGetCallWithPagination } from "../../api/ApiCall";
import { utilTableMode } from "./util-tablemode";
import { utilColumnsFromAPI } from "./util-columnsFromAPI";
import { CIPPTableToptoolbar } from "./CIPPTableToptoolbar";
import { More, MoreHoriz } from "@mui/icons-material";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import { useDialog } from "../../hooks/use-dialog";
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import { getCippError } from "../../utils/get-cipp-error";

export const CippDataTable = (props) => {
  const {
    queryKey,
    data = [],
    columns = [],
    api = {},
    isFetching = false,
    columnVisibility: initialColumnVisibility = {
      id: false,
      RowKey: false,
      ETag: false,
      PartitionKey: false,
      Timestamp: false,
      TableTimestamp: false,
    },
    exportEnabled = true,
    simpleColumns = [],
    actions,
    title = "Report",
    simple = false,
    cardButton,
    offCanvas = false,
    noCard = false,
    hideTitle = false,
    refreshFunction,
    incorrectDataMessage = "Data not in correct format",
    onChange,
    filters,
  } = props;
  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);
  const [configuredSimpleColumns, setConfiguredSimpleColumns] = useState(simpleColumns);
  const [usedData, setUsedData] = useState(data);
  const [usedColumns, setUsedColumns] = useState([]);
  const [offcanvasVisible, setOffcanvasVisible] = useState(false);
  const [offCanvasData, setOffCanvasData] = useState({});
  const [actionData, setActionData] = useState({ data: {}, action: {}, ready: false });
  const [graphFilterData, setGraphFilterData] = useState({});
  const waitingBool = api?.url ? true : false;
  const getRequestData = ApiGetCallWithPagination({
    url: api.url,
    data: { ...api.data },
    queryKey: queryKey ? queryKey : title,
    waiting: waitingBool,
    ...graphFilterData,
  });

  useEffect(() => {
    if (Array.isArray(data) && !api?.url) {
      setUsedData(data);
    }
  }, [data, api?.url]);

  useEffect(() => {
    if (getRequestData.isSuccess && !getRequestData.isFetching) {
      const lastPage = getRequestData.data?.pages[getRequestData.data.pages.length - 1];
      const nextLinkExists = lastPage?.Metadata?.nextLink;
      if (nextLinkExists) {
        getRequestData.fetchNextPage();
      }
    }
  }, [getRequestData.data?.pages?.length, getRequestData.isFetching, queryKey]);

  useEffect(() => {
    if (getRequestData.isSuccess) {
      const allPages = getRequestData.data.pages;
      const getNestedValue = (obj, path) => {
        if (!path) {
          return obj;
        }

        const keys = path.split(".");
        let result = obj;
        for (const key of keys) {
          if (result && typeof result === "object" && key in result) {
            result = result[key];
          } else {
            return undefined;
          }
        }
        return result;
      };

      const combinedResults = allPages.flatMap((page) => {
        const nestedData = getNestedValue(page, api.dataKey);
        return nestedData !== undefined ? nestedData : [];
      });
      setUsedData(combinedResults);
    }
  }, [
    getRequestData.isSuccess,
    getRequestData.data,
    api.dataKey,
    getRequestData.isFetching,
    queryKey,
  ]);
  useEffect(() => {
    if (!Array.isArray(usedData) || usedData.length === 0 || typeof usedData[0] !== "object") {
      return;
    }
    const apiColumns = utilColumnsFromAPI(usedData);
    let finalColumns = [];
    let newVisibility = { ...columnVisibility };

    if (columns.length === 0 && configuredSimpleColumns.length === 0) {
      finalColumns = apiColumns;
      apiColumns.forEach((col) => {
        newVisibility[col.id] = true;
      });
    } else if (configuredSimpleColumns.length > 0) {
      finalColumns = apiColumns.map((col) => {
        newVisibility[col.id] = configuredSimpleColumns.includes(col.id);
        return col;
      });
    } else {
      const providedColumnKeys = new Set(columns.map((col) => col.id || col.header));
      finalColumns = [...columns, ...apiColumns.filter((col) => !providedColumnKeys.has(col.id))];
      finalColumns.forEach((col) => {
        newVisibility[col.accessorKey] = providedColumnKeys.has(col.id);
      });
    }
    setUsedColumns(finalColumns);
    setColumnVisibility(newVisibility);
  }, [columns.length, usedData.length, queryKey]);

  const createDialog = useDialog();

  // Apply the modeInfo directly
  const [modeInfo] = useState(
    utilTableMode(columnVisibility, simple, actions, configuredSimpleColumns, offCanvas, onChange)
  );
  //create memoized version of usedColumns, and usedData
  const memoizedColumns = useMemo(() => usedColumns, [usedColumns]);
  const memoizedData = useMemo(() => usedData, [usedData]);

  const handleActionDisabled = (row, action) => {
    if (action?.condition) {
      return !action.condition(row);
    }
    return false;
  };

  const table = useMaterialReactTable({
    mrtTheme: (theme) => ({
      baseBackgroundColor: theme.palette.background.paper,
    }),

    columns: memoizedColumns,
    data: memoizedData,
    state: {
      columnVisibility,
      showSkeletons: getRequestData.isFetching ? getRequestData.isFetching : isFetching,
    },
    renderEmptyRowsFallback: ({ table }) =>
      getRequestData.data?.pages?.[0].Metadata?.QueueMessage ? (
        <center>{getRequestData.data?.pages?.[0].Metadata?.QueueMessage}</center>
      ) : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    ...modeInfo,
    renderRowActionMenuItems: actions
      ? ({ closeMenu, row }) => [
          actions.map((action, index) => (
            <MenuItem
              sx={{ color: action.color }}
              key={`actions-list-row-${index}`}
              onClick={() => {
                setActionData({
                  data: row.original,
                  action: action,
                  ready: true,
                });
                if (action.noConfirm && action.customFunction) {
                  action.customFunction(row.original, action, {});
                  closeMenu();
                  return;
                } else {
                  createDialog.handleOpen();
                  closeMenu();
                }
              }}
              disabled={handleActionDisabled(row.original, action)}
            >
              <SvgIcon fontSize="small" sx={{ minWidth: "30px" }}>
                {action.icon}
              </SvgIcon>
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          )),
          offCanvas && (
            <MenuItem
              key={`actions-list-row-more`}
              onClick={() => {
                closeMenu();
                setOffCanvasData(row.original);
                setOffcanvasVisible(true);
              }}
            >
              <SvgIcon fontSize="small" sx={{ minWidth: "30px" }}>
                <MoreHoriz />
              </SvgIcon>
              More Info
            </MenuItem>
          ),
        ]
      : offCanvas && (
          <MenuItem
            onClick={() => {
              closeMenu();
              setOffCanvasData(row.original);
              setOffcanvasVisible(true);
            }}
          >
            <ListItemIcon>
              <More fontSize="small" />
            </ListItemIcon>
            More Info
          </MenuItem>
        ),
    renderTopToolbar: ({ table }) => {
      return (
        <>
          {!simple && (
            <CIPPTableToptoolbar
              table={table}
              api={api}
              queryKey={queryKey}
              simpleColumns={simpleColumns}
              data={data}
              columnVisibility={columnVisibility}
              getRequestData={getRequestData}
              usedColumns={usedColumns}
              usedData={usedData}
              title={title}
              actions={actions}
              exportEnabled={exportEnabled}
              refreshFunction={refreshFunction}
              setColumnVisibility={setColumnVisibility}
              filters={filters}
              queryKeys={queryKey}
              graphFilterData={graphFilterData}
              setGraphFilterData={setGraphFilterData}
              setConfiguredSimpleColumns={setConfiguredSimpleColumns}
            />
          )}
        </>
      );
    },
  });

  useEffect(() => {
    if (onChange && table.getSelectedRowModel().rows) {
      onChange(table.getSelectedRowModel().rows.map((row) => row.original));
    }
  }, [table.getSelectedRowModel().rows]);

  return (
    <>
      {noCard ? (
        <Scrollbar>
          {!Array.isArray(usedData) && usedData ? (
            <ResourceUnavailable message={incorrectDataMessage} />
          ) : (
            <>
              {(getRequestData.isSuccess || getRequestData.data?.pages.length >= 0 || data) && (
                <MaterialReactTable table={table} />
              )}
            </>
          )}
          {getRequestData.isError && !getRequestData.isFetchNextPageError && (
            <ResourceError
              onReload={() => getRequestData.refetch()}
              message={`Error Loading data:  ${getCippError(getRequestData.error)}`}
            />
          )}
        </Scrollbar>
      ) : (
        // Render the table inside a Card
        <Card style={{ width: "100%" }}>
          {cardButton || !hideTitle ? (
            <>
              <CardHeader action={cardButton} title={hideTitle ? "" : title} />
              <Divider />
            </>
          ) : null}
          <CardContent sx={{ padding: "1rem" }}>
            <Scrollbar>
              {!Array.isArray(usedData) && usedData ? (
                <ResourceUnavailable message={incorrectDataMessage} />
              ) : (
                <>
                  {(getRequestData.isSuccess ||
                    getRequestData.data?.pages.length >= 0 ||
                    (data && !getRequestData.isError)) && (
                    <MaterialReactTable
                      enableRowVirtualization
                      enableColumnVirtualization
                      table={table}
                    />
                  )}
                </>
              )}
              {getRequestData.isError && !getRequestData.isFetchNextPageError && (
                <ResourceError
                  onReload={() => getRequestData.refetch()}
                  message={`Error Loading data:  ${getCippError(getRequestData.error)}`}
                />
              )}
            </Scrollbar>
          </CardContent>
        </Card>
      )}
      <CippOffCanvas
        isFetching={getRequestData.isFetching}
        visible={offcanvasVisible}
        onClose={() => setOffcanvasVisible(false)}
        extendedData={offCanvasData}
        extendedInfoFields={offCanvas?.extendedInfoFields}
        actions={actions}
        children={offCanvas?.children}
        customComponent={offCanvas?.customComponent}
        {...offCanvas}
      />
      {actionData.ready && (
        <CippApiDialog
          createDialog={createDialog}
          title="Confirmation"
          fields={actionData.action?.fields}
          api={actionData.action}
          row={actionData.data}
          relatedQueryKeys={queryKey ? queryKey : title}
        />
      )}
    </>
  );
};
