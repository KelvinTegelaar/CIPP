import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";
import { CippDataTable } from "./CippDataTable";
const CippDataTableButton = ({ data }) => {
  const [openDialogs, setOpenDialogs] = useState([]);

  const handleOpenDialog = () => {
    const dataArray = Array.isArray(data) ? data : [data];
    setOpenDialogs([...openDialogs, dataArray]);
  };

  const handleCloseDialog = (index) => {
    setOpenDialogs(openDialogs.filter((_, i) => i !== index));
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpenDialog}>
        {Array.isArray(data) ? `${data.length} items` : "1 item"}
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
            <CippDataTable title="Data" data={dialogData} simple={false} />
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
};

export default CippDataTableButton;
