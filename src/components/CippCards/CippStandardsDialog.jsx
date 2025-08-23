import React, { useState } from "react";
import _ from "lodash";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Close as CloseIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Construction as ConstructionIcon,
  Public as PublicIcon,
  Cloud as CloudIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  PhoneAndroid as PhoneAndroidIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { SvgIcon } from "@mui/material";
import standards from "../../data/standards.json";

const getCategoryIcon = (category) => {
  switch (category) {
    case "Global Standards":
      return <PublicIcon fontSize="small" />;
    case "Entra (AAD) Standards":
      return <CloudIcon fontSize="small" />;
    case "Exchange Standards":
      return <EmailIcon fontSize="small" />;
    case "Defender Standards":
      return <SecurityIcon fontSize="small" />;
    case "Intune Standards":
      return <PhoneAndroidIcon fontSize="small" />;
    case "Templates":
      return <ConstructionIcon fontSize="small" />;
    default:
      return <PublicIcon fontSize="small" />;
  }
};

const getActionIcon = (action) => {
  switch (action?.toLowerCase()) {
    case "report":
      return <AssignmentIcon fontSize="small" />;
    case "alert":
    case "warn":
      return <NotificationsIcon fontSize="small" />;
    case "remediate":
      return <ConstructionIcon fontSize="small" />;
    default:
      return <InfoIcon fontSize="small" />;
  }
};

const getImpactColor = (impact) => {
  switch (impact?.toLowerCase()) {
    case "low impact":
      return "info";
    case "medium impact":
      return "warning";
    case "high impact":
      return "error";
    default:
      return "default";
  }
};

