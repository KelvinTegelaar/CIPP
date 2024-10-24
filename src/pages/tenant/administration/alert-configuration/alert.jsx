import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { useRouter } from "next/router";
import { useForm, useFormState, useWatch } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";
import CippButtonCard from "../../../../components/CippCards/CippButtonCard";
import alertList from "/src/data/alerts.json";
import auditLogTemplates from "/src/data/auditLogTemplates";
import auditLogSchema from "/src/data/AuditLogSchema.json";
import DeleteIcon from "@mui/icons-material/Delete"; // Icon for removing added inputs
import { Layout as DashboardLayout } from "/src/layouts/index.js"; // Dashboard layout
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import { ApiPostCall } from "../../../../api/ApiCall";

const AlertWizard = () => {
  const apiRequest = ApiPostCall({
    relatedQueryKeys: "ListAlertsQueue",
  });

  const router = useRouter();
  const [alertType, setAlertType] = useState("none");
  const [addedEvent, setAddedEvent] = useState([{ id: 1 }]); // Track added inputs
  const [recurrenceOptions, setRecurrenceOptions] = useState([
    { value: "30m", label: "Every 30 minutes" },
    { value: "1h", label: "Every hour" },
    { value: "4h", label: "Every 4 hours" },
    { value: "1d", label: "Every 1 day" },
    { value: "7d", label: "Every 7 days" },
    { value: "30d", label: "Every 30 days" },
    { value: "365d", label: "Every 365 days" },
  ]);

  const formControl = useForm({ mode: "onChange" });
  const selectedPreset = useWatch({ control: formControl.control, name: "preset" }); // Watch the preset
  const commandValue = useWatch({ control: formControl.control, name: "command" });
  const logbookWatcher = useWatch({ control: formControl.control, name: "logbook" });

  useEffect(() => {
    formControl.reset();
  }, [alertType]);

  useEffect(() => {
    if (commandValue && commandValue.value?.recommendedRunInterval) {
      const updatedRecurrenceOptions = recurrenceOptions.map((opt) => ({
        ...opt,
        label: opt.label.replace(" (Recommended)", ""), // Clear any previous "Recommended" text
      }));

      const recommendedOption = updatedRecurrenceOptions.find(
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
      const selectedTemplate = auditLogTemplates.find(
        (template) => template.value === selectedPreset.value
      );

      if (selectedTemplate) {
        // Ensure the conditions array exists and update it
        const conditions = selectedTemplate.template.conditions || [];

        conditions.forEach((condition, index) => {
          // Ensure form structure is in place for 0th condition
          formControl.setValue(`conditions.${index}.Property`, condition.Property || "");
          formControl.setValue(`conditions.${index}.Operator`, condition.Operator || "");
          formControl.setValue(`conditions.${index}.Input`, condition.Input.value || "");
        });

        // Set the logbook or other fields based on the template
        if (selectedTemplate.template.logbook) {
          formControl.setValue("logbook", selectedTemplate.template.logbook);
        }
        console.log("conditions", conditions);
        // Ensure the addedEvent array reflects the correct number of conditions
        setAddedEvent(
          conditions.map((_, index) => ({
            id: index + 1,
          }))
        );
      }
    }
  }, [selectedPreset]);

  const getAuditLogSchema = (logbook) => {
    console.log("logbook", logbook);
    const common = auditLogSchema.Common;
    const log = auditLogSchema[logbook];
    const combined = { ...common, ...log };
    return Object.keys(combined).map((key) => ({
      label: key,
      value: combined[key],
    }));
  };

  const handleAuditSubmit = (values) => {
    console.log("Audit Alert Form Values:", values);
  };

  const handleScriptSubmit = (values) => {
    const postObject = {
      tenantFilter: values.tenantFilter?.value,
      Name: `${values.tenantFilter.value}: ${values.command.label}`,
      Command: { value: `Get-CIPPAlert${values.command.value.name}` },
      Parameters: {},
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
    setAddedEvent(addedEvent.filter((event) => event.id !== id));
  };

  const { isValid } = useFormState({ control: formControl.control });
  console.log("the form is valid:", isValid);
  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth={"xl"}>
        <Stack spacing={4}>
          {/* Back Button */}
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

          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="h4">Add Alert</Typography>
          </Stack>

          {/* Selection Cards */}
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
                          <Typography>
                            Select the tenants you want to include in this Alert.
                          </Typography>
                          <CippFormTenantSelector
                            multiple={true}
                            formControl={formControl}
                            allTenants={true}
                          />
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
                                validators={{
                                  required: { value: true, message: "This field is required" },
                                }}
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
                                options={[
                                  { value: "Audit.AzureActiveDirectory", label: "Azure AD" },
                                  { value: "Audit.Exchange", label: "Exchange" },
                                ]}
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
                                    { value: "gt", label: "Greater than" },
                                  ]}
                                />
                              </Grid>
                              <Grid item xs={3}>
                                <CippFormComponent
                                  type="textField"
                                  name={`conditions.${event.id}.Input`}
                                  formControl={formControl}
                                  label="Input"
                                />
                              </Grid>
                              <Grid item xs={1}>
                                <IconButton
                                  color="error"
                                  onClick={() => handleRemoveCondition(event.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Grid>
                            </Grid>
                          ))}

                          <Button onClick={handleAddCondition} sx={{ mt: 2 }}>
                            Add Condition
                          </Button>
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
                          <Typography>
                            Select the tenants you want to include in this Alert.
                          </Typography>
                          <CippFormTenantSelector multiple={false} formControl={formControl} />
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
                              <CippFormComponent
                                type="autoComplete"
                                name="postExecution"
                                label="Alert via"
                                validators={{
                                  required: { value: true, message: "This field is required" },
                                }}
                                formControl={formControl}
                                multiple
                                options={[
                                  { label: "Webhook", value: "Webhook" },
                                  { label: "Email", value: "Email" },
                                  { label: "PSA", value: "PSA" },
                                ]}
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
