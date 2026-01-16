import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useRouter } from "next/router";
import { Policy, Security, AdminPanelSettings, Devices, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import { HeaderedTabbedLayout } from "/src/layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions.json";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";
import { CippHead } from "/src/components/CippComponents/CippHead";
import { ApiGetCall } from "/src/api/ApiCall";
import standardsData from "/src/data/standards.json";
import { createDriftManagementActions } from "./driftManagementActions";
import { useSettings } from "../../../hooks/use-settings";
import { CippAutoComplete } from "../../../components/CippComponents/CippAutocomplete";
import { useEffect } from "react";

const PoliciesDeployedPage = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { templateId } = router.query;
  const tenantFilter = router.query.tenantFilter || userSettingsDefaults.tenantFilter;
  const currentTenant = userSettingsDefaults.currentTenant;

  // API call to get standards template data
  const standardsApi = ApiGetCall({
    url: "/api/listStandardTemplates",
    queryKey: "ListStandardsTemplates-Drift",
  });

  // API call to get standards comparison data
  const comparisonApi = ApiGetCall({
    url: "/api/ListStandardsCompare",
    data: {
      TemplateId: templateId,
      TenantFilter: tenantFilter,
      CompareToStandard: true,
    },
    queryKey: `StandardsCompare-${templateId}-${tenantFilter}`,
    enabled: !!templateId && !!tenantFilter,
  });

  // API call to get drift data for deviation statuses
  const driftApi = ApiGetCall({
    url: "/api/listTenantDrift",
    data: {
      tenantFilter: tenantFilter,
      standardsId: templateId,
    },
    queryKey: `TenantDrift-${templateId}-${tenantFilter}`,
    enabled: !!templateId && !!tenantFilter,
  });

  // API call to get all Intune templates for displayName lookup
  const intuneTemplatesApi = ApiGetCall({
    url: "/api/ListIntuneTemplates",
    queryKey: "ListIntuneTemplates",
  });

  // Find the current template from standards data
  const currentTemplate = (standardsApi.data || []).find(
    (template) => template.GUID === templateId
  );
  const templateStandards = currentTemplate?.standards || {};
  const comparisonData = comparisonApi.data?.[0] || {};

  // Helper function to get status from comparison data with deviation status
  const getStatus = (standardKey, templateValue = null, templateType = null) => {
    const comparisonKey = `standards.${standardKey}`;
    const comparisonItem = comparisonData[comparisonKey];
    const value = comparisonItem?.Value;

    // If value is true, it's deployed and compliant
    if (value === true) {
      return "Deployed";
    }

    // Check if ExpectedValue and CurrentValue match (like drift.js does)
    if (comparisonItem?.ExpectedValue && comparisonItem?.CurrentValue) {
      try {
        const expectedStr = JSON.stringify(comparisonItem.ExpectedValue);
        const currentStr = JSON.stringify(comparisonItem.CurrentValue);
        if (expectedStr === currentStr) {
          return "Deployed";
        }
      } catch (e) {
        console.error("Error comparing values:", e);
      }
    }

    // If value is explicitly false, it means not deployed (not a deviation)
    if (value === false) {
      return "Not Deployed";
    }

    // If value is null/undefined, check drift data for deviation status
    const driftData = Array.isArray(driftApi.data) ? driftApi.data : [];

    // For templates, we need to match against the full template path
    let searchKeys = [standardKey, `standards.${standardKey}`];

    // Add template-specific search keys
    if (templateValue && templateType) {
      searchKeys.push(
        `standards.${templateType}.${templateValue}`,
        `${templateType}.${templateValue}`,
        templateValue
      );
    }

    const deviation = driftData.find((item) =>
      searchKeys.some(
        (key) =>
          item.standardName === key ||
          item.policyName === key ||
          item.standardName?.includes(key) ||
          item.policyName?.includes(key)
      )
    );

    if (deviation && deviation.Status) {
      return `Deviation - ${deviation.Status}`;
    }

    // Only return "Deviation - New" if we have comparison data but value is null
    if (comparisonItem) {
      return "Deviation - New";
    }

    return "Not Configured";
  };

  // Helper function to get display name from drift data
  const getDisplayNameFromDrift = (standardKey, templateValue = null, templateType = null) => {
    const driftData = Array.isArray(driftApi.data) ? driftApi.data : [];

    // For templates, we need to match against the full template path
    let searchKeys = [standardKey, `standards.${standardKey}`];

    // Add template-specific search keys
    if (templateValue && templateType) {
      searchKeys.push(
        `standards.${templateType}.${templateValue}`,
        `${templateType}.${templateValue}`,
        templateValue
      );
    }

    const deviation = driftData.find((item) =>
      searchKeys.some(
        (key) =>
          item.standardName === key ||
          item.policyName === key ||
          item.standardName?.includes(key) ||
          item.policyName?.includes(key)
      )
    );

    // If found in drift data, return the display name
    if (deviation?.standardDisplayName) {
      return deviation.standardDisplayName;
    }

    // If not found in drift data and this is an Intune template, look it up in the Intune templates API
    if (templateType === "IntuneTemplate" && templateValue && intuneTemplatesApi.data) {
      const template = intuneTemplatesApi.data.find((t) => t.GUID === templateValue);
      if (template?.Displayname) {
        return template.Displayname;
      }
    }

    return null;
  };

  // Helper function to get last refresh date
  const getLastRefresh = (standardKey) => {
    const comparisonKey = `standards.${standardKey}`;
    const lastRefresh = comparisonData[comparisonKey]?.LastRefresh;
    return lastRefresh ? new Date(lastRefresh).toLocaleDateString() : "N/A";
  };

  // Helper function to get standard name from standards.json
  const getStandardName = (standardKey) => {
    const standardName = `standards.${standardKey}`;
    const standard = standardsData.find((s) => s.name === standardName);
    return standard?.label || standardKey.replace(/([A-Z])/g, " $1").trim();
  };

  // Helper function to get template label from standards API data
  const getTemplateLabel = (templateValue, templateType) => {
    if (!templateValue || !currentTemplate) return "Unknown Template";

    // Search through all templates in the current template data
    const allTemplates = currentTemplate.standards || {};

    // Look for the template in the specific type array
    if (allTemplates[templateType] && Array.isArray(allTemplates[templateType])) {
      const template = allTemplates[templateType].find(
        (t) => t.TemplateList?.value === templateValue
      );
      if (template?.TemplateList?.label) {
        return template.TemplateList.label;
      }
    }

    // If not found in the specific type, search through all template types
    for (const [key, templates] of Object.entries(allTemplates)) {
      if (Array.isArray(templates)) {
        const template = templates.find((t) => t.TemplateList?.value === templateValue);
        if (template?.TemplateList?.label) {
          return template.TemplateList.label;
        }
      }
    }

    return "Unknown Template";
  };

  // Process Security Standards (everything NOT IntuneTemplates or ConditionalAccessTemplates)
  const deployedStandards = Object.entries(templateStandards)
    .filter(([key]) => key !== "IntuneTemplate" && key !== "ConditionalAccessTemplate")
    .map(([key, value], index) => ({
      id: index + 1,
      name: getStandardName(key),
      category: "Security Standard",
      status: getStatus(key),
      lastModified: getLastRefresh(key),
      standardKey: key,
    }));

  // Process Intune Templates
  const intunePolices = [];
  (templateStandards.IntuneTemplate || []).forEach((template, index) => {
    console.log("Processing IntuneTemplate in policies-deployed:", template);

    // Check if this template has TemplateList-Tags (try both property formats)
    const templateListTags = template["TemplateList-Tags"] || template.TemplateListTags;

    // Check if this template has TemplateList-Tags and expand them
    if (templateListTags?.value && templateListTags?.addedFields?.templates) {
      console.log(
        "Found TemplateList-Tags for IntuneTemplate in policies-deployed:",
        templateListTags
      );
      console.log("Templates to expand:", templateListTags.addedFields.templates);

      // Expand TemplateList-Tags into multiple template items
      templateListTags.addedFields.templates.forEach((expandedTemplate, expandedIndex) => {
        console.log("Expanding IntuneTemplate in policies-deployed:", expandedTemplate);
        const standardKey = `IntuneTemplate.${expandedTemplate.GUID}`;
        const driftDisplayName = getDisplayNameFromDrift(
          standardKey,
          expandedTemplate.GUID,
          "IntuneTemplate"
        );
        const packageTagName = templateListTags.value;
        const templateName =
          expandedTemplate.displayName || expandedTemplate.name || "Unknown Template";

        intunePolices.push({
          id: intunePolices.length + 1,
          name: `${driftDisplayName || templateName} (via ${packageTagName})`,
          category: "Intune Template",
          platform: "Multi-Platform",
          status: getStatus(standardKey, expandedTemplate.GUID, "IntuneTemplate"),
          lastModified: getLastRefresh(standardKey),
          assignedGroups: template.AssignTo || "N/A",
          templateValue: expandedTemplate.GUID,
        });
      });
    } else {
      // Regular TemplateList processing
      const templateGuid = template.TemplateList?.value;
      const standardKey = `IntuneTemplate.${templateGuid}`;
      const driftDisplayName = getDisplayNameFromDrift(standardKey, templateGuid, "IntuneTemplate");

      // Try multiple fallbacks for the name
      let templateName = driftDisplayName;
      if (!templateName) {
        const templateLabel = getTemplateLabel(templateGuid, "IntuneTemplate");
        if (templateLabel !== "Unknown Template") {
          templateName = `Intune - ${templateLabel}`;
        }
      }
      // If still no name, try looking up directly in intuneTemplatesApi by GUID
      if (!templateName && templateGuid && intuneTemplatesApi.data) {
        const intuneTemplate = intuneTemplatesApi.data.find((t) => t.GUID === templateGuid);
        if (intuneTemplate?.Displayname) {
          templateName = intuneTemplate.Displayname;
        }
      }
      // Final fallback
      if (!templateName) {
        templateName = `Intune - ${templateGuid || "Unknown Template"}`;
      }

      intunePolices.push({
        id: intunePolices.length + 1,
        name: templateName,
        category: "Intune Template",
        platform: "Multi-Platform",
        status: getStatus(standardKey, templateGuid, "IntuneTemplate"),
        lastModified: getLastRefresh(standardKey),
        assignedGroups: template.AssignTo || "N/A",
        templateValue: templateGuid,
      });
    }
  });

  // Add any templates from comparison data that weren't in template standards (e.g., from tags)
  // Check for IntuneTemplate entries in comparison data
  Object.keys(comparisonData).forEach((key) => {
    if (key.startsWith("standards.IntuneTemplate.")) {
      const guid = key.replace("standards.IntuneTemplate.", "");
      // Check if this GUID is already in our list
      const alreadyExists = intunePolices.some((p) => p.templateValue === guid);
      if (!alreadyExists && comparisonData[key]?.Value === true) {
        const standardKey = `IntuneTemplate.${guid}`;
        const driftDisplayName = getDisplayNameFromDrift(standardKey, guid, "IntuneTemplate");

        intunePolices.push({
          id: intunePolices.length + 1,
          name: driftDisplayName || `Intune - ${guid}`,
          category: "Intune Template",
          platform: "Multi-Platform",
          status: getStatus(standardKey, guid, "IntuneTemplate"),
          lastModified: getLastRefresh(standardKey),
          assignedGroups: "N/A",
          templateValue: guid,
        });
      }
    }
  });

  // Process Conditional Access Templates
  const conditionalAccessPolicies = [];
  (templateStandards.ConditionalAccessTemplate || []).forEach((template, index) => {
    console.log("Processing ConditionalAccessTemplate in policies-deployed:", template);

    // Check if this template has TemplateList-Tags (try both property formats)
    const templateListTags = template["TemplateList-Tags"] || template.TemplateListTags;

    // Check if this template has TemplateList-Tags and expand them
    if (templateListTags?.value && templateListTags?.addedFields?.templates) {
      console.log(
        "Found TemplateList-Tags for ConditionalAccessTemplate in policies-deployed:",
        templateListTags
      );
      console.log("Templates to expand:", templateListTags.addedFields.templates);

      // Expand TemplateList-Tags into multiple template items
      templateListTags.addedFields.templates.forEach((expandedTemplate, expandedIndex) => {
        console.log("Expanding ConditionalAccessTemplate in policies-deployed:", expandedTemplate);
        const standardKey = `ConditionalAccessTemplate.${expandedTemplate.GUID}`;
        const driftDisplayName = getDisplayNameFromDrift(
          standardKey,
          expandedTemplate.GUID,
          "ConditionalAccessTemplate"
        );
        const packageTagName = templateListTags.value;
        const templateName =
          expandedTemplate.displayName || expandedTemplate.name || "Unknown Template";

        conditionalAccessPolicies.push({
          id: conditionalAccessPolicies.length + 1,
          name: `${driftDisplayName || templateName} (via ${packageTagName})`,
          state: template.state || "Unknown",
          conditions: "Conditional Access Policy",
          controls: "Access Control",
          lastModified: getLastRefresh(standardKey),
          status: getStatus(standardKey, expandedTemplate.GUID, "ConditionalAccessTemplate"),
          templateValue: expandedTemplate.GUID,
        });
      });
    } else {
      // Regular TemplateList processing
      const standardKey = `ConditionalAccessTemplate.${template.TemplateList?.value}`;
      const driftDisplayName = getDisplayNameFromDrift(
        standardKey,
        template.TemplateList?.value,
        "ConditionalAccessTemplate"
      );
      const templateLabel = getTemplateLabel(
        template.TemplateList?.value,
        "ConditionalAccessTemplate"
      );

      conditionalAccessPolicies.push({
        id: conditionalAccessPolicies.length + 1,
        name: driftDisplayName || `Conditional Access - ${templateLabel}`,
        state: template.state || "Unknown",
        conditions: "Conditional Access Policy",
        controls: "Access Control",
        lastModified: getLastRefresh(standardKey),
        status: getStatus(standardKey, template.TemplateList?.value, "ConditionalAccessTemplate"),
        templateValue: template.TemplateList?.value,
      });
    }
  });

  // Add any CA templates from comparison data that weren't in template standards
  Object.keys(comparisonData).forEach((key) => {
    if (key.startsWith("standards.ConditionalAccessTemplate.")) {
      const guid = key.replace("standards.ConditionalAccessTemplate.", "");
      // Check if this GUID is already in our list
      const alreadyExists = conditionalAccessPolicies.some((p) => p.templateValue === guid);
      if (!alreadyExists && comparisonData[key]?.Value === true) {
        const standardKey = `ConditionalAccessTemplate.${guid}`;
        const driftDisplayName = getDisplayNameFromDrift(
          standardKey,
          guid,
          "ConditionalAccessTemplate"
        );

        conditionalAccessPolicies.push({
          id: conditionalAccessPolicies.length + 1,
          name: driftDisplayName || `Conditional Access - ${guid}`,
          state: "Unknown",
          conditions: "Conditional Access Policy",
          controls: "Access Control",
          lastModified: getLastRefresh(standardKey),
          status: getStatus(standardKey, guid, "ConditionalAccessTemplate"),
          templateValue: guid,
        });
      }
    }
  });

  // Simple filter for all templates (no type filtering)
  const templateOptions = standardsApi.data
    ? standardsApi.data.map((template) => ({
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
    templateId && templateOptions.length
      ? templateOptions.find((option) => option.value === templateId) || null
      : null;

  // Effect to refetch APIs when templateId changes (needed for shallow routing)
  useEffect(() => {
    if (templateId) {
      comparisonApi.refetch();
      driftApi.refetch();
    }
  }, [templateId]);

  const actions = createDriftManagementActions({
    templateId,
    templateType: currentTemplate?.type || "classic",
    showEditTemplate: true,
    onRefresh: () => {
      standardsApi.refetch();
      comparisonApi.refetch();
      driftApi.refetch();
    },
    currentTenant,
  });
  const title = "View Deployed Policies";
  const subtitle = [];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      actions={actions}
      actionsData={{}}
      backUrl="/tenant/standards"
    >
      <CippHead title="Policies and Settings Deployed" />
      <Box sx={{ py: 2 }}>
        {/* Filters Section */}
        <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
          <CippAutoComplete
            options={templateOptions}
            label="Template"
            multiple={false}
            creatable={false}
            isFetching={standardsApi.isFetching}
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
                { shallow: true }
              );
            }}
            sx={{ width: 300 }}
            placeholder="Select template..."
          />
        </Stack>

        <Stack spacing={3} sx={{ pr: 2 }}>
          {/* Standards Section */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box display="flex" alignItems="center" gap={1}>
                <Security color="primary" />
                <Typography variant="h6">Security Standards</Typography>
                <Chip label={deployedStandards.length} size="small" color="primary" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <CippDataTable
                title="Security Standards"
                data={deployedStandards}
                simpleColumns={["name", "category", "status", "lastModified"]}
                noCard={true}
                isFetching={
                  standardsApi.isFetching || comparisonApi.isFetching || driftApi.isFetching
                }
              />
            </AccordionDetails>
          </Accordion>

          {/* Intune Policies Section */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box display="flex" alignItems="center" gap={1}>
                <Devices color="primary" />
                <Typography variant="h6">Intune Policies</Typography>
                <Chip label={intunePolices.length} size="small" color="primary" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <CippDataTable
                title="Intune Templates"
                data={intunePolices}
                simpleColumns={[
                  "name",
                  "category",
                  "platform",
                  "status",
                  "lastModified",
                  "assignedGroups",
                ]}
                noCard={true}
                isFetching={
                  standardsApi.isFetching || comparisonApi.isFetching || driftApi.isFetching
                }
              />
            </AccordionDetails>
          </Accordion>

          {/* Conditional Access Policies Section */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box display="flex" alignItems="center" gap={1}>
                <AdminPanelSettings color="primary" />
                <Typography variant="h6">Conditional Access Policies</Typography>
                <Chip label={conditionalAccessPolicies.length} size="small" color="primary" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <CippDataTable
                title="Conditional Access Templates"
                data={conditionalAccessPolicies}
                simpleColumns={[
                  "name",
                  "state",
                  "status",
                  "conditions",
                  "controls",
                  "lastModified",
                ]}
                noCard={true}
                isFetching={
                  standardsApi.isFetching || comparisonApi.isFetching || driftApi.isFetching
                }
              />
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Box>
    </HeaderedTabbedLayout>
  );
};

PoliciesDeployedPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default PoliciesDeployedPage;
