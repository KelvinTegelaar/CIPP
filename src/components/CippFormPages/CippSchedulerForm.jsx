import React from "react";
import { Box, Grid, Skeleton, Typography } from "@mui/material";
import { useWatch } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";
import { CippFormCondition } from "/src/components/CippComponents/CippFormCondition";
import { getCippValidator } from "/src/utils/get-cipp-validator";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import { useEffect } from "react";

const CippSchedulerForm = (props) => {
  const { formControl } = props;
  const selectedCommand = useWatch({ control: formControl.control, name: "command" });
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

      //find tenantfilter in tenantList, and create a label/value pair for the autocomplete
      if (tenantList.isSuccess) {
        //in the tenantlist, find the defaultDomainName that matches the task.tenantFilter
        const tenantFilter = tenantList.data.find(
          (tenant) => tenant.defaultDomainName === task?.Tenant
        );
        if (commands.isSuccess) {
          const command = commands.data.find((command) => command.Function === task.Command);
          formControl.reset({
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
          });
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
  return (
    <Grid container spacing={2}>
      {(scheduledTaskList.isFetching || tenantList.isLoading || commands.isLoading) && (
        <Skeleton width={"100%"} />
      )}
      <Grid item xs={12} md={12}>
        <CippFormTenantSelector label="Select a Tenant" formControl={formControl} type="single" />
      </Grid>

      <Grid item xs={12} md={12}>
        <CippFormComponent
          type="textField"
          name="Name"
          label="Task Name"
          formControl={formControl}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <CippFormComponent
          name="command"
          type="autoComplete"
          label="Select Command"
          multiple={false}
          formControl={formControl}
          options={
            commands.data?.map((command) => {
              return {
                label: command.Function,
                value: command.Function,
                addedFields: command,
              };
            }) || []
          }
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CippFormComponent
          type="datePicker"
          name="ScheduledTime"
          label="Start Date"
          fullWidth
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CippFormComponent
          type="autoComplete"
          name="Recurrence"
          label="Recurrence"
          formControl={formControl}
          options={recurrenceOptions}
          multiple={false}
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
        <Grid item xs={12} md={6} key={idx}>
          {param.Type === "System.Boolean" ? (
            <CippFormComponent
              type="switch"
              name={`parameters.${param.Name}`}
              label={param.Name}
              formControl={formControl}
            />
          ) : param.Type === "System.Collections.Hashtable" ||
            param.Type?.startsWith("System.String") ? (
            <CippFormComponent
              type="textField"
              name={`parameters.${param.Name}`}
              label={param.Name}
              formControl={formControl}
              placeholder={`Enter a value for ${param.Name}`}
            />
          ) : null}
        </Grid>
      ))}
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
          options={[
            { label: "Webhook", value: "Webhook" },
            { label: "Email", value: "Email" },
            { label: "PSA", value: "PSA" },
          ]}
        />
      </Grid>
    </Grid>
  );
};

export default CippSchedulerForm;
