import React, { useState, useEffect, useMemo } from "react";
import { CippAutoComplete } from "../../../components/CippComponents/CippAutocomplete";
import {
  Button,
  Card,
  Stack,
  Typography,
  Box,
  Divider,
  Chip,
  Skeleton,
  Alert,
  IconButton,
  Tooltip,
  ButtonGroup,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
} from "@mui/material";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { HeaderedTabbedLayout } from "../../../layouts/HeaderedTabbedLayout";
import {
  CheckCircle,
  Cancel,
  Info,
  Microsoft,
  FilterAlt,
  Close,
  Search,
  FactCheck,
  Policy,
  ArrowDropDown,
  Assignment,
  NotificationImportant,
  Construction,
  Schedule,
  Check,
} from "@mui/icons-material";
import standards from "../../../data/standards.json";
import { CippApiDialog } from "../../../components/CippComponents/CippApiDialog";
import { SvgIcon } from "@mui/material";
import { useForm } from "react-hook-form";
import { useSettings } from "../../../hooks/use-settings";
import { ApiGetCall, ApiPostCall } from "../../../api/ApiCall";
import { useRouter } from "next/router";
import { useDialog } from "../../../hooks/use-dialog";
import { Grid } from "@mui/system";
import DOMPurify from "dompurify";
import { ClockIcon } from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import tabOptions from "./tabOptions.json";
import { createDriftManagementActions } from "./driftManagementActions";
import { CippApiLogsDrawer } from "../../../components/CippComponents/CippApiLogsDrawer";
import { CippHead } from "../../../components/CippComponents/CippHead";

