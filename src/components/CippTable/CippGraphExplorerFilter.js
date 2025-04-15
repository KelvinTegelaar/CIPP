import React, { useState, useEffect, useCallback } from "react";
import { Button, Typography } from "@mui/material";
import {
  Save as SaveIcon,
  Delete,
  CalendarMonthTwoTone,
  CopyAll,
  ImportExport,
  PlayCircle,
} from "@mui/icons-material";
import { useForm, useWatch } from "react-hook-form";
import { debounce } from "lodash";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { CippFormCondition } from "../CippComponents/CippFormCondition";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import { CippCodeBlock } from "../CippComponents/CippCodeBlock";
import CippSchedulerForm from "../CippFormPages/CippSchedulerForm";
import defaultPresets from "../../data/GraphExplorerPresets";
import { Grid, Stack } from "@mui/system";
import { GroupHeader, GroupItems } from "../CippComponents/CippAutocompleteGrouping";

const CippGraphExplorerFilter = ({
  endpointFilter = "",
  onSubmitFilter,
  onPresetChange,
  component = "accordion",
}) => {
  const [offCanvasOpen, setOffCanvasOpen] = useState(false);
  const [cardExpanded, setCardExpanded] = useState(true);
  const [offCanvasContent, setOffCanvasContent] = useState(null);
  const [selectedPresetState, setSelectedPreset] = useState(null);
  const [presetOwner, setPresetOwner] = useState(false);
  const [lastPresetTitle, setLastPresetTitle] = useState(null);
  const [presetOptions, setPresetOptions] = useState([]);
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      endpoint: "",
      $select: [],
      $filter: "",
      $expand: "",
      $top: "",
      $search: "",
      $format: "",
      NoPagination: false,
      ReverseTenantLookup: false,
      ReverseTenantLookupProperty: "tenantId",
      $count: false,
      manualPagination: false,
      IsShared: false,
    },
  });
  const presetControl = useForm({
    mode: "onChange",
    defaultValues: {
      reportTemplate: null,
    },
  });

  const defaultGraphExplorerTitle = "Graph Explorer";

  var gridItemSize = 6;
  if (component !== "accordion") {
    gridItemSize = 12;
  }

  var gridSwitchSize = 3;
  if (component !== "accordion") {
    gridSwitchSize = 12;
  }

  const [currentEndpoint, setCurrentEndpoint] = useState(endpointFilter);
  const { control, handleSubmit } = formControl;
  const tenant = useSettings().currentTenant;
  const watchedValues = useWatch({ control: formControl.control });

  useEffect(() => {
    const endpoint = watchedValues.endpoint;
    if (endpoint && endpoint !== currentEndpoint) {
      setCurrentEndpoint(endpoint);
    }
  }, [watchedValues.endpoint]);

  // API call for available properties
  const propertyList = ApiGetCall({
    url: "/api/ListGraphRequest",
    queryKey: `graph-properties-${currentEndpoint}`,
    data: {
      Endpoint: currentEndpoint,
      ListProperties: true,
      TenantFilter: tenant,
      IgnoreErrors: true,
    },
    waiting: false,
  });

  var presetFilter = {};
  if (endpointFilter) {
    if (formControl.getValues("endpoint") !== endpointFilter) {
      formControl.setValue("endpoint", endpointFilter);
    }
    presetFilter = { Endpoint: endpointFilter };
  }

  // API call for available presets
  const presetList = ApiGetCall({
    url: "/api/ListGraphExplorerPresets",
    queryKey: "ListGraphExplorerPresets",
    data: presetFilter,
  });

  useEffect(() => {
    var presetOptionList = [];
    const normalizeEndpoint = (endpoint) => endpoint.replace(/^\//, "");
    defaultPresets
      .filter(
        (item) =>
          !endpointFilter ||
          normalizeEndpoint(item.params.endpoint) === normalizeEndpoint(endpointFilter)
      )
      .forEach((item) => {
        presetOptionList.push({
          label: item.name,
          value: item.id,
          addedFields: item,
          type: "Built-In",
        });
      });
    if (presetList.isSuccess && presetList.data?.Results.length > 0) {
      presetList.data.Results.forEach((item) => {
        presetOptionList.push({
          label: item.name,
          value: item.id,
          addedFields: item,
          type: "Custom",
        });
      });
    }
    setPresetOptions(presetOptionList);
  }, [defaultPresets, presetList.isSuccess, presetList.data]);

  // Debounced refetch when endpoint, put in in a useEffect dependand on endpoint
  const debouncedRefetch = useCallback(
    debounce(() => {
      if (currentEndpoint) {
        propertyList.refetch();
      }
    }, 1000),
    [currentEndpoint] // Dependencies that the debounce function depends on
  );

  useEffect(() => {
    debouncedRefetch();
    // Clean up the debounce on unmount
    return () => {
      debouncedRefetch.cancel();
    };
  }, [currentEndpoint, debouncedRefetch]);

  const savePresetApi = ApiPostCall({
    relatedQueryKeys: ["ListGraphExplorerPresets", "ListGraphRequest"],
  });

  // Save preset function
  const handleSavePreset = () => {
    const currentTemplate = formControl.getValues();
    if (!presetOwner && currentTemplate?.id) {
      delete currentTemplate.id;
    }
    savePresetApi.mutate({
      url: "/api/ExecGraphExplorerPreset",
      data: { action: presetOwner ? "Save" : "Copy", preset: currentTemplate },
    });
  };

  const selectedPresets = useWatch({ control: presetControl.control, name: "reportTemplate" });
  useEffect(() => {
    if (selectedPresets?.addedFields?.params) {
      setPresetOwner(selectedPresets?.addedFields?.IsMyPreset ?? false);
      Object.keys(selectedPresets.addedFields.params).forEach(
        (key) =>
          selectedPresets.addedFields.params[key] == null &&
          delete selectedPresets.addedFields.params[key]
      );
      //if $select is a blank array, set it to a string.
      if (
        selectedPresets.addedFields.params.$select &&
        selectedPresets.addedFields.params.$select.length === 0
      ) {
        selectedPresets.addedFields.params.$select = "";
      }

      // if $select is an array, extract the values and comma separate
      if (
        Array.isArray(selectedPresets.addedFields.params.$select) &&
        selectedPresets.addedFields.params.$select.length > 0
      ) {
        selectedPresets.addedFields.params.$select = selectedPresets.addedFields.params.$select
          .map((item) => item.value)
          .join(",");
      }
      selectedPresets.addedFields.params.$select !== ""
        ? (selectedPresets.addedFields.params.$select = selectedPresets.addedFields.params?.$select
            ?.split(",")
            .map((item) => ({ label: item, value: item })))
        : (selectedPresets.addedFields.params.$select = []);
      selectedPresets.addedFields.params.id = selectedPresets.value;
      setSelectedPreset(selectedPresets.value);
      selectedPresets.addedFields.params.name = selectedPresets.label;

      // save last preset title
      setLastPresetTitle(selectedPresets.label);
      formControl.reset(selectedPresets?.addedFields?.params, { keepDefaultValues: true });
    }
  }, [selectedPresets]);

  const schedulerForm = useForm({
    mode: "onChange",
  });

  const schedulerCommand = {
    Function: "Get-GraphRequestList",
    Synopsis: "Execute a Graph query",
    Parameters: [
      {
        Name: "Endpoint",
        Type: "System.String",
        Description: "Graph API endpoint",
        Required: true,
      },
      {
        Name: "Parameters",
        Type: "System.Collections.Hashtable",
        Description: "API Parameters",
        Required: false,
      },
      {
        Name: "queueId",
        Type: "System.String",
        Description: "Queue Id",
        Required: false,
      },
      {
        Name: "NoPagination",
        Type: "System.Management.Automation.SwitchParameter",
        Description: "Disable pagination",
        Required: false,
      },
      {
        Name: "CountOnly",
        Type: "System.Management.Automation.SwitchParameter",
        Description: "Only return count of results",
        Required: false,
      },
      {
        Name: "ReverseTenantLookup",
        Type: "System.Management.Automation.SwitchParameter",
        Description: "Perform reverse tenant lookup",
        Required: false,
      },
      {
        Name: "ReverseTenantLookupProperty",
        Type: "System.String",
        Description: "Property to perform reverse tenant lookup",
        Required: false,
      },
      {
        Name: "AsApp",
        Type: "System.Boolean",
        Description: null,
        Required: false,
      },
    ],
  };
  // Schedule report function
  const handleScheduleReport = () => {
    const formParameters = watchedValues;
    const selectString = formParameters.$select
      ? formParameters.$select?.map((item) => item.value).join(",")
      : null;

    //compose the parameters for the form based on what is available
    var Parameters = [
      {
        Key: "$select",
        Value: selectString,
      },
      {
        Key: "$filter",
        Value: formParameters.$filter,
      },
      {
        Key: "$top",
        Value: formParameters.$top,
      },
      {
        Key: "$search",
        Value: formParameters.$search,
      },
      {
        Key: "$count",
        Value: formParameters.$count,
      },
      {
        Key: "$expand",
        Value: formParameters.$expand,
      },
      {
        Key: "$format",
        Value: formParameters.$format,
      },
    ];
    Parameters = Parameters.filter((param) => {
      return (
        param.Value != null &&
        param.Value !== "" &&
        !(typeof param.Value === "boolean" && param.Value === false)
      );
    });
    const resetParams = {
      tenantFilter: tenant,
      Name: formParameters.name
        ? `Graph Explorer - ${formParameters.name}`
        : "Graph Explorer Report",
      command: {
        label: schedulerCommand.Function,
        value: schedulerCommand.Function,
        addedFields: schedulerCommand,
      },
      parameters: {
        Endpoint: formParameters.endpoint,
        skipCache: true,
        NoPagination: formParameters.NoPagination,
        AsApp: formParameters.AsApp,
        ReverseTenantLookup: formParameters.ReverseTenantLookup,
        ReverseTenantLookupProperty: formParameters.ReverseTenantLookupProperty,
        Parameters: Parameters,
      },
      advancedParameters: false,
      Recurrence: {
        value: 0,
        label: "Only once",
      },
    };
    schedulerForm.reset(resetParams);
    setOffCanvasContent(
      <>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Schedule Graph Explorer Report
        </Typography>
        <CippSchedulerForm fullWidth formControl={schedulerForm} />
      </>
    );
    setOffCanvasOpen(true);
  };

  const [editorValues, setEditorValues] = useState({});
  //keep the editor in sync with the form

  function getPresetProps(values) {
    var newvals = Object.assign({}, values);
    if (newvals?.$select !== undefined && Array.isArray(newvals?.$select)) {
      newvals.$select = newvals?.$select.map((p) => p.value).join(",");
    }
    delete newvals["reportTemplate"];
    delete newvals["tenantFilter"];
    delete newvals["IsShared"];
    delete newvals["id"];
    if (newvals.ReverseTenantLookup === false) {
      delete newvals.ReverseTenantLookup;
    }
    if (newvals.NoPagination === false) {
      delete newvals.NoPagination;
    }
    if (newvals.$count === false) {
      delete newvals.$count;
    }
    if (newvals.AsApp === false) {
      delete newvals.AsApp;
    }
    Object.keys(newvals).forEach((key) => {
      if (values[key] === "" || values[key] === null) {
        delete newvals[key];
      }
    });
    return newvals;
  }

  useEffect(() => {
    var values = getPresetProps(watchedValues);
    setOffCanvasContent(() => (
      <>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Import / Export Graph Explorer Preset
        </Typography>
        <CippCodeBlock
          type="editor"
          onChange={(value) => setEditorValues(JSON.parse(value))}
          code={JSON.stringify(values, null, 2)}
        />
        <Button
          onClick={() => {
            savePresetApi.mutate({
              url: "/api/ExecGraphExplorerPreset",
              data: { action: "Copy", preset: editorValues },
            });
          }}
          variant="contained"
          color="primary"
        >
          Import Template
        </Button>
        <CippApiResults apiObject={savePresetApi} />
      </>
    ));
  }, [editorValues, savePresetApi.isPending, formControl, selectedPresets, watchedValues]);

  const handleImport = () => {
    setOffCanvasOpen(true); // Open the offCanvas, the content will be updated by useEffect
  };
  // Handle filter form submission
  const onSubmit = (values) => {
    if (values.$select && Array.isArray(values.$select) && values.$select.length > 0) {
      values.$select = values?.$select?.map((item) => item.value)?.join(",");
    }
    if (values.ReverseTenantLookup === false) {
      delete values.ReverseTenantLookup;
    }
    if (values.NoPagination === false) {
      delete values.NoPagination;
    }
    if (values.$count === false) {
      delete values.$count;
    }

    Object.keys(values).forEach((key) => {
      if (values[key] === null) {
        delete values[key];
      }
    });

    if (onPresetChange) {
      const presetName = lastPresetTitle ? `Graph Explorer - ${lastPresetTitle}` : null;
      if (presetName) onPresetChange(presetName);
    }
    onSubmitFilter(values);
    setCardExpanded(false);
  };

  //console.log(cardExpanded);
  const deletePreset = (id) => {
    savePresetApi.mutate({
      url: "/api/ExecGraphExplorerPreset",
      data: { action: "Delete", preset: { id: selectedPresetState } },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CippButtonCard
        title="Graph Filter"
        component={component}
        accordionExpanded={cardExpanded}
        onAccordionChange={(expanded) => setCardExpanded(expanded)}
        cardSx={{
          width: "100%",
          height: "100%",
          mb: 2,
        }}
        CardButton={
          <>
            <Stack spacing={2} width={"100%"}>
              <Stack
                spacing={1.5}
                direction={component === "accordion" ? "row" : "column"}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  startIcon={<PlayCircle />}
                  fullWidth
                >
                  Apply Filter
                </Button>

                <Button
                  startIcon={<CalendarMonthTwoTone />}
                  variant="outlined"
                  onClick={handleScheduleReport}
                  fullWidth
                >
                  Schedule Report
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleSavePreset}
                  startIcon={<>{presetOwner ? <SaveIcon /> : <CopyAll />}</>}
                  fullWidth
                >
                  {presetOwner ? "Save" : "Copy"} Preset
                </Button>

                {selectedPresetState && (
                  <Button
                    startIcon={<Delete />}
                    variant="outlined"
                    onClick={() => deletePreset(selectedPresetState)}
                    disabled={!presetOwner}
                    fullWidth
                  >
                    Delete Preset
                  </Button>
                )}

                <Button
                  onClick={handleImport}
                  variant="outlined"
                  color="primary"
                  startIcon={<ImportExport />}
                  fullWidth
                >
                  Import/Export
                </Button>
                <CippFormComponent
                  name="IsShared"
                  type="switch"
                  formControl={formControl}
                  label="Share Preset"
                  fullWidth
                />
              </Stack>
            </Stack>
          </>
        }
      >
        <Grid container size={12} spacing={2} sx={{ mb: 2 }}>
          <Grid item size={gridItemSize}>
            <CippFormComponent
              type="autoComplete"
              name="reportTemplate"
              label="Select a preset"
              multiple={false}
              formControl={presetControl}
              options={presetOptions}
              isFetching={presetList.isFetching}
              groupBy={(option) => option.type}
              renderGroup={(params) => (
                <li key={params.key}>
                  <GroupHeader>{params.group}</GroupHeader>
                  <GroupItems>{params.children}</GroupItems>
                </li>
              )}
              placeholder="Select a preset"
            />
          </Grid>

          {/* Preset Name Field */}
          <Grid item size={gridItemSize}>
            <CippFormComponent
              type="textField"
              name="name"
              label="Preset Name"
              formControl={formControl}
              placeholder="Name for this filter preset"
            />
          </Grid>

          <Grid item size={gridItemSize}>
            <CippFormComponent
              type="textField"
              name="endpoint"
              label="Endpoint"
              formControl={formControl}
              disabled={endpointFilter ? true : false}
              placeholder="Enter Graph API endpoint"
            />
          </Grid>

          <Grid item size={gridItemSize}>
            <CippFormComponent
              type="autoComplete"
              name="$select"
              label="Select"
              formControl={formControl}
              isFetching={propertyList.isFetching}
              options={
                (propertyList.isSuccess &&
                  propertyList?.data?.Results?.length > 0 &&
                  propertyList?.data?.Results?.map((item) => ({ label: item, value: item }))) || [
                  {
                    label: "No properties found, check your endpoint",
                    value: "",
                  },
                ]
              }
              placeholder="Columns to select"
              helperText="Comma-separated list of columns to include in the response"
            />
          </Grid>

          {/* Filter Field */}
          <Grid item size={gridItemSize}>
            <CippFormComponent
              type="textField"
              name="$filter"
              label="Filter"
              formControl={formControl}
              placeholder="OData filter"
            />
          </Grid>

          {/* Expand Field */}
          <Grid item size={gridItemSize}>
            <CippFormComponent
              type="textField"
              name="$expand"
              label="Expand"
              formControl={formControl}
              placeholder="Expand related entities"
            />
          </Grid>

          {/* Top Field */}
          <Grid item size={gridItemSize}>
            <CippFormComponent
              type="number"
              fullWidth
              name="$top"
              label="Top"
              formControl={formControl}
              placeholder="Number of records to return"
            />
          </Grid>

          {/* Search Field */}
          <Grid item size={gridItemSize}>
            <CippFormComponent
              type="textField"
              name="$search"
              label="Search"
              formControl={formControl}
              placeholder="Search query"
            />
          </Grid>

          {/* Format Field */}
          <Grid item size={gridItemSize}>
            <CippFormComponent
              type="textField"
              name="$format"
              label="Format"
              formControl={formControl}
              placeholder="Format parameter for report data (e.g. application/json)"
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          {/* Reverse Tenant Lookup Switch */}
          <Grid item size={{ xs: 6, sm: gridSwitchSize }}>
            <CippFormComponent
              type="switch"
              name="ReverseTenantLookup"
              label="Reverse Tenant Lookup"
              formControl={formControl}
            />
          </Grid>
          <CippFormCondition
            formControl={formControl}
            field={"ReverseTenantLookup"}
            compareValue={true}
          >
            {/* Reverse Tenant Lookup Property Field */}
            <Grid item size={6}>
              <CippFormComponent
                type="textField"
                name="ReverseTenantLookupProperty"
                label="Reverse Tenant Lookup Property"
                formControl={formControl}
                placeholder="Enter the reverse tenant lookup property (e.g. tenantId)"
              />
            </Grid>
          </CippFormCondition>
          {/* No Pagination Switch */}
          <Grid item size={{ xs: 6, sm: gridSwitchSize }}>
            <CippFormComponent
              type="switch"
              name="NoPagination"
              label="Disable Pagination"
              formControl={formControl}
            />
          </Grid>
          {/* $count Switch */}
          <Grid item size={{ xs: 6, sm: gridSwitchSize }}>
            <CippFormComponent
              type="switch"
              name="$count"
              label="Use $count"
              formControl={formControl}
            />
          </Grid>

          {/* AsApp switch */}
          <Grid item size={{ xs: 6, sm: gridSwitchSize }}>
            <CippFormComponent
              name="AsApp"
              type="switch"
              formControl={formControl}
              label="As App"
            />
          </Grid>
        </Grid>
      </CippButtonCard>
      <CippApiResults apiObject={savePresetApi} />
      <CippOffCanvas
        visible={offCanvasOpen}
        size="md"
        onClose={() => setOffCanvasOpen(false)}
        children={offCanvasContent}
      />
    </form>
  );
};

export default CippGraphExplorerFilter;
