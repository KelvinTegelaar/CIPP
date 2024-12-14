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
    const policyNameKey = ["Name", "DisplayName", "displayName", "name"].find((key) => key in data);
    if (policyNameKey) {
      items.push(
        <PropertyListItem key="policyName" label="Policy Name" value={data[policyNameKey]} />
      );
    }

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
      data.settings.forEach((setting, index) => {
        const settingInstance = setting.settingInstance;
        const intuneObj = intuneCollection.find(
          (item) => item.id === settingInstance.settingDefinitionId
        );

        // Handle groupSettingCollectionInstance
        if (
          settingInstance["@odata.type"] ===
            "#microsoft.graph.deviceManagementConfigurationGroupSettingCollectionInstance" &&
          settingInstance.groupSettingCollectionValue
        ) {
          settingInstance.groupSettingCollectionValue.forEach((groupValue, gIndex) => {
            if (groupValue.children && Array.isArray(groupValue.children)) {
              groupValue.children.forEach((child, cIndex) => {
                const childIntuneObj = intuneCollection.find(
                  (item) => item.id === child.settingDefinitionId
                );
                const label = childIntuneObj?.displayName || child.settingDefinitionId;
                let value;
                if (child.choiceSettingValue && child.choiceSettingValue.value) {
                  value =
                    childIntuneObj?.options?.find(
                      (option) => option.id === child.choiceSettingValue.value
                    )?.displayName || child.choiceSettingValue.value;
                }
                items.push(
                  <PropertyListItem
                    key={`setting-${index}-group-${gIndex}-child-${cIndex}`}
                    label={label}
                    value={value}
                  />
                );
              });
            }
          });
        } else if (settingInstance?.simpleSettingValue?.value) {
          const label = intuneObj?.displayName || settingInstance.settingDefinitionId;
          const value = settingInstance.simpleSettingValue.value;
          items.push(<PropertyListItem key={`setting-${index}`} label={label} value={value} />);
        } else if (settingInstance?.choiceSettingValue?.value) {
          const label = intuneObj?.displayName || settingInstance.settingDefinitionId;
          const optionValue =
            intuneObj?.options?.find(
              (option) => option.id === settingInstance.choiceSettingValue.value
            )?.displayName || settingInstance.choiceSettingValue.value;
          items.push(
            <PropertyListItem key={`setting-${index}`} label={label} value={optionValue} />
          );
        } else {
          const label = intuneObj?.displayName || settingInstance.settingDefinitionId;
          items.push(
            <PropertyListItem
              key={`setting-${index}`}
              label={label}
              value="This setting could not be resolved"
            />
          );
        }
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
