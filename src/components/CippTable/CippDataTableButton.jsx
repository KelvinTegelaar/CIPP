import React, { useState } from "react";
import { Dialog, DialogContent, Button } from "@mui/material";
import { CippDataTable } from "./CippDataTable";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
const CippDataTableButton = ({ data, title, tableTitle = "Data" }) => {
  const [openDialogs, setOpenDialogs] = useState([]);

  const handleOpenDialog = () => {
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

  const handleCloseDialog = (index) => {
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
          onClose={() => handleCloseDialog(index)}
          fullWidth
          maxWidth="lg"
        >
          <DialogContent sx={tableTitle !== "Data" && { p: 0 }}>
            <CippDataTable
              noCard={tableTitle === "Data"}
              title={tableTitle}
              data={dialogData}
              simple={false}
            />
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
};

export default CippDataTableButton;
