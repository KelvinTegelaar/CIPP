import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton, Button, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CippDataTable } from "./CippDataTable";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { resolveRowTemplates, getRowTenant } from "../../utils/resolve-row-templates";
import { useSettings } from "../../hooks/use-settings";

const applyTenantFilterDefault = (api, row, currentTenant) => {
  if (!api) {
    return api;
  }
  const data = { ...(api.data || {}) };
  if (data.tenantFilter === undefined && data.TenantFilter === undefined) {
    const tenant = getRowTenant(row, currentTenant);
    if (tenant) {
      data.tenantFilter = tenant;
    }
  }
  return { ...api, data };
};

const CippDataTableButton = ({
  data,
  title,
  tableTitle = "Data",
  row,
  api,
  label,
  condition,
  queryKey,
  ...tableProps
}) => {
  const [openDialogs, setOpenDialogs] = useState([]);
  const [liveOpen, setLiveOpen] = useState(false);
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const settings = useSettings();
  const isLive = Boolean(api?.url);

  const nestedTitle = title ?? tableTitle ?? "Data";

  const handleOpenStaticDialog = (event) => {
    event?.stopPropagation();

    let dataArray;

    if (Array.isArray(data)) {
      dataArray = data;
    } else if (typeof data === "object" && data !== null) {
      dataArray = Object.keys(data).map((key) => ({
        key: getCippTranslation(key),
        value: data[key],
      }));
    } else {
      dataArray = [data];
    }
    setOpenDialogs([...openDialogs, dataArray]);
  };

  const handleCloseStaticDialog = (index, event) => {
    event?.stopPropagation?.();
    setOpenDialogs(openDialogs.filter((_, i) => i !== index));
  };

  const handleOpenLiveDialog = (event) => {
    event?.stopPropagation();
    setLiveOpen(true);
  };

  const handleCloseLiveDialog = (event) => {
    event?.stopPropagation?.();
    setLiveOpen(false);
  };

  const liveTableProps = useMemo(() => {
    if (!isLive || !liveOpen) {
      return null;
    }
    const templatedApi = applyTenantFilterDefault(
      resolveRowTemplates(api, row),
      row,
      settings?.currentTenant
    );
    const templatedQueryKey = queryKey
      ? resolveRowTemplates(queryKey, row)
      : undefined;
    const templatedTitle = resolveRowTemplates(nestedTitle, row);
    const { title: _ignoredTitle, ...rest } = tableProps;

    return {
      ...rest,
      api: templatedApi,
      queryKey: templatedQueryKey,
      title: templatedTitle,
      parentRow: row,
      isInDialog: true,
      simple: rest.simple ?? false,
      hideTitle: mdDown,
      maxHeightOffset: rest.maxHeightOffset ?? "160px",
    };
  }, [api, isLive, liveOpen, mdDown, nestedTitle, queryKey, row, settings?.currentTenant, tableProps]);

  const dataIsNotANullArray =
    !Array.isArray(data) &&
    (typeof data !== "object" || data === null || Object.keys(data).length === 0);
  const dataLength = Array.isArray(data)
    ? data.length
    : typeof data === "object" && data !== null
    ? Object.keys(data).length
    : 0;

  const liveDisabled = typeof condition === "function" ? !condition(row) : false;
  const buttonLabel = isLive
    ? typeof label === "function"
      ? label(row)
      : label ?? "View"
    : dataIsNotANullArray
    ? "No items"
    : `${dataLength} items`;

  const dialogTitle = isLive
    ? liveTableProps?.title ?? nestedTitle
    : tableTitle;

  return (
    <>
      <Button
        disabled={isLive ? liveDisabled : dataIsNotANullArray}
        variant="contained"
        onClick={isLive ? handleOpenLiveDialog : handleOpenStaticDialog}
        size="small"
        data-no-row-click="true"
      >
        {buttonLabel}
      </Button>

      {isLive && liveOpen && liveTableProps && (
        <Dialog
          open={true}
          onClose={handleCloseLiveDialog}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          fullWidth
          fullScreen={mdDown}
          maxWidth="lg"
        >
          {mdDown && (
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 0.5, py: 1, px: 1 }}>
              <IconButton
                onClick={handleCloseLiveDialog}
                aria-label="Close"
                sx={{ minWidth: 44, minHeight: 44 }}
              >
                <CloseIcon />
              </IconButton>
              {dialogTitle}
            </DialogTitle>
          )}
          <DialogContent sx={{ p: mdDown ? 1 : 0 }}>
            <CippDataTable noCard={false} {...liveTableProps} />
          </DialogContent>
        </Dialog>
      )}

      {!isLive &&
        openDialogs.map((dialogData, index) => (
          <Dialog
            key={index}
            open={true}
            onClose={(event) => handleCloseStaticDialog(index, event)}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            fullWidth
            fullScreen={mdDown}
            maxWidth="lg"
          >
            {mdDown && (
              <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 0.5, py: 1, px: 1 }}>
                <IconButton
                  onClick={(event) => handleCloseStaticDialog(index, event)}
                  aria-label="Close"
                  sx={{ minWidth: 44, minHeight: 44 }}
                >
                  <CloseIcon />
                </IconButton>
                {tableTitle}
              </DialogTitle>
            )}
            <DialogContent sx={tableTitle !== "Data" && { p: mdDown ? 1 : 0 }}>
              <CippDataTable
                noCard={tableTitle === "Data"}
                title={tableTitle}
                data={dialogData}
                simple={false}
                isInDialog={true}
                hideTitle={mdDown}
                actions={tableProps.actions}
                simpleColumns={tableProps.simpleColumns}
                cardButton={tableProps.cardButton}
                parentRow={row}
              />
            </DialogContent>
          </Dialog>
        ))}
    </>
  );
};

export default CippDataTableButton;
