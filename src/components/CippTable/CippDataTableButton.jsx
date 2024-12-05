import React, { useState } from "react";
import { Dialog, DialogContent, Button } from "@mui/material";
import { CippDataTable } from "./CippDataTable";
const CippDataTableButton = ({ data, title }) => {
  const [openDialogs, setOpenDialogs] = useState([]);

  const handleOpenDialog = () => {
    const dataArray = Array.isArray(data) ? data : [data];
    setOpenDialogs([...openDialogs, dataArray]);
  };

  const handleCloseDialog = (index) => {
    setOpenDialogs(openDialogs.filter((_, i) => i !== index));
  };
  const dataIsNotANullArray = !Array.isArray(data) || data.length === 0;
  return (
    <>
      <Button
        disabled={dataIsNotANullArray}
        variant="contained"
        onClick={handleOpenDialog}
        size="small"
      >
        {title ? title + " " : ""}
        {dataIsNotANullArray ? "No items" : `${data.length} items`}
      </Button>

      {openDialogs.map((dialogData, index) => (
        <Dialog
          key={index}
          open={true}
          onClose={() => handleCloseDialog(index)}
          fullWidth
          maxWidth="lg"
        >
          <DialogContent>
            <CippDataTable noCard={true} title="Data" data={dialogData} simple={false} />
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
};

export default CippDataTableButton;
