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

    return tenantInFilter || allTenantsTemplate;
  });

  // Combine standards from all applicable templates
  const combinedStandards = {};
  for (const template of applicableTemplates) {
    for (const [standardKey, standardValue] of Object.entries(template.standards)) {
      combinedStandards[standardKey] = standardValue;
    }
  }

  // Group standards by category
  const standardsByCategory = {};
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
              standards: <strong>{Object.keys(combinedStandards).length}</strong>
            </Typography>
          </Box>

          {Object.entries(standardsByCategory).map(([category, categoryStandards], idx) => (
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
                  <Chip
                    label={`${categoryStandards.length} standards`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 1, pb: 2 }}>
                <Grid container spacing={1}>
                  {categoryStandards.map(({ key, config, info }) => (
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
                                    const componentValue = _.get(config, component.name);
                                    const displayValue =
                                      componentValue?.label || componentValue || "N/A";
                                    return (
                                      <Box
                                        key={index}
                                        sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
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
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}

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
