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

  // Find the current template from standards data
  const currentTemplate = (standardsApi.data || []).find(
    (template) => template.GUID === templateId
  );
  const templateStandards = currentTemplate?.standards || {};
  const comparisonData = comparisonApi.data?.[0] || {};

  // Helper function to get status from comparison data with deviation status
  const getStatus = (standardKey, templateValue = null, templateType = null) => {
    const comparisonKey = `standards.${standardKey}`;
    const value = comparisonData[comparisonKey]?.Value;

    if (value === true) {
      return "Deployed";
    } else {
      // Check if there's drift data for this standard to get the deviation status
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

      return "Deviation - New";
    }
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

    return deviation?.standardDisplayName || null;
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

    // Check if this template has TemplateList-Tags and expand them
    if (
      template["TemplateList-Tags"]?.value &&
      template["TemplateList-Tags"]?.addedFields?.templates
    ) {
      console.log(
        "Found TemplateList-Tags for IntuneTemplate in policies-deployed:",
        template["TemplateList-Tags"]
      );
      console.log("Templates to expand:", template["TemplateList-Tags"].addedFields.templates);

      // Expand TemplateList-Tags into multiple template items
      template["TemplateList-Tags"].addedFields.templates.forEach(
        (expandedTemplate, expandedIndex) => {
          console.log("Expanding IntuneTemplate in policies-deployed:", expandedTemplate);
          const standardKey = `IntuneTemplate.${expandedTemplate.GUID}`;
          const driftDisplayName = getDisplayNameFromDrift(
            standardKey,
            expandedTemplate.GUID,
            "IntuneTemplate"
          );
          const packageTagName = template["TemplateList-Tags"].value;
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
        }
      );
    } else {
      // Regular TemplateList processing
      const standardKey = `IntuneTemplate.${template.TemplateList?.value}`;
      const driftDisplayName = getDisplayNameFromDrift(
        standardKey,
        template.TemplateList?.value,
        "IntuneTemplate"
      );
      const templateLabel = getTemplateLabel(template.TemplateList?.value, "IntuneTemplate");

      intunePolices.push({
        id: intunePolices.length + 1,
        name: driftDisplayName || `Intune - ${templateLabel}`,
        category: "Intune Template",
        platform: "Multi-Platform",
        status: getStatus(standardKey, template.TemplateList?.value, "IntuneTemplate"),
        lastModified: getLastRefresh(standardKey),
        assignedGroups: template.AssignTo || "N/A",
        templateValue: template.TemplateList?.value,
      });
    }
  });

  // Process Conditional Access Templates
  const conditionalAccessPolicies = [];
  (templateStandards.ConditionalAccessTemplate || []).forEach((template, index) => {
    console.log("Processing ConditionalAccessTemplate in policies-deployed:", template);

    // Check if this template has TemplateList-Tags and expand them
    if (
      template["TemplateList-Tags"]?.value &&
      template["TemplateList-Tags"]?.addedFields?.templates
    ) {
      console.log(
        "Found TemplateList-Tags for ConditionalAccessTemplate in policies-deployed:",
        template["TemplateList-Tags"]
      );
      console.log("Templates to expand:", template["TemplateList-Tags"].addedFields.templates);

      // Expand TemplateList-Tags into multiple template items
      template["TemplateList-Tags"].addedFields.templates.forEach(
        (expandedTemplate, expandedIndex) => {
          console.log(
            "Expanding ConditionalAccessTemplate in policies-deployed:",
            expandedTemplate
          );
          const standardKey = `ConditionalAccessTemplate.${expandedTemplate.GUID}`;
          const driftDisplayName = getDisplayNameFromDrift(
            standardKey,
            expandedTemplate.GUID,
            "ConditionalAccessTemplate"
          );
          const packageTagName = template["TemplateList-Tags"].value;
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
        }
      );
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
    onRefresh: () => {
      standardsApi.refetch();
      comparisonApi.refetch();
      driftApi.refetch();
    },
    currentTenant,
  });
  const title = "View Deployed Policies";
  const subtitle = [
    {
      icon: <Policy />,
      text: (
        <CippAutoComplete
          options={templateOptions}
          label="Select Template"
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
          sx={{ minWidth: 300 }}
          placeholder="Select a template..."
        />
      ),
    },
  ];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      actions={actions}
      actionsData={{}}
      backUrl="/tenant/standards/list-standards"
    >
      <CippHead title="Policies and Settings Deployed" />
      <Box sx={{ py: 2 }}>
        <Stack spacing={3}>
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
