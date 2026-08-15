import { useState, useEffect } from "react";
import { Button, Stack, Box } from "@mui/material";
import { PlayCircle, ManageSearch, TableChart, Code } from "@mui/icons-material";
import { useForm, useWatch } from "react-hook-form";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { ApiGetCall } from "../../api/ApiCall";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import CippGraphExplorerFilter from "./CippGraphExplorerFilter";
import defaultPresets from "../../data/GraphExplorerPresets";
import { GroupHeader, GroupItems } from "../CippComponents/CippAutocompleteGrouping";

const CippGraphExplorerSimpleFilter = ({
  onSubmitFilter,
  onPresetChange,
  relatedQueryKeys = [],
  viewMode = "table",
  onViewModeChange,
}) => {
  const [offCanvasVisible, setOffCanvasVisible] = useState(false);
  const [presetOptions, setPresetOptions] = useState([]);
  const [currentFilterValues, setCurrentFilterValues] = useState(null);

  const presetControl = useForm({
    mode: "onChange",
    defaultValues: {
      reportTemplate: null,
    },
  });

  const selectedPreset = useWatch({ control: presetControl.control, name: "reportTemplate" });

  // API call for available presets
  const presetList = ApiGetCall({
    url: "/api/ListGraphExplorerPresets",
    queryKey: "ListGraphExplorerPresets",
  });

  useEffect(() => {
    var presetOptionList = [];
    defaultPresets.forEach((item) => {
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

  const handleRunPreset = () => {
    // re-run the last applied query from the edit drawer, preset change clears it
    if (currentFilterValues) {
      onSubmitFilter(currentFilterValues);
      return;
    }
    if (selectedPreset?.addedFields?.params) {
      const params = selectedPreset.addedFields.params;
      const values = { ...params };

      // Handle $select array/string conversion
      if (values.$select && Array.isArray(values.$select) && values.$select.length > 0) {
        values.$select = values.$select
          .map((item) => (typeof item === "string" ? item : item.value))
          .join(",");
      } else if (!values.$select || values.$select.length === 0) {
        delete values.$select;
      }

      // Handle version conversion
      if (values.version && values.version.value) {
        values.version = values.version.value;
      } else if (!values.version) {
        values.version = "beta";
      }

      // Clean up false boolean values
      if (values.ReverseTenantLookup === false) {
        delete values.ReverseTenantLookup;
      }
      if (values.NoPagination === false) {
        delete values.NoPagination;
      }
      if (values.$count === false) {
        delete values.$count;
      }
      if (values.AsApp === false) {
        delete values.AsApp;
      }

      // Remove non-API fields and null/empty values (presets saved from the form carry id/name/IsShared in params)
      delete values.id;
      delete values.name;
      delete values.IsShared;
      Object.keys(values).forEach((key) => {
        if (values[key] === null || values[key] === "") {
          delete values[key];
        }
      });

      // Update page title if callback provided
      if (onPresetChange && selectedPreset.label) {
        onPresetChange(`Graph Explorer - ${selectedPreset.label}`);
      }

      setCurrentFilterValues(values);
      onSubmitFilter(values);
    }
  };

  const handleFilterSubmit = (values) => {
    setCurrentFilterValues(values);
    onSubmitFilter(values);
    setOffCanvasVisible(false);
  };

  const handlePresetChange = (preset) => {
    setCurrentFilterValues(null);
    presetControl.setValue("reportTemplate", preset);
  };

  // preset picked directly in the bar, discard drawer edits so Run uses the pristine preset
  useEffect(() => {
    setCurrentFilterValues(null);
  }, [selectedPreset?.value]);

  return (
    <>
      {/* This sits on a page with no Card, so at 390px there is ~358px for a query field
          plus three buttons whose fixed minimums alone came to 340px. */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "flex-end" },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CippFormComponent
            type="autoComplete"
            name="reportTemplate"
            label="Select a query"
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
            placeholder="Select a query to run"
          />
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pb: 0.25 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayCircle />}
            onClick={handleRunPreset}
            disabled={!selectedPreset && !currentFilterValues}
            sx={{ minWidth: { md: "100px" } }}
          >
            Run
          </Button>
          <Button
            variant="outlined"
            startIcon={<ManageSearch />}
            onClick={() => setOffCanvasVisible(true)}
            sx={{ minWidth: { md: "120px" } }}
          >
            Edit Query
          </Button>
          {onViewModeChange && (
            <Button
              variant="outlined"
              startIcon={viewMode === "table" ? <Code /> : <TableChart />}
              onClick={() => onViewModeChange(viewMode === "table" ? "json" : "table")}
              sx={{ minWidth: { md: "120px" } }}
            >
              {viewMode === "table" ? "View JSON" : "View Table"}
            </Button>
          )}
        </Stack>
      </Box>

      <CippOffCanvas
        size="md"
        title="Graph Explorer Query"
        visible={offCanvasVisible}
        onClose={() => setOffCanvasVisible(false)}
        contentPadding={1}
        keepMounted={true}
      >
        <CippGraphExplorerFilter
          onSubmitFilter={handleFilterSubmit}
          onPresetChange={onPresetChange}
          component="card"
          relatedQueryKeys={relatedQueryKeys}
          selectedPreset={selectedPreset}
          onPresetSelect={handlePresetChange}
        />
      </CippOffCanvas>
    </>
  );
};

export default CippGraphExplorerSimpleFilter;
