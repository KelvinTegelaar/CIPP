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
import intuneCollection from "/src/data/intuneCollection.json";
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
              {value.length} item{value.length > 1 ? "s" : ""}
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

function CippJsonView({ object = { "No Data Selected": "No Data Selected" }, type }) {
  const [viewJson, setViewJson] = useState(false);
  const [drilldownData, setDrilldownData] = useState([]);
  const renderIntuneItems = (data) => {
    const items = [];

    // The first propertylistItem should always be the policy name
    const policyNameKey = ["Name", "DisplayName", "displayName", "name"].find((key) => key in data);
    if (policyNameKey) {
      items.push(
        <PropertyListItem key="policyName" label="Policy Name" value={data[policyNameKey]} />
      );
    }

    // Generate items based on the type of policy
    if (data.omaSettings) {
      data.omaSettings.forEach((omaSetting, index) => {
        items.push(
          <PropertyListItem
            key={`omaSetting-${index}`}
            label={`${omaSetting.displayName} (${omaSetting.omaUri})`}
            value={omaSetting.value}
          />
        );
      });
    } else if (data.settings) {
      //use setting.settingInstance.settingDefinitionId to get the label from the intuneCollection. the name should match the id property in the intuneCollection. The displayName is the label

      data.settings.forEach((setting, index) => {
        const intuneObj = intuneCollection.find(
          (item) => item.id === setting.settingInstance.settingDefinitionId
        );
        console.log(setting.settingInstance);
        const label = intuneObj?.displayName || setting.settingInstance.settingDefinitionId;
        const value = setting.settingInstance?.simpleSettingValue?.value
          ? setting.settingInstance?.simpleSettingValue?.value
          : intuneObj?.options?.find(
              (option) => option.id === setting.settingInstance.choiceSettingValue?.value
            )?.displayName;
        items.push(<PropertyListItem key={`setting-${index}`} label={label} value={value} />);
      });
    } else if (data.added) {
      items.push(
        <PropertyListItem
          key="legacyPolicy"
          label="Legacy Policy"
          value="This is a legacy policy and the settings can only be shown in JSON format. Press the eye icon to view the JSON."
        />
      );
    } else {
      Object.entries(data).forEach(([key, value]) => {
        items.push(
          <PropertyListItem
            key={key}
            label={getCippTranslation(key)}
            value={getCippFormatting(value, key)}
          />
        );
      });
    }

    return items;
  };
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
              <Grid
                item
                xs={12}
                sm={type === "intune" ? 12 : 3}
                key={index}
                sx={{
                  borderRight: index < 3 && type !== "intune" ? "1px solid lightgrey" : "none",
                  overflowWrap: "anywhere",
                  whiteSpace: "pre-line",
                  paddingRight: 2,
                }}
              >
                {type !== "intune" && (
                  <PropertyList>
                    {renderListItems(data, (itemData) => handleItemClick(itemData, index))}
                  </PropertyList>
                )}
                {type === "intune" && <PropertyList>{renderIntuneItems(data)}</PropertyList>}
              </Grid>
            ))}
          </Grid>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default CippJsonView;
