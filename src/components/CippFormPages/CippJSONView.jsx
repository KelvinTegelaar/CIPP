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
import { ApiPostCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";

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

// Function to check if a string is a GUID
const isGuid = (str) => {
  if (typeof str !== "string") return false;
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return guidRegex.test(str);
};

// Function to recursively scan an object for GUIDs
const findGuids = (obj, guidsSet = new Set()) => {
  if (!obj) return guidsSet;

  if (typeof obj === "string" && isGuid(obj)) {
    guidsSet.add(obj);
  } else if (Array.isArray(obj)) {
    obj.forEach((item) => findGuids(item, guidsSet));
  } else if (typeof obj === "object") {
    Object.values(obj).forEach((value) => findGuids(value, guidsSet));
  }

  return guidsSet;
};

const renderListItems = (data, onItemClick, guidMapping = {}, isLoadingGuids = false) => {
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
  const [drilldownData, setDrilldownData] = useState([]);
  const [guidMapping, setGuidMapping] = useState({});
  const [notFoundGuids, setNotFoundGuids] = useState(new Set());
  const [isLoadingGuids, setIsLoadingGuids] = useState(false);
  const [pendingGuids, setPendingGuids] = useState([]);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const tenantFilter = useSettings().currentTenant;

  // Setup API call for directory objects resolution
  const directoryObjectsMutation = ApiPostCall({
    relatedQueryKeys: ["directoryObjects"],
    onResult: (data) => {
      if (data && Array.isArray(data.value)) {
        const newMapping = {};

        // Process the returned results
        data.value.forEach((item) => {
          if (item.id && (item.displayName || item.userPrincipalName || item.mail)) {
            // Prefer displayName, fallback to UPN or mail if available
            newMapping[item.id] = item.displayName || item.userPrincipalName || item.mail;
          }
        });

        // Find GUIDs that were sent but not returned in the response
        const processedGuids = new Set(pendingGuids);
        const returnedGuids = new Set(data.value.map((item) => item.id));
        const notReturned = [...processedGuids].filter((guid) => !returnedGuids.has(guid));

        // Add them to the notFoundGuids set
        if (notReturned.length > 0) {
          setNotFoundGuids((prev) => {
            const newSet = new Set(prev);
            notReturned.forEach((guid) => newSet.add(guid));
            return newSet;
          });
        }

        setGuidMapping((prevMapping) => ({ ...prevMapping, ...newMapping }));
        setPendingGuids([]);
        setIsLoadingGuids(false);
      }
    },
  });

  // Function to handle resolving GUIDs - used in both useEffect and handleItemClick
  const resolveGuids = (objectToScan) => {
    const guidsSet = findGuids(objectToScan);

    if (guidsSet.size === 0) return;

    const guidsArray = Array.from(guidsSet);
    // Filter out GUIDs that are already resolved or known to not be resolvable
    const notResolvedGuids = guidsArray.filter(
      (guid) => !guidMapping[guid] && !notFoundGuids.has(guid)
    );

    if (notResolvedGuids.length === 0) return;

    // Merge with any pending GUIDs to avoid duplicate requests
    const allPendingGuids = [...new Set([...pendingGuids, ...notResolvedGuids])];
    setPendingGuids(allPendingGuids);
    setIsLoadingGuids(true);

    // Implement throttling - only send a new request every 2 seconds
    const now = Date.now();
    if (now - lastRequestTime < 2000) {
      return;
    }

    setLastRequestTime(now);

    // Only send a maximum of 1000 GUIDs per request
    const batchSize = 1000;
    const guidsToSend = allPendingGuids.slice(0, batchSize);

    if (guidsToSend.length > 0) {
      directoryObjectsMutation.mutate({
        url: "/api/ListDirectoryObjects",
        data: {
          tenantFilter: tenantFilter,
          ids: guidsToSend,
          $select: "id,displayName,userPrincipalName,mail",
        },
      });
    } else {
      setIsLoadingGuids(false);
    }
  };

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
            intuneObj?.options?.find((option) => option.id === rawValue)?.displayName || rawValue;

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
    setDrilldownData([filteredObj]);

    // Using the centralized resolveGuids function to handle GUID resolution
    resolveGuids(cleanedObj);
  }, [object, tenantFilter]);

  // Effect to reprocess any pending GUIDs when the guidMapping changes or throttling window passes
  useEffect(() => {
    if (pendingGuids.length > 0 && !isLoadingGuids) {
      const now = Date.now();
      if (now - lastRequestTime >= 2000) {
        // Only send a maximum of 1000 GUIDs per request
        const batchSize = 1000;
        const guidsToSend = pendingGuids.slice(0, batchSize);

        setLastRequestTime(now);
        setIsLoadingGuids(true);

        directoryObjectsMutation.mutate({
          url: "/api/ListDirectoryObjects",
          data: {
            tenantFilter: tenantFilter,
            ids: guidsToSend,
            $select: "id,displayName,userPrincipalName,mail",
          },
        });
      }
    }
  }, [
    guidMapping,
    notFoundGuids,
    pendingGuids,
    lastRequestTime,
    isLoadingGuids,
    directoryObjectsMutation,
    tenantFilter,
  ]);

  const toggleView = () => setViewJson(!viewJson);

  const handleItemClick = (itemData, level) => {
    const updatedData = drilldownData.slice(0, level + 1);
    updatedData[level + 1] = itemData;
    setDrilldownData(updatedData);

    // Use the centralized resolveGuids function to handle GUID resolution for drill-down data
    resolveGuids(itemData);
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
              ?.filter((data) => data !== null && data !== undefined)
              .map((data, index) => (
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
                  {type !== "intune" && (
                    <PropertyList>
                      {renderListItems(
                        data,
                        (itemData) => handleItemClick(itemData, index),
                        guidMapping,
                        isLoadingGuids
                      )}
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