const Page = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const [comparisonData, setComparisonData] = useState(null);
  const settings = useSettings();
  // Prioritize URL query parameter, then fall back to settings
  const currentTenant = router.query.tenantFilter || settings?.currentTenant;
  const formControl = useForm({
    mode: "onBlur",
    defaultValues: {
      comparisonMode: "standard",
    },
  });
  const runReportDialog = useDialog();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);

  const templateDetails = ApiGetCall({
    url: `/api/listStandardTemplates`,
    data: {
      templateId: templateId,
    },
    queryKey: `listStandardTemplates-reports-${templateId}`,
  });

  // Normalize template data structure to always work with an array
  const templates = useMemo(() => {
    const raw = templateDetails?.data;
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.templates)) return raw.templates; // alternate key
    if (raw && Array.isArray(raw.data)) return raw.data; // nested data property
    return [];
  }, [templateDetails?.data]);

  // Selected template object (safe lookup)
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.GUID === templateId),
    [templates, templateId],
  );

  // Run the report once
  const runReport = ApiPostCall({ relatedQueryKeys: ["ListStandardsCompare"] });

  // Dialog configuration for Run Report Once
  const runReportApi = {
    type: "GET",
    url: "/api/ExecStandardsRun",
    data: {
      TemplateId: templateId,
    },
    confirmText: "Are you sure you want to run this standard report?",
  };

  // Get comparison data - fetch all standards without filtering by template
  const comparisonApi = ApiGetCall({
    url: "/api/ListStandardsCompare",
    data: {
      tenantFilter: currentTenant,
      CompareToStandard: true, // Always compare to standard, even in tenant comparison mode
    },
    queryKey: `ListStandardsCompare-${
      formControl.watch("compareTenantId") || "standard"
    }-${currentTenant}`,
    enabled: !!templateId, // Only run the query if templateId is available
  });

  useEffect(() => {
    if (templateId && templateDetails.isSuccess && templateDetails.data) {
      const selectedTemplate = templateDetails.data.find(
        (template) => template.GUID === templateId,
      );

      if (selectedTemplate && comparisonApi.isSuccess && comparisonApi.data) {
        const tenantData = comparisonApi.data;

        // Find the current tenant's data by matching tenantFilter with currentTenant
        const currentTenantObj = tenantData.find((t) => t.tenantFilter === currentTenant);
        const currentTenantData = currentTenantObj ? currentTenantObj.standardsResults || [] : [];

        // Helper function to get template display name from GUID
        const getTemplateDisplayName = (guid) => {
          if (!guid) return null;
          const template = templateDetails.data.find((t) => t.GUID === guid);
          return template?.displayName || template?.templateName || template?.name || guid;
        };

        const allStandards = [];
        if (selectedTemplate.standards) {
          Object.entries(selectedTemplate.standards).forEach(([standardKey, standardConfig]) => {
            if (standardKey === "IntuneTemplate" && Array.isArray(standardConfig)) {
              standardConfig.forEach((templateItem, index) => {
                if (!templateItem) return; // Skip null items

                // Check for both addedFields.templates AND rawData.templates
                const tagTemplates =
                  templateItem["TemplateList-Tags"]?.addedFields?.templates ||
                  templateItem["TemplateList-Tags"]?.rawData?.templates;

                if (templateItem["TemplateList-Tags"]?.value && tagTemplates) {
                  tagTemplates.forEach((expandedTemplate) => {
                    const itemTemplateId = expandedTemplate.GUID;
                    const standardId = `standards.IntuneTemplate.${itemTemplateId}`;
                    const standardInfo = standards.find(
                      (s) => s.name === `standards.IntuneTemplate`,
                    );

                    // Find the tenant's value for this specific template
                    const currentTenantStandard = currentTenantData.find(
                      (s) => s.standardId === standardId,
                    );

                    // Get the standard object and its value from the tenant object
                    const standardObject = currentTenantObj?.[standardId];
                    const directStandardValue = standardObject?.Value;

                    // Determine compliance status - match main logic
                    let isCompliant = false;

                    // FIRST: Check if CurrentValue and ExpectedValue exist and match
                    if (
                      standardObject?.CurrentValue !== undefined &&
                      standardObject?.ExpectedValue !== undefined
                    ) {
                      const sortedCurrent =
                        typeof standardObject.CurrentValue === "object" &&
                        standardObject.CurrentValue !== null
                          ? Object.keys(standardObject.CurrentValue)
                              .sort()
                              .reduce((obj, key) => {
                                obj[key] = standardObject.CurrentValue[key];
                                return obj;
                              }, {})
                          : standardObject.CurrentValue;
                      const sortedExpected =
                        typeof standardObject.ExpectedValue === "object" &&
                        standardObject.ExpectedValue !== null
                          ? Object.keys(standardObject.ExpectedValue)
                              .sort()
                              .reduce((obj, key) => {
                                obj[key] = standardObject.ExpectedValue[key];
                                return obj;
                              }, {})
                          : standardObject.ExpectedValue;
                      isCompliant =
                        JSON.stringify(sortedCurrent) === JSON.stringify(sortedExpected);
                    }
                    // SECOND: Check if Value is explicitly true
                    else if (directStandardValue === true) {
                      isCompliant = true;
                    }
                    // THIRD: Fall back to currentTenantStandard
                    else if (currentTenantStandard) {
                      isCompliant = currentTenantStandard.value === true;
                    }

                    // Create a standardValue object that contains the template settings
                    const templateSettings = {
                      templateId,
                      Template:
                        expandedTemplate.displayName || expandedTemplate.name || "Unknown Template",
                      "Assign to": templateItem.AssignTo || "On",
                      "Excluded Group": templateItem.excludeGroup || "",
                      "Included Group": templateItem.customGroup || "",
                    };

                    // Check if this standard is overridden by another template
                    const tenantTemplateId = standardObject?.TemplateId;
                    const isOverridden = tenantTemplateId && tenantTemplateId !== templateId;
                    const overridingTemplateName = isOverridden
                      ? getTemplateDisplayName(tenantTemplateId)
                      : null;

                    allStandards.push({
                      standardId,
                      standardName: `Intune Template: ${
                        expandedTemplate.displayName || expandedTemplate.name || itemTemplateId
                      } (via ${templateItem["TemplateList-Tags"]?.value})`,
                      currentTenantValue:
                        standardObject !== undefined
                          ? {
                              Value: directStandardValue,
                              LastRefresh: standardObject?.LastRefresh,
                              TemplateId: tenantTemplateId,
                              CurrentValue: standardObject?.CurrentValue,
                              ExpectedValue: standardObject?.ExpectedValue,
                            }
                          : currentTenantStandard?.value,
                      standardValue: templateSettings,
                      complianceStatus: isOverridden
                        ? "Overridden"
                        : isCompliant
                          ? "Compliant"
                          : "Non-Compliant",
                      isOverridden,
                      overridingTemplateId: isOverridden ? tenantTemplateId : null,
                      overridingTemplateName,
                      complianceDetails:
                        standardInfo?.docsDescription || standardInfo?.helpText || "",
                      standardDescription: standardInfo?.helpText || "",
                      standardImpact: standardInfo?.impact || "Medium Impact",
                      standardImpactColour: standardInfo?.impactColour || "warning",
                      templateName: selectedTemplate?.templateName || "Standard Template",
                      templateActions: (() => {
                        const actions = templateItem.action || [];
                        const hasRemediate = actions.some((a) => {
                          const label = typeof a === "object" ? a?.label || a?.value : a;
                          return label === "Remediate" || label === "remediate";
                        });
                        const hasReport = actions.some((a) => {
                          const label = typeof a === "object" ? a?.label || a?.value : a;
                          return label === "Report" || label === "report";
                        });
                        if (hasRemediate && !hasReport) {
                          return [...actions, "Report"];
                        }
                        return actions;
                      })(),
                      autoRemediate:
                        templateItem.autoRemediate ||
                        templateItem.TemplateList?.autoRemediate ||
                        false,
                    });
                  });
                } else {
                  // Regular TemplateList processing
                  const itemTemplateId = templateItem.TemplateList?.value;
                  if (itemTemplateId) {
                    const standardId = `standards.IntuneTemplate.${itemTemplateId}`;
                    const standardInfo = standards.find(
                      (s) => s.name === `standards.IntuneTemplate`,
                    );

                    // Find the tenant's value for this specific template
                    const currentTenantStandard = currentTenantData.find(
                      (s) => s.standardId === standardId,
                    );

                    // Get the standard object and its value from the tenant object
                    const standardObject = currentTenantObj?.[standardId];
                    const directStandardValue = standardObject?.Value;

                    // Determine compliance status
                    let isCompliant = false;

                    // For IntuneTemplate, the value is true if compliant, or an object with comparison data if not compliant
                    if (directStandardValue === true) {
                      isCompliant = true;
                    } else if (
                      directStandardValue !== undefined &&
                      typeof directStandardValue !== "object"
                    ) {
                      isCompliant = true;
                    } else if (currentTenantStandard) {
                      isCompliant = currentTenantStandard.value === true;
                    }

                    // Create a standardValue object that contains the template settings
                    const templateSettings = {
                      templateId: itemTemplateId,
                      Template: templateItem.TemplateList?.label || "Unknown Template",
                      "Assign to": templateItem.AssignTo || "On",
                      "Excluded Group": templateItem.excludeGroup || "",
                      "Included Group": templateItem.customGroup || "",
                    };

                    // Check if this standard is overridden by another template
                    const tenantTemplateId = standardObject?.TemplateId;
                    const isOverridden = tenantTemplateId && tenantTemplateId !== templateId;
                    const overridingTemplateName = isOverridden
                      ? getTemplateDisplayName(tenantTemplateId)
                      : null;

                    allStandards.push({
                      standardId,
                      standardName: `Intune Template: ${
                        templateItem.TemplateList?.label || itemTemplateId
                      }`,
                      currentTenantValue:
                        standardObject !== undefined
                          ? {
                              Value: directStandardValue,
                              LastRefresh: standardObject?.LastRefresh,
                              TemplateId: tenantTemplateId,
                              CurrentValue: standardObject?.CurrentValue,
                              ExpectedValue: standardObject?.ExpectedValue,
                            }
                          : currentTenantStandard?.value,
                      standardValue: templateSettings, // Use the template settings object instead of true
                      complianceStatus: isOverridden
                        ? "Overridden"
                        : isCompliant
                          ? "Compliant"
                          : "Non-Compliant",
                      isOverridden,
                      overridingTemplateId: isOverridden ? tenantTemplateId : null,
                      overridingTemplateName,
                      complianceDetails:
                        standardInfo?.docsDescription || standardInfo?.helpText || "",
                      standardDescription: standardInfo?.helpText || "",
                      standardImpact: standardInfo?.impact || "Medium Impact",
                      standardImpactColour: standardInfo?.impactColour || "warning",
                      templateName: selectedTemplate?.templateName || "Standard Template",
                      templateActions: (() => {
                        const actions =
                          templateItem.action || templateItem.TemplateList?.action || [];
                        const hasRemediate = actions.some((a) => {
                          const label = typeof a === "object" ? a?.label || a?.value : a;
                          return label === "Remediate" || label === "remediate";
                        });
                        const hasReport = actions.some((a) => {
                          const label = typeof a === "object" ? a?.label || a?.value : a;
                          return label === "Report" || label === "report";
                        });
                        if (hasRemediate && !hasReport) {
                          return [...actions, "Report"];
                        }
                        return actions;
                      })(),
                      autoRemediate:
                        templateItem.autoRemediate ||
                        templateItem.TemplateList?.autoRemediate ||
                        false,
                    });
                  }
                }
              });
            } else if (
              standardKey === "ConditionalAccessTemplate" &&
              Array.isArray(standardConfig)
            ) {
              // Process each ConditionalAccessTemplate item separately
              standardConfig.forEach((templateItem, index) => {
                if (!templateItem) return; // Skip null items

                // Check for both addedFields.templates AND rawData.templates
                const tagTemplates =
                  templateItem["TemplateList-Tags"]?.addedFields?.templates ||
                  templateItem["TemplateList-Tags"]?.rawData?.templates;

                // Check if this item has TemplateList-Tags and expand them
                if (templateItem["TemplateList-Tags"]?.value && tagTemplates) {
                  tagTemplates.forEach((expandedTemplate) => {
                    const itemTemplateId = expandedTemplate.GUID;
                    const standardId = `standards.ConditionalAccessTemplate.${itemTemplateId}`;
                    const standardInfo = standards.find(
                      (s) => s.name === `standards.ConditionalAccessTemplate`,
                    );

                    // Find the tenant's value for this specific template
                    const currentTenantStandard = currentTenantData.find(
                      (s) => s.standardId === standardId,
                    );
                    const standardObject = currentTenantObj?.[standardId];
                    const directStandardValue = standardObject?.Value;
                    const tenantTemplateId = standardObject?.TemplateId;
                    const isOverridden = tenantTemplateId && tenantTemplateId !== templateId;
                    const overridingTemplateName = isOverridden
                      ? getTemplateDisplayName(tenantTemplateId)
                      : null;
                    let isCompliant = false;

                    // FIRST: Check if CurrentValue and ExpectedValue exist and match
                    if (
                      standardObject?.CurrentValue !== undefined &&
                      standardObject?.ExpectedValue !== undefined
                    ) {
                      const sortedCurrent =
                        typeof standardObject.CurrentValue === "object" &&
                        standardObject.CurrentValue !== null
                          ? Object.keys(standardObject.CurrentValue)
                              .sort()
                              .reduce((obj, key) => {
                                obj[key] = standardObject.CurrentValue[key];
                                return obj;
                              }, {})
                          : standardObject.CurrentValue;
                      const sortedExpected =
                        typeof standardObject.ExpectedValue === "object" &&
                        standardObject.ExpectedValue !== null
                          ? Object.keys(standardObject.ExpectedValue)
                              .sort()
                              .reduce((obj, key) => {
                                obj[key] = standardObject.ExpectedValue[key];
                                return obj;
                              }, {})
                          : standardObject.ExpectedValue;
                      isCompliant =
                        JSON.stringify(sortedCurrent) === JSON.stringify(sortedExpected);
                    }
                    // SECOND: Check if Value is explicitly true
                    else if (directStandardValue === true) {
                      isCompliant = true;
                    }
                    // THIRD: Otherwise not compliant
                    else {
                      isCompliant = false;
                    }

                    // Create a standardValue object that contains the template settings
                    const templateSettings = {
                      templateId: itemTemplateId,
                      Template:
                        expandedTemplate.displayName || expandedTemplate.name || "Unknown Template",
                    };

                    allStandards.push({
                      standardId,
                      standardName: `Conditional Access Template: ${
                        expandedTemplate.displayName || expandedTemplate.name || itemTemplateId
                      } (via ${templateItem["TemplateList-Tags"]?.value})`,
                      currentTenantValue:
                        standardObject !== undefined
                          ? {
                              Value: directStandardValue,
                              LastRefresh: standardObject?.LastRefresh,
                              TemplateId: tenantTemplateId,
                              CurrentValue: standardObject?.CurrentValue,
                              ExpectedValue: standardObject?.ExpectedValue,
                            }
                          : currentTenantStandard?.value,
                      standardValue: templateSettings,
                      complianceStatus: isOverridden
                        ? "Overridden"
                        : isCompliant
                          ? "Compliant"
                          : "Non-Compliant",
                      complianceDetails:
                        standardInfo?.docsDescription || standardInfo?.helpText || "",
                      standardDescription: standardInfo?.helpText || "",
                      standardImpact: standardInfo?.impact || "Medium Impact",
                      standardImpactColour: standardInfo?.impactColour || "warning",
                      templateName: selectedTemplate?.templateName || "Standard Template",
                      templateActions: (() => {
                        const actions = templateItem.action || [];
                        const hasRemediate = actions.some((a) => {
                          const label = typeof a === "object" ? a?.label || a?.value : a;
                          return label === "Remediate" || label === "remediate";
                        });
                        const hasReport = actions.some((a) => {
                          const label = typeof a === "object" ? a?.label || a?.value : a;
                          return label === "Report" || label === "report";
                        });
                        if (hasRemediate && !hasReport) {
                          return [...actions, "Report"];
                        }
                        return actions;
                      })(),
                      autoRemediate:
                        templateItem.autoRemediate ||
                        templateItem.TemplateList?.autoRemediate ||
                        false,
                      isOverridden,
                      overridingTemplateId: isOverridden ? tenantTemplateId : null,
                      overridingTemplateName,
                    });
                  });
                } else {
                  // Regular TemplateList processing
                  const itemTemplateId = templateItem.TemplateList?.value;
                  if (itemTemplateId) {
                    const standardId = `standards.ConditionalAccessTemplate.${itemTemplateId}`;
                    const standardInfo = standards.find(
                      (s) => s.name === `standards.ConditionalAccessTemplate`,
                    );

                    // Find the tenant's value for this specific template
                    const currentTenantStandard = currentTenantData.find(
                      (s) => s.standardId === standardId,
                    );
                    const standardObject = currentTenantObj?.[standardId];
                    const directStandardValue = standardObject?.Value;
                    const tenantTemplateId = standardObject?.TemplateId;
                    const isOverridden = tenantTemplateId && tenantTemplateId !== templateId;
                    const overridingTemplateName = isOverridden
                      ? getTemplateDisplayName(tenantTemplateId)
                      : null;
                    let isCompliant = false;

                    // For ConditionalAccessTemplate, the value is true if compliant, or an object with comparison data if not compliant
                    if (directStandardValue === true) {
                      isCompliant = true;
                    } else {
                      isCompliant = false;
                    }

                    // Create a standardValue object that contains the template settings
                    const templateSettings = {
                      templateId: itemTemplateId,
                      Template: templateItem.TemplateList?.label || "Unknown Template",
                    };

                    allStandards.push({
                      standardId,
                      standardName: `Conditional Access Template: ${
                        templateItem.TemplateList?.label || itemTemplateId
                      }`,
                      currentTenantValue:
                        standardObject !== undefined
                          ? {
                              Value: directStandardValue,
                              LastRefresh: standardObject?.LastRefresh,
                              TemplateId: tenantTemplateId,
                              CurrentValue: standardObject?.CurrentValue,
                              ExpectedValue: standardObject?.ExpectedValue,
                            }
                          : currentTenantStandard?.value,
                      standardValue: templateSettings, // Use the template settings object instead of true
                      complianceStatus: isOverridden
                        ? "Overridden"
                        : isCompliant
                          ? "Compliant"
                          : "Non-Compliant",
                      complianceDetails:
                        standardInfo?.docsDescription || standardInfo?.helpText || "",
                      standardDescription: standardInfo?.helpText || "",
                      standardImpact: standardInfo?.impact || "Medium Impact",
                      standardImpactColour: standardInfo?.impactColour || "warning",
                      templateName: selectedTemplate?.templateName || "Standard Template",
                      templateActions: (() => {
                        const actions =
                          templateItem.action || templateItem.TemplateList?.action || [];
                        const hasRemediate = actions.some((a) => {
                          const label = typeof a === "object" ? a?.label || a?.value : a;
                          return label === "Remediate" || label === "remediate";
                        });
                        const hasReport = actions.some((a) => {
                          const label = typeof a === "object" ? a?.label || a?.value : a;
                          return label === "Report" || label === "report";
                        });
                        if (hasRemediate && !hasReport) {
                          return [...actions, "Report"];
                        }
                        return actions;
                      })(),
                      autoRemediate:
                        templateItem.autoRemediate ||
                        templateItem.TemplateList?.autoRemediate ||
                        false,
                      isOverridden,
                      overridingTemplateId: isOverridden ? tenantTemplateId : null,
                      overridingTemplateName,
                    });
                  }
                }
              });
            } else if (standardKey === "GroupTemplate") {
              // GroupTemplate structure has groupTemplate array and action array at the top level
              const groupTemplates = standardConfig.groupTemplate || [];
              const actions = standardConfig.action || [];
              const standardId = `standards.GroupTemplate`;
              const standardInfo = standards.find((s) => s.name === standardId);

              // Find the tenant's value for this template
              const currentTenantStandard = currentTenantData.find(
                (s) => s.standardId === standardId,
              );
              const standardObject = currentTenantObj?.[standardId];
              const directStandardValue = standardObject?.Value;
              const tenantTemplateId = standardObject?.TemplateId;
              const isOverridden = tenantTemplateId && tenantTemplateId !== templateId;
              const overridingTemplateName = isOverridden
                ? getTemplateDisplayName(tenantTemplateId)
                : null;
              let isCompliant = false;

              // For GroupTemplate, the value is true if compliant
              if (directStandardValue === true) {
                isCompliant = true;
              } else if (currentTenantStandard?.value) {
                isCompliant = currentTenantStandard.value === true;
              }

              // Build a list of all group names with their types
              const groupList = groupTemplates
                .map((groupTemplate) => {
                  const rawGroupType = (
                    groupTemplate.rawData?.groupType || "generic"
                  ).toLowerCase();
                  let prettyGroupType = "Generic";

                  if (rawGroupType.includes("dynamicdistribution")) {
                    prettyGroupType = "Dynamic Distribution Group";
                  } else if (rawGroupType.includes("dynamic")) {
                    prettyGroupType = "Dynamic Security Group";
                  } else if (rawGroupType.includes("azurerole")) {
                    prettyGroupType = "Azure Role-Assignable Group";
                  } else if (
                    rawGroupType.includes("m365") ||
                    rawGroupType.includes("unified") ||
                    rawGroupType.includes("microsoft")
                  ) {
                    prettyGroupType = "Microsoft 365 Group";
                  } else if (
                    rawGroupType.includes("distribution") ||
                    rawGroupType.includes("mail")
                  ) {
                    prettyGroupType = "Distribution Group";
                  } else if (
                    rawGroupType.includes("security") ||
                    rawGroupType === "mail-enabled security"
                  ) {
                    prettyGroupType = "Security Group";
                  } else if (rawGroupType.includes("generic")) {
                    prettyGroupType = "Security Group";
                  }

                  const groupName =
                    groupTemplate.label || groupTemplate.rawData?.displayName || "Unknown Group";
                  return `- ${groupName} (${prettyGroupType})`;
                })
                .join("\n");

              // Create a single standard entry for all groups
              const templateSettings = {
                Groups: groupList,
              };

              allStandards.push({
                standardId,
                standardName: `Group Templates`,
                currentTenantValue:
                  standardObject !== undefined
                    ? {
                        Value: directStandardValue,
                        LastRefresh: standardObject?.LastRefresh,
                        TemplateId: tenantTemplateId,
                        CurrentValue: standardObject?.CurrentValue,
                        ExpectedValue: standardObject?.ExpectedValue,
                      }
                    : currentTenantStandard?.value,
                standardValue: templateSettings,
                complianceStatus: isOverridden
                  ? "Overridden"
                  : isCompliant
                    ? "Compliant"
                    : "Non-Compliant",
                complianceDetails: standardInfo?.docsDescription || standardInfo?.helpText || "",
                standardDescription: standardInfo?.helpText || "",
                standardImpact: standardInfo?.impact || "Medium Impact",
                standardImpactColour: standardInfo?.impactColour || "warning",
                templateName: selectedTemplate?.templateName || "Standard Template",
                templateActions: (() => {
                  const hasRemediate = actions.some((a) => {
                    const label = typeof a === "object" ? a?.label || a?.value : a;
                    return label === "Remediate" || label === "remediate";
                  });
                  const hasReport = actions.some((a) => {
                    const label = typeof a === "object" ? a?.label || a?.value : a;
                    return label === "Report" || label === "report";
                  });
                  if (hasRemediate && !hasReport) {
                    return [...actions, "Report"];
                  }
                  return actions;
                })(),
                autoRemediate: standardConfig.autoRemediate || false,
                isOverridden,
                overridingTemplateId: isOverridden ? tenantTemplateId : null,
                overridingTemplateName,
              });
            } else {
              // Regular handling for other standards
              const standardId = `standards.${standardKey}`;
              const standardInfo = standards.find((s) => s.name === standardId);
              const standardSettings = standardConfig.standards?.[standardKey] || {};
              //console.log(standardInfo);

              // Check if reporting is enabled for this standard by checking the action property
              // The standard should be reportable if there's an action with value === 'Report'
              const actions = standardConfig?.action ?? [];
              const reportingEnabled =
                //if actions contains Report or Remediate, case insensitive, then we good.
                actions.filter(
                  (action) =>
                    action?.value.toLowerCase() === "report" ||
                    action?.value.toLowerCase() === "remediate",
                ).length > 0;

              // Find the tenant's value for this standard
              const currentTenantStandard = currentTenantData.find(
                (s) => s.standardId === standardId,
              );

              // Check if the standard is directly in the tenant object (like "standards.AuditLog": {...})
              const standardIdWithoutPrefix = standardId.replace("standards.", "");
              const standardObject = currentTenantObj?.[standardId];

              console.log(
                "standardId:",
                standardId,
                "includes IntuneTag:",
                standardId.includes("IntuneTag"),
              );

              // Debug logging for Intune tags
              if (standardId.includes("IntuneTag") || standardId.includes("intuneTag")) {
                console.log(`[${standardId}] standardObject:`, {
                  standardObject,
                  hasCurrentValue: standardObject?.CurrentValue !== undefined,
                  hasExpectedValue: standardObject?.ExpectedValue !== undefined,
                  Value: standardObject?.Value,
                  CurrentValue: standardObject?.CurrentValue,
                  ExpectedValue: standardObject?.ExpectedValue,
                });
              }

              // Extract the actual value from the standard object (new data structure includes .Value property)
              const directStandardValue = standardObject?.Value;

              // Determine compliance - prioritize Value field, then CurrentValue/ExpectedValue comparison
              let isCompliant = false;
              let reportingDisabled = !reportingEnabled;

              // Helper function to compare values, handling arrays with order-independent comparison
              const compareValues = (val1, val2) => {
                // If both are arrays, compare as sets (order-independent)
                if (Array.isArray(val1) && Array.isArray(val2)) {
                  if (val1.length !== val2.length) return false;
                  // Sort both arrays by their JSON representation for consistent comparison
                  const sorted1 = [...val1].sort((a, b) =>
                    JSON.stringify(a).localeCompare(JSON.stringify(b)),
                  );
                  const sorted2 = [...val2].sort((a, b) =>
                    JSON.stringify(a).localeCompare(JSON.stringify(b)),
                  );
                  return JSON.stringify(sorted1) === JSON.stringify(sorted2);
                }
                // For objects, sort keys to ensure consistent comparison
                if (
                  typeof val1 === "object" &&
                  val1 !== null &&
                  typeof val2 === "object" &&
                  val2 !== null
                ) {
                  const sortedVal1 = Object.keys(val1)
                    .sort()
                    .reduce((obj, key) => {
                      obj[key] = val1[key];
                      return obj;
                    }, {});
                  const sortedVal2 = Object.keys(val2)
                    .sort()
                    .reduce((obj, key) => {
                      obj[key] = val2[key];
                      return obj;
                    }, {});
                  return JSON.stringify(sortedVal1) === JSON.stringify(sortedVal2);
                }
                // Otherwise use standard JSON comparison
                return JSON.stringify(val1) === JSON.stringify(val2);
              };

              // FIRST: Check if CurrentValue and ExpectedValue exist and match (most reliable)
              if (
                standardObject?.CurrentValue !== undefined &&
                standardObject?.ExpectedValue !== undefined
              ) {
                isCompliant = compareValues(
                  standardObject.CurrentValue,
                  standardObject.ExpectedValue,
                );
                // Debug logging for Intune tags
                if (standardId.includes("IntuneTag") || standardId.includes("intuneTag")) {
                  console.log(`[${standardId}] Comparing CurrentValue vs ExpectedValue:`, {
                    CurrentValue: standardObject.CurrentValue,
                    ExpectedValue: standardObject.ExpectedValue,
                    isCompliant,
                    currentJSON: JSON.stringify(standardObject.CurrentValue),
                    expectedJSON: JSON.stringify(standardObject.ExpectedValue),
                    areEqual:
                      JSON.stringify(standardObject.CurrentValue) ===
                      JSON.stringify(standardObject.ExpectedValue),
                  });
                }
              }
              // SECOND: Check if Value is explicitly true (compliant) or false (non-compliant)
              else if (directStandardValue === true) {
                isCompliant = true;
              } else if (directStandardValue === false) {
                isCompliant = false;
              }
              // THIRD: For other non-boolean, non-null values, use strict equality with template settings
              else if (directStandardValue !== undefined && directStandardValue !== null) {
                isCompliant =
                  JSON.stringify(directStandardValue) === JSON.stringify(standardSettings);
              }
              // FOURTH: Fall back to the previous logic if the standard is not directly in the tenant object
              else if (currentTenantStandard) {
                if (typeof standardSettings === "boolean" && standardSettings === true) {
                  isCompliant = currentTenantStandard.value === true;
                } else {
                  isCompliant =
                    JSON.stringify(currentTenantStandard.value) ===
                    JSON.stringify(standardSettings);
                }
              }

              // Determine compliance status text based on reporting flag
              const complianceStatus = reportingDisabled
                ? "Reporting Disabled"
                : isCompliant
                  ? "Compliant"
                  : "Non-Compliant";

              // Check if this standard is overridden by another template
              const tenantTemplateId = standardObject?.TemplateId;
              const isOverridden = tenantTemplateId && tenantTemplateId !== templateId;
              const overridingTemplateName = isOverridden
                ? getTemplateDisplayName(tenantTemplateId)
                : null;

              // Use the direct standard value from the tenant object if it exists
              allStandards.push({
                standardId,
                standardName: standardInfo?.label || standardKey,
                currentTenantValue:
                  standardObject !== undefined
                    ? {
                        Value: directStandardValue,
                        LastRefresh: standardObject?.LastRefresh,
                        TemplateId: tenantTemplateId,
                        CurrentValue: standardObject?.CurrentValue,
                        ExpectedValue: standardObject?.ExpectedValue,
                      }
                    : currentTenantStandard?.value,
                standardValue: standardSettings,
                complianceStatus: isOverridden ? "Overridden" : complianceStatus,
                reportingDisabled,
                isOverridden,
                overridingTemplateId: isOverridden ? tenantTemplateId : null,
                overridingTemplateName,
                complianceDetails: standardInfo?.docsDescription || standardInfo?.helpText || "",
                standardDescription: standardInfo?.helpText || "",
                standardImpact: standardInfo?.impact || "Medium Impact",
                standardImpactColour: standardInfo?.impactColour || "warning",
                templateName: selectedTemplate.templateName || "Standard Template",
                templateActions: (() => {
                  const actions = standardConfig.action || [];
                  const hasRemediate = actions.some((a) => {
                    const label = typeof a === "object" ? a?.label || a?.value : a;
                    return label === "Remediate" || label === "remediate";
                  });
                  const hasReport = actions.some((a) => {
                    const label = typeof a === "object" ? a?.label || a?.value : a;
                    return label === "Report" || label === "report";
                  });
                  if (hasRemediate && !hasReport) {
                    return [...actions, "Report"];
                  }
                  return actions;
                })(),
                autoRemediate: standardConfig.autoRemediate || false,
              });
            }
          });
        }

        setComparisonData(allStandards);
      } else {
        setComparisonData([]);
      }
    } else if (comparisonApi.isError) {
      setComparisonData([]);
    }
  }, [
    templateId,
    templateDetails.isSuccess,
    templateDetails.data,
    comparisonApi.isSuccess,
    comparisonApi.data,
    comparisonApi.isError,
  ]);
  const comparisonModeOptions = [{ label: "Compare Tenant to Standard", value: "standard" }];

  // Group standards by category
  const groupedStandards = useMemo(() => {
    if (!comparisonData) return {};

    const result = {};

    comparisonData.forEach((standard) => {
      // Find the standard info in the standards.json data
      const standardInfo = standards.find((s) => standard.standardId.includes(s.name));

      // Use the category from standards.json, or default to "Other Standards"
      const category = standardInfo?.cat || "Other Standards";

      if (!result[category]) {
        result[category] = [];
      }

      result[category].push(standard);
    });

    // Sort standards within each category
    Object.keys(result).forEach((category) => {
      result[category].sort((a, b) => a.standardName.localeCompare(b.standardName));
    });

    return result;
  }, [comparisonData]);

  const filteredGroupedStandards = useMemo(() => {
    if (!groupedStandards) return {};

    if (!searchQuery && filter === "all") {
      return groupedStandards;
    }

    const result = {};
    const searchLower = searchQuery.toLowerCase();

    Object.keys(groupedStandards).forEach((category) => {
      const categoryMatchesSearch = !searchQuery || category.toLowerCase().includes(searchLower);

      const filteredStandards = groupedStandards[category].filter((standard) => {
        const tenantValue = standard.currentTenantValue?.Value || standard.currentTenantValue;
        const hasLicenseMissing =
          typeof tenantValue === "string" && tenantValue.startsWith("License Missing:");

        const matchesFilter =
          filter === "all" ||
          (filter === "compliant" && standard.complianceStatus === "Compliant") ||
          (filter === "nonCompliant" && standard.complianceStatus === "Non-Compliant") ||
          (filter === "overridden" && standard.complianceStatus === "Overridden") ||
          (filter === "nonCompliantWithLicense" &&
            standard.complianceStatus === "Non-Compliant" &&
            !hasLicenseMissing) ||
          (filter === "nonCompliantWithoutLicense" &&
            standard.complianceStatus === "Non-Compliant" &&
            hasLicenseMissing);

        const matchesSearch =
          !searchQuery ||
          categoryMatchesSearch ||
          standard.standardName.toLowerCase().includes(searchLower) ||
          standard.standardDescription.toLowerCase().includes(searchLower);

        return matchesFilter && matchesSearch;
      });

      if (filteredStandards.length > 0) {
        result[category] = filteredStandards;
      }
    });

    return result;
  }, [groupedStandards, searchQuery, filter]);

  const allCount = comparisonData?.length || 0;
  const compliantCount =
    comparisonData?.filter((standard) => standard.complianceStatus === "Compliant").length || 0;
  const nonCompliantCount =
    comparisonData?.filter((standard) => standard.complianceStatus === "Non-Compliant").length || 0;
  const reportingDisabledCount =
    comparisonData?.filter((standard) => standard.complianceStatus === "Reporting Disabled")
      .length || 0;
  const overriddenCount =
    comparisonData?.filter((standard) => standard.complianceStatus === "Overridden").length || 0;

  // Calculate license-related metrics
  const missingLicenseCount =
    comparisonData?.filter((standard) => {
      const tenantValue = standard.currentTenantValue?.Value || standard.currentTenantValue;
      return typeof tenantValue === "string" && tenantValue.startsWith("License Missing:");
    }).length || 0;

  const nonCompliantWithLicenseCount =
    comparisonData?.filter((standard) => {
      const tenantValue = standard.currentTenantValue?.Value || standard.currentTenantValue;
      return (
        standard.complianceStatus === "Non-Compliant" &&
        !(typeof tenantValue === "string" && tenantValue.startsWith("License Missing:"))
      );
    }).length || 0;

  const nonCompliantWithoutLicenseCount =
    comparisonData?.filter((standard) => {
      const tenantValue = standard.currentTenantValue?.Value || standard.currentTenantValue;
      return (
        standard.complianceStatus === "Non-Compliant" &&
        typeof tenantValue === "string" &&
        tenantValue.startsWith("License Missing:")
      );
    }).length || 0;

  const compliancePercentage =
    allCount > 0
      ? Math.round(
          (compliantCount / (allCount - reportingDisabledCount - overriddenCount || 1)) * 100,
        )
      : 0;

  const missingLicensePercentage =
    allCount > 0
      ? Math.round(
          (missingLicenseCount / (allCount - reportingDisabledCount - overriddenCount || 1)) * 100,
        )
      : 0;

  // Combined score: compliance percentage + missing license percentage
  // This represents the total "addressable" compliance (compliant + could be compliant if licensed)
  const combinedScore = compliancePercentage + missingLicensePercentage;

  // Simple filter for all templates (no type filtering)
  const templateOptions = templates
    ? templates.map((template) => ({
        label:
          template.displayName ||
          template.templateName ||
          template.name ||
          `Template ${template.GUID}`,
        value: template.GUID,
      }))
    : [];

  // Find currently selected template
  const selectedTemplateOption =
    templateId && selectedTemplate
      ? {
          label:
            selectedTemplate.displayName ||
            selectedTemplate.templateName ||
            selectedTemplate.name ||
            `Template ${selectedTemplate.GUID}`,
          value: selectedTemplate.GUID,
        }
      : null;

  // Effect to refetch APIs when templateId changes (needed for shallow routing)
  useEffect(() => {
    if (templateId) {
      comparisonApi.refetch();
    }
  }, [templateId]);

  // Prepare title and subtitle for HeaderedTabbedLayout
  const title = selectedTemplate?.templateName || selectedTemplate?.displayName || "Tenant Report";

  const subtitle = [];

  // Actions for the header
  const actions = [
    ...createDriftManagementActions({
      templateId,
      templateType: selectedTemplate?.type || "classic",
      showEditTemplate: true,
      onRefresh: () => {
        comparisonApi.refetch();
        templateDetails.refetch();
      },
      currentTenant,
    }),
  ];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      backUrl="/tenant/standards"
      actions={actions}
      actionsData={{}}
      isFetching={comparisonApi.isFetching || templateDetails.isFetching}
    >
      <CippHead title={title} />
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {comparisonApi.isFetching && (
          <>
            {[1, 2, 3].map((item) => (
              <Grid container spacing={3} key={item} sx={{ mb: 4 }}>
                <Grid size={12}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2, px: 1 }}
                  >
                    <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" spacing={2}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Skeleton variant="text" width={200} height={32} />
                    </Stack>
                    <Skeleton variant="text" width={100} height={24} />
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: "100%" }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ p: 3 }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        alignItems="center"
                        spacing={3}
                      >
                        <Skeleton variant="circular" width={40} height={40} />
                        <Stack>
                          <Skeleton variant="text" width={150} height={32} />
                          <Skeleton variant="text" width={120} height={24} sx={{ mt: 1 }} />
                        </Stack>
                      </Stack>
                    </Stack>
                    <Divider />
                    <Box sx={{ p: 3 }}>
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="90%" height={20} />
                      <Skeleton variant="text" width="95%" height={20} />
                    </Box>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: "100%" }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ p: 3 }}
                    >
                      <Stack direction="row" alignItems="center" spacing={3}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Stack>
                          <Skeleton variant="text" width={150} height={32} />
                          <Skeleton variant="text" width={120} height={24} sx={{ mt: 1 }} />
                        </Stack>
                      </Stack>
                    </Stack>
                    <Divider />
                    <Box sx={{ p: 3 }}>
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="85%" height={20} />
                      <Skeleton variant="text" width="90%" height={20} />
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            ))}
          </>
        )}
        {!comparisonApi.isFetching && (
          <>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                displayPrint: "none", // Hide filters in print view
                flexShrink: 0,
                mt: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: "wrap" }}>
                <CippAutoComplete
                  options={templateOptions}
                  label="Template"
                  multiple={false}
                  creatable={false}
                  isFetching={templateDetails.isFetching}
                  defaultValue={selectedTemplateOption}
                  value={selectedTemplateOption}
                  onChange={(selectedTemplate) => {
                    const query = { ...router.query };
                    if (selectedTemplate && selectedTemplate.value) {
                      query.templateId = selectedTemplate.value;
                    } else {
                      delete query.templateId;
                    }
                    router.replace(
                      {
                        pathname: router.pathname,
                        query: query,
                      },
                      undefined,
                      { shallow: true },
                    );
                  }}
                  sx={{ width: 300 }}
                  placeholder="Select template..."
                />
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
                {templateId && (
                  <CippApiLogsDrawer
                    standardFilter={templateId}
                    buttonText="Logs"
                    title="Standard Logs"
                    variant="outlined"
                    tenantFilter={currentTenant}
                  />
                )}
              </Stack>
              <ButtonGroup variant="outlined" color="primary">
                <Button disabled={true} color="primary">
                  <SvgIcon fontSize="small">
                    <FilterAlt />
                  </SvgIcon>
                </Button>
                <Button
                  onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                  endIcon={<ArrowDropDown />}
                >
                  {filter === "all" && `All Standards (${allCount})`}
                  {filter === "compliant" && `Compliant (${compliantCount})`}
                  {filter === "nonCompliant" && `Non-Compliant (${nonCompliantCount})`}
                  {filter === "overridden" && `Overridden (${overriddenCount})`}
                  {filter === "nonCompliantWithLicense" &&
                    `Non-Compliant (License available) (${nonCompliantWithLicenseCount})`}
                  {filter === "nonCompliantWithoutLicense" &&
                    `Non-Compliant (License not available) (${nonCompliantWithoutLicenseCount})`}
                </Button>
              </ButtonGroup>
            </Stack>
            {selectedTemplate && (
              <Stack direction="row" spacing={1} sx={{ mt: 2, displayPrint: "none" }}>
                {selectedTemplate?.runManually && (
                  <Chip
                    label="Run Manually"
                    size="small"
                    color="warning"
                    variant="outlined"
                    icon={
                      <SvgIcon fontSize="small">
                        <Schedule />
                      </SvgIcon>
                    }
                  />
                )}
                <Chip
                  icon={
                    <SvgIcon fontSize="small">
                      <FactCheck />
                    </SvgIcon>
                  }
                  label={`${compliancePercentage}% Compliant`}
                  variant="outlined"
                  size="small"
                  color={
                    compliancePercentage === 100
                      ? "success"
                      : compliancePercentage >= 50
                        ? "warning"
                        : "error"
                  }
                />
                <Chip
                  label={`${missingLicensePercentage}% Missing License`}
                  variant="outlined"
                  size="small"
                  color={
                    missingLicensePercentage === 0
                      ? "success"
                      : missingLicensePercentage <= 25
                        ? "warning"
                        : "error"
                  }
                />
                <Chip
                  label={`${combinedScore}% Combined`}
                  variant="outlined"
                  size="small"
                  color={
                    combinedScore >= 80 ? "success" : combinedScore >= 60 ? "warning" : "error"
                  }
                />
              </Stack>
            )}
            <Menu
              anchorEl={filterMenuAnchor}
              open={Boolean(filterMenuAnchor)}
              onClose={() => setFilterMenuAnchor(null)}
            >
              <MenuItem
                selected={filter === "all"}
                onClick={() => {
                  setFilter("all");
                  setFilterMenuAnchor(null);
                }}
              >
                All ({allCount})
              </MenuItem>
              <MenuItem
                selected={filter === "compliant"}
                onClick={() => {
                  setFilter("compliant");
                  setFilterMenuAnchor(null);
                }}
              >
                Compliant ({compliantCount})
              </MenuItem>
              <MenuItem
                selected={filter === "nonCompliant"}
                onClick={() => {
                  setFilter("nonCompliant");
                  setFilterMenuAnchor(null);
                }}
              >
                Non-Compliant ({nonCompliantCount})
              </MenuItem>
              <MenuItem
                selected={filter === "overridden"}
                onClick={() => {
                  setFilter("overridden");
                  setFilterMenuAnchor(null);
                }}
              >
                Overridden ({overriddenCount})
              </MenuItem>
              <MenuItem
                selected={filter === "nonCompliantWithLicense"}
                onClick={() => {
                  setFilter("nonCompliantWithLicense");
                  setFilterMenuAnchor(null);
                }}
              >
                Non-Compliant (License available) ({nonCompliantWithLicenseCount})
              </MenuItem>
              <MenuItem
                selected={filter === "nonCompliantWithoutLicense"}
                onClick={() => {
                  setFilter("nonCompliantWithoutLicense");
                  setFilterMenuAnchor(null);
                }}
              >
                Non-Compliant (License not available) ({nonCompliantWithoutLicenseCount})
              </MenuItem>
            </Menu>
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                mt: 2,
                minHeight: 0,
              }}
            >
              {comparisonApi.isError && (
                <Card sx={{ mb: 4, p: 3, borderRadius: 2, boxShadow: 2 }}>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    Error fetching comparison data
                  </Alert>
                  <Typography variant="body2">
                    There was an error retrieving the comparison data. Please try running the report
                    again by clicking the "Run Report Once" button above.
                  </Typography>
                  {comparisonApi.error && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: "background.default",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="caption" component="pre" sx={{ whiteSpace: "pre-wrap" }}>
                        {comparisonApi.error.message ||
                          JSON.stringify(comparisonApi.error, null, 2)}
                      </Typography>
                    </Box>
                  )}
                </Card>
              )}

              {comparisonApi.isSuccess &&
                (!comparisonApi.data || comparisonApi.data.length === 0) && (
                  <Card sx={{ mb: 4, p: 3, borderRadius: 2, boxShadow: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      No comparison data is available. This might be because:
                    </Alert>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • The tenant has not been scanned yet
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • The template has no standards configured
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        • There was an issue with the comparison
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      Try running the report by clicking the "Run Report Once" button above.
                    </Typography>
                  </Card>
                )}

              {filteredGroupedStandards && Object.keys(filteredGroupedStandards).length === 0 && (
                <Card sx={{ mb: 4, p: 3, borderRadius: 2, boxShadow: 2 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No standards match the selected filter criteria or search query.
                  </Alert>
                  <Typography variant="body2">
                    Try selecting a different filter or modifying the search query.
                  </Typography>
                </Card>
              )}

              {Object.keys(filteredGroupedStandards).map((category) => (
                <React.Fragment key={category}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
                    {category}
                  </Typography>

                  {filteredGroupedStandards[category].map((standard, index) => (
                    <Grid container spacing={3} key={index} sx={{ mb: 4, pr: 2 }}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ height: "100%", borderRadius: 2, boxShadow: 2 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ p: 3 }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ width: "100%" }}
                            >
                              <Stack direction="row" alignItems="center" spacing={3}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    minWidth: 40,
                                    minHeight: 40,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    bgcolor:
                                      standard.complianceStatus === "Compliant"
                                        ? "success.main"
                                        : standard.complianceStatus === "Overridden"
                                          ? "warning.main"
                                          : standard.complianceStatus === "Reporting Disabled"
                                            ? "grey.500"
                                            : "error.main",
                                  }}
                                >
                                  {standard.complianceStatus === "Compliant" ? (
                                    <CheckCircle sx={{ color: "white" }} />
                                  ) : standard.complianceStatus === "Overridden" ? (
                                    <Info sx={{ color: "white" }} />
                                  ) : standard.complianceStatus === "Reporting Disabled" ? (
                                    <Info sx={{ color: "white" }} />
                                  ) : (
                                    <Cancel sx={{ color: "white" }} />
                                  )}
                                </Box>
                                <Stack sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      wordBreak: "break-word",
                                      overflowWrap: "break-word",
                                      hyphens: "auto",
                                    }}
                                  >
                                    {standard?.standardName}
                                  </Typography>
                                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                                    {standard?.templateActions &&
                                    standard.templateActions.length > 0 ? (
                                      <>
                                        {standard.templateActions.map((action, idx) => {
                                          const actionLabel =
                                            typeof action === "object"
                                              ? action?.label || action?.value || "Unknown"
                                              : action;
                                          const actionValue =
                                            typeof action === "object" ? action?.value : action;
                                          const isRemediate =
                                            actionLabel === "Remediate" ||
                                            actionLabel === "remediate";

                                          return (
                                            <Chip
                                              key={idx}
                                              label={actionLabel}
                                              size="small"
                                              color={isRemediate ? "success" : "primary"}
                                              variant="outlined"
                                              icon={
                                                <SvgIcon>
                                                  {actionValue === "Report" && <Assignment />}
                                                  {actionValue === "warn" && (
                                                    <NotificationImportant />
                                                  )}
                                                  {actionValue === "Remediate" && <Construction />}
                                                </SvgIcon>
                                              }
                                            />
                                          );
                                        })}
                                        {standard?.autoRemediate && (
                                          <Chip
                                            label="Auto-Remediate"
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                            sx={{ px: 1 }}
                                            icon={<Construction />}
                                          />
                                        )}
                                      </>
                                    ) : (
                                      <Chip
                                        label="Standard"
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                        sx={{ px: 2 }}
                                      />
                                    )}
                                  </Box>
                                </Stack>
                              </Stack>
                            </Stack>
                          </Stack>
                          <Divider />
                          <Box sx={{ p: 3 }}>
                            {/* Show Expected Configuration with property-by-property breakdown */}
                            {standard.currentTenantValue?.ExpectedValue !== undefined ? (
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 600,
                                    color: "text.secondary",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                    display: "block",
                                    mb: 2,
                                  }}
                                >
                                  Expected Configuration
                                </Typography>
                                {typeof standard.currentTenantValue.ExpectedValue === "object" &&
                                standard.currentTenantValue.ExpectedValue !== null ? (
                                  <Stack spacing={2}>
                                    {Object.entries(standard.currentTenantValue.ExpectedValue).map(
                                      ([key, val]) => (
                                        <Box key={key}>
                                          <Typography
                                            variant="subtitle2"
                                            sx={{
                                              fontWeight: 600,
                                              mb: 1,
                                              color: "primary.main",
                                            }}
                                          >
                                            {key}
                                          </Typography>
                                          <Box
                                            sx={{
                                              p: 1.5,
                                              bgcolor: "primary.lighter",
                                              borderRadius: 1,
                                              border: "1px solid",
                                              borderColor: "primary.main",
                                            }}
                                          >
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontFamily: "monospace",
                                                fontSize: "0.8125rem",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                              }}
                                            >
                                              {val !== undefined
                                                ? JSON.stringify(val, null, 2)
                                                : "Not set"}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      ),
                                    )}
                                  </Stack>
                                ) : (
                                  <Box
                                    sx={{
                                      p: 1.5,
                                      bgcolor: "primary.lighter",
                                      borderRadius: 1,
                                      border: "1px solid",
                                      borderColor: "primary.main",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontFamily: "monospace",
                                        fontSize: "0.8125rem",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {String(standard.currentTenantValue.ExpectedValue)}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            ) : (
                              <Alert severity="info">
                                This data has not yet been collected. Collect the data by pressing
                                the report button on the top of the page.
                              </Alert>
                            )}

                            <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
                              <Chip
                                label={standard.standardImpact || "Medium Impact"}
                                size="small"
                                color={
                                  standard.standardImpactColour === "info"
                                    ? "info"
                                    : standard.standardImpactColour === "warning"
                                      ? "warning"
                                      : "error"
                                }
                                sx={{ mr: 1 }}
                              />
                            </Box>
                          </Box>
                        </Card>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ height: "100%", borderRadius: 2, boxShadow: 2 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ p: 3 }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ width: "100%" }}
                            >
                              <Stack direction="row" alignItems="center" spacing={3}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "primary.main",
                                  }}
                                >
                                  <Microsoft sx={{ color: "white" }} />
                                </Box>
                                <Stack>
                                  <Typography variant="h6">{currentTenant}</Typography>
                                  <Box>
                                    <Chip
                                      label="Current Tenant"
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                      sx={{ mt: 1, px: 2 }}
                                    />
                                  </Box>
                                </Stack>
                              </Stack>
                              <Stack spacing={1}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    width: "100%",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      backgroundColor:
                                        standard.complianceStatus === "Compliant"
                                          ? "success.main"
                                          : standard.complianceStatus === "Overridden"
                                            ? "warning.main"
                                            : standard.complianceStatus === "Reporting Disabled"
                                              ? "grey.500"
                                              : "error.main",
                                      borderRadius: "50%",
                                      width: 8,
                                      height: 8,
                                      mr: 1,
                                    }}
                                  />
                                  <Typography variant="body2" sx={{ mr: 1 }}>
                                    {standard.complianceStatus}
                                  </Typography>
                                </Box>
                                {standard.currentTenantValue?.LastRefresh && (
                                  <Chip
                                    icon={
                                      <SvgIcon fontSize="small">
                                        <ClockIcon />
                                      </SvgIcon>
                                    }
                                    size="small"
                                    label={`${new Date(
                                      standard.currentTenantValue.LastRefresh,
                                    ).toLocaleString()}`}
                                    variant="outlined"
                                  />
                                )}
                              </Stack>
                            </Stack>
                          </Stack>
                          <Divider />
                          <Box sx={{ p: 3 }}>
                            {/* Existing tenant comparison content */}
                            {typeof standard.currentTenantValue?.Value === "object" &&
                            standard.currentTenantValue?.Value !== null ? (
                              <Box
                                sx={{
                                  p: 2,
                                  bgcolor: "background.default",
                                  borderRadius: 1,
                                  border: "1px solid",
                                  borderColor: "divider",
                                }}
                              >
                                {standard.complianceStatus === "Reporting Disabled" ? (
                                  <Alert severity="info" sx={{ mt: 1 }}>
                                    Reporting is disabled for this standard in the template
                                    configuration.
                                  </Alert>
                                ) : (
                                  <>
                                    {standard.complianceStatus === "Overridden" ? (
                                      <Alert severity="warning" sx={{ mb: 2 }}>
                                        This setting is configured by template:{" "}
                                        {standard.overridingTemplateName ||
                                          standard.overridingTemplateId}
                                      </Alert>
                                    ) : standard.complianceStatus === "Compliant" ? (
                                      <>
                                        {/* Show Current value property-by-property for compliant standards */}
                                        {standard.currentTenantValue?.CurrentValue !== undefined ? (
                                          typeof standard.currentTenantValue.CurrentValue ===
                                            "object" &&
                                          standard.currentTenantValue.CurrentValue !== null ? (
                                            <Stack spacing={2}>
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  fontWeight: 600,
                                                  color: "text.secondary",
                                                  textTransform: "uppercase",
                                                  letterSpacing: 0.5,
                                                }}
                                              >
                                                Current Configuration
                                              </Typography>
                                              {Object.entries(
                                                standard.currentTenantValue.CurrentValue,
                                              ).map(([key, val]) => (
                                                <Box key={key}>
                                                  <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                      fontWeight: 600,
                                                      mb: 1,
                                                      color: "success.main",
                                                    }}
                                                  >
                                                    {key}
                                                  </Typography>
                                                  <Box
                                                    sx={{
                                                      p: 1.5,
                                                      bgcolor: "success.lighter",
                                                      borderRadius: "12px",
                                                      border: "2px solid",
                                                      borderColor: "success.main",
                                                      position: "relative",
                                                    }}
                                                  >
                                                    <Box
                                                      sx={{
                                                        position: "absolute",
                                                        top: -8,
                                                        right: -8,
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: "50%",
                                                        bgcolor: "success.main",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                      }}
                                                    >
                                                      <Check
                                                        sx={{ color: "white", fontSize: 16 }}
                                                      />
                                                    </Box>
                                                    <Typography
                                                      variant="body2"
                                                      sx={{
                                                        fontFamily: "monospace",
                                                        fontSize: "0.8125rem",
                                                        whiteSpace: "pre-wrap",
                                                        wordBreak: "break-word",
                                                        color: "success.dark",
                                                      }}
                                                    >
                                                      {val !== undefined
                                                        ? JSON.stringify(val, null, 2)
                                                        : "Not set"}
                                                    </Typography>
                                                  </Box>
                                                </Box>
                                              ))}
                                            </Stack>
                                          ) : (
                                            <Box sx={{ mt: 2 }}>
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  fontWeight: 600,
                                                  color: "text.secondary",
                                                  textTransform: "uppercase",
                                                  letterSpacing: 0.5,
                                                  display: "block",
                                                  mb: 1,
                                                }}
                                              >
                                                Current Configuration
                                              </Typography>
                                              <Box
                                                sx={{
                                                  p: 1.5,
                                                  bgcolor: "success.lighter",
                                                  borderRadius: "12px",
                                                  border: "2px solid",
                                                  borderColor: "success.main",
                                                }}
                                              >
                                                <Typography
                                                  variant="body2"
                                                  sx={{
                                                    fontFamily: "monospace",
                                                    fontSize: "0.8125rem",
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word",
                                                    color: "success.dark",
                                                  }}
                                                >
                                                  {String(standard.currentTenantValue.CurrentValue)}
                                                </Typography>
                                              </Box>
                                            </Box>
                                          )
                                        ) : null}
                                      </>
                                    ) : (
                                      <>
                                        {standard.currentTenantValue?.Value === false && (
                                          <Alert severity="warning" sx={{ mb: 2 }}>
                                            This setting is not configured correctly
                                          </Alert>
                                        )}
                                        {/* Show Current value property-by-property for non-compliant standards */}
                                        {standard.currentTenantValue?.CurrentValue !== undefined &&
                                          (typeof standard.currentTenantValue.CurrentValue ===
                                            "object" &&
                                          standard.currentTenantValue.CurrentValue !== null ? (
                                            <Stack
                                              spacing={2}
                                              sx={{
                                                mt:
                                                  standard.currentTenantValue?.Value === false
                                                    ? 0
                                                    : 2,
                                              }}
                                            >
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  fontWeight: 600,
                                                  color: "text.secondary",
                                                  textTransform: "uppercase",
                                                  letterSpacing: 0.5,
                                                }}
                                              >
                                                Current Configuration
                                              </Typography>
                                              {Object.entries(
                                                standard.currentTenantValue.CurrentValue,
                                              ).map(([key, val]) => (
                                                <Box key={key}>
                                                  <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                      fontWeight: 600,
                                                      mb: 1,
                                                      color: "warning.main",
                                                    }}
                                                  >
                                                    {key}
                                                  </Typography>
                                                  <Box
                                                    sx={{
                                                      p: 1.5,
                                                      bgcolor: "action.hover",
                                                      borderRadius: 1,
                                                      border: "1px solid",
                                                      borderColor: "divider",
                                                    }}
                                                  >
                                                    <Typography
                                                      variant="body2"
                                                      sx={{
                                                        fontFamily: "monospace",
                                                        fontSize: "0.8125rem",
                                                        whiteSpace: "pre-wrap",
                                                        wordBreak: "break-word",
                                                      }}
                                                    >
                                                      {val !== undefined
                                                        ? JSON.stringify(val, null, 2)
                                                        : "Not set"}
                                                    </Typography>
                                                  </Box>
                                                </Box>
                                              ))}
                                            </Stack>
                                          ) : (
                                            <Box
                                              sx={{
                                                mt:
                                                  standard.currentTenantValue?.Value === false
                                                    ? 0
                                                    : 2,
                                                mb: 2,
                                              }}
                                            >
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  fontWeight: 600,
                                                  color: "text.secondary",
                                                  textTransform: "uppercase",
                                                  letterSpacing: 0.5,
                                                  display: "block",
                                                  mb: 1,
                                                }}
                                              >
                                                Current Configuration
                                              </Typography>
                                              <Box
                                                sx={{
                                                  p: 1.5,
                                                  bgcolor: "action.hover",
                                                  borderRadius: 1,
                                                  border: "1px solid",
                                                  borderColor: "divider",
                                                }}
                                              >
                                                <Typography
                                                  variant="body2"
                                                  sx={{
                                                    fontFamily: "monospace",
                                                    fontSize: "0.8125rem",
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word",
                                                  }}
                                                >
                                                  {String(standard.currentTenantValue.CurrentValue)}
                                                </Typography>
                                              </Box>
                                            </Box>
                                          ))}
                                      </>
                                    )}

                                    {/* Only show values if they're not simple true/false that's already covered by the alerts above */}
                                    {!(
                                      standard.complianceStatus === "Compliant" &&
                                      (standard.currentTenantValue?.Value === true ||
                                        standard.currentTenantValue?.Value === false)
                                    ) &&
                                      Object.entries(standard.currentTenantValue)
                                        .filter(
                                          ([key]) =>
                                            key !== "LastRefresh" &&
                                            key !== "CurrentValue" &&
                                            key !== "ExpectedValue" &&
                                            // Skip showing the Value field separately if it's just true/false
                                            !(
                                              key === "Value" &&
                                              (standard.currentTenantValue?.Value === true ||
                                                standard.currentTenantValue?.Value === false)
                                            ),
                                        )
                                        .map(([key, value]) => {
                                          const actualValue = key === "Value" ? value : value;

                                          const standardValueForKey =
                                            standard.standardValue &&
                                            typeof standard.standardValue === "object"
                                              ? standard.standardValue[key]
                                              : undefined;

                                          const isDifferent =
                                            standardValueForKey !== undefined &&
                                            JSON.stringify(actualValue) !==
                                              JSON.stringify(standardValueForKey);

                                          // Format the display value
                                          let displayValue;
                                          if (typeof value === "object" && value !== null) {
                                            displayValue =
                                              value?.label || JSON.stringify(value, null, 2);
                                          } else if (value === true) {
                                            displayValue = "Enabled";
                                          } else if (value === false) {
                                            displayValue = "Disabled";
                                          } else {
                                            displayValue = String(value);
                                          }

                                          return (
                                            <Box
                                              key={key}
                                              sx={{ display: "flex", mb: 0.5, flexWrap: "wrap" }}
                                            >
                                              <Typography
                                                variant="body2"
                                                sx={{ fontWeight: "medium", mr: 1, flexShrink: 0 }}
                                              >
                                                {key}:
                                              </Typography>
                                              <Typography
                                                variant="body2"
                                                component="pre"
                                                sx={{
                                                  color:
                                                    standard.complianceStatus === "Compliant"
                                                      ? "success.main"
                                                      : isDifferent
                                                        ? "error.main"
                                                        : "inherit",
                                                  fontWeight:
                                                    standard.complianceStatus === "Non-Compliant" &&
                                                    isDifferent
                                                      ? "medium"
                                                      : "inherit",
                                                  wordBreak: "break-word",
                                                  overflowWrap: "break-word",
                                                  whiteSpace: "pre-wrap",
                                                  flex: 1,
                                                  minWidth: 0,
                                                  fontFamily:
                                                    typeof value === "object" &&
                                                    value !== null &&
                                                    !value?.label
                                                      ? "monospace"
                                                      : "inherit",
                                                  fontSize:
                                                    typeof value === "object" &&
                                                    value !== null &&
                                                    !value?.label
                                                      ? "0.75rem"
                                                      : "inherit",
                                                  m: 0,
                                                }}
                                              >
                                                {displayValue}
                                              </Typography>
                                            </Box>
                                          );
                                        })}
                                  </>
                                )}
                              </Box>
                            ) : (
                              <Typography
                                variant="body1"
                                sx={{
                                  whiteSpace: "pre-wrap",
                                  color:
                                    standard.complianceStatus === "Compliant"
                                      ? "success.main"
                                      : standard.complianceStatus === "Overridden"
                                        ? "warning.main"
                                        : standard.complianceStatus === "Reporting Disabled"
                                          ? "text.secondary"
                                          : "error.main",
                                  fontWeight:
                                    standard.complianceStatus === "Non-Compliant"
                                      ? "medium"
                                      : "inherit",
                                }}
                              >
                                {standard.complianceStatus === "Reporting Disabled" ? (
                                  <Alert severity="info" sx={{ mt: 1 }}>
                                    Reporting is disabled for this standard in the template
                                    configuration.
                                  </Alert>
                                ) : standard.complianceStatus === "Overridden" ? (
                                  <Alert severity="warning" sx={{ mt: 1 }}>
                                    This setting is configured by template:{" "}
                                    {standard.overridingTemplateName ||
                                      standard.overridingTemplateId}
                                  </Alert>
                                ) : standard.complianceStatus === "Compliant" ? (
                                  <>
                                    {/* Show Current value property-by-property in card view */}
                                    {standard.currentTenantValue?.CurrentValue !== undefined ? (
                                      typeof standard.currentTenantValue.CurrentValue ===
                                        "object" &&
                                      standard.currentTenantValue.CurrentValue !== null ? (
                                        <Stack spacing={2}>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontWeight: 600,
                                              color: "text.secondary",
                                              textTransform: "uppercase",
                                              letterSpacing: 0.5,
                                            }}
                                          >
                                            Current Configuration
                                          </Typography>
                                          {Object.entries(
                                            standard.currentTenantValue.CurrentValue,
                                          ).map(([key, val]) => (
                                            <Box key={key}>
                                              <Typography
                                                variant="subtitle2"
                                                sx={{
                                                  fontWeight: 600,
                                                  mb: 1,
                                                  color: "success.main",
                                                }}
                                              >
                                                {key}
                                              </Typography>
                                              <Box
                                                sx={{
                                                  p: 1.5,
                                                  bgcolor: "success.lighter",
                                                  borderRadius: "12px",
                                                  border: "2px solid",
                                                  borderColor: "success.main",
                                                  position: "relative",
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    position: "absolute",
                                                    top: -8,
                                                    right: -8,
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: "50%",
                                                    bgcolor: "success.main",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                  }}
                                                >
                                                  <Check sx={{ color: "white", fontSize: 16 }} />
                                                </Box>
                                                <Typography
                                                  variant="body2"
                                                  sx={{
                                                    fontFamily: "monospace",
                                                    fontSize: "0.8125rem",
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word",
                                                    color: "success.dark",
                                                  }}
                                                >
                                                  {val !== undefined
                                                    ? JSON.stringify(val, null, 2)
                                                    : "Not set"}
                                                </Typography>
                                              </Box>
                                            </Box>
                                          ))}
                                        </Stack>
                                      ) : (
                                        <Box sx={{ mt: 2 }}>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontWeight: 600,
                                              color: "text.secondary",
                                              textTransform: "uppercase",
                                              letterSpacing: 0.5,
                                              display: "block",
                                              mb: 1,
                                            }}
                                          >
                                            Current Configuration
                                          </Typography>
                                          <Box
                                            sx={{
                                              p: 1.5,
                                              bgcolor: "success.lighter",
                                              borderRadius: "12px",
                                              border: "2px solid",
                                              borderColor: "success.main",
                                            }}
                                          >
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontFamily: "monospace",
                                                fontSize: "0.8125rem",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                                color: "success.dark",
                                              }}
                                            >
                                              {String(standard.currentTenantValue.CurrentValue)}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      )
                                    ) : null}
                                  </>
                                ) : (
                                  <>
                                    {(standard.currentTenantValue?.Value === false ||
                                      standard.currentTenantValue === false) && (
                                      <Alert severity="warning" sx={{ mt: 1 }}>
                                        This setting is not configured correctly
                                      </Alert>
                                    )}
                                    {/* Show Current value property-by-property for non-compliant standards in card view */}
                                    {standard.currentTenantValue?.CurrentValue !== undefined ? (
                                      typeof standard.currentTenantValue.CurrentValue ===
                                        "object" &&
                                      standard.currentTenantValue.CurrentValue !== null ? (
                                        <Stack
                                          spacing={2}
                                          sx={{
                                            mt:
                                              standard.currentTenantValue?.Value === false ||
                                              standard.currentTenantValue === false
                                                ? 1
                                                : 2,
                                          }}
                                        >
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontWeight: 600,
                                              color: "text.secondary",
                                              textTransform: "uppercase",
                                              letterSpacing: 0.5,
                                            }}
                                          >
                                            Current Configuration
                                          </Typography>
                                          {Object.entries(
                                            standard.currentTenantValue.CurrentValue,
                                          ).map(([key, val]) => (
                                            <Box key={key}>
                                              <Typography
                                                variant="subtitle2"
                                                sx={{
                                                  fontWeight: 600,
                                                  mb: 1,
                                                  color: "warning.main",
                                                }}
                                              >
                                                {key}
                                              </Typography>
                                              <Box
                                                sx={{
                                                  p: 1.5,
                                                  bgcolor: "action.hover",
                                                  borderRadius: 1,
                                                  border: "1px solid",
                                                  borderColor: "divider",
                                                }}
                                              >
                                                <Typography
                                                  variant="body2"
                                                  sx={{
                                                    fontFamily: "monospace",
                                                    fontSize: "0.8125rem",
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word",
                                                  }}
                                                >
                                                  {val !== undefined
                                                    ? JSON.stringify(val, null, 2)
                                                    : "Not set"}
                                                </Typography>
                                              </Box>
                                            </Box>
                                          ))}
                                        </Stack>
                                      ) : (
                                        <Box
                                          sx={{
                                            mt:
                                              standard.currentTenantValue?.Value === false ||
                                              standard.currentTenantValue === false
                                                ? 1
                                                : 2,
                                          }}
                                        >
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontWeight: 600,
                                              color: "text.secondary",
                                              textTransform: "uppercase",
                                              letterSpacing: 0.5,
                                              display: "block",
                                              mb: 1,
                                            }}
                                          >
                                            Current Configuration
                                          </Typography>
                                          <Box
                                            sx={{
                                              p: 1.5,
                                              bgcolor: "action.hover",
                                              borderRadius: 1,
                                              border: "1px solid",
                                              borderColor: "divider",
                                            }}
                                          >
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontFamily: "monospace",
                                                fontSize: "0.8125rem",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                              }}
                                            >
                                              {String(standard.currentTenantValue.CurrentValue)}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      )
                                    ) : standard.currentTenantValue !== undefined &&
                                      standard.currentTenantValue?.Value !== true &&
                                      standard.currentTenantValue?.Value !== false ? (
                                      <Box sx={{ mt: 1 }}>
                                        {String(
                                          standard.currentTenantValue?.Value !== undefined
                                            ? standard.currentTenantValue?.Value
                                            : standard.currentTenantValue,
                                        )}
                                      </Box>
                                    ) : standard.currentTenantValue === undefined ||
                                      (standard.currentTenantValue?.Value === null &&
                                        standard.currentTenantValue?.CurrentValue === undefined &&
                                        standard.currentTenantValue?.ExpectedValue ===
                                          undefined) ? (
                                      <Alert severity="info" sx={{ mt: 1 }}>
                                        This setting is not configured, or data has not been
                                        collected. If you are getting this after data collection,
                                        the tenant might not be licensed for this feature
                                      </Alert>
                                    ) : null}
                                  </>
                                )}
                              </Typography>
                            )}
                          </Box>
                        </Card>
                      </Grid>

                      {standard.complianceDetails && (
                        <Grid size={12}>
                          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                            <Stack
                              direction="row"
                              alignItems="flex-start"
                              spacing={2}
                              sx={{ p: 3 }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "info.main",
                                }}
                              >
                                <Info />
                              </Box>
                              <Box
                                sx={{
                                  // Style markdown links to match CIPP theme
                                  "& a": {
                                    color: (theme) => theme.palette.primary.main,
                                    textDecoration: "underline",
                                    "&:hover": {
                                      textDecoration: "none",
                                    },
                                  },
                                  fontSize: "0.875rem",
                                  lineHeight: 1.43,
                                  "& p": {
                                    my: 0,
                                  },
                                  flex: 1,
                                }}
                              >
                                <ReactMarkdown
                                  components={{
                                    // Make links open in new tab with security attributes
                                    a: ({ href, children, ...props }) => (
                                      <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        {...props}
                                      >
                                        {children}
                                      </a>
                                    ),
                                    // Convert paragraphs to spans to avoid unwanted spacing
                                    p: ({ children }) => <span>{children}</span>,
                                  }}
                                >
                                  {standard.complianceDetails}
                                </ReactMarkdown>
                              </Box>
                            </Stack>
                          </Card>
                        </Grid>
                      )}
                    </Grid>
                  ))}
                </React.Fragment>
              ))}
            </Box>
          </>
        )}

        <CippApiDialog
          createDialog={runReportDialog}
          title="Run Standard Report"
          api={{
            ...runReportApi,
            data: {
              ...runReportApi.data,
              TemplateId: templateId,
            },
          }}
          relatedQueryKeys={["ListStandardsCompare"]}
        />
      </Box>
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
