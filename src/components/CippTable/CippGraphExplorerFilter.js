import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Grid, Button, IconButton, Tooltip, Collapse } from "@mui/material";
import {
  Save as SaveIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useForm, useWatch } from "react-hook-form";
import { debounce } from "lodash";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { ApiGetCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";

const CippGraphExplorerFilter = ({ onSubmitFilter, onSavePreset }) => {
  const [cardExpanded, setCardExpanded] = useState(false); // State for showing/hiding the card content
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      endpoint: "",
      $select: [],
      NoPagination: false,
      ReverseTenantLookup: false,
      ReverseTenantLookupProperty: "tenantId",
      $count: false,
    },
  });

  const { control, handleSubmit, watch } = formControl;
  const tenant = useSettings().currentTenant;
  const endPoint = useWatch({ control, name: "endpoint" });

  // API call for available properties
  const propertyList = ApiGetCall({
    url: "/api/ListGraphRequest",
    queryKey: `graph-properties-${endPoint}`,
    data: {
      Endpoint: endPoint,
      ListProperties: true,
      TenantFilter: tenant,
      IgnoreErrors: true,
    },
    waiting: false,
  });

  // Debounced refetch when endpoint, put in in a useEffect dependand on endpoint
  const debouncedRefetch = useCallback(
    debounce(() => {
      if (endPoint) {
        propertyList.refetch();
      }
    }, 1000),
    [endPoint] // Dependencies that the debounce function depends on
  );

  useEffect(() => {
    debouncedRefetch();
    // Clean up the debounce on unmount
    return () => {
      debouncedRefetch.cancel();
    };
  }, [endPoint, debouncedRefetch]);

  // Watch for endpoint changes

  const onSubmit = (values) => {
    values.$select = values?.$select?.map((item) => item.value)?.join(",");
    onSubmitFilter(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CippButtonCard
        title="Graph Explorer Filter"
        cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
        cardActions={
          <>
            <Tooltip title="Expand/Collapse">
              <IconButton onClick={() => setCardExpanded(!cardExpanded)}>
                {cardExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
          </>
        }
      >
        <Collapse in={cardExpanded} timeout="auto" unmountOnExit>
          <Grid container spacing={2}>
            <Grid container item xs={12} sm={6} spacing={2}>
              <Grid item xs={12}>
                <CippFormComponent
                  type="autoComplete"
                  name="reportTemplate"
                  label="Select a Report Preset"
                  formControl={formControl}
                  api={{
                    url: "/api/ListGraphExplorerPresets",
                    dataKey: "Results",
                    labelField: "name",
                    valueField: "id",
                  }}
                  placeholder="Select a preset"
                />
              </Grid>
              <Grid item xs={12}>
                <CippFormComponent
                  type="textField"
                  name="endpoint"
                  label="Endpoint"
                  formControl={formControl}
                  placeholder="Enter Graph API endpoint"
                />
              </Grid>

              <Grid item xs={12}>
                <CippFormComponent
                  type="autoComplete"
                  name="$select"
                  label="Select"
                  formControl={formControl}
                  options={
                    (propertyList.isSuccess &&
                      propertyList?.data?.Results?.map((item) => ({ label: item, value: item }))) ||
                    []
                  }
                  placeholder="Columns to select"
                  helperText="Comma-separated list of columns to include in the response"
                />
              </Grid>

              {/* Expand Field */}
              <Grid item xs={12}>
                <CippFormComponent
                  type="textField"
                  name="$expand"
                  label="Expand"
                  formControl={formControl}
                  placeholder="Expand related entities"
                />
              </Grid>
            </Grid>

            {/* Right Column */}
            <Grid container item xs={12} sm={6} spacing={2}>
              {/* Preset Name Field */}
              <Grid item xs={10}>
                <CippFormComponent
                  type="textField"
                  name="name"
                  label="Preset Name"
                  formControl={formControl}
                  placeholder="Name for this filter preset"
                />
              </Grid>

              {/* Save Preset Icon Button */}
              <Grid item xs={2} style={{ display: "flex", alignItems: "center" }}>
                <Tooltip title="Save Preset">
                  <IconButton color="primary" onClick={() => onSavePreset(formControl.getValues())}>
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
              </Grid>

              {/* Filter Field */}
              <Grid item xs={12}>
                <CippFormComponent
                  type="textField"
                  name="$filter"
                  label="Filter"
                  formControl={formControl}
                  placeholder="OData filter"
                />
              </Grid>

              {/* Top Field */}
              <Grid item xs={12}>
                <CippFormComponent
                  type="number"
                  name="$top"
                  label="Top"
                  formControl={formControl}
                  placeholder="Number of records to return"
                />
              </Grid>

              {/* Search Field */}
              <Grid item xs={12}>
                <CippFormComponent
                  type="textField"
                  name="$search"
                  label="Search"
                  formControl={formControl}
                  placeholder="Search query"
                />
              </Grid>
            </Grid>

            {/* Reverse Tenant Lookup Switch */}
            <Grid item xs={12} sm={6}>
              <CippFormComponent
                type="switch"
                name="ReverseTenantLookup"
                label="Reverse Tenant Lookup"
                formControl={formControl}
              />
            </Grid>

            {/* Reverse Tenant Lookup Property Field */}
            <Grid item xs={12} sm={6}>
              <CippFormComponent
                type="textField"
                name="ReverseTenantLookupProperty"
                label="Reverse Tenant Lookup Property"
                formControl={formControl}
                placeholder="Enter the reverse tenant lookup property (e.g. tenantId)"
              />
            </Grid>

            {/* No Pagination Switch */}
            <Grid item xs={12} sm={6}>
              <CippFormComponent
                type="switch"
                name="NoPagination"
                label="Disable Pagination"
                formControl={formControl}
              />
            </Grid>

            {/* $count Switch */}
            <Grid item xs={12} sm={6}>
              <CippFormComponent
                type="switch"
                name="$count"
                label="Use $count"
                formControl={formControl}
              />
            </Grid>

            {/* Is Shared Switch */}
            <Grid item xs={12} sm={6}>
              <CippFormComponent
                type="switch"
                name="IsShared"
                label="Share Preset"
                formControl={formControl}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit">
                Apply Filter
              </Button>
            </Grid>
          </Grid>
        </Collapse>
      </CippButtonCard>
    </form>
  );
};

export default CippGraphExplorerFilter;
