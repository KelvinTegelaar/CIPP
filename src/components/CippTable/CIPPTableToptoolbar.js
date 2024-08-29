import { Sync } from "@mui/icons-material";
import {
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
} from "@mui/material";
import { Box } from "@mui/system";
import {
  MRT_GlobalFilterTextField,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToolbarAlertBanner,
} from "material-react-table";
import { PDFExportButton } from "../pdfExportButton";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { usePopover } from "../../hooks/use-popover";
import { CSVExportButton } from "../csvExportButton";
import { useDialog } from "../../hooks/use-dialog";
import { useState } from "react";
import { CippApiDialog } from "../CippComponents/CippApiDialog";

export const CIPPTableToptoolbar = ({
  table,
  getRequestData,
  usedColumns,
  title,
  actions,
  exportEnabled,
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
            <IconButton
              className="MuiIconButton"
              onClick={() => getRequestData.refetch()}
              disabled={getRequestData.isLoading || getRequestData.isFetching}
            >
              <SvgIcon fontSize="small">{getRequestData.isFetching ? <Sync /> : <Sync />}</SvgIcon>
            </IconButton>
            <MRT_GlobalFilterTextField table={table} />
            <MRT_ToggleFiltersButton table={table} />
            <MRT_ShowHideColumnsButton table={table} />
            <MRT_ToggleDensePaddingButton table={table} />
            {exportEnabled && (
              <>
                <PDFExportButton
                  rows={table.getFilteredRowModel().rows}
                  columns={usedColumns}
                  reportName={title}
                />
                <CSVExportButton
                  reportName={title}
                  rows={table.getFilteredRowModel().rows}
                  columns={usedColumns}
                />
              </>
            )}
          </>
        </Box>
        <Box>
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
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
                  {actions.map((action, index) => (
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
                      <ListItemIcon>{action.icon}</ListItemIcon>
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
