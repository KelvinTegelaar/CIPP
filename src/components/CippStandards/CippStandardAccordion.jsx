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
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon, Delete, Public } from "@mui/icons-material";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import PropTypes from "prop-types";
import { useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import _ from "lodash"; // Import lodash for safely accessing values with dot notation

const CippStandardAccordion = ({
  standards,
  selectedStandards,
  expanded,
  handleAccordionToggle,
  handleRemoveStandard,
  formControl,
}) => {
  const [configuredState, setConfiguredState] = useState({});

  // useWatch to observe all form values
  const watchedValues = useWatch({
    control: formControl.control,
  });

  useEffect(() => {
    // Loop through selected standards and update configured status
    Object.keys(selectedStandards).forEach((standardName) => {
      const standard = standards.find((s) => s.name === standardName);
      if (standard) {
        const actionFilled = !!_.get(watchedValues, `${standardName}.action`);
        const addedComponentsFilled =
          standard.addedComponent?.every(
            (component) => !!_.get(watchedValues, `${standardName}.${component.name}`)
          ) ?? true;

        const isConfigured = actionFilled && addedComponentsFilled;
        setConfiguredState((prevState) => ({
          ...prevState,
          [standardName]: isConfigured,
        }));
      }
    });
  }, [watchedValues, standards, selectedStandards]);

  const getAvailableActions = (disabledFeatures) => {
    const allActions = [
      { label: "Report", value: "Report" },
      { label: "Alert", value: "warn" },
      { label: "Remediate", value: "Remediate" },
    ];

    // Filter out disabled features from the actions list
    return allActions.filter((action) => !disabledFeatures?.[action.value.toLowerCase()]);
  };

  return Object.keys(selectedStandards).map((standardName) => {
    const standard = standards.find((s) => s.name === standardName);

    if (!standard) return null;

    const isExpanded = expanded === standardName;
    const hasAddedComponents = standard.addedComponent && standard.addedComponent.length > 0;
    const isConfigured = configuredState[standardName];

    // Get the disabledFeatures from the standard, or default to an empty object
    const disabledFeatures = standard.disabledFeatures || {};

    return (
      <Card key={standardName} sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Avatar>
              <Public />
            </Avatar>
            <Box>
              <Typography variant="h6">{standard.label}</Typography>
              <Typography variant="body2" color="textSecondary">
                {standard.helpText}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                backgroundColor: isConfigured ? "success.main" : "warning.main",
                borderRadius: "50%",
                width: 8,
                height: 8,
              }}
            />
            <Typography variant="body2">{isConfigured ? "Configured" : "Unconfigured"}</Typography>
            <IconButton onClick={() => handleAccordionToggle(standardName)}>
              <SvgIcon
                component={ExpandMoreIcon}
                sx={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}
              />
            </IconButton>
          </Stack>
        </Stack>

        <Collapse in={isExpanded}>
          <Divider />
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {/* First Row - Dynamic Action Autocomplete with disabled features logic */}
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

              {/* Second Row - Added Components (null-safe) */}
              {hasAddedComponents && (
                <Grid item xs={8}>
                  <Grid container spacing={2}>
                    {standard.addedComponent.map((component, idx) => (
                      <Grid key={idx} item xs={6}>
                        <CippFormComponent
                          type={component.type}
                          name={`${standardName}.${component.name}`}
                          label={component.label}
                          formControl={formControl}
                          fullWidth
                          {...component}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Divider and Remove Button */}
          <Divider sx={{ mt: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
            <IconButton color="error" onClick={() => handleRemoveStandard(standardName)}>
              <Delete />
            </IconButton>
          </Box>
        </Collapse>
      </Card>
    );
  });
};

CippStandardAccordion.propTypes = {
  standards: PropTypes.array.isRequired,
  selectedStandards: PropTypes.object.isRequired,
  expanded: PropTypes.string,
  handleAccordionToggle: PropTypes.func.isRequired,
  handleRemoveStandard: PropTypes.func.isRequired,
  formControl: PropTypes.object.isRequired,
};

export default CippStandardAccordion;
