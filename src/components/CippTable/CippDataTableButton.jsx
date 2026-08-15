import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton, Button, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CippDataTable } from "./CippDataTable";
import { getCippTranslation } from "../../utils/get-cipp-translation";
const CippDataTableButton = ({ data, title, tableTitle = "Data" }) => {
  const [openDialogs, setOpenDialogs] = useState([]);
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const handleOpenDialog = (event) => {
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

  const handleCloseDialog = (index, event) => {
    event?.stopPropagation?.();
    setOpenDialogs(openDialogs.filter((_, i) => i !== index));
  };
  const dataIsNotANullArray =
    !Array.isArray(data) &&
    (typeof data !== "object" || data === null || Object.keys(data).length === 0);
  const dataLength = Array.isArray(data)
    ? data.length
    : typeof data === "object" && data !== null
    ? Object.keys(data).length
    : 0;

  return (
    <>
      <Button
        disabled={dataIsNotANullArray}
        variant="contained"
        onClick={handleOpenDialog}
        size="small"
      >
        {dataIsNotANullArray ? "No items" : `${dataLength} items`}
      </Button>

      {openDialogs.map((dialogData, index) => (
        <Dialog
          key={index}
          open={true}
          onClose={(event) => handleCloseDialog(index, event)}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          fullWidth
          // Fullscreen on phones (CippApiDialog precedent): the nested card list needs the
          // viewport, not a cramped modal window — and fullscreen has no backdrop, so give
          // it an explicit close header.
          fullScreen={mdDown}
          maxWidth="lg"
        >
          {mdDown && (
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 0.5, py: 1, px: 1 }}>
              <IconButton
                onClick={(event) => handleCloseDialog(index, event)}
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
            />
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
};

export default CippDataTableButton;
