import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  IconButton,
  ListItemIcon,
  MenuItem,
  Skeleton,
} from "@mui/material";
import { ResourceUnavailable } from "../resource-unavailable";
import { ResourceError } from "../resource-error";
import { Scrollbar } from "../scrollbar";
import { useEffect, useState } from "react";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { utilTableMode } from "./util-tablemode";
import { utilColumnsFromAPI } from "./util-columnsFromAPI";
import { CIPPTableToptoolbar } from "./CIPPTableToptoolbar";
import { Close, More } from "@mui/icons-material";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";

export const CippDataTable = (props) => {
  const {
    data = [],
    columns = [],
    api = {},
    isFetching = false,
    columnVisibility = {
      id: false,
      RowKey: false,
      ETag: false,
      PartitionKey: false,
      Timestamp: false,
      TableTimestamp: false,
    },
    columnsFromApi = false,
    exportEnabled = true,
    noDataButton = {},
    actions,
    noDataText = "No data found.",
    title = "Report",
    simple = false,
    cardButton,
    offCanvas = false,
  } = props;
  //start get data from API logic
  const getRequestData = ApiGetCall({
    url: api.url,
    data: api.data,
    queryKey: title,
  });
  //end get data from API logic
  const [usedData, setUsedData] = useState(data);
  const [offcanvasVisble, setOffcanvasVisible] = useState(false);
  const [offCanvasData, setOffCanvasData] = useState({});

  useEffect(() => {
    if (getRequestData.isSuccess) {
      if (api.dataKey) {
        setUsedData(getRequestData.data[api.dataKey]);
      } else {
        setUsedData(getRequestData.data);
      }
    }
  }, [getRequestData.isSuccess, getRequestData.data]);
  const [usedColumns, setUsedColumns] = useState(columns);
  const [alertVisible, setAlertVisible] = useState(true);

  //Start columnsFromAPI logic
  useEffect(() => {
    if (columnsFromApi && Array.isArray(usedData) && typeof usedData[0] === "object") {
      const newColumns = utilColumnsFromAPI(usedData[0]);
      setUsedColumns([...newColumns]);
    }
    if (!columnsFromApi) {
      setUsedColumns([...columns]);
    }
  }, [columns, columnsFromApi, usedData]);
  //End columnsFromAPI logic

  const modeInfo = utilTableMode(columnVisibility, simple, actions);
  //handleActionslogic logic
  const actionPostRequest = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: title,
  });
  const [getRequestInfo, setGetRequestInfo] = useState({
    url: "",
    waiting: false,
    queryKey: "",
  });

  const actionGetRequest = ApiGetCall({
    ...getRequestInfo,
  });

  const handleActionClick = (row, action, table) => {
    setAlertVisible(true);

    const data = {};
    if (action.multiPost && Array.isArray(row)) {
      Object.keys(action.data).forEach((key) => {
        data[key] = row.map((singleRow) => {
          const value = singleRow[action.data[key]];
          return value !== undefined ? value : action.data[key];
        });
      });
    } else {
      Object.keys(action.data).forEach((key) => {
        const value = row[action.data[key]];
        data[key] = value !== undefined ? value : action.data[key];
      });
    }

    if (action.type === "POST") {
      actionPostRequest.mutate({ url: action.url, ...data });
    }

    if (action.type === "GET") {
      setGetRequestInfo({
        url: action.url,
        waiting: true,
        queryKey: Date.now(),
        data, // Include the data in the GET request
      });
    }
  };

  //end handleActionClick logic

  const table = useMaterialReactTable({
    mrtTheme: (theme) => ({
      baseBackgroundColor: theme.palette.mode === "dark" ? theme.palette.neutral[900] : "#FFFFFF", //change default background color
    }),
    columns: usedColumns ? usedColumns : [],
    data: usedData ? usedData : [],
    ...modeInfo,

    renderRowActionMenuItems: actions
      ? ({ closeMenu, row, table }) => [
          actions.map((action, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                handleActionClick(row.original, action, table, actionGetRequest, actionPostRequest);
                closeMenu();
              }}
            >
              <ListItemIcon>{action.icon}</ListItemIcon>
              {action.label}
            </MenuItem>
          )),
          offCanvas && (
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
          {simple === false && (
            <>
              <CIPPTableToptoolbar
                table={table}
                getRequestData={getRequestData}
                usedColumns={usedColumns}
                title={title}
                actions={actions}
                exportEnabled={exportEnabled}
                handleActionClick={handleActionClick}
              />
              {actionPostRequest.isError && (
                <Alert variant="outlined" severity="error">
                  {console.log(actionPostRequest.error)}
                  {actionPostRequest.error.response?.data?.result
                    ? actionPostRequest.error.response?.data.result
                    : actionPostRequest.error.message}
                </Alert>
              )}
              {actionPostRequest.isSuccess && (
                <Collapse in={alertVisible}>
                  <Alert
                    variant="outlined"
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          setAlertVisible((prev) => !prev);
                        }}
                      >
                        <Close fontSize="inherit" />
                      </IconButton>
                    }
                    severity="success"
                  >
                    {actionPostRequest.data?.data?.result}
                  </Alert>
                </Collapse>
              )}
              {actionGetRequest.isError && (
                <Alert variant="outlined" severity="error">
                  {actionGetRequest.error.data
                    ? actionGetRequest.error.data.result
                    : actionGetRequest.error.message}
                </Alert>
              )}
              {actionGetRequest.isSuccess && (
                <Collapse in={alertVisible}>
                  <Alert
                    variant="outlined"
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          setAlertVisible((prev) => !prev);
                        }}
                      >
                        <Close fontSize="inherit" />
                      </IconButton>
                    }
                    severity="success"
                  >
                    {actionGetRequest.data?.result}
                  </Alert>
                </Collapse>
              )}
            </>
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
          {getRequestData.isError && <ResourceError message="Error loading data" />}
          {isFetching || (getRequestData.isFetching && !getRequestData.data) ? (
            <>
              <Skeleton />
            </>
          ) : null}
        </Scrollbar>
      </CardContent>
      <CippOffCanvas
        isFetching={getRequestData.isFetching}
        visible={offcanvasVisble}
        onClose={() => setOffcanvasVisible(false)}
        extendedData={offCanvasData}
        extendedInfoFields={offCanvas?.extendedInfoFields}
        actions={actions}
      />
      ,
    </Card>
  );
};
