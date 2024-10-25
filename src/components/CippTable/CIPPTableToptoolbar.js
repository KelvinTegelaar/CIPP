import { Sync } from "@mui/icons-material";
import { Button, IconButton, ListItemText, Menu, MenuItem, SvgIcon, Tooltip } from "@mui/material";
import { Box } from "@mui/system";
import {
  MRT_GlobalFilterTextField,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToolbarAlertBanner,
} from "material-react-table";
import { PDFExportButton } from "../pdfExportButton";
import { ChevronDownIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { usePopover } from "../../hooks/use-popover";
import { CSVExportButton } from "../csvExportButton";
import { useDialog } from "../../hooks/use-dialog";
import { useState } from "react";
import { CippApiDialog } from "../CippComponents/CippApiDialog";

export const CIPPTableToptoolbar = ({
  table,
  getRequestData,
  usedColumns,
  columnVisibility,
  title,
  actions,
  exportEnabled,
  refreshFunction,
}) => {
  const popover = usePopover();
  const createDialog = useDialog();
  const [actionData, setActionData] = useState({ data: {}, action: {}, ready: false });

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
              <span>
                <IconButton
                  className="MuiIconButton"
                  onClick={() =>
                    getRequestData?.waiting
                      ? getRequestData.refetch()
                      : typeof refreshFunction === "object"
                      ? refreshFunction.refetch()
                      : null
                  }
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
              </span>
            </Tooltip>
            <MRT_GlobalFilterTextField table={table} />
            <MRT_ToggleFiltersButton table={table} />
            {
              //this one is hideous, replace with custom component.
            }
            <MRT_ShowHideColumnsButton table={table} />
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
          </>
        </Box>
        <Box>
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            {
              //add information icons here when getRequest is fetiching extra pages,
              //e.g. a page counter or just "Retrieving more data..." also show a button for load errors. Find a way to discern and infinite load error vs a regular error.
            }
            {(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) && (
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
                  {actions?.map((action, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => {
                        setActionData({
                          data: table.getSelectedRowModel().rows.map((row) => row.original),
                          action: action,
                          ready: true,
                        });
                        createDialog.handleOpen();
                        popover.handleClose();
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
          />
        )}
        <MRT_ToolbarAlertBanner stackAlertBanner table={table} />
      </Box>
    </>
  );
};