export const CippStandardsDialog = ({ open, onClose, standardsData, currentTenant }) => {
  const [expanded, setExpanded] = useState(false);
  if (!standardsData) return null;

  // Get applicable templates for the current tenant
  const applicableTemplates = standardsData.filter((template) => {
    const tenantFilterArr = Array.isArray(template?.tenantFilter) ? template.tenantFilter : [];
    const excludedTenantsArr = Array.isArray(template?.excludedTenants)
      ? template.excludedTenants
      : [];

    const tenantInFilter =
      tenantFilterArr.length > 0 && tenantFilterArr.some((tf) => tf.value === currentTenant);

    const allTenantsTemplate =
      tenantFilterArr.some((tf) => tf.value === "AllTenants") &&
      (excludedTenantsArr.length === 0 ||
        !excludedTenantsArr.some((et) => et.value === currentTenant));

    const isApplicable = tenantInFilter || allTenantsTemplate;

    return isApplicable;
  });

  // Combine standards from all applicable templates
  const combinedStandards = {};
  for (const template of applicableTemplates) {
    for (const [standardKey, standardValue] of Object.entries(template.standards)) {
      if (combinedStandards[standardKey]) {
        // If the standard already exists, we need to merge it
        const existing = combinedStandards[standardKey];
        const incoming = standardValue;

        // If both are arrays (like IntuneTemplate, ConditionalAccessTemplate), concatenate them
        if (Array.isArray(existing) && Array.isArray(incoming)) {
          combinedStandards[standardKey] = [...existing, ...incoming];
        }
        // If one is array and other is not, or both are objects, keep the last one (existing behavior)
        else {
          combinedStandards[standardKey] = standardValue;
        }
      } else {
        combinedStandards[standardKey] = standardValue;
      }
    }
  }

  // Group standards by category
  const standardsByCategory = {};
  let totalStandardsCount = 0;

  Object.entries(combinedStandards).forEach(([standardKey, standardConfig]) => {
    const standardInfo = standards.find((s) => s.name === `standards.${standardKey}`);
    if (standardInfo) {
      const category = standardInfo.cat;
      if (!standardsByCategory[category]) {
        standardsByCategory[category] = [];
      }
      standardsByCategory[category].push({
        key: standardKey,
        config: standardConfig,
        info: standardInfo,
      });

      // Count template instances separately
      if (Array.isArray(standardConfig) && standardConfig.length > 0) {
        totalStandardsCount += standardConfig.length;
      } else {
        totalStandardsCount += 1;
      }
    }
  });

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <Typography variant="h6">Standards Configuration</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Showing standards configuration for tenant: <strong>{currentTenant}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total templates applied: <strong>{applicableTemplates.length}</strong> | Total
              standards: <strong>{totalStandardsCount}</strong>
            </Typography>
          </Box>

          {Object.entries(standardsByCategory).map(([category, categoryStandards], idx) => {
            // Calculate the actual count of standards in this category (counting template instances)
            const categoryCount = categoryStandards.reduce((count, { config }) => {
              if (Array.isArray(config) && config.length > 0) {
                return count + config.length;
              }
              return count + 1;
            }, 0);

            return (
              <Accordion
                key={category}
                expanded={expanded === category}
                onChange={handleAccordionChange(category)}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  boxShadow: "none",
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${category}-content`}
                  id={`${category}-header`}
                  sx={{
                    minHeight: 48,
                    "& .MuiAccordionSummary-content": { alignItems: "center", m: 0 },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <SvgIcon color="primary">{getCategoryIcon(category)}</SvgIcon>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {category}
                    </Typography>
                    <Chip label={`${categoryCount} standards`} size="small" variant="outlined" />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 1, pb: 2 }}>
                  <Grid container spacing={1}>
                    {categoryStandards.map(({ key, config, info }) => {
                      // Handle template arrays by rendering each template as a separate card
                      if (Array.isArray(config) && config.length > 0) {
                        return config.map((templateItem, templateIndex) => (
                          <Grid item xs={12} md={6} key={`${key}-${templateIndex}`}>
                            <Card variant="outlined" sx={{ height: "100%", mb: 1, p: 0 }}>
                              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                                <Stack spacing={1}>
                                  <Box>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                      {info.label} {config.length > 1 && `(${templateIndex + 1})`}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {info.helpText}
                                    </Typography>
                                  </Box>
                                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                    <Chip
                                      label={info.impact}
                                      size="small"
                                      color={getImpactColor(info.impact)}
                                      variant="outlined"
                                    />
                                    {info.tag && info.tag.length > 0 && (
                                      <Chip
                                        label={`${info.tag.length} tags`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                  </Stack>
                                  <Box>
                                    <Typography variant="caption" fontWeight="bold" gutterBottom>
                                      Actions:
                                    </Typography>
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                      {templateItem.action && Array.isArray(templateItem.action) ? (
                                        templateItem.action.map((action, actionIndex) => (
                                          <Chip
                                            key={actionIndex}
                                            icon={getActionIcon(action.value)}
                                            label={action.value}
                                            size="small"
                                            variant="outlined"
                                            color={
                                              action.value?.toLowerCase() === "remediate"
                                                ? "error"
                                                : action.value?.toLowerCase() === "alert" ||
                                                  action.value?.toLowerCase() === "warn"
                                                ? "warning"
                                                : "info"
                                            }
                                          />
                                        ))
                                      ) : (
                                        <Typography variant="caption" color="text.secondary">
                                          No actions configured
                                        </Typography>
                                      )}
                                    </Stack>
                                  </Box>

                                  {info.addedComponent && info.addedComponent.length > 0 && (
                                    <Box>
                                      <Typography variant="caption" fontWeight="bold" gutterBottom>
                                        Fields:
                                      </Typography>
                                      <Stack spacing={0.5}>
                                        {info.addedComponent.map((component, componentIndex) => {
                                          const value = _.get(templateItem, component.name);
                                          let displayValue = "N/A";

                                          if (value) {
                                            if (typeof value === "object" && value !== null) {
                                              displayValue =
                                                value.label || value.value || JSON.stringify(value);
                                            } else {
                                              displayValue = String(value);
                                            }
                                          }

                                          return (
                                            <Box
                                              key={componentIndex}
                                              sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 0.5,
                                              }}
                                            >
                                              <Typography variant="caption" color="text.secondary">
                                                {component.label || component.name}:
                                              </Typography>
                                              <Chip
                                                label={displayValue}
                                                size="small"
                                                variant="outlined"
                                              />
                                            </Box>
                                          );
                                        })}
                                      </Stack>
                                    </Box>
                                  )}
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ));
                      }

                      // Handle regular standards (non-template arrays)
                      return (
                        <Grid item xs={12} md={6} key={key}>
                          <Card variant="outlined" sx={{ height: "100%", mb: 1, p: 0 }}>
                            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                              <Stack spacing={1}>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {info.label}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {info.helpText}
                                  </Typography>
                                </Box>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                  <Chip
                                    label={info.impact}
                                    size="small"
                                    color={getImpactColor(info.impact)}
                                    variant="outlined"
                                  />
                                  {info.tag && info.tag.length > 0 && (
                                    <Chip
                                      label={`${info.tag.length} tags`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </Stack>
                                <Box>
                                  <Typography variant="caption" fontWeight="bold" gutterBottom>
                                    Actions:
                                  </Typography>
                                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                    {config.action && Array.isArray(config.action) ? (
                                      config.action.map((action, index) => (
                                        <Chip
                                          key={index}
                                          icon={getActionIcon(action.value)}
                                          label={action.value}
                                          size="small"
                                          variant="outlined"
                                          color={
                                            action.value?.toLowerCase() === "remediate"
                                              ? "error"
                                              : action.value?.toLowerCase() === "alert" ||
                                                action.value?.toLowerCase() === "warn"
                                              ? "warning"
                                              : "info"
                                          }
                                        />
                                      ))
                                    ) : (
                                      <Typography variant="caption" color="text.secondary">
                                        No actions configured
                                      </Typography>
                                    )}
                                  </Stack>
                                </Box>

                                {info.addedComponent && info.addedComponent.length > 0 && (
                                  <Box>
                                    <Typography variant="caption" fontWeight="bold" gutterBottom>
                                      Fields:
                                    </Typography>
                                    <Stack spacing={0.5}>
                                      {info.addedComponent.map((component, index) => {
                                        let componentValue;
                                        let displayValue = "N/A";

                                        // Handle regular standards and nested standards structures
                                        let extractedValue = null;

                                        // Try direct access first
                                        componentValue = _.get(config, component.name);

                                        // If direct access fails and component name contains dots (nested structure)
                                        if (
                                          (componentValue === undefined ||
                                            componentValue === null) &&
                                          component.name.includes(".")
                                        ) {
                                          const pathParts = component.name.split(".");

                                          // Handle structures like: standards.AuthMethodsSettings.ReportSuspiciousActivity
                                          if (pathParts[0] === "standards" && config.standards) {
                                            // Remove 'standards.' prefix and try to find the value in config.standards
                                            const nestedPath = pathParts.slice(1).join(".");
                                            extractedValue = _.get(config.standards, nestedPath);

                                            // If still not found, try alternative nested structures
                                            // Some standards have double nesting like: config.standards.StandardName.fieldName
                                            if (
                                              (extractedValue === undefined ||
                                                extractedValue === null) &&
                                              pathParts.length >= 3
                                            ) {
                                              const standardName = pathParts[1];
                                              const fieldPath = pathParts.slice(2).join(".");
                                              extractedValue = _.get(
                                                config.standards,
                                                `${standardName}.${fieldPath}`
                                              );
                                            }
                                          }
                                        } else {
                                          extractedValue = componentValue;
                                        }

                                        if (extractedValue) {
                                          if (Array.isArray(extractedValue)) {
                                            // Handle array of objects
                                            const arrayValues = extractedValue.map((item) => {
                                              if (typeof item === "object" && item !== null) {
                                                return (
                                                  item.label || item.value || JSON.stringify(item)
                                                );
                                              }
                                              return String(item);
                                            });
                                            displayValue = arrayValues.join(", ");
                                          } else if (
                                            typeof extractedValue === "object" &&
                                            extractedValue !== null
                                          ) {
                                            if (extractedValue.label) {
                                              displayValue = extractedValue.label;
                                            } else if (extractedValue.value) {
                                              displayValue = extractedValue.value;
                                            } else {
                                              displayValue = JSON.stringify(extractedValue);
                                            }
                                          } else {
                                            displayValue = String(extractedValue);
                                          }
                                        }

                                        return (
                                          <Box
                                            key={index}
                                            sx={{
                                              display: "flex",
                                              flexDirection: "column",
                                              gap: 0.5,
                                            }}
                                          >
                                            <Typography variant="caption" color="text.secondary">
                                              {component.label || component.name}:
                                            </Typography>
                                            <Chip
                                              label={displayValue}
                                              size="small"
                                              variant="outlined"
                                            />
                                          </Box>
                                        );
                                      })}
                                    </Stack>
                                  </Box>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            );
          })}

          {Object.keys(standardsByCategory).length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No standards configured for this tenant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Standards templates may not be applied to this tenant or no standards are currently
                active.
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
