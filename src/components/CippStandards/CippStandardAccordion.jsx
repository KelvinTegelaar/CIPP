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
  Grid,
  Tooltip,
  Chip,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon, Delete, Add, Public } from "@mui/icons-material";
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
    <Grid item xs={12}>
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
  standards,
  selectedStandards,
  expanded,
  handleAccordionToggle,
  handleRemoveStandard,
  handleAddMultipleStandard,
  formControl,
}) => {
  const [configuredState, setConfiguredState] = useState({});

  const watchedValues = useWatch({
    control: formControl.control,
  });

  useEffect(() => {
    const newConfiguredState = { ...configuredState };

    Object.keys(selectedStandards).forEach((standardName) => {
      const standard = standards.find((s) => s.name === standardName.split("[")[0]);
      if (standard) {
        const actionFilled = !!_.get(watchedValues, `${standardName}.action`, false);

        const addedComponentsFilled =
          standard.addedComponent?.every((component) => {
            const isRequired = component.required !== false && component.type !== "switch";
            if (!isRequired) return true;
            return !!_.get(watchedValues, `${standardName}.${component.name}`);
          }) ?? true;

        const isConfigured = actionFilled && addedComponentsFilled;

        // Only update state if there's a change to reduce unnecessary re-renders.
        if (newConfiguredState[standardName] !== isConfigured) {
          newConfiguredState[standardName] = isConfigured;
        }
      }
    });

    if (!_.isEqual(newConfiguredState, configuredState)) {
      setConfiguredState(newConfiguredState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValues, standards, selectedStandards]);

  return Object.keys(selectedStandards)?.map((standardName) => {
    const standard = standards.find((s) => s.name === standardName.split("[")[0]);
    if (!standard) return null;

    const isExpanded = expanded === standardName;
    const hasAddedComponents = standard.addedComponent && standard.addedComponent.length > 0;
    const isConfigured = configuredState[standardName];
    const disabledFeatures = standard.disabledFeatures || {};

    let selectedActions = _.get(watchedValues, `${standardName}.action`);
    //if selectedActions is not an array, convert it to an array
    if (selectedActions && !Array.isArray(selectedActions)) {
      selectedActions = [selectedActions];
    }

    const selectedTemplateName = standard.multiple
      ? _.get(watchedValues, `${standardName}.${standard.addedComponent?.[0]?.name}`)
      : "";
    const accordionTitle = selectedTemplateName
      ? `${standard.label} - ${selectedTemplateName.label}`
      : standard.label;

    return (
      <Card key={standardName} sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 3 }}>
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
              {selectedActions && selectedActions?.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ my: 0.5 }}>
                  {selectedActions?.map((action, index) => (
                    <>
                      <Chip
                        key={index}
                        label={action.label}
                        color="info"
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    </>
                  ))}
                  <Chip
                    label={standard?.impact}
                    color={standard?.impact === "High Impact" ? "error" : "info"}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </Stack>
              )}
              {
                //add a chip that shows the impact
              }
              <Typography variant="body2" color="textSecondary">
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
            <Typography variant="body2">{isConfigured ? "Configured" : "Unconfigured"}</Typography>
            <IconButton color="error" onClick={() => handleRemoveStandard(standardName)}>
              <Delete />
            </IconButton>

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
              <Grid item xs={4}>
                <CippFormComponent
                  type="autoComplete"
                  name={`${standardName}.action`}
                  formControl={formControl}
                  label="Action"
                  options={getAvailableActions(disabledFeatures)}
                  fullWidth
                />
              </Grid>

              {hasAddedComponents && (
                <Grid item xs={8}>
                  <Grid container spacing={2}>
                    {standard.addedComponent?.map((component, idx) => (
                      <CippAddedComponent
                        key={idx}
                        standardName={standardName}
                        component={component}
                        formControl={formControl}
                      />
                    ))}
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Box>
        </Collapse>
      </Card>
    );
  });
};

export default CippStandardAccordion;
