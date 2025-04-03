import React from "react";
import { Box, Button, Divider, Grid, Skeleton, SvgIcon, Typography } from "@mui/material";
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
    { value: "0", label: "Only once" },
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
    queryKey: "ListScheduledItems-Edit",
  });

  const tenantList = ApiGetCall({
    url: "/api/ListTenants",
    queryKey: "ListTenants",
  });
  useEffect(() => {
    if (scheduledTaskList.isSuccess && router.query.id) {
      const task = scheduledTaskList.data.find((task) => task.RowKey === router.query.id);
      const postExecution = task?.postExecution?.split(",").map((item) => {
        return { label: item, value: item };
      });

      // Find tenantFilter in tenantList, and create a label/value pair for the autocomplete
      if (tenantList.isSuccess) {
        const tenantFilter = tenantList.data.find(
          (tenant) => tenant.defaultDomainName === task?.Tenant
        );
        if (commands.isSuccess) {
          const command = commands.data.find((command) => command.Function === task.Command);
          const ResetParams = {
            tenantFilter: {
              value: tenantFilter?.defaultDomainName,
              label: tenantFilter?.defaultDomainName,
            },
            RowKey: router.query.Clone ? null : task.RowKey,
            Name: router.query.Clone ? `${task.Name} (Clone)` : task?.Name,
            command: { label: task.Command, value: task.Command, addedFields: command },
            ScheduledTime: task.ScheduledTime,
            Recurrence: task.Recurrence,
            parameters: task.Parameters,
            postExecution: postExecution,
            advancedParameters: task.RawJsonParameters ? true : false,
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
      var schedulerValues = formControl.getValues("parameters");
      Object.keys(schedulerValues).forEach((key) => {
        if (schedulerValues[key] === "" || schedulerValues[key] === null) {
          delete schedulerValues[key];
        }
      });
      const jsonString = JSON.stringify(schedulerValues, null, 2);
      formControl.setValue("RawJsonParameters", jsonString);
    }
  }, [advancedParameters]);

  const gridSize = fullWidth ? 12 : 4; // Adjust size based on fullWidth prop

  return (
    <>
      <Grid container spacing={2}>
        {(scheduledTaskList.isFetching || tenantList.isLoading || commands.isLoading) && (
          <Skeleton width={"100%"} />
        )}
        <Grid item xs={12} md={12}>
          <CippFormTenantSelector
            label="Select a Tenant"
            formControl={formControl}
            type="single"
            allTenants={true}
          />
        </Grid>

        <Grid item xs={12} md={12}>
          <CippFormComponent
            type="textField"
            name="Name"
            label="Task Name"
            formControl={formControl}
          />
        </Grid>

        <Grid item xs={12} md={gridSize}>
          <CippFormComponent
            name="command"
            type="autoComplete"
            label="Select Command"
            multiple={false}
            creatable={false}
            required={true}
            formControl={formControl}
            isFetching={commands.isFetching}
            options={
              commands.data?.map((command) => {
                return {
                  label: command.Function,
                  value: command.Function,
                  addedFields: command,
                };
              }) || []
            }
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
        <Grid item xs={12} md={gridSize}>
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
        <Grid item xs={12} md={gridSize}>
          <CippFormComponent
            type="autoComplete"
            name="Recurrence"
            label="Recurrence"
            formControl={formControl}
            options={recurrenceOptions}
            multiple={false}
            disableClearable={true}
          />
        </Grid>
        {selectedCommand?.addedFields?.Synopsis && (
          <Grid item xs={12} md={12}>
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
          >
            <Grid
              item
              xs={12}
              md={param.Type === "System.Collections.Hashtable" ? 12 : gridSize}
              key={idx}
            >
              {param.Type === "System.Boolean" ||
              param.Type === "System.Management.Automation.SwitchParameter" ? (
                <CippFormComponent
                  type="switch"
                  name={`parameters.${param.Name}`}
                  label={param.Name}
                  formControl={formControl}
                />
              ) : param.Type === "System.Collections.Hashtable" ? (
                <CippFormInputArray
                  formControl={formControl}
                  name={`parameters.${param.Name}`}
                  label={`${param.Name}`}
                  key={idx}
                />
              ) : param.Type?.startsWith("System.String") ? (
                <CippFormComponent
                  type="textField"
                  name={`parameters.${param.Name}`}
                  label={param.Name}
                  formControl={formControl}
                  placeholder={`Enter a value for ${param.Name}`}
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
                  validators={fieldRequired(param)}
                  required={param.Required}
                />
              )}
            </Grid>
          </CippFormCondition>
        ))}
        <Grid item xs={12} md={12}>
          <Divider />
        </Grid>
        <Grid item xs={12} md={12}>
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
          <Grid item xs={12} md={12}>
            <CippFormComponent
              type="textField"
              name="RawJsonParameters"
              label="Advanced Parameters (JSON Input)"
              validators={{
                validate: (value) => getCippValidator(value, "json"),
              }}
              formControl={formControl}
              multiline
              rows={4}
              placeholder={`Enter a JSON object`}
            />
          </Grid>
        </CippFormCondition>
        <Grid item xs={12} md={12}>
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
        <Grid item xs={12} sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
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
      </Grid>
      <CippApiResults apiObject={postCall} />
    </>
  );
};

export default CippSchedulerForm;
