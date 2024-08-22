import { Sync } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
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

export const CIPPTableToptoolbar = ({
  table,
  getRequestData,
  usedColumns,
  title,
  actions,
  exportEnabled,
  handleActionClick,
}) => {
  const popover = usePopover();

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
                <CSVExportButton rows={table.getFilteredRowModel().rows} columns={usedColumns} />
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
                      i
                      key={index}
                      onClick={() => {
                        //if actions.multipost is set, then use multipost.data to send the correct data.
                        if (action.multiPost) {
                          const selectedRows = table
                            .getSelectedRowModel()
                            .rows.map((row) => row.original);
                          handleActionClick(selectedRows, action, table);
                        } else {
                          table.getSelectedRowModel().rows.forEach((row) => {
                            handleActionClick(row.original, action, table);
                          });
                        }
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
        <MRT_ToolbarAlertBanner stackAlertBanner table={table} />
      </Box>
    </>
  );
};
