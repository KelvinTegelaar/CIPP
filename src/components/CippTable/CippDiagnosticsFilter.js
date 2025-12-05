import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Box,
  Button,
  Stack,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { ExpandMore, Search, Save, Delete } from "@mui/icons-material";
import { CippFormComponent } from "../CippComponents/CippFormComponent";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { Grid } from "@mui/system";
import defaultPresets from "../../data/DiagnosticsPresets.json";

const CippDiagnosticsFilter = ({ onSubmitFilter }) => {
  const [expanded, setExpanded] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [presetOptions, setPresetOptions] = useState([]);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      presetName: "",
      queryPreset: null,
      query: "",
    },
  });

  const { handleSubmit } = formControl;
  const queryValue = useWatch({ control: formControl.control, name: "query" });
  const queryPreset = useWatch({ control: formControl.control, name: "queryPreset" });
  const presetName = useWatch({ control: formControl.control, name: "presetName" });

  // Load presets
  const presetList = ApiGetCall({
    url: "/api/ListDiagnosticsPresets",
    queryKey: "ListDiagnosticsPresets",
  });

  useEffect(() => {
    // Combine built-in presets with custom presets
    const builtInOptions = defaultPresets.map((preset) => ({
      label: preset.name,
      value: preset.id,
      query: preset.query,
      isBuiltin: true,
    }));

    const customOptions =
      presetList.isSuccess && presetList.data
        ? presetList.data.map((preset) => ({
            label: preset.name,
            value: preset.GUID,
            query: preset.query,
            isBuiltin: false,
          }))
        : [];

    setPresetOptions([...builtInOptions, ...customOptions]);
  }, [presetList.isSuccess, presetList.data]);

  // Load preset when selected
  useEffect(() => {
    if (queryPreset) {
      // queryPreset is the full object from autoComplete
      // Check if it's an array (multiple) or object (single)
      const preset = Array.isArray(queryPreset) ? queryPreset[0] : queryPreset;

      if (preset?.query) {
        formControl.setValue("query", preset.query);
        formControl.setValue("presetName", preset.label);
        setSelectedPreset(preset);
      }
    } else {
      // Clear selection when preset is cleared
      setSelectedPreset(null);
    }
  }, [queryPreset, formControl]);

  const savePresetApi = ApiPostCall({
    relatedQueryKeys: ["ListDiagnosticsPresets"],
  });

  const deletePresetApi = ApiPostCall({
    relatedQueryKeys: ["ListDiagnosticsPresets"],
  });

  const handleSavePreset = () => {
    if (!presetName || !queryValue) {
      return;
    }

    // Don't allow updating built-in presets
    if (selectedPreset?.isBuiltin) {
      return;
    }

    const presetData = {
      name: presetName,
      query: queryValue,
      GUID: selectedPreset?.value || undefined,
    };

    savePresetApi.mutate({
      url: "/api/ExecDiagnosticsPresets",
      data: presetData,
      title: selectedPreset ? "Update Preset" : "Save Preset",
      message: selectedPreset
        ? `Preset "${presetName}" updated successfully`
        : `Preset "${presetName}" saved successfully`,
    });
  };

  const handleDeletePreset = () => {
    if (!selectedPreset || selectedPreset.isBuiltin) {
      return;
    }

    deletePresetApi.mutate({
      url: "/api/ExecDiagnosticsPresets",
      data: {
        GUID: selectedPreset.value,
        action: "delete",
      },
      title: "Delete Preset",
      message: `Preset "${selectedPreset.label}" deleted successfully`,
    });

    formControl.setValue("queryPreset", null);
    formControl.setValue("presetName", "");
    setSelectedPreset(null);
  };

  const onSubmit = (values) => {
    if (values.query && values.query.trim()) {
      onSubmitFilter(values);
      setExpanded(false);
    }
  };

  const handleClear = () => {
    formControl.reset({ query: "", presetName: "", queryPreset: null });
    onSubmitFilter({ query: "" });
    setSelectedPreset(null);
  };

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6">Query</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3}>
          <Alert severity="info">
            <AlertTitle>Requirements</AlertTitle>
            <Typography variant="body2">
              • Application Insights must be deployed for your CIPP environment
              <br />• The Function App's managed identity must have <strong>Reader</strong>{" "}
              permissions on the Application Insights resource
              <br />• Queries are executed using Kusto Query Language (KQL)
            </Typography>
          </Alert>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CippFormComponent
                    type="autoComplete"
                    name="queryPreset"
                    label="Load Preset"
                    formControl={formControl}
                    options={presetOptions}
                    multiple={false}
                    isFetching={presetList.isFetching}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ flexGrow: 1 }}>
                      <CippFormComponent
                        type="textField"
                        name="presetName"
                        label="Preset Name"
                        formControl={formControl}
                        placeholder="Enter a name to save this query as a preset"
                      />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                      <Stack direction="row" spacing={1}>
                        <Tooltip
                          title={
                            selectedPreset?.isBuiltin
                              ? "Built-in presets cannot be modified"
                              : selectedPreset
                              ? "Update Preset"
                              : "Save Preset"
                          }
                        >
                          <span>
                            <IconButton
                              color="primary"
                              onClick={handleSavePreset}
                              disabled={
                                !presetName ||
                                !queryValue ||
                                savePresetApi.isPending ||
                                selectedPreset?.isBuiltin
                              }
                            >
                              {savePresetApi.isPending ? <CircularProgress size={24} /> : <Save />}
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            selectedPreset?.isBuiltin
                              ? "Built-in presets cannot be deleted"
                              : "Delete Preset"
                          }
                        >
                          <span>
                            <IconButton
                              color="error"
                              onClick={handleDeletePreset}
                              disabled={
                                !selectedPreset ||
                                deletePresetApi.isPending ||
                                selectedPreset?.isBuiltin
                              }
                            >
                              {deletePresetApi.isPending ? (
                                <CircularProgress size={24} />
                              ) : (
                                <Delete />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>

              <CippFormComponent
                type="textField"
                name="query"
                label="KQL Query"
                formControl={formControl}
                multiline
                rows={12}
                placeholder={`Enter your KQL query here, for example:\n\ntraces\n| where timestamp > ago(1h)\n| where severityLevel >= 2\n| project timestamp, message, severityLevel\n| order by timestamp desc`}
                helperText="Enter a valid Kusto Query Language (KQL) query to execute against Application Insights"
                sx={{
                  "& textarea": {
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                  },
                }}
              />

              <Stack direction="row" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Search />}
                  disabled={!queryValue || !queryValue.trim()}
                >
                  Execute Query
                </Button>
                <Button variant="outlined" onClick={handleClear}>
                  Clear
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default CippDiagnosticsFilter;
