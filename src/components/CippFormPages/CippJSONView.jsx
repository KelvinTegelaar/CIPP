import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Typography,
  Button,
  Tooltip,
  CircularProgress,
  Stack,
} from "@mui/material";
import { Grid } from "@mui/system";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { PropertyListItem } from "../property-list-item";
import { PropertyList } from "../property-list";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { CippCodeBlock } from "../CippComponents/CippCodeBlock";
import intuneCollection from "/src/data/intuneCollection.json";
import { useGuidResolver } from "../../hooks/use-guid-resolver";

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

const renderListItems = (data, onItemClick, guidMapping = {}, isLoadingGuids = false, isGuid) => {
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
    } else if (typeof value === "string" && isGuid(value) && guidMapping[value]) {
      return (
        <PropertyListItem
          key={key}
          label={getCippTranslation(key)}
          value={
            <Tooltip title={`GUID: ${value}`} placement="top">
              <div>{guidMapping[value]}</div>
            </Tooltip>
          }
        />
      );
    } else if (typeof value === "string" && isGuid(value) && isLoadingGuids) {
      return (
        <PropertyListItem
          key={key}
          label={getCippTranslation(key)}
          value={
            <div style={{ display: "flex", alignItems: "center" }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <span>{getCippFormatting(value, key)}</span>
            </div>
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

function CippJsonView({
  object = { "No Data Selected": "No Data Selected" },
  type,
  defaultOpen = false,
}) {
  const [viewJson, setViewJson] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(defaultOpen);
  const [drilldownData, setDrilldownData] = useState([]); // Array of { data, title }

  // Use the GUID resolver hook
  const { guidMapping, isLoadingGuids, resolveGuids, isGuid } = useGuidResolver();

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
        // Check if value is a GUID that we've resolved
        const value =
          typeof omaSetting.value === "string" &&
          isGuid(omaSetting.value) &&
          guidMapping[omaSetting.value] ? (
            <Tooltip title={`GUID: ${omaSetting.value}`} placement="top">
              <div>
                {guidMapping[omaSetting.value]}
                <Typography
                  variant="caption"
                  sx={{ fontStyle: "italic", ml: 1, color: "text.secondary" }}
                >
                  (GUID)
                </Typography>
              </div>
            </Tooltip>
          ) : (
            omaSetting.value
          );

        items.push(
          <PropertyListItem
            key={`omaSetting-${index}`}
            label={`${omaSetting.displayName} (${omaSetting.omaUri})`}
            value={value}
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
                    (Array.isArray(childIntuneObj?.options) &&
                      childIntuneObj.options.find(
                        (option) => option.id === child.choiceSettingValue.value
                      )?.displayName) ||
                    child.choiceSettingValue.value;
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
          // Check if value is a GUID that we've resolved
          const displayValue =
            typeof value === "string" && isGuid(value) && guidMapping[value] ? (
              <Tooltip title={`GUID: ${value}`} placement="top">
                <div>
                  {guidMapping[value]}
                  <Typography
                    variant="caption"
                    sx={{ fontStyle: "italic", ml: 1, color: "text.secondary" }}
                  >
                    (GUID)
                  </Typography>
                </div>
              </Tooltip>
            ) : (
              value
            );

          items.push(
            <PropertyListItem key={`setting-${index}`} label={label} value={displayValue} />
          );
        } else if (settingInstance?.choiceSettingValue?.value) {
          const label = intuneObj?.displayName || settingInstance.settingDefinitionId;
          const rawValue = settingInstance.choiceSettingValue.value;
          let optionValue =
            (Array.isArray(intuneObj?.options) &&
              intuneObj.options.find((option) => option.id === rawValue)?.displayName) ||
            rawValue;

          // Check if optionValue is a GUID that we've resolved
          if (typeof optionValue === "string" && isGuid(optionValue) && guidMapping[optionValue]) {
            optionValue = (
              <Tooltip title={`GUID: ${optionValue}`} placement="top">
                <div>
                  {guidMapping[optionValue]}
                  <Typography
                    variant="caption"
                    sx={{ fontStyle: "italic", ml: 1, color: "text.secondary" }}
                  >
                    (GUID)
                  </Typography>
                </div>
              </Tooltip>
            );
          }

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
        // Check if value is a GUID that we've resolved
        if (typeof value === "string" && isGuid(value) && guidMapping[value]) {
          items.push(
            <PropertyListItem
              key={key}
              label={getCippTranslation(key)}
              value={
                <Tooltip title={`GUID: ${value}`} placement="top">
                  <div>
                    {guidMapping[value]}
                    <Typography
                      variant="caption"
                      sx={{ fontStyle: "italic", ml: 1, color: "text.secondary" }}
                    >
                      (GUID)
                    </Typography>
                  </div>
                </Tooltip>
              }
            />
          );
        } else if (typeof value === "string" && isGuid(value) && isLoadingGuids) {
          items.push(
            <PropertyListItem
              key={key}
              label={getCippTranslation(key)}
              value={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <span>{getCippFormatting(value, key)}</span>
                </div>
              }
            />
          );
        } else {
          items.push(
            <PropertyListItem
              key={key}
              label={getCippTranslation(key)}
              value={getCippFormatting(value, key)}
            />
          );
        }
      });
    }

    return items;
  };

  useEffect(() => {
    if (!type && (object?.omaSettings || object?.settings || object?.added)) {
      type = "intune";
    }
    const blacklist = [
      "selectedOption",
      "GUID",
      "ID",
      "id",
      "noSubmitButton",
      "createdDateTime",
      "modifiedDateTime",
    ];
    const cleanedObj = cleanObject(object) || {};
    const filteredObj = Object.fromEntries(
      Object.entries(cleanedObj).filter(([key]) => !blacklist.includes(key))
    );
    setDrilldownData([{ data: filteredObj, title: null }]);

    // Using the resolveGuids function from the hook to handle GUID resolution
    resolveGuids(cleanedObj);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object]);

  const toggleView = () => setViewJson(!viewJson);

  const handleItemClick = (itemData, level) => {
    const updatedData = drilldownData.slice(0, level + 1);
    
    // Compress single-property objects and single-item arrays into the same pane
    let dataToAdd = itemData;
    const compressedKeys = [];
    let wasCompressed = false;
    
    while (dataToAdd && typeof dataToAdd === "object") {
      // Handle single-item arrays
      if (Array.isArray(dataToAdd) && dataToAdd.length === 1) {
        const singleItem = dataToAdd[0];
        if (singleItem && typeof singleItem === "object") {
          compressedKeys.push("[0]");
          dataToAdd = singleItem;
          wasCompressed = true;
          continue;
        } else {
          break;
        }
      }
      
      // Handle single-property objects
      if (!Array.isArray(dataToAdd) && Object.keys(dataToAdd).length === 1) {
        const singleKey = Object.keys(dataToAdd)[0];
        const singleValue = dataToAdd[singleKey];
        
        // Only compress if the value is also an object or single-item array
        if (singleValue && typeof singleValue === "object") {
          compressedKeys.push(singleKey);
          dataToAdd = singleValue;
          wasCompressed = true;
          continue;
        }
      }
      
      break;
    }
    
    // Create title from compressed keys if compression occurred
    const title = wasCompressed ? compressedKeys.join(" > ") : null;
    
    updatedData[level + 1] = { data: dataToAdd, title };
    setDrilldownData(updatedData);

    // Use the resolveGuids function from the hook to handle GUID resolution for drill-down data
    resolveGuids(dataToAdd);
  };

  return (
    <Accordion
      variant="outlined"
      expanded={accordionOpen}
      onChange={() => setAccordionOpen(!accordionOpen)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ display: "flex", alignItems: "center" }}
      >
        <Stack direction="row" spacing={1} alignItems="space-between" sx={{ width: "100%" }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Policy Details
          </Typography>
          {isLoadingGuids && (
            <Typography variant="caption" sx={{ display: "flex", alignItems: "center" }}>
              <CircularProgress size={16} sx={{ mr: 1 }} /> Resolving object identifiers...
            </Typography>
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <IconButton onClick={toggleView} sx={{ ml: 1 }}>
          {viewJson ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
        {viewJson ? (
          <CippCodeBlock type="editor" code={JSON.stringify(cleanObject(object), null, 2)} />
        ) : (
          <Grid container spacing={2}>
            {drilldownData
              ?.filter((item) => item !== null && item !== undefined)
              .map((item, index) => (
                <Grid
                  size={{ sm: type === "intune" ? 12 : 3, xs: 12 }}
                  key={index}
                  sx={{
                    //give a top border if the item is > 4, and add spacing between the top and bottom items
                    paddingTop: index === 0 ? 0 : 2,
                    borderTop: index >= 4 && type !== "intune" ? "1px solid lightgrey" : "none",
                    borderRight: index < drilldownData.length - 1 ? "1px solid lightgrey" : "none",
                    overflowWrap: "anywhere",
                    whiteSpace: "pre-line",
                    paddingRight: 2,
                  }}
                >
                  {item.title && (
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                      {getCippTranslation(item.title)}
                    </Typography>
                  )}
                  {type !== "intune" && (
                    <PropertyList>
                      {renderListItems(
                        item.data,
                        (itemData) => handleItemClick(itemData, index),
                        guidMapping,
                        isLoadingGuids,
                        isGuid
                      )}
                    </PropertyList>
                  )}
                  {type === "intune" && <PropertyList>{renderIntuneItems(item.data)}</PropertyList>}
                </Grid>
              ))}
          </Grid>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default CippJsonView;
