import {
  Box,
  Button,
  Divider,
  Skeleton,
  SvgIcon,
  Typography,
  ButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Alert,
} from "@mui/material";
import { Grid, Stack } from "@mui/system";
import { useWatch } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";
import { CippFormCondition } from "/src/components/CippComponents/CippFormCondition";
import CippGraphResourceSelector from "/src/components/CippComponents/CippGraphResourceSelector";
import CippGraphAttributeSelector from "/src/components/CippComponents/CippGraphAttributeSelector";
import { getCippValidator } from "/src/utils/get-cipp-validator";
import { useRouter } from "next/router";
import Link from "next/link";
import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import { useEffect, useState } from "react";
import CippFormInputArray from "../CippComponents/CippFormInputArray";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { ExpandMoreOutlined, Delete, Add, Sync } from "@mui/icons-material";

const CippSchedulerForm = (props) => {
  const { formControl, fullWidth = false, taskId = null, cloneMode = false } = props;
  const selectedCommand = useWatch({ control: formControl.control, name: "command" });
  const [addedConditions, setAddedConditions] = useState([{ id: 0 }]);
  const [isResourcePickerDisabled, setIsResourcePickerDisabled] = useState(false);

  const fieldRequired = (field) => {
    if (field?.Required) {
      return {
        required: { value: true, message: "This field is required" },
      };
    } else {
      return {};
    }
  };

  const handleAddCondition = () => {
    setAddedConditions([...addedConditions, { id: addedConditions.length }]);
  };

  const handleRemoveCondition = (id) => {
    const currentConditions = formControl.getValues("Trigger.DeltaConditions") || [];
    const updatedConditions = currentConditions.filter((_, index) => index !== id);
    formControl.setValue("Trigger.DeltaConditions", updatedConditions);
    setAddedConditions(addedConditions.filter((condition, index) => index !== id));
  };

  const postCall = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: [
      "ListScheduledItems-Edit",
      "ListScheduledItems-hidden",
      "ListScheduledItems",
    ],
  });

  const handleSubmit = () => {
    const values = formControl.getValues();

    // Extract values from string array parameters
    if (values.parameters && selectedCommand?.addedFields?.Parameters) {
      selectedCommand.addedFields.Parameters.forEach((param) => {
        if (param.Type === "System.String[]" && values.parameters[param.Name]) {
          const paramValue = values.parameters[param.Name];
          if (Array.isArray(paramValue)) {
            // Extract just the values from objects with {label, value} structure
            values.parameters[param.Name] = paramValue.map((item) =>
              typeof item === "object" && item.value !== undefined ? item.value : item
            );
          }
        }
      });
    }

    //remove all empty values or blanks
    Object.keys(values).forEach((key) => {
      if (values[key] === "" || values[key] === null) {
        delete values[key];
      }
    });

    postCall.mutate({
      url: "/api/AddScheduledItem",
      data: values,
    });
  };

  const recurrenceOptions = [
    { value: "0", label: "Once" },
    { value: "1d", label: "Every 1 day" },
    { value: "7d", label: "Every 7 days" },
    { value: "30d", label: "Every 30 days" },
    { value: "365d", label: "Every 365 days" },
  ];

  const triggerRecurrenceOptions = [
    { value: "15m", label: "Every 15 minutes" },
    { value: "30m", label: "Every 30 minutes" },
    { value: "1h", label: "Every 1 hour" },
    { value: "4h", label: "Every 4 hours" },
    { value: "12h", label: "Every 12 hours" },
    { value: "1d", label: "Every 1 day" },
  ];

  const taskTypeOptions = [
    { value: "scheduled", label: "Scheduled Task" },
    { value: "triggered", label: "Triggered Task" },
  ];

  const triggerTypeOptions = [{ value: "DeltaQuery", label: "Delta Query" }];

  const deltaResourceOptions = [
    { value: "users", label: "Users" },
    { value: "groups", label: "Groups" },
    { value: "contacts", label: "Contacts" },
    { value: "orgContact", label: "Organizational Contacts" },
    { value: "devices", label: "Devices" },
    { value: "applications", label: "Applications" },
    { value: "servicePrincipals", label: "Service Principals" },
    { value: "directoryObjects", label: "Directory Objects" },
    { value: "directoryRole", label: "Directory Roles" },
    { value: "administrativeUnits", label: "Administrative Units" },
    { value: "oAuth2PermissionGrant", label: "OAuth2 Permission Grants" },
  ];

  const simpleEventOptions = [
    { value: "created", label: "Resource Created" },
    { value: "updated", label: "Resource Updated" },
    { value: "deleted", label: "Resource Deleted" },
  ];

  const operatorOptions = [
    { value: "eq", label: "Equals to" },
    { value: "ne", label: "Not Equals to" },
    { value: "like", label: "Like" },
    { value: "notlike", label: "Not like" },
    { value: "notmatch", label: "Does not match" },
    { value: "gt", label: "Greater than" },
    { value: "lt", label: "Less than" },
    { value: "in", label: "In" },
    { value: "notIn", label: "Not In" },
  ];

  // Watch for trigger-related fields
  const selectedTaskType = useWatch({ control: formControl.control, name: "taskType" });
  const selectedTriggerType = useWatch({ control: formControl.control, name: "Trigger.Type" });
  const selectedDeltaResource = useWatch({
    control: formControl.control,
    name: "Trigger.DeltaResource",
  });
  const selectedTenant = useWatch({ control: formControl.control, name: "tenantFilter" });

  // Watch for summary display
  const selectedSimpleEvent = useWatch({ control: formControl.control, name: "Trigger.EventType" });
  const selectedRecurrence = useWatch({ control: formControl.control, name: "Recurrence" });
  const selectedScheduledTime = useWatch({ control: formControl.control, name: "ScheduledTime" });
  const selectedExecutePerResource = useWatch({
    control: formControl.control,
    name: "Trigger.ExecutePerResource",
  });
  const selectedDeltaExecutionMode = useWatch({
    control: formControl.control,
    name: "Trigger.ExecutionMode",
  });
  const selectedUseConditions = useWatch({
    control: formControl.control,
    name: "Trigger.UseConditions",
  });
  const selectedDeltaConditions = useWatch({
    control: formControl.control,
    name: "Trigger.DeltaConditions",
  });
  const commands = ApiGetCall({
    url: "/api/ListFunctionParameters?Module=CIPPCore",
    queryKey: "ListCommands",
  });

  const router = useRouter();

  const scheduledTaskList = ApiGetCall({
    url: "/api/ListScheduledItems",
    queryKey: "ListScheduledItems-Edit-" + (taskId || router.query.id),
    waiting: !!(taskId || router.query.id),
    data: {
      Id: taskId || router.query.id,
    },
  });

  const tenantList = ApiGetCall({
    url: "/api/ListTenants?AllTenantSelector=true",
    queryKey: "ListTenants-AllTenants",
  });

  // Check if resource picker should be disabled
  useEffect(() => {
    console.log(selectedTenant);
    if (!selectedTenant) {
      setIsResourcePickerDisabled(false);
      return;
    }

    // Disable if AllTenants is selected
    if (selectedTenant.value === "AllTenants") {
      setIsResourcePickerDisabled(true);
      return;
    }

    // Disable if a tenant group is selected (groups have type: "Group")
    if (selectedTenant.type === "Group") {
      setIsResourcePickerDisabled(true);
      return;
    }

    setIsResourcePickerDisabled(false);
  }, [selectedTenant]);

  // Helper functions for accordion summaries
  const getTriggerSummary = () => {
    if (!selectedTriggerType || selectedTaskType?.value !== "triggered") return "";

    let summary = selectedTriggerType.label;

    if (selectedTriggerType.value === "DeltaQuery") {
      if (selectedDeltaResource?.label) {
        summary += ` - ${selectedDeltaResource.label}`;
      }
      if (selectedSimpleEvent?.label) {
        summary += ` (${selectedSimpleEvent.label})`;
      }
      if (selectedUseConditions && selectedDeltaConditions?.length > 0) {
        summary += ` with ${selectedDeltaConditions.length} condition${
          selectedDeltaConditions.length > 1 ? "s" : ""
        }`;
      }
    }

    return summary;
  };

  const getScheduleSummary = () => {
    if (selectedTaskType?.value !== "scheduled") return "";

    let summary = "";
    if (selectedScheduledTime) {
      // Handle both Unix timestamp and regular date formats
      let date;
      if (
        typeof selectedScheduledTime === "number" ||
        (typeof selectedScheduledTime === "string" && /^\d+$/.test(selectedScheduledTime))
      ) {
        // Unix timestamp (seconds or milliseconds)
        const timestamp = parseInt(selectedScheduledTime);
        date = new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000);
      } else {
        date = new Date(selectedScheduledTime);
      }
      // Include both date and time
      summary += `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
    if (selectedRecurrence) {
      summary += summary ? ` - ${selectedRecurrence.label}` : selectedRecurrence.label;
    }

    return summary;
  };

  const getCommandSummary = () => {
    if (!selectedCommand) return "";

    let summary = selectedCommand.label;

    if (selectedTaskType?.value === "triggered" && selectedTriggerType?.value === "DeltaQuery") {
      if (selectedExecutePerResource) {
        summary += " (per resource)";
      }
      if (selectedDeltaExecutionMode) {
        summary += ` - ${selectedDeltaExecutionMode.label}`;
      }
    }

    return summary;
  };
  useEffect(() => {
    if (scheduledTaskList.isSuccess && (taskId || router.query.id)) {
      const task = scheduledTaskList.data.find(
        (task) => task.RowKey === (taskId || router.query.id)
      );

      // Early return if task is not found
      if (!task) {
        console.warn(`Task with RowKey ${taskId || router.query.id} not found`);
        return;
      }

      const postExecution = task?.PostExecution
        ? task.PostExecution.split(",").map((item) => {
            return { label: item.trim(), value: item.trim() };
          })
        : [];

      // Find tenantFilter in tenantList, and create a label/value pair for the autocomplete
      if (tenantList.isSuccess) {
        let tenantFilter = null;
        let tenantFilterForForm = null;

        // Check if the task has a tenant group
        if (task?.TenantGroupInfo) {
          // Handle tenant group
          tenantFilterForForm = {
            value: task.TenantGroupInfo.value,
            label: task.TenantGroupInfo.label,
            type: "Group",
            addedFields: task.TenantGroupInfo,
          };
        } else {
          // Handle regular tenant
          tenantFilter = tenantList.data.find(
            (tenant) =>
              tenant.defaultDomainName === task?.Tenant.value ||
              tenant.defaultDomainName === task?.Tenant
          );
          if (tenantFilter) {
            tenantFilterForForm = {
              value: tenantFilter.defaultDomainName,
              label: `${tenantFilter.displayName} (${tenantFilter.defaultDomainName})`,
              type: "Tenant",
              addedFields: tenantFilter,
            };
          }
        }
        if (commands.isSuccess) {
          const command = commands.data.find((command) => command.Function === task.Command);

          // If command is not found in the list, create a placeholder command entry
          let commandForForm = command;
          if (!command && task.Command) {
            commandForForm = {
              Function: task.Command,
              Parameters: [],
              // Add minimal required structure for system jobs
            };
          }

          var recurrence = recurrenceOptions.find(
            (option) => option.value === task.Recurrence || option.label === task.Recurrence
          );

          // If recurrence is not found in predefined options, create a custom option
          if (!recurrence && task.Recurrence) {
            recurrence = {
              value: task.Recurrence,
              label: `${task.Recurrence}`,
            };
          }

          // if scheduledtime type is a date, convert to unixtime
          if (typeof task.ScheduledTime === "date") {
            task.ScheduledTime = Math.floor(task.ScheduledTime.getTime() / 1000);
          } else if (typeof task.ScheduledTime === "string") {
            task.ScheduledTime = Math.floor(new Date(task.ScheduledTime).getTime() / 1000);
          }

          // Check if any parameter values are complex objects that can't be represented as simple form fields
          const hasComplexObjects =
            task.Parameters && typeof task.Parameters === "object"
              ? Object.entries(task.Parameters).some(([key, value]) => {
                  // Exclude TenantFilter and Headers parameters
                  if (key === "TenantFilter" || key === "Headers") return false;

                  // Check if this parameter is a System.String[] type
                  const paramDef = commandForForm?.Parameters?.find((p) => p.Name === key);
                  if (paramDef?.Type === "System.String[]") return false;

                  // Check for arrays
                  if (Array.isArray(value)) return true;
                  // Check for objects (but not null)
                  if (value !== null && typeof value === "object") return true;
                  // Check for stringified objects that contain [object Object]
                  if (typeof value === "string" && value.includes("[object Object]")) return true;
                  // Check for stringified JSON arrays/objects
                  if (
                    typeof value === "string" &&
                    (value.trim().startsWith("[") || value.trim().startsWith("{"))
                  ) {
                    try {
                      const parsed = JSON.parse(value);
                      return typeof parsed === "object";
                    } catch {
                      return false;
                    }
                  }
                  return false;
                })
              : false;

          const ResetParams = {
            tenantFilter: tenantFilterForForm,
            RowKey: router.query.Clone || cloneMode ? null : task.RowKey,
            Name: router.query.Clone || cloneMode ? `${task.Name} (Clone)` : task?.Name,
            command: { label: task.Command, value: task.Command, addedFields: commandForForm },
            ScheduledTime: task.ScheduledTime,
            Recurrence: recurrence,
            parameters: task.Parameters,
            postExecution: postExecution,
            // Set task type based on whether trigger exists
            taskType: task.Trigger
              ? { value: "triggered", label: "Triggered Task" }
              : { value: "scheduled", label: "Scheduled Task" },
            // Trigger configuration - use the trigger data directly since it's already in the correct format
            ...(task.Trigger && {
              "Trigger.Type": task.Trigger.Type,
              "Trigger.DeltaResource": task.Trigger.DeltaResource,
              "Trigger.EventType": task.Trigger.EventType,
              "Trigger.ResourceFilter": task.Trigger.ResourceFilter || [],
              "Trigger.WatchedAttributes": task.Trigger.WatchedAttributes || [],
              "Trigger.UseConditions": task.Trigger.UseConditions || false,
              "Trigger.DeltaConditions": task.Trigger.DeltaConditions || [],
              "Trigger.ExecutePerResource": task.Trigger.ExecutePerResource || false,
              "Trigger.ExecutionMode": task.Trigger.ExecutionMode,
            }),
            // Show advanced parameters if:
            // 1. RawJsonParameters exist
            // 2. It's a system command with no defined parameters
            // 3. Any parameter contains complex objects (arrays, objects, etc.)
            advancedParameters: task.RawJsonParameters
              ? true
              : hasComplexObjects ||
                !commandForForm?.Parameters ||
                commandForForm.Parameters.length === 0,
            // Set the RawJsonParameters if they exist
            RawJsonParameters: task.RawJsonParameters || "",
          };
          formControl.reset(ResetParams);

          // Set up condition builder if task has delta conditions
          if (
            task.Trigger?.DeltaConditions &&
            Array.isArray(task.Trigger.DeltaConditions) &&
            task.Trigger.DeltaConditions.length > 0
          ) {
            const conditionsWithIds = task.Trigger.DeltaConditions.map((condition, index) => ({
              id: index,
              ...condition,
            }));
            setAddedConditions(conditionsWithIds);
          } else {
            // Reset to default single condition if no conditions exist
            setAddedConditions([{ id: 0 }]);
          }
        }
      }
    }
  }, [
    taskId,
    router.query.id,
    scheduledTaskList.isSuccess,
    tenantList.isSuccess,
    router.query.Clone,
    cloneMode,
    commands.isSuccess,
  ]);

  const advancedParameters = useWatch({ control: formControl.control, name: "advancedParameters" });

  useEffect(() => {
    if (advancedParameters === true) {
      // Check if we're editing an existing task and it has RawJsonParameters
      const currentRawJsonParameters = formControl.getValues("RawJsonParameters");

      // If we already have raw JSON parameters (from editing existing task), use those
      if (
        currentRawJsonParameters &&
        currentRawJsonParameters.trim() !== "" &&
        currentRawJsonParameters !== "{}"
      ) {
        // Already populated from existing task, no need to overwrite
        return;
      }

      // Get the original task parameters if we're editing (to preserve complex objects)
      let parametersToUse = null;
      if ((taskId || router.query.id) && scheduledTaskList.isSuccess) {
        const task = scheduledTaskList.data.find(
          (task) => task.RowKey === (taskId || router.query.id)
        );
        if (task?.Parameters) {
          parametersToUse = task.Parameters;
        }
      }

      // If we don't have original task parameters, use current form parameters
      if (!parametersToUse) {
        parametersToUse = formControl.getValues("parameters");
      }

      // Add null check to prevent error when no parameters exist
      if (parametersToUse && typeof parametersToUse === "object") {
        // Create a clean copy for JSON
        const cleanParams = { ...parametersToUse };
        Object.keys(cleanParams).forEach((key) => {
          if (cleanParams[key] === "" || cleanParams[key] === null) {
            delete cleanParams[key];
          }
        });
        const jsonString = JSON.stringify(cleanParams, null, 2);
        formControl.setValue("RawJsonParameters", jsonString);
      } else {
        // If no parameters, set empty object
        formControl.setValue("RawJsonParameters", "{}");
      }
    }
  }, [advancedParameters, taskId, router.query.id, scheduledTaskList.isSuccess]);

  const gridSize = fullWidth ? 12 : 4; // Adjust size based on fullWidth prop

  return (
    <>
      <Grid container spacing={2}>
        {(scheduledTaskList.isFetching || tenantList.isLoading || commands.isLoading) && (
          <Skeleton width={"100%"} />
        )}
        {/* Top section: Tenant and Task Name */}
        <Grid size={{ md: 12, xs: 12 }}>
          <CippFormTenantSelector
            label="Select a Tenant"
            formControl={formControl}
            type="single"
            allTenants={true}
            includeGroups={true}
            required={true}
          />
        </Grid>

        <Grid size={{ md: 12, xs: 12 }}>
          <CippFormComponent
            type="textField"
            name="Name"
            label="Task Name"
            formControl={formControl}
            required={true}
          />
        </Grid>

        <Grid size={{ md: 12, xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            name="postExecution"
            label="Post Execution Actions"
            formControl={formControl}
            multiple
            creatable={false}
            options={[
              { label: "Webhook", value: "Webhook" },
              { label: "Email", value: "Email" },
              { label: "PSA", value: "PSA" },
            ]}
          />
        </Grid>

        {/* Divider */}
        <Grid size={{ md: 12, xs: 12 }}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Task Type Selection */}
        <Grid size={{ md: 12, xs: 12 }}>
          <ButtonGroup variant="outlined" fullWidth sx={{ mb: 2 }}>
            {taskTypeOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedTaskType?.value === option.value ? "contained" : "outlined"}
                color={selectedTaskType?.value === option.value ? "primary" : "inherit"}
                onClick={() => {
                  formControl.setValue("taskType", option);
                }}
                fullWidth
              >
                {option.label}
              </Button>
            ))}
          </ButtonGroup>
        </Grid>

        {/* Trigger Configuration Accordion */}
        <CippFormCondition
          field="taskType"
          compareType="is"
          compareValue={{ value: "triggered", label: "Triggered Task" }}
          formControl={formControl}
        >
          <Grid size={{ md: 12, xs: 12 }}>
            <Accordion defaultExpanded variant="outlined">
              <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                  <Typography variant="h6">Trigger Configuration</Typography>
                  {getTriggerSummary() && (
                    <Typography variant="body2" color="text.secondary">
                      - {getTriggerSummary()}
                    </Typography>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ md: 12, xs: 12 }}>
                    <CippFormComponent
                      name="Trigger.Type"
                      type="autoComplete"
                      label="Trigger Type"
                      multiple={false}
                      creatable={false}
                      required={true}
                      formControl={formControl}
                      options={triggerTypeOptions}
                    />
                  </Grid>

                  {/* Delta Query Configuration */}
                  <CippFormCondition
                    field="Trigger.Type"
                    compareType="is"
                    compareValue={{ value: "DeltaQuery", label: "Delta Query" }}
                    formControl={formControl}
                  >
                    <Grid size={{ md: 12, xs: 12 }}>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          Delta queries track changes to Microsoft Graph resources. Learn more about{" "}
                          <Link
                            href="https://learn.microsoft.com/en-us/graph/delta-query-overview"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "inherit", textDecoration: "underline" }}
                          >
                            delta query concepts and usage
                          </Link>{" "}
                          in the Microsoft documentation.
                        </Typography>
                      </Alert>
                    </Grid>

                    <Grid size={{ md: 12, xs: 12 }}>
                      <CippFormComponent
                        name="Trigger.DeltaResource"
                        type="autoComplete"
                        label="Resource Type"
                        multiple={false}
                        creatable={false}
                        required={true}
                        formControl={formControl}
                        options={deltaResourceOptions}
                        helperText="Select the type of Microsoft Graph resource to monitor for changes. Different resources support different properties and events."
                      />
                    </Grid>

                    <Grid size={{ md: 12, xs: 12 }}>
                      <CippFormComponent
                        name="Trigger.EventType"
                        type="autoComplete"
                        label="Event Type"
                        multiple={false}
                        creatable={false}
                        required={true}
                        formControl={formControl}
                        options={simpleEventOptions}
                        helperText="Choose what type of change to monitor: Created (new resources), Updated (modified resources), or Deleted (removed resources). Created events are limited to resources with a createdDateTime property."
                      />
                    </Grid>

                    <CippFormCondition
                      field="Trigger.EventType"
                      compareType="valueNotEq"
                      compareValue={"created"}
                      formControl={formControl}
                    >
                      <Grid size={{ md: 12, xs: 12 }}>
                        <CippGraphResourceSelector
                          name="Trigger.ResourceFilter"
                          formControl={formControl}
                          resourceFieldName="Trigger.DeltaResource"
                          tenantFilterFieldName="tenantFilter"
                          label="Filter Specific Resources (Optional)"
                          multiple={true}
                          required={false}
                          disabled={isResourcePickerDisabled}
                          helperText={
                            isResourcePickerDisabled
                              ? "Resource filtering is not available when All Tenants or tenant groups are selected"
                              : "Select specific resources to monitor"
                          }
                        />
                      </Grid>
                    </CippFormCondition>

                    <Grid size={{ md: 12, xs: 12 }}>
                      <CippGraphAttributeSelector
                        name="Trigger.WatchedAttributes"
                        formControl={formControl}
                        resourceFieldName="Trigger.DeltaResource"
                        label="Attributes to Monitor"
                        multiple={true}
                        required={false}
                        helperText="Specify which properties to monitor for changes. Leave empty to monitor all properties. Only changes to selected attributes will trigger the task."
                      />
                    </Grid>

                    {/* Condition Builder for all event types */}
                    <Grid size={{ md: 12, xs: 12 }}>
                      <CippFormComponent
                        type="switch"
                        name="Trigger.UseConditions"
                        label="Add Conditions"
                        formControl={formControl}
                        helperText="Enable to add PowerShell-style filters that determine which specific resources should trigger the task. Use this to create more targeted triggers based on resource properties."
                      />
                    </Grid>

                    <CippFormCondition
                      field="Trigger.UseConditions"
                      compareType="is"
                      compareValue={true}
                      formControl={formControl}
                    >
                      <Grid size={{ md: 12, xs: 12 }}>
                        <Divider sx={{ my: 2 }} />
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Typography variant="h6">Delta Query Conditions</Typography>
                          <Button
                            startIcon={<Add />}
                            onClick={handleAddCondition}
                            variant="outlined"
                            size="small"
                          >
                            Add Condition
                          </Button>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Create PowerShell-style Where-Object conditions to filter delta query
                          results. Each condition compares a resource property against a specific
                          value. Multiple conditions work as AND logic - all must be true to trigger
                          the task.
                        </Typography>
                      </Grid>

                      {addedConditions.map((condition, index) => (
                        <Grid container spacing={2} key={condition.id}>
                          <Grid size={4}>
                            <CippFormComponent
                              type="textField"
                              name={`Trigger.DeltaConditions.${index}.Property`}
                              formControl={formControl}
                              label="Property Name"
                              placeholder="displayName"
                              required={true}
                            />
                          </Grid>
                          <Grid size={3}>
                            <CippFormComponent
                              type="autoComplete"
                              multiple={false}
                              name={`Trigger.DeltaConditions.${index}.Operator`}
                              formControl={formControl}
                              label="Operator"
                              options={operatorOptions}
                              required={true}
                              disableClearable={true}
                            />
                          </Grid>
                          <Grid size={4}>
                            <CippFormComponent
                              type="textField"
                              name={`Trigger.DeltaConditions.${index}.Value`}
                              formControl={formControl}
                              label="Value"
                              placeholder="*admin*"
                            />
                          </Grid>
                          <Grid size={1}>
                            <IconButton onClick={() => handleRemoveCondition(index)} color="error">
                              <Delete />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}
                    </CippFormCondition>

                    {/* Delta Query Execution Options */}
                    <Grid size={{ md: 12, xs: 12 }}>
                      <CippFormComponent
                        type="switch"
                        name="Trigger.ExecutePerResource"
                        label="Execute Command Per Resource"
                        formControl={formControl}
                        helperText="When enabled, the command will be executed once for each resource that matches the delta query. When disabled, the command runs once with all matching resources passed as a parameter."
                      />
                    </Grid>

                    <Grid size={{ md: 12, xs: 12 }}>
                      <CippFormComponent
                        type="autoComplete"
                        name="Trigger.ExecutionMode"
                        label="Execution Mode"
                        formControl={formControl}
                        options={[
                          { value: "once", label: "Run Once" },
                          { value: "repeat", label: "Repeat Indefinitely" },
                        ]}
                        multiple={false}
                        disableClearable={true}
                        creatable={false}
                        required={true}
                        helperText="Run Once: Execute the task when changes are detected, then stop monitoring. Repeat Indefinitely: Continue monitoring and executing the task every time changes are detected."
                      />
                    </Grid>

                    {/* Trigger Recurrence */}
                    <Grid size={{ md: 12, xs: 12 }}>
                      <CippFormComponent
                        type="autoComplete"
                        name="Recurrence"
                        label="Check Frequency"
                        formControl={formControl}
                        options={triggerRecurrenceOptions}
                        multiple={false}
                        disableClearable={true}
                        creatable={false}
                        required={true}
                        helperText="How often to poll Microsoft Graph for changes. More frequent checks provide faster response times but consume more API quota. Consider your monitoring needs and Graph API rate limits."
                      />
                    </Grid>
                  </CippFormCondition>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </CippFormCondition>

        {/* Schedule Configuration - Only for scheduled tasks */}
        <CippFormCondition
          field="taskType"
          compareType="is"
          compareValue={{ value: "scheduled", label: "Scheduled Task" }}
          formControl={formControl}
        >
          <Grid size={{ md: 12, xs: 12 }}>
            <Accordion defaultExpanded variant="outlined">
              <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                  <Typography variant="h6">Schedule Configuration</Typography>
                  {getScheduleSummary() && (
                    <Typography variant="body2" color="text.secondary">
                      - {getScheduleSummary()}
                    </Typography>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ md: gridSize, xs: 12 }}>
                    <CippFormComponent
                      type="datePicker"
                      name="ScheduledTime"
                      label="Start Date"
                      fullWidth
                      formControl={formControl}
                      validators={{
                        required: { value: true, message: "You must set a start date." },
                      }}
                    />
                  </Grid>
                  <Grid size={{ md: gridSize, xs: 12 }}>
                    <CippFormComponent
                      type="autoComplete"
                      name="Recurrence"
                      label="Recurrence"
                      formControl={formControl}
                      options={(() => {
                        let options = [...recurrenceOptions];

                        // If we're editing a task and the recurrence isn't in the base options, add it
                        if ((taskId || router.query.id) && scheduledTaskList.isSuccess) {
                          const task = scheduledTaskList.data.find(
                            (task) => task.RowKey === (taskId || router.query.id)
                          );
                          if (
                            task?.Recurrence &&
                            !options.find((opt) => opt.value === task.Recurrence)
                          ) {
                            options.push({
                              value: task.Recurrence,
                              label: `Custom: ${task.Recurrence}`,
                            });
                          }
                        }

                        return options;
                      })()}
                      multiple={false}
                      disableClearable={true}
                      creatable={true}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </CippFormCondition>

        {/* Command & Parameters - For both scheduled and triggered tasks */}
        <Grid size={{ md: 12, xs: 12 }}>
          <Accordion defaultExpanded variant="outlined">
            <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                <Typography variant="h6">Command & Parameters</Typography>
                {getCommandSummary() && (
                  <Typography variant="body2" color="text.secondary">
                    - {getCommandSummary()}
                  </Typography>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {/* Command selection for both scheduled and triggered tasks */}
                <Grid size={{ md: gridSize, xs: 12 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ flexGrow: 1 }}>
                      <CippFormComponent
                        name="command"
                        type="autoComplete"
                        label="Select Command"
                        multiple={false}
                        creatable={false}
                        required={true}
                        formControl={formControl}
                        isFetching={commands.isFetching}
                        options={(() => {
                          const baseOptions =
                            commands.data?.map((command) => {
                              return {
                                label: command.Function,
                                value: command.Function,
                                addedFields: command,
                              };
                            }) || [];

                          // If we're editing a task and the command isn't in the base options, add it
                          if ((taskId || router.query.id) && scheduledTaskList.isSuccess) {
                            const task = scheduledTaskList.data.find(
                              (task) => task.RowKey === (taskId || router.query.id)
                            );
                            if (
                              task?.Command &&
                              !baseOptions.find((opt) => opt.value === task.Command)
                            ) {
                              baseOptions.unshift({
                                label: task.Command,
                                value: task.Command,
                                addedFields: {
                                  Function: task.Command,
                                  Parameters: [],
                                },
                              });
                            }
                          }

                          return baseOptions;
                        })()}
                        validators={{
                          validate: (value) => {
                            if (!value) {
                              return "Please select a Command";
                            }
                            return true;
                          },
                        }}
                      />
                    </Box>
                    <IconButton onClick={() => commands.refetch()}>
                      <Sync />
                    </IconButton>
                  </Stack>
                </Grid>

                {selectedCommand?.addedFields?.Synopsis && (
                  <Grid size={{ md: 12, xs: 12 }}>
                    <Box sx={{ my: 1 }}>
                      <Typography variant="h6">PowerShell Command:</Typography>
                      <Typography variant="body2" color={"text.secondary"}>
                        {selectedCommand.addedFields.Synopsis}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {selectedCommand?.addedFields?.Parameters?.map((param, idx) => (
                  <CippFormCondition
                    field="advancedParameters"
                    compareType="isNot"
                    compareValue={true}
                    formControl={formControl}
                    key={idx}
                  >
                    <Grid
                      size={{
                        md: param.Type === "System.Collections.Hashtable" ? 12 : gridSize,
                        xs: 12,
                      }}
                    >
                      {param.Type === "System.Boolean" ||
                      param.Type === "System.Management.Automation.SwitchParameter" ? (
                        <CippFormComponent
                          type="switch"
                          name={`parameters.${param.Name}`}
                          label={param.Name}
                          formControl={formControl}
                          helperText={param.Description}
                        />
                      ) : param.Type === "System.Collections.Hashtable" ? (
                        <CippFormInputArray
                          formControl={formControl}
                          name={`parameters.${param.Name}`}
                          label={`${param.Name}`}
                          helperText={param.Description}
                          key={idx}
                        />
                      ) : param.Type === "System.String[]" ? (
                        <CippFormComponent
                          type="autoComplete"
                          name={`parameters.${param.Name}`}
                          label={param.Name}
                          formControl={formControl}
                          placeholder={`Enter values for ${param.Name}`}
                          helperText={param.Description}
                          validators={fieldRequired(param)}
                          required={param.Required}
                          multiple={true}
                          freeSolo={true}
                          creatable={true}
                          options={[]}
                        />
                      ) : param.Type?.startsWith("System.String") ? (
                        <CippFormComponent
                          type="textField"
                          name={`parameters.${param.Name}`}
                          label={param.Name}
                          formControl={formControl}
                          placeholder={`Enter a value for ${param.Name}`}
                          helperText={param.Description}
                          validators={fieldRequired(param)}
                          required={param.Required}
                          disableVariables={true}
                        />
                      ) : (
                        <CippFormComponent
                          type="textField"
                          name={`parameters.${param.Name}`}
                          label={param.Name}
                          formControl={formControl}
                          placeholder={`Enter a value for ${param.Name}`}
                          helperText={param.Description}
                          validators={fieldRequired(param)}
                          required={param.Required}
                          disableVariables={true}
                        />
                      )}
                    </Grid>
                  </CippFormCondition>
                ))}

                <Grid size={{ md: 12, xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    name="advancedParameters"
                    label="Use advanced parameters"
                    formControl={formControl}
                    helperText="Advanced Parameters are used when you want to use parameters not available in the standard fields."
                  />
                </Grid>

                <CippFormCondition
                  field="advancedParameters"
                  compareType="is"
                  compareValue={true}
                  formControl={formControl}
                >
                  <Grid size={{ md: 12, xs: 12 }}>
                    <CippFormComponent
                      type="textField"
                      name="RawJsonParameters"
                      label="Advanced Parameters (JSON Input)"
                      validators={{
                        validate: (value) => getCippValidator(value, "json"),
                      }}
                      formControl={formControl}
                      multiline
                      rows={6}
                      maxRows={30}
                      sx={{
                        "& .MuiInputBase-root": {
                          overflow: "auto",
                          minHeight: "200px",
                        },
                      }}
                      placeholder={`Enter a JSON object`}
                    />
                  </Grid>
                </CippFormCondition>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid size={{ xs: 12 }} sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={() => {
              formControl.trigger();
              handleSubmit();
            }}
            disabled={postCall.isPending}
            variant="contained"
            color="primary"
            type="submit"
            startIcon={
              <SvgIcon fontSize="small">
                <CalendarDaysIcon />
              </SvgIcon>
            }
          >
            {taskId || router.query.id ? "Edit" : "Add"} Schedule
          </Button>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CippApiResults apiObject={postCall} />
        </Grid>
      </Grid>
    </>
  );
};

export default CippSchedulerForm;
