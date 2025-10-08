import { Box, Button, Divider, Skeleton, SvgIcon, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { useWatch } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";
import { CippFormCondition } from "/src/components/CippComponents/CippFormCondition";
import { getCippValidator } from "/src/utils/get-cipp-validator";
import { useRouter } from "next/router";
import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import { useEffect } from "react";
import CippFormInputArray from "../CippComponents/CippFormInputArray";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

const CippSchedulerForm = (props) => {
  const { formControl, fullWidth = false } = props; // Added fullWidth prop
  const selectedCommand = useWatch({ control: formControl.control, name: "command" });

  const fieldRequired = (field) => {
    if (field?.Required) {
      return {
        required: { value: true, message: "This field is required" },
      };
    } else {
      return {};
    }
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
  const commands = ApiGetCall({
    url: "/api/ListFunctionParameters?Module=CIPPCore",
    queryKey: "ListCommands",
  });

  const router = useRouter();
  const scheduledTaskList = ApiGetCall({
    url: "/api/ListScheduledItems",
    queryKey: "ListScheduledItems-Edit-" + router.query.id,
    waiting: !!router.query.id,
    data: {
      Id: router.query.id,
    },
  });

  const tenantList = ApiGetCall({
    url: "/api/ListTenants?AllTenantSelector=true",
    queryKey: "ListTenants-AllTenants",
  });
  useEffect(() => {
    if (scheduledTaskList.isSuccess && router.query.id) {
      const task = scheduledTaskList.data.find((task) => task.RowKey === router.query.id);

      // Early return if task is not found
      if (!task) {
        console.warn(`Task with RowKey ${router.query.id} not found`);
        return;
      }

      const postExecution = task?.postExecution?.split(",").map((item) => {
        return { label: item, value: item };
      });

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
              ? Object.values(task.Parameters).some((value) => {
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
            RowKey: router.query.Clone ? null : task.RowKey,
            Name: router.query.Clone ? `${task.Name} (Clone)` : task?.Name,
            command: { label: task.Command, value: task.Command, addedFields: commandForForm },
            ScheduledTime: task.ScheduledTime,
            Recurrence: recurrence,
            parameters: task.Parameters,
            postExecution: postExecution,
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
        }
      }
    }
  }, [
    router.query.id,
    scheduledTaskList.isSuccess,
    tenantList.isSuccess,
    router.query.Clone,
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
      if (router.query.id && scheduledTaskList.isSuccess) {
        const task = scheduledTaskList.data.find((task) => task.RowKey === router.query.id);
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
  }, [advancedParameters, router.query.id, scheduledTaskList.isSuccess]);

  const gridSize = fullWidth ? 12 : 4; // Adjust size based on fullWidth prop

  return (
    <>
      <Grid container spacing={2}>
        {(scheduledTaskList.isFetching || tenantList.isLoading || commands.isLoading) && (
          <Skeleton width={"100%"} />
        )}
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
          />
        </Grid>

        <Grid size={{ md: gridSize, xs: 12 }}>
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
              if (router.query.id && scheduledTaskList.isSuccess) {
                const task = scheduledTaskList.data.find((task) => task.RowKey === router.query.id);
                if (task?.Command && !baseOptions.find((opt) => opt.value === task.Command)) {
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
        </Grid>
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
              if (router.query.id && scheduledTaskList.isSuccess) {
                const task = scheduledTaskList.data.find((task) => task.RowKey === router.query.id);
                if (task?.Recurrence && !options.find((opt) => opt.value === task.Recurrence)) {
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
              size={{ md: param.Type === "System.Collections.Hashtable" ? 12 : gridSize, xs: 12 }}
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
                />
              )}
            </Grid>
          </CippFormCondition>
        ))}
        <Grid size={{ md: 12, xs: 12 }}>
          <Divider />
        </Grid>
        <Grid size={{ md: 12, xs: 12 }}>
          <CippFormComponent
            type="switch"
            name="advancedParameters"
            label="Advanced Parameters (JSON Input)"
            formControl={formControl}
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
            {router.query.id ? "Edit" : "Add"} Schedule
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
