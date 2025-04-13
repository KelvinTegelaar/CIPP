import React, { useState, useEffect, use } from "react";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  SvgIcon,
  IconButton,
  Skeleton,
  Divider,
} from "@mui/material";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { useRouter } from "next/router";
import { useForm, useFormState, useWatch } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";
import CippButtonCard from "../../../../components/CippCards/CippButtonCard";
import alertList from "/src/data/alerts.json";
import auditLogTemplates from "/src/data/AuditLogTemplates";
import auditLogSchema from "/src/data/AuditLogSchema.json";
import DeleteIcon from "@mui/icons-material/Delete"; // Icon for removing added inputs
import { Layout as DashboardLayout } from "/src/layouts/index.js"; // Dashboard layout
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import { ApiGetCall, ApiPostCall } from "../../../../api/ApiCall";
import { PlusIcon } from "@heroicons/react/24/outline";
import { CippFormCondition } from "../../../../components/CippComponents/CippFormCondition";

const AlertWizard = () => {
  const apiRequest = ApiPostCall({
    relatedQueryKeys: "ListAlertsQueue",
  });
  const router = useRouter();
  const [editAlert, setAlertEdit] = useState(false);
  useEffect(() => {
    if (router.query.id) {
      setAlertEdit(true);
    }
  }, [router]);

  const existingAlert = ApiGetCall({
    url: "/api/ListAlertsQueue",
    relatedQueryKeys: "ListAlertsQueue",
  });
  const [recurrenceOptions, setRecurrenceOptions] = useState([
    { value: "30m", label: "Every 30 minutes" },
    { value: "1h", label: "Every hour" },
    { value: "4h", label: "Every 4 hours" },
    { value: "1d", label: "Every 1 day" },
    { value: "7d", label: "Every 7 days" },
    { value: "30d", label: "Every 30 days" },
    { value: "365d", label: "Every 365 days" },
  ]);

  const postExecutionOptions = [
    { label: "Webhook", value: "Webhook" },
    { label: "Email", value: "Email" },
    { label: "PSA", value: "PSA" },
  ];
  const actionstoTake = [
    //{ value: 'cippcommand', label: 'Execute a CIPP Command' },
    { value: "becremediate", label: "Execute a BEC Remediate" },
    { value: "disableuser", label: "Disable the user in the log entry" },
    // { value: 'generatelog', label: 'Generate a log entry' },
    { value: "generatemail", label: "Generate an email" },
    { value: "generatePSA", label: "Generate a PSA ticket" },
    { value: "generateWebhook", label: "Generate a webhook" },
  ];

  const logbookOptions = [
    { value: "Audit.AzureActiveDirectory", label: "Azure AD" },
    { value: "Audit.Exchange", label: "Exchange" },
  ];

  useEffect(() => {
    if (existingAlert.isSuccess && editAlert) {
      const alert = existingAlert?.data?.find((alert) => alert.RowKey === router.query.id);
      if (alert?.LogType === "Scripted") {
        setAlertType("script");

        console.log(alert);

        // Create formatted excluded tenants array if it exists
        const excludedTenantsFormatted = Array.isArray(alert.excludedTenants)
          ? alert.excludedTenants.map((tenant) => ({ value: tenant, label: tenant }))
          : [];

        // Format the command object
        const usedCommand = alertList?.find(
          (cmd) => cmd.name === alert.RawAlert.Command.replace("Get-CIPPAlert", "")
        );

        // Format recurrence option
        const recurrenceOption = recurrenceOptions?.find(
          (opt) => opt.value === alert.RawAlert.Recurrence
        );

        // Format post execution values
        const postExecutionValue = postExecutionOptions.filter((opt) =>
          alert.RawAlert.PostExecution.split(",").includes(opt.value)
        );

        // Reset the form with all values at once
        formControl.reset(
          {
            tenantFilter: {
              value: alert.RawAlert.Tenant,
              label: alert.RawAlert.Tenant,
            },
            excludedTenants: excludedTenantsFormatted,
            command: { value: usedCommand, label: usedCommand.label },
            recurrence: recurrenceOption,
            postExecution: postExecutionValue,
          },
          { keepDirty: false }
        );
      }
      if (alert?.PartitionKey === "Webhookv2") {
        setAlertType("audit");
        const foundLogbook = logbookOptions?.find(
          (logbook) => logbook.value === alert.RawAlert.type
        );
        //make sure that for every condition, we spawn the field using setAddedEvent
        setAddedEvent(
          alert.RawAlert.Conditions.map((_, index) => ({
            id: index,
          }))
        );

        formControl.reset({
          RowKey: router.query.clone ? undefined : router.query.id ? router.query.id : undefined,
          tenantFilter: alert.RawAlert.Tenants,
          excludedTenants: alert.RawAlert.excludedTenants,
          Actions: alert.RawAlert.Actions,
          conditions: alert.RawAlert.Conditions,
          logbook: foundLogbook,
        });
      }
    }
  }, [existingAlert.isSuccess, router, editAlert]);

  const [alertType, setAlertType] = useState("none");
  const [addedEvent, setAddedEvent] = useState([{ id: 1 }]); // Track added inputs

  const formControl = useForm({ mode: "onChange" });
  const selectedPreset = useWatch({ control: formControl.control, name: "preset" }); // Watch the preset
  const commandValue = useWatch({ control: formControl.control, name: "command" });
  const logbookWatcher = useWatch({ control: formControl.control, name: "logbook" });
  const propertyWatcher = useWatch({ control: formControl.control, name: "conditions" });

  useEffect(() => {
    formControl.reset();
  }, [alertType]);

  useEffect(() => {
    if (commandValue && commandValue.value?.recommendedRunInterval) {
      const updatedRecurrenceOptions = recurrenceOptions.map((opt) => ({
        ...opt,
        label: opt.label.replace(" (Recommended)", ""), // Clear any previous "Recommended" text
      }));

      const recommendedOption = updatedRecurrenceOptions?.find(
        (opt) => opt.value === commandValue.value.recommendedRunInterval
      );

      if (recommendedOption) {
        recommendedOption.label += " (Recommended)";
      }
      setRecurrenceOptions(updatedRecurrenceOptions);
      formControl.setValue("recurrence", recommendedOption);
    }
  }, [commandValue]);

  useEffect(() => {
    // Logic to handle template-based form updates when a preset is selected
    if (selectedPreset) {
      const selectedTemplate = auditLogTemplates?.find(
        (template) => template.value === selectedPreset.value
      );

      if (selectedTemplate) {
        // Ensure the conditions array exists and update it
        const conditions = selectedTemplate.template.conditions || [];

        conditions.forEach((condition, index) => {
          // Ensure form structure is in place for 0th condition
          formControl.setValue(`conditions.${index}.Property`, condition.Property || "");
          formControl.setValue(`conditions.${index}.Operator`, condition.Operator || "");
          //if Condition.Property.value is "String" then set the input value, otherwise
          formControl.setValue(
            condition.Property.value === "String"
              ? `conditions.${index}.Input.value`
              : `conditions.${index}.Input`,
            condition.Property.value === "String" ? condition.Input.value : condition.Input
          );
        });

        // Set the logbook or other fields based on the template
        if (selectedTemplate.template.logbook) {
          formControl.setValue("logbook", selectedTemplate.template.logbook);
        }
        // Ensure the addedEvent array reflects the correct number of conditions
        setAddedEvent(
          conditions.map((_, index) => ({
            id: index,
          }))
        );
      }
    }
  }, [selectedPreset]);

  const getAuditLogSchema = (logbook) => {
    const common = auditLogSchema.Common;
    const log = auditLogSchema[logbook];
    const combined = { ...common, ...log };
    return Object.keys(combined).map((key) => ({
      label: key,
      value: combined[key],
    }));
  };

  const handleAuditSubmit = (values) => {
    values.conditions = values.conditions.filter((condition) => condition.Property);
    apiRequest.mutate({ url: "/api/AddAlert", data: values });
  };

  const handleScriptSubmit = (values) => {
    const getInputParams = () => {
      if (values.command.value.requiresInput) {
        return {
          InputValue: values[values.command.value.inputName],
        };
      }
      return {};
    };

    const postObject = {
      RowKey: router.query.clone ? undefined : router.query.id ? router.query.id : undefined,
      tenantFilter: values.tenantFilter?.value,
      excludedTenants: values.excludedTenants,
      Name: `${values.tenantFilter.value}: ${values.command.label}`,
      Command: { value: `Get-CIPPAlert${values.command.value.name}` },
      Parameters: getInputParams(),
      ScheduledTime: Math.floor(new Date().getTime() / 1000) + 60,
      Recurrence: values.recurrence,
      PostExecution: values.postExecution,
    };
    apiRequest.mutate({ url: "/api/AddScheduledItem?hidden=true", data: postObject });
  };

  const handleAddCondition = () => {
    setAddedEvent([...addedEvent, { id: addedEvent.length + 1 }]);
  };

  const handleRemoveCondition = (id) => {
    //remove the condition from the form
    const currentConditions = formControl.getValues("conditions") || [];
    const updatedConditions = currentConditions.filter((_, index) => index !== id);
    formControl.setValue("conditions", updatedConditions);
    setAddedEvent(addedEvent.filter((event) => event.id !== id));
  };

  const { isValid } = useFormState({ control: formControl.control });
  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth={"xl"}>
        <Stack spacing={4}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button
              color="inherit"
              onClick={() => router.back()}
              startIcon={
                <SvgIcon fontSize="small">
                  <ArrowLeftIcon />
                </SvgIcon>
              }
            >
              Back to Alerts
            </Button>
          </Stack>
          {existingAlert.isLoading && <Skeleton />}
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="h4">{editAlert ? "Edit" : "Add"} Alert</Typography>
          </Stack>

          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardActionArea onClick={() => setAlertType("audit")}>
                  <CardContent>
                    <Typography variant="h6">Audit Log Alert</Typography>
                    <Typography variant="body2">
                      Select this option to create an alert based on a received Microsoft Audit log.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={12} md={5.9}>
              <Card>
                <CardActionArea onClick={() => setAlertType("script")}>
                  <CardContent>
                    <Typography variant="h6">Scripted CIPP Alert</Typography>
                    <Typography variant="body2">
                      Select this option to set up an alert based on data processed by CIPP.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Audit Log Form */}
            {alertType === "audit" && (
              <Grid container spacing={4} sx={{ mt: 3 }} justifyContent="space-around">
                <Grid item xs={12}>
                  <form id="auditAlertForm" onSubmit={formControl.handleSubmit(handleAuditSubmit)}>
                    <Grid container spacing={4} justifyContent="space-around">
                      <Grid item xs={12} md={12}>
                        <CippButtonCard title="Tenant Selector" sx={{ mb: 3 }}>
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <CippFormTenantSelector
                                multiple={true}
                                formControl={formControl}
                                allTenants={true}
                                label="Included Tenants for alert"
                              />
                            </Grid>
                            <CippFormCondition
                              field="tenantFilter"
                              formControl={formControl}
                              compareType="valueContains"
                              compareValue="AllTenants"
                            >
                              <Grid item xs={12}>
                                <CippFormTenantSelector
                                  multiple={true}
                                  label="Excluded Tenants for alert"
                                  formControl={formControl}
                                  allTenants={false}
                                  name="excludedTenants"
                                />
                              </Grid>
                            </CippFormCondition>
                          </Grid>
                        </CippButtonCard>
                      </Grid>

                      <Grid item xs={12} md={12}>
                        <CippButtonCard
                          title="Alert Criteria"
                          CardButton={
                            <Button disabled={isValid ? false : true} type="submit">
                              Save Alert
                            </Button>
                          }
                          sx={{ mb: 3 }}
                        >
                          <Grid container spacing={3} sx={{ mb: 2 }}>
                            <Grid item xs={12}>
                              <CippFormComponent
                                type="autoComplete"
                                multiple={false}
                                name="preset"
                                formControl={formControl}
                                label="Select an alert preset, or customize your own"
                                options={auditLogTemplates.map((template) => ({
                                  value: template.value,
                                  label: template.name,
                                }))}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <CippFormComponent
                                type="autoComplete"
                                name="logbook"
                                multiple={false}
                                formControl={formControl}
                                validators={{
                                  required: { value: true, message: "This field is required" },
                                }}
                                label="Select the log source"
                                options={logbookOptions}
                              />
                            </Grid>
                          </Grid>
                          {addedEvent.map((event) => (
                            <Grid
                              container
                              spacing={3}
                              justifyContent="space-around"
                              sx={{ mb: 2 }}
                              key={event.id}
                            >
                              <Grid item xs={4}>
                                <CippFormComponent
                                  type="autoComplete"
                                  multiple={false}
                                  name={`conditions.${event.id}.Property`}
                                  formControl={formControl}
                                  label="Select property"
                                  options={getAuditLogSchema(logbookWatcher?.value)}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <CippFormComponent
                                  type="autoComplete"
                                  multiple={false}
                                  name={`conditions.${event.id}.Operator`}
                                  formControl={formControl}
                                  label="is"
                                  options={[
                                    { value: "eq", label: "Equals to" },
                                    { value: "ne", label: "Not Equals to" },
                                    { value: "like", label: "Like" },
                                    { value: "notlike", label: "Not like" },
                                    { value: "notmatch", label: "Does not match" },
                                    { value: "gt", label: "Greater than" },
                                    { value: "lt", label: "Less than" },
                                    { value: "in", label: "In" },
                                    { value: "notIn", label: "Not In" },
                                  ]}
                                />
                              </Grid>
                              <Grid item xs={3}>
                                <CippFormCondition
                                  field={`conditions.${event.id}.Property`}
                                  formControl={formControl}
                                  compareType="is"
                                  compareValue={"String"}
                                >
                                  <CippFormComponent
                                    type="textField"
                                    name={`conditions.${event.id}.Input.value`}
                                    formControl={formControl}
                                    label="Input"
                                  />
                                </CippFormCondition>
                                <CippFormCondition
                                  field={`conditions.${event.id}.Property`}
                                  formControl={formControl}
                                  compareType="contains"
                                  compareValue={"List:"}
                                >
                                  <CippFormComponent
                                    type="autoComplete"
                                    multiple={propertyWatcher?.[event.id]?.Property?.multi ?? false}
                                    name={`conditions.${event.id}.Input`}
                                    formControl={formControl}
                                    label="Input"
                                    options={
                                      auditLogSchema[propertyWatcher?.[event.id]?.Property?.value]
                                    }
                                  />
                                </CippFormCondition>
                              </Grid>
                              <Grid item xs={1}>
                                <IconButton color="primary" onClick={() => handleAddCondition()}>
                                  <SvgIcon>
                                    <PlusIcon />
                                  </SvgIcon>
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={() => handleRemoveCondition(event.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Grid>
                            </Grid>
                          ))}

                          <Grid item xs={12} sx={{ mt: 2 }}>
                            <CippFormComponent
                              type="autoComplete"
                              name="Actions"
                              label="Actions to take"
                              validators={{
                                required: { value: true, message: "This field is required" },
                              }}
                              formControl={formControl}
                              multiple
                              options={actionstoTake}
                            />
                          </Grid>
                          <Grid item xs={12} md={12} sx={{ mt: 2 }}>
                            <CippApiResults apiObject={apiRequest} />
                          </Grid>
                        </CippButtonCard>
                      </Grid>
                    </Grid>
                  </form>
                </Grid>
              </Grid>
            )}

            {/* Scripted CIPP Alert Form */}
            {alertType === "script" && (
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <form
                    id="scriptAlertForm"
                    onSubmit={formControl.handleSubmit(handleScriptSubmit)}
                    disabled={isValid === false}
                  >
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={12}>
                        <CippButtonCard title="Tenant Selector">
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <CippFormTenantSelector
                                allTenants={true}
                                multiple={false}
                                formControl={formControl}
                                label="Included Tenants for alert"
                              />
                            </Grid>
                            <CippFormCondition
                              field="tenantFilter"
                              formControl={formControl}
                              compareType="is"
                              compareValue="AllTenants"
                            >
                              <Grid item xs={12}>
                                <CippFormTenantSelector
                                  multiple={true}
                                  label="Excluded Tenants for alert"
                                  formControl={formControl}
                                  allTenants={false}
                                  name="excludedTenants"
                                />
                              </Grid>
                            </CippFormCondition>
                          </Grid>
                        </CippButtonCard>
                      </Grid>

                      <Grid item xs={12} md={12}>
                        <CippButtonCard
                          title="Alert Criteria"
                          CardButton={
                            <Button disabled={isValid ? false : true} type="submit">
                              Save Alert
                            </Button>
                          }
                        >
                          <Grid spacing={2} container>
                            <Grid item xs={12} md={6}>
                              <CippFormComponent
                                type="autoComplete"
                                validators={{ required: true }}
                                multiple={false}
                                name="command"
                                formControl={formControl}
                                label="What alerting script should run"
                                validation={{ required: "This field is required" }}
                                options={alertList.map((cmd) => ({
                                  value: cmd,
                                  label: cmd.label,
                                }))}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <CippFormComponent
                                type="autoComplete"
                                multiple={false}
                                name="recurrence"
                                validators={{
                                  required: { value: true, message: "This field is required" },
                                }}
                                formControl={formControl}
                                label="When should the alert run"
                                options={recurrenceOptions} // Use the state-managed recurrenceOptions here
                              />
                            </Grid>
                            <Grid item xs={12} md={12}>
                              {commandValue?.value?.requiresInput && (
                                <CippFormComponent
                                  type={commandValue.value?.inputType}
                                  name={commandValue.value?.inputName}
                                  formControl={formControl}
                                  label={commandValue.value?.inputLabel}
                                />
                              )}
                            </Grid>
                            <Grid item xs={12} md={12}>
                              <CippFormComponent
                                type="autoComplete"
                                name="postExecution"
                                label="Alert via"
                                validators={{
                                  required: { value: true, message: "This field is required" },
                                }}
                                formControl={formControl}
                                multiple
                                options={postExecutionOptions}
                              />
                            </Grid>
                            <Grid item xs={12} md={12}>
                              <CippApiResults apiObject={apiRequest} />
                            </Grid>
                          </Grid>
                        </CippButtonCard>
                      </Grid>
                    </Grid>
                  </form>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

AlertWizard.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AlertWizard;
