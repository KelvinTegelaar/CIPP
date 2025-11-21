import React, { useState, useMemo } from "react";
import { Box, Button, IconButton, Typography, Alert, Paper } from "@mui/material";
import { Grid } from "@mui/system";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import CippFormComponent from "./CippFormComponent";
import { CippFormCondition } from "./CippFormCondition";
import { useWatch } from "react-hook-form";
import {
  getTenantGroupPropertyOptions,
  getTenantGroupOperatorOptions,
  getTenantGroupValueOptions,
  getTenantGroupsQuery,
} from "../../utils/get-cipp-tenant-group-options";
import { ApiGetCallWithPagination } from "../../api/ApiCall";

const CippTenantGroupRuleBuilder = ({ formControl, name = "dynamicRules" }) => {
  const [ruleCount, setRuleCount] = useState(1);

  // Watch the rules array to get current values
  const watchedRules = useWatch({
    control: formControl.control,
    name: name,
    defaultValue: [{}],
  });

  // Watch the logic operator
  const ruleLogic = useWatch({
    control: formControl.control,
    name: "ruleLogic",
    defaultValue: "and",
  });

  const propertyOptions = getTenantGroupPropertyOptions();

  // Fetch tenant groups using ApiGetCallWithPagination
  const tenantGroupsQuery = ApiGetCallWithPagination(getTenantGroupsQuery());

  const tenantGroupOptions = useMemo(() => {
    if (tenantGroupsQuery.isSuccess && tenantGroupsQuery.data?.pages) {
      // Flatten all pages and extract Results
      const allGroups = tenantGroupsQuery.data.pages.flatMap((page) => page?.Results || []);
      return allGroups
        .filter((group) => group.GroupType === "static")
        .map((group) => ({
          label: group.Name || group.displayName,
          value: group.Id || group.RowKey,
          type: group.GroupType,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    return [];
  }, [tenantGroupsQuery.isSuccess, tenantGroupsQuery.data]);

  const addRule = () => {
    const currentRules = formControl.getValues(name) || [];
    const newRules = [...currentRules, {}];
    formControl.setValue(name, newRules);
    setRuleCount(ruleCount + 1);
  };

  const removeRule = (index) => {
    const currentRules = formControl.getValues(name) || [];
    const newRules = currentRules.filter((_, i) => i !== index);
    formControl.setValue(name, newRules);
    setRuleCount(Math.max(1, ruleCount - 1));
  };

  const getValueOptions = (ruleIndex) => {
    const rules = watchedRules || [];
    const rule = rules[ruleIndex];
    const propertyType = rule?.property?.type;

    // Return tenant group options for tenantGroup type
    if (propertyType === "tenantGroup") {
      return tenantGroupOptions;
    }

    return getTenantGroupValueOptions(propertyType);
  };

  const getOperatorOptions = (ruleIndex) => {
    const rules = watchedRules || [];
    const rule = rules[ruleIndex];
    const propertyType = rule?.property?.type;
    return getTenantGroupOperatorOptions(propertyType);
  };

  const renderRule = (ruleIndex) => {
    const isFirstRule = ruleIndex === 0;
    const canRemove = (watchedRules?.length || 0) > 1;

    return (
      <Box key={ruleIndex} sx={{ mb: 2 }}>
        {!isFirstRule && (
          <Typography
            variant="body2"
            sx={{ mb: 1, fontWeight: "bold", color: "primary.main", textAlign: "center" }}
          >
            {(ruleLogic || "and").toUpperCase()}
          </Typography>
        )}

        <Grid container spacing={2} alignItems="center">
          {/* Property Selection */}
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              name={`${name}.${ruleIndex}.property`}
              label="Property"
              options={propertyOptions}
              formControl={formControl}
              required
              placeholder="Select property"
              multiple={false}
              fullWidth
            />
          </Grid>

          {/* Operator Selection */}
          <Grid size={{ md: 3, xs: 12 }}>
            <CippFormCondition
              formControl={formControl}
              field={`${name}.${ruleIndex}.property`}
              compareType="hasValue"
              compareValue={true}
            >
              <CippFormComponent
                type="autoComplete"
                name={`${name}.${ruleIndex}.operator`}
                label="Operator"
                options={getOperatorOptions(ruleIndex)}
                formControl={formControl}
                required
                placeholder="Select operator"
                multiple={false}
                fullWidth
              />
            </CippFormCondition>
          </Grid>

          {/* Value Selection - Conditional based on property type */}
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormCondition
              formControl={formControl}
              field={`${name}.${ruleIndex}.property`}
              compareType="hasValue"
              compareValue={true}
            >
              {/* Custom Variable - Two-field input */}
              {watchedRules?.[ruleIndex]?.property?.type === "customVariable" ? (
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <CippFormComponent
                      type="autoComplete"
                      name={`${name}.${ruleIndex}.value.variableName`}
                      label="Variable Name"
                      formControl={formControl}
                      required
                      placeholder="Select or type variable name"
                      fullWidth
                      multiple={false}
                      freeSolo={true}
                      creatable={true}
                      api={{
                        url: "/api/ListCustomVariables?includeSystem=false&excludeGlobalReserved=true",
                        labelField: (option) => {
                          if (typeof option === "string") return option;
                          return option.Name || option;
                        },
                        valueField: (option) => {
                          if (typeof option === "string") return option;
                          return option.Name || option;
                        },
                        queryKey: "CustomVariables-TenantSpecific",
                        dataKey: "Results",
                      }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <CippFormComponent
                      type="textField"
                      name={`${name}.${ruleIndex}.value.value`}
                      label="Expected Value"
                      formControl={formControl}
                      required
                      placeholder="Value to match"
                      fullWidth
                    />
                  </Grid>
                </Grid>
              ) : (
                <CippFormComponent
                  type="autoComplete"
                  name={`${name}.${ruleIndex}.value`}
                  label="Value"
                  options={getValueOptions(ruleIndex)}
                  formControl={formControl}
                  required
                  placeholder="Select value"
                  isFetching={
                    tenantGroupsQuery.isFetching &&
                    watchedRules?.[ruleIndex]?.property?.type === "tenantGroup"
                  }
                />
              )}
            </CippFormCondition>
          </Grid>

          {/* Remove Rule Button */}
          <Grid size={{ md: 1, xs: 12 }} sx={{ display: "flex", justifyContent: "center" }}>
            {canRemove && (
              <IconButton color="error" onClick={() => removeRule(ruleIndex)} size="small">
                <DeleteIcon />
              </IconButton>
            )}
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Dynamic Rules
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Define rules to automatically include tenants in this group. Rules are combined with the
        selected logic operator. Examples: "Available License equals Microsoft 365 E3"{" "}
        {(ruleLogic || "and").toUpperCase()} "Delegated Access Status equals Direct Tenant"
        {" | "}
        "Member of Tenant Group equals 'Production Tenants'"
        {" | "}
        "Custom Variable: Environment equals Production"
      </Alert>

      {/* Logic Operator Selection */}
      <Box sx={{ mb: 3 }}>
        <CippFormComponent
          type="radio"
          name="ruleLogic"
          label="Rule Logic"
          options={[
            { label: "AND (All rules must match)", value: "and" },
            { label: "OR (Any rule must match)", value: "or" },
          ]}
          formControl={formControl}
          defaultValue="and"
        />
      </Box>

      {/* Render existing rules */}
      {(watchedRules || [{}]).map((_, index) => renderRule(index))}

      {/* Add Rule Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addRule}>
          Add Rule
        </Button>
      </Box>
    </Paper>
  );
};

export default CippTenantGroupRuleBuilder;
