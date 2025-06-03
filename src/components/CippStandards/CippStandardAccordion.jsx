import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Stack,
  Avatar,
  Box,
  Typography,
  IconButton,
  SvgIcon,
  Collapse,
  Divider,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  ButtonGroup,
  Button,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Delete,
  Add,
  Public,
  Search,
  Close,
  FilterAlt,
  NotificationImportant,
  Assignment,
  Construction,
} from "@mui/icons-material";
import { Grid } from "@mui/system";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useWatch } from "react-hook-form";
import _ from "lodash";
import Microsoft from "../../icons/iconly/bulk/microsoft";
import Azure from "../../icons/iconly/bulk/azure";
import Exchange from "../../icons/iconly/bulk/exchange";
import Defender from "../../icons/iconly/bulk/defender";
import Intune from "../../icons/iconly/bulk/intune";
import GDAPRoles from "/src/data/GDAPRoles";
import timezoneList from "/src/data/timezoneList";
import standards from "/src/data/standards.json";
import { CippFormCondition } from "../CippComponents/CippFormCondition";

const getAvailableActions = (disabledFeatures) => {
  const allActions = [
    { label: "Report", value: "Report" },
    { label: "Alert", value: "warn" },
    { label: "Remediate", value: "Remediate" },
  ];
  return allActions.filter((action) => !disabledFeatures?.[action.value.toLowerCase()]);
};

const CippAddedComponent = React.memo(({ standardName, component, formControl }) => {
  const updatedComponent = { ...component };

  if (component.type === "AdminRolesMultiSelect") {
    updatedComponent.type = "autoComplete";
    updatedComponent.options = GDAPRoles.map((role) => ({
      label: role.Name,
      value: role.ObjectId,
    }));
  } else if (component.type === "TimezoneSelect") {
    updatedComponent.type = "autoComplete";
    updatedComponent.options = timezoneList.map((tz) => ({
      label: tz.timezone,
      value: tz.timezone,
    }));
    updatedComponent.multiple = false;
  } else {
    updatedComponent.type = component.type;
  }

  return (
    <Grid size={12}>
      <CippFormComponent
        type={updatedComponent.type}
        label={updatedComponent.label}
        formControl={formControl}
        {...updatedComponent}
        name={`${standardName}.${updatedComponent.name}`}
      />
    </Grid>
  );
});
CippAddedComponent.displayName = "CippAddedComponent";

