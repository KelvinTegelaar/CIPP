import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { useForm } from "react-hook-form";
import { ApiGetCall, ApiPostCall } from "../../../api/ApiCall";
import { useRouter } from "next/router";
import {
  Alert,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Stack, Grid } from "@mui/system";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExpandMore } from "@mui/icons-material";
import cacheTypes from "../../../data/CIPPDBCacheTypes.json";
import { renderCustomScriptMarkdownTemplate } from "../../../utils/customScriptTemplate";
import { useSettings } from "../../../hooks/use-settings";
import CippFormPage from "../../../components/CippFormPages/CippFormPage";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";
import { CippApiResults } from "../../../components/CippComponents/CippApiResults";
import { CippCodeBlock } from "../../../components/CippComponents/CippCodeBlock";

const Page = () => {
  const getValueType = (value) => {
    if (value === null) {
      return "null";
    }
    if (Array.isArray(value)) {
      return "array";
    }
    return typeof value === "object" ? "object" : typeof value;
  };

  const buildResultSchema = (result) => {
    const entriesMap = new Map();

    const addEntry = (path, type) => {
      const key = `${path}:${type}`;
      if (!entriesMap.has(key)) {
        entriesMap.set(key, { path, type });
      }
    };

    const walk = (value, path) => {
      const valueType = getValueType(value);
      addEntry(path, valueType);

      if (valueType === "array") {
        if (value.length > 0) {
          walk(value[0], `${path}[0]`);
        }
        return;
      }

      if (valueType === "object") {
        Object.entries(value).forEach(([key, childValue]) => {
          walk(childValue, `${path}.${key}`);
        });
      }
    };

    walk(result, "Result");

    return {
      generatedAt: new Date().toISOString(),
      entries: Array.from(entriesMap.values()),
    };
  };

  const settings = useSettings();
  const router = useRouter();
  const { ScriptGuid } = router.query;
  const isEdit = !!ScriptGuid;
  const [cacheTypesDialogOpen, setCacheTypesDialogOpen] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [guidanceExpanded, setGuidanceExpanded] = useState(true);
  const [configExpanded, setConfigExpanded] = useState(true);
  const [scriptContentExpanded, setScriptContentExpanded] = useState(true);
  const [testerExpanded, setTesterExpanded] = useState(true);

  const toSelectOption = (value, fallback) =>
    value
      ? { value, label: value }
      : {
          value: fallback,
          label: fallback,
        };

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      ScriptName: "",
      ScriptContent: "",
      Enabled: false,
      AlertOnFailure: false,
      ReturnType: "JSON",
      MarkdownTemplate: "",
      Description: "",
      Category: { value: "General", label: "General" },
      Pillar: { value: "Identity", label: "Identity" },
      Risk: { value: "Low", label: "Low" },
      UserImpact: { value: "Low", label: "Low" },
      ImplementationEffort: { value: "Low", label: "Low" },
      TestParameters: "",
      ResultSchema: "",
    },
  });

  const existingScript = ApiGetCall({
    url: `/api/ListCustomScripts?ScriptGuid=${ScriptGuid}`,
    queryKey: `CustomScript-${ScriptGuid}`,
    waiting: isEdit,
  });
  const isScriptLoading = isEdit && (existingScript.isLoading || existingScript.isFetching);

  useEffect(() => {
    if (isEdit && existingScript.isSuccess && existingScript?.data && existingScript.data[0]) {
      const script = existingScript.data[0];
      formControl.reset({
        ScriptName: script.ScriptName || "",
        ScriptContent: script.ScriptContent || "",
        Enabled: script.Enabled || false,
        AlertOnFailure: script.AlertOnFailure || false,
        ReturnType: script.ReturnType || "JSON",
        MarkdownTemplate: script.MarkdownTemplate || "",
        ResultSchema: script.ResultSchema || "",
        Category: toSelectOption(script.Category, "General"),
        Pillar: toSelectOption(script.Pillar, "Identity"),
        Description: script.Description || "",
        Risk: toSelectOption(script.Risk, "Low"),
        UserImpact: toSelectOption(script.UserImpact, "Low"),
        ImplementationEffort: toSelectOption(script.ImplementationEffort, "Low"),
        ScriptGuid: script.ScriptGuid,
      });
    }
  }, [existingScript.data, isEdit, existingScript.isSuccess, formControl]);

  useEffect(() => {
    setGuidanceExpanded(!isEdit);
    setConfigExpanded(!isEdit);
    setScriptContentExpanded(true);
    setTesterExpanded(true);
  }, [isEdit]);

  const testScriptApi = ApiPostCall({
    urlFromData: true,
    onResult: (result) => {
      setTestResults(result);
      if (result?.Results !== undefined) {
        const generatedSchema = buildResultSchema(result.Results);
        formControl.setValue("ResultSchema", JSON.stringify(generatedSchema, null, 2), {
          shouldDirty: true,
        });
      }
    },
  });

  const handleRunTest = () => {
    if (!isEdit || !ScriptGuid) {
      return;
    }

    let parsedParams = {};
    const rawParams = formControl.getValues("TestParameters");

    if (rawParams) {
      try {
        parsedParams = JSON.parse(rawParams);
      } catch (error) {
        const sanitizedError = String(error.message || "Unknown error").replace(/[<>]/g, "");
        formControl.setError("TestParameters", {
          type: "manual",
          message: `Parameters must be valid JSON: ${sanitizedError}`,
        });
        return;
      }
    }

    const payload = {
      ScriptGuid,
      TenantFilter: router.query.tenantFilter || settings?.currentTenant,
      Parameters: parsedParams,
    };

    testScriptApi.mutate({
      url: "/api/ExecCustomScript",
      data: payload,
    });
  };

  const customDataformatter = (data) => {
    const payload = {
      ScriptName: data.ScriptName,
      ScriptContent: data.ScriptContent,
      Enabled: data.Enabled,
      AlertOnFailure: data.AlertOnFailure,
      ReturnType: data.ReturnType,
      MarkdownTemplate: data.MarkdownTemplate,
      ResultSchema: data.ResultSchema,
      Description: data.Description,
      Category: data.Category?.value,
      Pillar: data.Pillar?.value,
      Risk: data.Risk?.value,
      UserImpact: data.UserImpact?.value,
      ImplementationEffort: data.ImplementationEffort?.value,
    };

    if (isEdit) {
      payload.ScriptGuid = ScriptGuid;
    }

    return payload;
  };

  const categoryOptions = [
    { value: "License Management", label: "License Management" },
    { value: "Security", label: "Security" },
    { value: "Compliance", label: "Compliance" },
    { value: "User Management", label: "User Management" },
    { value: "Group Management", label: "Group Management" },
    { value: "Device Management", label: "Device Management" },
    { value: "Guest Management", label: "Guest Management" },
    { value: "General", label: "General" },
  ];

  const riskOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
    { value: "Critical", label: "Critical" },
  ];

  const pillarOptions = [
    { value: "Identity", label: "Identity" },
    { value: "Devices", label: "Devices" },
    { value: "Data", label: "Data" },
  ];

  const impactAndEffortOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
  ];

  const returnTypeOptions = [
    { value: "JSON", label: "JSON" },
    { value: "Markdown", label: "Markdown" },
  ];

  const scriptNameField = {
    name: "ScriptName",
    label: "Script Name",
    type: "textField",
    required: true,
    placeholder: "Enter a descriptive name for your script",
    disableVariables: true,
  };

  const descriptionField = {
    name: "Description",
    label: "Description",
    type: "textField",
    required: true,
    multiline: true,
    rows: 2,
    placeholder: "Describe what this script checks or monitors",
    disableVariables: true,
  };

  const categoryField = {
    name: "Category",
    label: "Category",
    type: "autoComplete",
    required: true,
    placeholder: "Select or enter a category",
    options: categoryOptions,
    creatable: true,
  };

  const riskField = {
    name: "Risk",
    label: "Risk Level",
    type: "select",
    required: true,
    placeholder: "Select the risk level for alerts from this script",
    options: riskOptions,
    creatable: false,
  };

  const pillarField = {
    name: "Pillar",
    label: "Pillar",
    type: "select",
    required: true,
    placeholder: "Select a pillar",
    options: pillarOptions,
    creatable: false,
  };

  const userImpactField = {
    name: "UserImpact",
    label: "User Impact",
    type: "select",
    required: true,
    placeholder: "Select user impact",
    options: impactAndEffortOptions,
    creatable: false,
  };

  const implementationEffortField = {
    name: "ImplementationEffort",
    label: "Implementation Effort",
    type: "select",
    required: true,
    placeholder: "Select implementation effort",
    options: impactAndEffortOptions,
    creatable: false,
  };

  const enabledField = {
    name: "Enabled",
    label: "Enable Script",
    type: "switch",
    defaultValue: false,
  };

  const alertOnFailureField = {
    name: "AlertOnFailure",
    label: "Notify on Alert",
    type: "switch",
    defaultValue: false,
  };

  const returnTypeField = {
    name: "ReturnType",
    label: "Result Display Type",
    type: "select",
    required: true,
    placeholder: "Select how test results are rendered",
    options: returnTypeOptions,
    creatable: false,
    helperText: "Choose how failed test results are rendered in CIPP test details.",
  };

  const markdownTemplateField = {
    name: "MarkdownTemplate",
    label: "Markdown Result Template",
    type: "textField",
    required: false,
    multiline: true,
    rows: 8,
    disableVariables: false,
    autocompleteTrigger: "{{",
    placeholder: `### Custom Script Finding

The script returned the following data:

{{ResultJson}}

Affected users: {{count(Result)}}

First user: {{Result[0].DisplayName ?? "Unknown"}}

All UPNs: {{join(Result[*].UserPrincipalName, ", ")}}`,
    helperText:
      "Supports {{ResultJson}}, {{Result.Path}}, {{Result.Path ?? \"fallback\"}}, {{join(Result[*].Path, \", \")}}, {{count(Result)}}, and {{table(Result[*], \"displayName\", \"mail\")}}.",
  };

  const scriptContentField = {
    name: "ScriptContent",
    label: "PowerShell Script",
    type: "textField",
    required: true,
    multiline: true,
    rows: 22,
    placeholder: `# Example: Find disabled users with licenses
param($TenantFilter, $DaysThreshold = 30)

$users = New-CIPPDbRequest -TenantFilter $TenantFilter -Type 'Users'
$results = $users | Where-Object {
    $_.assignedLicenses.Count -gt 0 -and
    $_.accountEnabled -eq $false
} | ForEach-Object {
    [PSCustomObject]@{
        UserPrincipalName = $_.userPrincipalName
        DisplayName = $_.displayName
        Message = "User has license but is disabled"
    }
}

# Return is optional; pipeline output is also captured.
return $results`,
    disableVariables: true,
  };

  const selectedReturnType = formControl.watch("ReturnType");
  const markdownTemplateValue = formControl.watch("MarkdownTemplate");
  const resultSchemaValue = formControl.watch("ResultSchema");

  const parsedResultSchema = useMemo(() => {
    if (!resultSchemaValue) {
      return null;
    }
    try {
      return JSON.parse(resultSchemaValue);
    } catch {
      return null;
    }
  }, [resultSchemaValue]);

  const schemaEntries = Array.isArray(parsedResultSchema?.entries) ? parsedResultSchema.entries : [];

  const markdownAutocompleteOptions = useMemo(() => {
    const suggestionsMap = new Map();

    const addSuggestion = (token, tokenType) => {
      if (!suggestionsMap.has(token)) {
        suggestionsMap.set(token, {
          name: token,
          variable: token,
          value: token,
          label: tokenType ? `${token} · ${tokenType}` : token,
          description: `Type: ${tokenType || "token"}`,
          type: "schema",
          category: "markdown-template",
        });
      }
    };

    addSuggestion("{{ResultJson}}", "json");
    addSuggestion("{{Result}}", "root");
    addSuggestion("{{count(Result)}}", "number");

    schemaEntries.forEach((entry) => {
      addSuggestion(`{{${entry.path}}}`, entry.type);
      if (entry.type === "array") {
        addSuggestion(`{{count(${entry.path})}}`, "number");
      }
      if (entry.path.includes("[0]")) {
        const wildcardPath = entry.path.replaceAll("[0]", "[*]");
        addSuggestion(`{{join(${wildcardPath}, ", ")}}`, "string");
      }
    });

    return Array.from(suggestionsMap.values());
  }, [schemaEntries]);

  return (
    <CippFormPage
      formControl={formControl}
      queryKey={["Custom PowerShell Scripts", "CustomScript*"]}
      title="Custom Script"
      backButtonTitle="Custom Scripts"
      formPageType={isEdit ? "Edit" : "Add"}
      postUrl="/api/AddCustomScript"
      customDataformatter={customDataformatter}
    >
      <Accordion
        sx={{ mb: 2 }}
        expanded={guidanceExpanded}
        onChange={(_, expanded) => setGuidanceExpanded(expanded)}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">Script Guidance</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Security Constraints:</strong> Scripts are validated using PowerShell AST
              parsing with an allowlist approach. Only specific commands are permitted (ForEach-Object,
              Where-Object, Select-Object, etc.). The += operator is blocked.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Allowed Data Access:</strong> New-CIPPDbRequest, Get-CIPPDbItem (read-only)
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Tip:</strong> The $TenantFilter parameter is automatically available in your
              script. Return @() when there are no results.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Pass/Fail contract:</strong> Return $false, $null, an empty string, or @() for
              pass/no findings. Return any non-empty value (object/string/true) to mark the test as
              failed and include that payload in the test output.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Result display:</strong> JSON shows raw data in code view. Markdown renders rich
              output and supports tokens like <code>{"{{ResultJson}}"}</code>,
              <code>{" {{Result[0].DisplayName}}"}</code>,
              <code>{" {{Result[0].DisplayName ?? \"Unknown\"}}"}</code>,
              <code>{" {{join(Result[*].UserPrincipalName, \", \")}}"}</code>, and
              <code>{" {{count(Result)}}"}</code>, and
              <code>{" {{table(Result[*], \"displayName\", \"mail\")}}"}</code>.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Persistence:</strong> Manual testing on this page is preview-only. Results are
              written to CippTestResults only when the script is enabled and tenant tests are
              executed.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, whiteSpace: "pre-line" }}>
              <strong>CIPP DB Examples:</strong>
              {"\n"}
              1) Load parsed users data:{"\n"}
              New-CIPPDbRequest -TenantFilter $TenantFilter -Type 'Users'{"\n"}
              2) Load raw entities for one type:{"\n"}
              Get-CIPPDbItem -TenantFilter $TenantFilter -Type 'Users'{"\n"}
              3) Load count rows only:{"\n"}
              Get-CIPPDbItem -TenantFilter $TenantFilter -CountsOnly
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Cached Types:</strong> Use these values in the -Type parameter.
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Button size="small" variant="outlined" onClick={() => setCacheTypesDialogOpen(true)}>
                View Cached Types ({cacheTypes.length})
              </Button>
            </Box>
          </Alert>
        </AccordionDetails>
      </Accordion>

      <Dialog
        open={cacheTypesDialogOpen}
        onClose={() => setCacheTypesDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cached Types</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            {cacheTypes.map((cacheType) => (
              <Box key={cacheType.type}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {cacheType.friendlyName} ({cacheType.type})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {cacheType.description}
                </Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCacheTypesDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Accordion expanded={configExpanded} onChange={(_, expanded) => setConfigExpanded(expanded)}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">Configuration Options</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent formControl={formControl} {...scriptNameField} disabled={isScriptLoading} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent formControl={formControl} {...categoryField} disabled={isScriptLoading} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent formControl={formControl} {...descriptionField} disabled={isScriptLoading} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent formControl={formControl} {...riskField} disabled={isScriptLoading} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent formControl={formControl} {...pillarField} disabled={isScriptLoading} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent formControl={formControl} {...userImpactField} disabled={isScriptLoading} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent formControl={formControl} {...implementationEffortField} disabled={isScriptLoading} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent formControl={formControl} {...returnTypeField} disabled={isScriptLoading} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CippFormComponent formControl={formControl} {...enabledField} disabled={isScriptLoading} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CippFormComponent formControl={formControl} {...alertOnFailureField} disabled={isScriptLoading} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion
        sx={{ mt: 2 }}
        expanded={scriptContentExpanded}
        onChange={(_, expanded) => setScriptContentExpanded(expanded)}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">Markdown / PowerShell</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            {selectedReturnType === "Markdown" && (
              <>
                <CippFormComponent
                  formControl={formControl}
                  {...markdownTemplateField}
                  autocompleteOptions={markdownAutocompleteOptions}
                  disabled={isScriptLoading}
                />
                <Typography variant="caption" color="text.secondary">
                  Type <code>{"{{"}</code> to open schema autocomplete suggestions.
                </Typography>
              </>
            )}
            <CippFormComponent formControl={formControl} {...scriptContentField} disabled={isScriptLoading} />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion
        sx={{ mt: 2 }}
        expanded={testerExpanded}
        onChange={(_, expanded) => setTesterExpanded(expanded)}
        slotProps={{ transition: { unmountOnExit: true, timeout: 150 } }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">Test Script Output</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {testerExpanded && (!isEdit ? (
            <Alert severity="info">Save the script first to test execution output.</Alert>
          ) : (
            <Stack spacing={2}>
              <Typography variant="caption" color="text.secondary">
                Runs a preview against your current tenant and renders output using the current
                Return Type and Markdown Template from this form.
              </Typography>
              <CippFormComponent
                name="TestParameters"
                label="Script Parameters (JSON)"
                type="textField"
                formControl={formControl}
                multiline={true}
                rows={5}
                disableVariables={true}
                placeholder={`{
  "DaysThreshold": 30,
  "ExcludeDisabled": true
}`}
              />
              <Box>
                <Button
                  variant="contained"
                  onClick={handleRunTest}
                  disabled={isScriptLoading || testScriptApi.isPending}
                >
                  Run Test
                </Button>
              </Box>

              {testScriptApi.isPending && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2">Running script test...</Typography>
                </Box>
              )}

              {testScriptApi.isError && <CippApiResults apiObject={testScriptApi} errorsOnly={true} />}

              {resultSchemaValue && (
                <Typography variant="caption" color="text.secondary">
                  Result schema detected from latest test output and used for typed markdown
                  completions above.
                </Typography>
              )}

              {testResults?.Results !== undefined && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Test Results
                  </Typography>
                  {selectedReturnType === "Markdown" ? (
                    <Box
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {renderCustomScriptMarkdownTemplate(
                          testResults.Results,
                          markdownTemplateValue || "",
                        )}
                      </ReactMarkdown>
                    </Box>
                  ) : (
                    <CippCodeBlock
                      code={JSON.stringify(testResults.Results, null, 2)}
                      language="json"
                      showLineNumbers={false}
                    />
                  )}
                </Box>
              )}
            </Stack>
          ))}
        </AccordionDetails>
      </Accordion>
    </CippFormPage>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
