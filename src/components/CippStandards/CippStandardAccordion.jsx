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
} from "@mui/icons-material";
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

  const watchedValues = useWatch({
    control: formControl.control,
  });

  useEffect(() => {
    const newConfiguredState = { ...configuredState };

    Object.keys(selectedStandards).forEach((standardName) => {
      const standard = providedStandards.find((s) => s.name === standardName.split("[")[0]);
      if (standard) {
        const actionFilled = !!_.get(watchedValues, `${standardName}.action`, false);

        const addedComponentsFilled =
          standard.addedComponent?.every((component) => {
            const isRequired = component.required !== false && component.type !== "switch";
            if (!isRequired) return true;
            return !!_.get(watchedValues, `${standardName}.${component.name}`);
          }) ?? true;

        const isConfigured = actionFilled && addedComponentsFilled;

        if (newConfiguredState[standardName] !== isConfigured) {
          newConfiguredState[standardName] = isConfigured;
        }
      }
    });

    if (!_.isEqual(newConfiguredState, configuredState)) {
      setConfiguredState(newConfiguredState);
    }
  }, [watchedValues, providedStandards, selectedStandards]);

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

  const filteredGroupedStandards = useMemo(() => {
    if (!searchQuery && filter === "all") {
      return groupedStandards;
    }

    const result = {};
    const searchLower = searchQuery.toLowerCase();

    Object.keys(groupedStandards).forEach((category) => {
      const categoryMatchesSearch = !searchQuery || category.toLowerCase().includes(searchLower);

      const filteredStandards = groupedStandards[category].filter(({ standardName, standard }) => {
        const matchesSearch =
          !searchQuery ||
          categoryMatchesSearch ||
          standard.label.toLowerCase().includes(searchLower) ||
          (standard.helpText && standard.helpText.toLowerCase().includes(searchLower)) ||
          (standard.cat && standard.cat.toLowerCase().includes(searchLower)) ||
          (standard.tag &&
            Array.isArray(standard.tag) &&
            standard.tag.some((tag) => tag.toLowerCase().includes(searchLower)));

        const isConfigured = configuredState[standardName];
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
                            onClick={() => setSearchQuery("")}
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
                onClick={() => setFilter("all")}
              >
                All ({standardCounts.allCount})
              </Button>
              <Button
                variant={filter === "configured" ? "contained" : "outlined"}
                onClick={() => setFilter("configured")}
              >
                Configured ({standardCounts.configuredCount})
              </Button>
              <Button
                variant={filter === "unconfigured" ? "contained" : "outlined"}
                onClick={() => setFilter("unconfigured")}
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
            const isConfigured = configuredState[standardName];
            const disabledFeatures = standard.disabledFeatures || {};

            let selectedActions = _.get(watchedValues, `${standardName}.action`);
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
                      {selectedActions && selectedActions?.length > 0 && (
                        <Stack direction="row" spacing={1} sx={{ my: 0.5 }}>
                          {selectedActions?.map((action, index) => (
                            <React.Fragment key={index}>
                              <Chip
                                label={action.label}
                                color="info"
                                variant="outlined"
                                size="small"
                                sx={{ mr: 1 }}
                              />
                            </React.Fragment>
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
                    <Typography variant="body2">
                      {isConfigured ? "Configured" : "Unconfigured"}
                    </Typography>
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
          })}
        </React.Fragment>
      ))}
    </>
  );
};

export default CippStandardAccordion;