const CippStandardAccordion = ({
  standards: providedStandards,
  selectedStandards,
  expanded,
  handleAccordionToggle,
  handleRemoveStandard,
  handleAddMultipleStandard,
  formControl,
}) => {
  const [configuredState, setConfiguredState] = useState({});
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedValues, setSavedValues] = useState({});
  const [originalValues, setOriginalValues] = useState({});

  const watchedValues = useWatch({
    control: formControl.control,
  });

  // Check if a standard is configured based on its values
  const isStandardConfigured = (standardName, standard, values) => {
    if (!values) return false;

    // ALWAYS require an action for any standard to be considered configured
    // The action field should be an array with at least one element
    const actionValue = _.get(values, "action");
    if (!actionValue || (Array.isArray(actionValue) && actionValue.length === 0)) return false;

    // Additional checks for required components
    const hasRequiredComponents =
      standard.addedComponent &&
      standard.addedComponent.some((comp) => comp.type !== "switch" && comp.required !== false);
    const actionRequired = standard.disabledFeatures !== undefined || hasRequiredComponents;

    // Always require an action (should be an array with at least one element)
    const actionFilled = actionValue && (!Array.isArray(actionValue) || actionValue.length > 0);

    const addedComponentsFilled =
      standard.addedComponent?.every((component) => {
        // Always skip switches
        if (component.type === "switch") return true;

        // Handle conditional fields
        if (component.condition) {
          const conditionField = component.condition.field;
          const conditionValue = _.get(values, conditionField);
          const compareType = component.condition.compareType || "is";
          const compareValue = component.condition.compareValue;
          const propertyName = component.condition.propertyName || "value";

          let conditionMet = false;
          if (propertyName === "value") {
            switch (compareType) {
              case "is":
                conditionMet = _.isEqual(conditionValue, compareValue);
                break;
              case "isNot":
                conditionMet = !_.isEqual(conditionValue, compareValue);
                break;
              default:
                conditionMet = false;
            }
          } else if (Array.isArray(conditionValue)) {
            switch (compareType) {
              case "valueEq":
                conditionMet = conditionValue.some((item) => item?.[propertyName] === compareValue);
                break;
              default:
                conditionMet = false;
            }
          }

          // If condition is not met, skip validation for this field
          if (!conditionMet) return true;
        }

        // Check if field is required
        const isRequired = component.required !== false;
        if (!isRequired) return true;

        // Get field value using lodash's get to properly handle nested properties
        const fieldValue = _.get(values, component.name);

        // Check if field has a value based on its type and multiple property
        if (component.type === "autoComplete" || component.type === "select") {
          if (component.multiple) {
            // For multiple selection, check if array exists and has items
            return Array.isArray(fieldValue) && fieldValue.length > 0;
          } else {
            // For single selection, check if value exists
            return !!fieldValue;
          }
        }

        // For other field types
        return !!fieldValue;
      }) ?? true;

    return actionFilled && addedComponentsFilled;
  };

  // Initialize when watchedValues are available
  useEffect(() => {
    // Only run initialization if we have watchedValues and they contain data
    if (!watchedValues || Object.keys(watchedValues).length === 0) {
      return;
    }

    // Prevent re-initialization if we already have configuration state
    const hasConfigState = Object.keys(configuredState).length > 0;
    if (hasConfigState) {
      return;
    }

    console.log("Initializing configuration state from template values");
    const initial = {};
    const initialConfigured = {};

    // For each standard, get its current values and determine if it's configured
    Object.keys(selectedStandards).forEach((standardName) => {
      const currentValues = _.get(watchedValues, standardName);
      if (!currentValues) return;

      initial[standardName] = _.cloneDeep(currentValues);

      const baseStandardName = standardName.split("[")[0];
      const standard = providedStandards.find((s) => s.name === baseStandardName);
      if (standard) {
        initialConfigured[standardName] = isStandardConfigured(
          standardName,
          standard,
          currentValues
        );
      }
    });

    // Store both the initial values and set them as current saved values
    setOriginalValues(initial);
    setSavedValues(initial);
    setConfiguredState(initialConfigured);
    // Only depend on watchedValues and selectedStandards to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValues, selectedStandards]);

  // Save changes for a standard
  const handleSave = (standardName, standard, current) => {
    // Clone the current values to avoid reference issues
    const newValues = _.cloneDeep(current);

    // Update saved values
    setSavedValues((prev) => ({
      ...prev,
      [standardName]: newValues,
    }));

    // Update configured state right away
    const isConfigured = isStandardConfigured(standardName, standard, newValues);
    console.log(`Saving standard ${standardName}, configured: ${isConfigured}`);

    setConfiguredState((prev) => ({
      ...prev,
      [standardName]: isConfigured,
    }));

    // Collapse the accordion after saving
    handleAccordionToggle(null);
  };

  // Cancel changes for a standard
  const handleCancel = (standardName) => {
    // Get the last saved values
    const savedValue = _.get(savedValues, standardName);
    if (!savedValue) return;

    // Set the entire standard's value at once to ensure proper handling of nested objects and arrays
    formControl.setValue(standardName, _.cloneDeep(savedValue));

    // Find the original standard definition to get the base standard
    const baseStandardName = standardName.split("[")[0];
    const standard = providedStandards.find((s) => s.name === baseStandardName);

    // Determine if the standard was configured with saved values
    if (standard) {
      const isConfigured = isStandardConfigured(standardName, standard, savedValue);

      // Restore the previous configuration state
      setConfiguredState((prev) => ({
        ...prev,
        [standardName]: isConfigured,
      }));
    }

    // Collapse the accordion after canceling
    handleAccordionToggle(null);
  };

  // Group standards by category
  const groupedStandards = useMemo(() => {
    const result = {};

    Object.keys(selectedStandards).forEach((standardName) => {
      const baseStandardName = standardName.split("[")[0];
      const standard = providedStandards.find((s) => s.name === baseStandardName);
      if (!standard) return;

      const standardInfo = standards.find((s) => s.name === baseStandardName);
      const category = standardInfo?.cat || "Other Standards";

      if (!result[category]) {
        result[category] = [];
      }

      result[category].push({
        standardName,
        standard,
      });
    });

    Object.keys(result).forEach((category) => {
      result[category].sort((a, b) => a.standard.label.localeCompare(b.standard.label));
    });

    return result;
  }, [selectedStandards, providedStandards]);

  // Filter standards based on search and filter selection
  const filteredGroupedStandards = useMemo(() => {
    if (!searchQuery && filter === "all") {
      return groupedStandards;
    }

    const result = {};
    const searchLower = searchQuery.toLowerCase();

    Object.keys(groupedStandards).forEach((category) => {
      const categoryMatchesSearch = !searchQuery || category.toLowerCase().includes(searchLower);

      const filteredStandards = groupedStandards[category].filter(({ standardName, standard }) => {
        // If this is the currently expanded standard, always include it in the result
        if (standardName === expanded) {
          return true;
        }

        const matchesSearch =
          !searchQuery ||
          categoryMatchesSearch ||
          standard.label.toLowerCase().includes(searchLower) ||
          (standard.helpText && standard.helpText.toLowerCase().includes(searchLower)) ||
          (standard.cat && standard.cat.toLowerCase().includes(searchLower)) ||
          (standard.tag &&
            Array.isArray(standard.tag) &&
            standard.tag.some((tag) => tag.toLowerCase().includes(searchLower)));

        const isConfigured = _.get(configuredState, standardName);
        const matchesFilter =
          filter === "all" ||
          (filter === "configured" && isConfigured) ||
          (filter === "unconfigured" && !isConfigured);

        return matchesSearch && matchesFilter;
      });

      if (filteredStandards.length > 0) {
        result[category] = filteredStandards;
      }
    });

    return result;
  }, [groupedStandards, searchQuery, filter, configuredState]);

  // Count standards by configuration state
  const standardCounts = useMemo(() => {
    let allCount = 0;
    let configuredCount = 0;
    let unconfiguredCount = 0;

    Object.keys(groupedStandards).forEach((category) => {
      groupedStandards[category].forEach(({ standardName }) => {
        allCount++;
        if (configuredState[standardName]) {
          configuredCount++;
        } else {
          unconfiguredCount++;
        }
      });
    });

    return { allCount, configuredCount, unconfiguredCount };
  }, [groupedStandards, configuredState]);

  const hasFilteredStandards = Object.keys(filteredGroupedStandards).length > 0;

  return (
    <>
      {Object.keys(selectedStandards).length > 0 && (
        <>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              mt: 2,
              mb: 3,
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
              <TextField
                size="small"
                variant="filled"
                fullWidth={{ xs: true, sm: false }}
                sx={{ width: { xs: "100%", sm: 350 } }}
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  // Close any expanded accordion when changing search query
                  if (expanded && e.target.value !== searchQuery) {
                    handleAccordionToggle(null);
                  }
                  setSearchQuery(e.target.value);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start" sx={{ margin: "0 !important" }}>
                        <Search />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <Tooltip title="Clear search">
                          <IconButton
                            size="small"
                            onClick={() => {
                              // Close any expanded accordion when clearing search
                              if (expanded) {
                                handleAccordionToggle(null);
                              }
                              setSearchQuery("");
                            }}
                            aria-label="Clear search"
                          >
                            <Close />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>
            <ButtonGroup variant="outlined" color="primary" size="small">
              <Button disabled={true} color="primary">
                <SvgIcon fontSize="small">
                  <FilterAlt />
                </SvgIcon>
              </Button>
              <Button
                variant={filter === "all" ? "contained" : "outlined"}
                onClick={() => {
                  // Close any expanded accordion when changing filters
                  if (expanded) {
                    handleAccordionToggle(null);
                  }
                  setFilter("all");
                }}
              >
                All ({standardCounts.allCount})
              </Button>
              <Button
                variant={filter === "configured" ? "contained" : "outlined"}
                onClick={() => {
                  // Close any expanded accordion when changing filters
                  if (expanded) {
                    handleAccordionToggle(null);
                  }
                  setFilter("configured");
                }}
              >
                Configured ({standardCounts.configuredCount})
              </Button>
              <Button
                variant={filter === "unconfigured" ? "contained" : "outlined"}
                onClick={() => {
                  // Close any expanded accordion when changing filters
                  if (expanded) {
                    handleAccordionToggle(null);
                  }
                  setFilter("unconfigured");
                }}
              >
                Unconfigured ({standardCounts.unconfiguredCount})
              </Button>
            </ButtonGroup>
          </Stack>

          {!hasFilteredStandards && (
            <Box sx={{ textAlign: "center", my: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No standards match the selected filter criteria or search query.
              </Typography>
            </Box>
          )}
        </>
      )}

      {Object.keys(filteredGroupedStandards).map((category) => (
        <React.Fragment key={category}>
          <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
            {category}
          </Typography>

          {filteredGroupedStandards[category].map(({ standardName, standard }) => {
            const isExpanded = expanded === standardName;
            const hasAddedComponents =
              standard.addedComponent && standard.addedComponent.length > 0;
            const isConfigured = _.get(configuredState, standardName);
            const disabledFeatures = standard.disabledFeatures || {};

            let selectedActions = _.get(watchedValues, `${standardName}.action`);
            if (selectedActions && !Array.isArray(selectedActions)) {
              selectedActions = [selectedActions];
            }

            const selectedTemplateName = standard.multiple
              ? _.get(watchedValues, `${standardName}.${standard.addedComponent?.[0]?.name}`)
              : "";
            const accordionTitle =
              selectedTemplateName && _.get(selectedTemplateName, "label")
                ? `${standard.label} - ${_.get(selectedTemplateName, "label")}`
                : standard.label;

            // Get current values and check if they differ from saved values
            const current = _.get(watchedValues, standardName);
            const saved = _.get(savedValues, standardName) || {};
            const hasUnsaved = !_.isEqual(current, saved);

            // Check if all required fields are filled
            const requiredFieldsFilled = current
              ? standard.addedComponent?.every((component) => {
                  // Always skip switches regardless of their required property
                  if (component.type === "switch") return true;

                  // Skip optional fields (not required)
                  const isRequired = component.required !== false;
                  if (!isRequired) return true;

                  // Handle conditional fields
                  if (component.condition) {
                    const conditionField = component.condition.field;
                    const conditionValue = _.get(current, conditionField);
                    const compareType = component.condition.compareType || "is";
                    const compareValue = component.condition.compareValue;
                    const propertyName = component.condition.propertyName || "value";

                    let conditionMet = false;
                    if (propertyName === "value") {
                      switch (compareType) {
                        case "is":
                          conditionMet = _.isEqual(conditionValue, compareValue);
                          break;
                        case "isNot":
                          conditionMet = !_.isEqual(conditionValue, compareValue);
                          break;
                        default:
                          conditionMet = false;
                      }
                    } else if (Array.isArray(conditionValue)) {
                      switch (compareType) {
                        case "valueEq":
                          conditionMet = conditionValue.some(
                            (item) => item?.[propertyName] === compareValue
                          );
                          break;
                        default:
                          conditionMet = false;
                      }
                    }

                    // If condition is not met, skip validation
                    if (!conditionMet) return true;
                  }

                  // Get field value for validation using lodash's get to properly handle nested properties
                  const fieldValue = _.get(current, component.name);
                  console.log(`Checking field: ${component.name}, value:`, fieldValue);
                  console.log(current);
                  // Check if required field has a value based on its type and multiple property
                  if (component.type === "autoComplete" || component.type === "select") {
                    if (component.multiple) {
                      // For multiple selection, check if array exists and has items
                      return Array.isArray(fieldValue) && fieldValue.length > 0;
                    } else {
                      // For single selection, check if value exists
                      return !!fieldValue;
                    }
                  }

                  // For other field types
                  return !!fieldValue;
                }) ?? true
              : false;

            // ALWAYS require an action for all standards
            const actionRequired = true;

            // Check if there are required non-switch components for UI display purposes
            const hasRequiredComponents =
              standard.addedComponent &&
              standard.addedComponent.some(
                (comp) => comp.type !== "switch" && comp.required !== false
              );

            // Action is always required and must be an array with at least one element
            const actionValue = _.get(current, "action");
            const hasAction =
              actionValue && (!Array.isArray(actionValue) || actionValue.length > 0);

            // Allow saving if:
            // 1. Action is selected if required
            // 2. All required fields are filled
            // 3. There are unsaved changes
            const canSave = hasAction && requiredFieldsFilled && hasUnsaved;

            console.log(
              `Standard: ${standardName}, Action Required: ${actionRequired}, Has Action: ${hasAction}, Required Fields Filled: ${requiredFieldsFilled}, Can Save: ${canSave}`
            );

            return (
              <Card key={standardName} sx={{ mb: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ p: 3 }}
                >
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Avatar>
                      {standard.cat === "Global Standards" ? (
                        <Public />
                      ) : standard.cat === "Entra (AAD) Standards" ? (
                        <Azure />
                      ) : standard.cat === "Exchange Standards" ? (
                        <Exchange />
                      ) : standard.cat === "Defender Standards" ? (
                        <Defender />
                      ) : standard.cat === "Intune Standards" ? (
                        <Intune />
                      ) : (
                        <Microsoft />
                      )}
                    </Avatar>
                    <Stack>
                      <Typography variant="h6">{accordionTitle}</Typography>
                      <Stack direction="row" spacing={1} sx={{ my: 0.5 }}>
                        {selectedActions && selectedActions?.length > 0 && (
                          <>
                            {selectedActions?.map((action, index) => (
                              <React.Fragment key={index}>
                                <Chip
                                  label={action.label}
                                  color="primary"
                                  variant="outlined"
                                  size="small"
                                  sx={{ mr: 1 }}
                                  icon={
                                    <SvgIcon>
                                      {action.value === "Report" && <Assignment />}
                                      {action.value === "warn" && <NotificationImportant />}
                                      {action.value === "Remediate" && <Construction />}
                                    </SvgIcon>
                                  }
                                />
                              </React.Fragment>
                            ))}
                          </>
                        )}
                        <Chip
                          label={standard?.impact}
                          color={standard?.impact === "High Impact" ? "error" : "info"}
                          variant="outlined"
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      </Stack>
                      <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                        {standard.helpText}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {standard.multiple && (
                      <Tooltip title={`Add another ${standard.label}`}>
                        <IconButton onClick={() => handleAddMultipleStandard(standardName)}>
                          <SvgIcon component={Add} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Box
                      sx={{
                        backgroundColor: isConfigured ? "success.main" : "warning.main",
                        borderRadius: "50%",
                        width: 8,
                        height: 8,
                      }}
                    />
                    <Typography variant="body2">
                      {isConfigured ? "Configured" : "Unconfigured"}
                    </Typography>
                    <Tooltip title="Remove Standard">
                      <IconButton color="error" onClick={() => handleRemoveStandard(standardName)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>

                    <IconButton onClick={() => handleAccordionToggle(standardName)}>
                      <SvgIcon
                        component={ExpandMoreIcon}
                        sx={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}
                      />
                    </IconButton>
                  </Stack>
                </Stack>

                <Collapse in={isExpanded} unmountOnExit>
                  <Divider />
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      {/* Always show action field as it's required */}
                      <Grid size={4}>
                        <CippFormComponent
                          type="autoComplete"
                          name={`${standardName}.action`}
                          formControl={formControl}
                          label="Action"
                          options={getAvailableActions(disabledFeatures)}
                          multiple={true}
                          fullWidth
                        />
                      </Grid>

                      {hasAddedComponents && (
                        <Grid size={8}>
                          <Grid container spacing={2}>
                            {standard.addedComponent?.map((component, idx) =>
                              component?.condition ? (
                                <CippFormCondition
                                  key={idx}
                                  formControl={formControl}
                                  field={`${standardName}.${component.condition.field}`}
                                  compareType={component.condition.compareType}
                                  compareValue={component.condition.compareValue}
                                  propertyName={component.condition.propertyName || "value"}
                                  action={component.condition.action || "hide"}
                                >
                                  <CippAddedComponent
                                    standardName={standardName}
                                    component={component}
                                    formControl={formControl}
                                  />
                                </CippFormCondition>
                              ) : (
                                <CippAddedComponent
                                  key={idx}
                                  standardName={standardName}
                                  component={component}
                                  formControl={formControl}
                                />
                              )
                            )}
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                  <Divider sx={{ mt: 2 }} />
                  <Box sx={{ px: 3 , py: 2 }}>
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <Button
                        variant="outlined"
                        color="primary"
                        disabled={!hasUnsaved}
                        onClick={() => handleCancel(standardName)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={!canSave}
                        onClick={() => handleSave(standardName, standard, current)}
                      >
                        Save
                      </Button>
                    </Stack>
                  </Box>
                </Collapse>
              </Card>
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
};

export default CippStandardAccordion;
