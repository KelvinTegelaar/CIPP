import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Grid,
  Typography,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { PropertyListItem } from "../property-list-item";
import { PropertyList } from "../property-list";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { CippCodeBlock } from "../CippComponents/CippCodeBlock";

const cleanObject = (obj) => {
  if (Array.isArray(obj)) {
    return obj
      .map((item) => cleanObject(item))
      .filter((item) => item !== null && item !== undefined && item !== "");
  } else if (typeof obj === "object" && obj !== null) {
    const cleanedObj = {};
    Object.entries(obj).forEach(([key, value]) => {
      const cleanedValue = cleanObject(value);
      if (cleanedValue !== null && cleanedValue !== undefined && cleanedValue !== "") {
        cleanedObj[key] = cleanedValue;
      }
    });
    return Object.keys(cleanedObj).length > 0 ? cleanedObj : null;
  } else {
    return obj;
  }
};

const renderListItems = (data, onItemClick) => {
  return Object.entries(data).map(([key, value]) => {
    if (Array.isArray(value)) {
      return (
        <PropertyListItem
          key={key}
          label={getCippTranslation(key)}
          disabled={value.length === 0}
          value={
            <Button variant="text" onClick={() => onItemClick(value)}>
              {value.length} configured item{value.length > 1 ? "s" : ""}
            </Button>
          }
        />
      );
    } else if (typeof value === "object" && value !== null) {
      return (
        <PropertyListItem
          key={key}
          label={getCippTranslation(key)}
          value={
            <Button variant="text" onClick={() => onItemClick(value)}>
              View Details
            </Button>
          }
        />
      );
    } else {
      return (
        <PropertyListItem
          key={key}
          label={getCippTranslation(key)}
          value={getCippFormatting(value, key)}
        />
      );
    }
  });
};

function CippJsonView({ object = { "No Data Selected": "No Data Selected" } }) {
  const [viewJson, setViewJson] = useState(false);
  const [drilldownData, setDrilldownData] = useState([]);

  useEffect(() => {
    const blacklist = [
      "selectedOption",
      "GUID",
      "ID",
      "id",
      "noSubmitButton",
      "createdDateTime",
      "modifiedDateTime",
    ];
    const cleanedObj = cleanObject(object);
    const filteredObj = Object.fromEntries(
      Object.entries(cleanedObj).filter(([key]) => !blacklist.includes(key))
    );
    setDrilldownData([filteredObj]);
  }, [object]);

  const toggleView = () => setViewJson(!viewJson);

  const handleItemClick = (itemData, level) => {
    const updatedData = drilldownData.slice(0, level + 1);
    updatedData[level + 1] = itemData;
    setDrilldownData(updatedData);
  };

  return (
    <Accordion variant="outlined">
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ display: "flex", alignItems: "center" }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Policy Details
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <IconButton onClick={toggleView} sx={{ ml: 1 }}>
          {viewJson ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
        {viewJson ? (
          <CippCodeBlock type="editor" code={JSON.stringify(cleanObject(object))} />
        ) : (
          <Grid container spacing={2}>
            {drilldownData.slice(0, 4).map((data, index) => (
              <Grid item xs={12} sm={3} key={index}>
                <PropertyList>
                  {renderListItems(data, (itemData) => handleItemClick(itemData, index))}
                </PropertyList>
              </Grid>
            ))}
          </Grid>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default CippJsonView;
