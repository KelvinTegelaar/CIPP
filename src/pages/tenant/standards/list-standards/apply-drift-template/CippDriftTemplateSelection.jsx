import { Stack, Typography, Card, CardContent, Chip, Box } from "@mui/material";
import { CippWizardStepButtons } from "/src/components/CippWizard/CippWizardStepButtons";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { ApiGetCall } from "/src/api/ApiCall";
import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";

export const CippDriftTemplateSelection = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Watch for template selection changes
  const watchedTemplate = useWatch({
    control: formControl.control,
    name: "driftTemplate",
  });

  // API call to get drift standard templates
  const driftTemplates = ApiGetCall({
    url: "/api/listStandardTemplates",
    queryKey: "DriftStandardTemplates",
    data: {
      type: "drift", // Filter for drift templates only
    },
  });

  // Update selected template when watcher changes
  useEffect(() => {
    if (driftTemplates.isSuccess && watchedTemplate?.value) {
      const template = driftTemplates.data.find((t) => t.GUID === watchedTemplate.value);
      setSelectedTemplate(template);
    }
  }, [driftTemplates, watchedTemplate]);

  // Template summary component
  const TemplateSummary = ({ template }) => {
    if (!template) return null;

    const standardsCount = template.standards ? Object.keys(template.standards)?.length : 0;
    const tenantCount =
      template.tenantFilter === "AllTenants"
        ? "All Tenants"
        : Array.isArray(template.tenantFilter)
        ? template.tenantFilter?.length
        : 1;

    return (
      <Card variant="outlined" sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {template.templateName}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {template.description || "No description available"}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <Chip label={`${standardsCount} Standards`} size="small" color="primary" />
            <Chip label={`Target: ${tenantCount}`} size="small" color="secondary" />
            {template.runManually && <Chip label="Manual Run" size="small" variant="outlined" />}
          </Box>

          {template.standards && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Included Standards:
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {Object.keys(template.standards).map((standard) => (
                  <Chip key={standard} label={standard} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <Typography variant="h6">Select Drift Standard Template</Typography>
        <Typography variant="body2" color="text.secondary">
          Choose a standard template that will be used to monitor configuration drift across your
          selected tenants.
        </Typography>

        <CippFormComponent
          type="autoComplete"
          name="driftTemplate"
          label="Drift Standard Template"
          placeholder="Select a drift standard template"
          isFetching={driftTemplates.isLoading}
          multiple={false}
          formControl={formControl}
          api={{
            url: "/api/listStandardTemplates",
            dataKey: "Results",
            queryKey: "DriftStandardTemplates-Lists",
            labelField: "templateName",
            valueField: "GUID",
          }}
        />

        {/* Template Summary */}
        <TemplateSummary template={selectedTemplate} />
      </Stack>

      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};

export default CippDriftTemplateSelection;
