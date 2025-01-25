import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";
import dynamic from "next/dynamic"; // Import dynamic from next/dynamic
import { CippPropertyList } from "./CippPropertyList"; // Import CippPropertyList
import { LocationOn } from "@mui/icons-material";

const CippMap = dynamic(() => import("./CippMap"), { ssr: false }); // Dynamic import for CippMap

export const CippLocationDialog = ({ location }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const markers = [
    {
      position: [location.geoCoordinates.latitude, location.geoCoordinates.longitude],
      popup: `${location.city}, ${location.state}, ${location.countryOrRegion}`,
    },
  ];

  const properties = [
    { label: "City", value: location.city },
    { label: "State", value: location.state },
    { label: "Country/Region", value: location.countryOrRegion },
  ];

  return (
    <>
      <Button size="small" variant="outlined" onClick={handleOpen} startIcon={<LocationOn />}>
        {location.city}, {location.state}, {location.countryOrRegion}
      </Button>
      <Dialog fullWidth maxWidth="sm" onClose={handleClose} open={open}>
        <DialogTitle>Location Details</DialogTitle>
        <DialogContent>
          <CippPropertyList propertyItems={properties} showDivider={false} />
          <CippMap markers={markers} zoom={10} mapSx={{ height: "300px", width: "100%" }} />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
