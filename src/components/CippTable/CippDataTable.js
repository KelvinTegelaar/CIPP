import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  ListItemIcon,
  MenuItem,
  Skeleton,
} from "@mui/material";
import { ResourceUnavailable } from "../resource-unavailable";
import { ResourceError } from "../resource-error";
import { Scrollbar } from "../scrollbar";
import { useEffect, useState } from "react";
import { ApiGetCall } from "../../api/ApiCall";
import { utilTableMode } from "./util-tablemode";
import { utilColumnsFromAPI } from "./util-columnsFromAPI";
import { CIPPTableToptoolbar } from "./CIPPTableToptoolbar";
import { More } from "@mui/icons-material";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import { useDialog } from "../../hooks/use-dialog";
import { CippApiDialog } from "../CippComponents/CippApiDialog";

export const CippDataTable = (props) => {
  const {
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
    noDataButton = {},
    actions,
    noDataText = "No data found.",
    title = "Report",
    simple = false,
    cardButton,
    offCanvas = false,
  } = props;

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);
  const [usedData, setUsedData] = useState(data);
  const [usedColumns, setUsedColumns] = useState([]);
  const [offcanvasVisible, setOffcanvasVisible] = useState(false);
  const [offCanvasData, setOffCanvasData] = useState({});
  const [actionData, setActionData] = useState({ data: {}, action: {}, ready: false });

  // Fetch data from API
  const getRequestData = ApiGetCall({
    url: api.url,
    data: api.data,
    queryKey: title,
  });

  useEffect(() => {
    if (getRequestData.isSuccess) {
      const fetchedData = api.dataKey ? getRequestData.data[api.dataKey] : getRequestData.data;
      setUsedData(fetchedData || []);
    }
  }, [getRequestData.isSuccess, getRequestData.data, api.dataKey]);

  useEffect(() => {
    if (Array.isArray(usedData) && usedData.length > 0 && typeof usedData[0] === "object") {
      const apiColumns = utilColumnsFromAPI(usedData[0]);

      // If columns is empty, only set columns once
      if (columns.length === 0 && usedColumns.length === 0) {
        setUsedColumns(apiColumns);

        // Update visibility for new columns, but avoid unnecessary updates
        const newVisibility = { ...columnVisibility };
        apiColumns.forEach((col) => {
          if (!columnVisibility.hasOwnProperty(col.accessorKey)) {
            newVisibility[col.accessorKey] = true; // show by default when columns is empty
          }
        });
        setColumnVisibility(newVisibility);
      } else if (columns.length > 0) {
        // Only update if columns prop is provided
        const existingColumnKeys = new Set(columns.map((col) => col.accessorKey || col.header));
        const finalColumns = [
          ...columns,
          ...apiColumns.filter((col) => !existingColumnKeys.has(col.accessorKey)),
        ];
        setUsedColumns(finalColumns);

        setColumnVisibility((prevVisibility) => {
          const newVisibility = { ...prevVisibility };
          finalColumns.forEach((col) => {
            if (!prevVisibility.hasOwnProperty(col.accessorKey)) {
              newVisibility[col.accessorKey] = false; // hide new columns by default
            }
          });
          return newVisibility;
        });
      }
    }
  }, [columns, usedData, usedColumns.length]); // Added usedColumns.length as a dependency to avoid looping

  const createDialog = useDialog();

  // Apply the modeInfo directly
  const modeInfo = utilTableMode(columnVisibility, simple, actions);

  const table = useMaterialReactTable({
    mrtTheme: (theme) => ({
      baseBackgroundColor: theme.palette.mode === "dark" ? theme.palette.neutral[900] : "#FFFFFF",
    }),
    columns: usedColumns,
    data: usedData,
    state: { columnVisibility },
    enableColumnPinning: true,
    enableStickyHeader: true,
    muiTableContainerProps: {
      sx: { maxHeight: `calc(100vh - 380px)` },
    },
    onColumnVisibilityChange: setColumnVisibility,
    ...modeInfo,

    renderRowActionMenuItems: actions
      ? ({ closeMenu, row }) => [
          actions.map((action, index) => (
            <MenuItem
              key={`actions-list-row-${index}`}
              onClick={() => {
                setActionData({
                  data: row.original,
                  action: action,
                  ready: true,
                });
                createDialog.handleOpen();
                closeMenu();
              }}
            >
              <ListItemIcon>{action.icon}</ListItemIcon>
              {action.label}
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
              <ListItemIcon>
                <More fontSize="small" />
              </ListItemIcon>
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
              getRequestData={getRequestData}
              usedColumns={usedColumns}
              title={title}
              actions={actions}
              exportEnabled={exportEnabled}
            />
          )}
        </>
      );
    },
  });

  return (
    <Card style={{ width: "100%" }}>
      <CardHeader action={cardButton} title={title} /> <Divider />
      <CardContent>
        <Scrollbar>
          {!Array.isArray(usedData) && usedData ? (
            <ResourceUnavailable message="Data not in correct format" />
          ) : (
            <>
              {getRequestData.isSuccess && usedData.length === 0 && (
                <ResourceUnavailable
                  message={noDataText}
                  createButtonText={noDataButton.createText}
                  onCreate={() =>
                    noDataButton.createFunction ? noDataButton.createFunction() : null
                  }
                  type={noDataButton.type}
                  target={noDataButton.target}
                />
              )}
              {getRequestData.isSuccess && usedData.length > 0 && (
                <MaterialReactTable
                  enableRowVirtualization
                  enableColumnVirtualization
                  table={table}
                />
              )}
            </>
          )}
          {getRequestData.isError && (
            <ResourceError
              onReload={() => getRequestData.refetch()}
              message={`Error Loading data:  ${
                apiObject.error.response?.data?.result
                  ? apiObject.error.response?.data.result
                  : apiObject.error.message
              }`}
            />
          )}
          {isFetching || (getRequestData.isFetching && !getRequestData.data) ? (
            <>
              <Skeleton />
            </>
          ) : null}
        </Scrollbar>
      </CardContent>
      <CippOffCanvas
        isFetching={getRequestData.isFetching}
        visible={offcanvasVisible}
        onClose={() => setOffcanvasVisible(false)}
        extendedData={offCanvasData}
        extendedInfoFields={offCanvas?.extendedInfoFields}
        actions={actions}
      />
      {actionData.ready && (
        <CippApiDialog
          createDialog={createDialog}
          title="Confirmation"
          fields={actionData.action?.fields}
          api={actionData.action}
          row={actionData.data}
        />
      )}
    </Card>
  );
};
