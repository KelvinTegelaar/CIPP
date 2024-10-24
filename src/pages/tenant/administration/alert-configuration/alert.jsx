import React, { useState } from "react";
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
import { useForm } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";
import CippButtonCard from "../../../../components/CippCards/CippButtonCard";
import alertList from "/src/data/alerts.json";
import auditLogTemplates from "/src/data/auditLogTemplates";
import auditLogSchema from "/src/data/AuditLogSchema.json";
import DeleteIcon from "@mui/icons-material/Delete"; // Icon for removing added inputs
import { Layout as DashboardLayout } from "/src/layouts/index.js"; // Dashboard layout

const AlertWizard = () => {
  const router = useRouter();
  const [alertType, setAlertType] = useState();
  const [addedEvent, setAddedEvent] = useState([{ id: 1 }]); // Track added inputs
  const auditFormMethods = useForm();
  const scriptFormMethods = useForm();

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
    console.log("Audit Alert Form Values:", values);
  };

  const handleScriptSubmit = (values) => {
    console.log("Script Alert Form Values:", values);
  };

  const recurrenceOptions = [
    { value: "30m", name: "Every 30 minutes" },
    { value: "1h", name: "Every hour" },
    { value: "4h", name: "Every 4 hours" },
    { value: "1d", name: "Every 1 day" },
    { value: "7d", name: "Every 7 days" },
    { value: "30d", name: "Every 30 days" },
    { value: "365d", name: "Every 365 days" },
  ];

  const handleAddCondition = () => {
    setAddedEvent([...addedEvent, { id: addedEvent.length + 1 }]);
  };

  const handleRemoveCondition = (id) => {
    setAddedEvent(addedEvent.filter((event) => event.id !== id));
  };

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
          <Grid container>
            <Grid item xs={12} md={6} sx={{ mr: 1 }}>
              <Card>
                {/* Added maxWidth to match form components */}
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
                {/* Added maxWidth to match form components */}
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
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <form
                    id="auditAlertForm"
                    onSubmit={auditFormMethods.handleSubmit(handleAuditSubmit)}
                  >
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={12}>
                        <CippButtonCard title="Tenant Selector">
                          <Typography>
                            Select the tenants you want to include in this Alert.
                          </Typography>
                          <CippFormTenantSelector
                            multiple={false}
                            formControl={auditFormMethods}
                            allTenants={true}
                          />
                        </CippButtonCard>
                      </Grid>

                      <Grid item xs={12} md={12}>
                        <CippButtonCard
                          title="Alert Criteria"
                          CardButton={<Button type="submit">Save Alert</Button>}
                        >
                          <CippFormComponent
                            type="autoComplete"
                            multiple={false}
                            name="preset"
                            formControl={auditFormMethods}
                            label="Select an alert preset, or customize your own"
                            options={auditLogTemplates.map((template) => ({
                              value: template.value,
                              label: template.name,
                            }))}
                          />
                          <CippFormComponent
                            type="autoComplete"
                            name="logbook"
                            multiple={false}
                            formControl={auditFormMethods}
                            label="Select the log source"
                            options={[
                              { value: "Audit.AzureActiveDirectory", label: "Azure AD" },
                              { value: "Audit.Exchange", label: "Exchange" },
                            ]}
                          />
                          {addedEvent.map((event) => (
                            <Grid container spacing={3} key={event.id} alignItems="center">
                              <Grid item xs={4}>
                                <CippFormComponent
                                  type="autoComplete"
                                  multiple={false}
                                  name={`conditions.${event.id}.Property`}
                                  formControl={auditFormMethods}
                                  label="Select property"
                                  options={getAuditLogSchema("Audit.AzureActiveDirectory")}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <CippFormComponent
                                  type="autoComplete"
                                  multiple={false}
                                  name={`conditions.${event.id}.Operator`}
                                  formControl={auditFormMethods}
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
                                  formControl={auditFormMethods}
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
                          <Button onClick={handleAddCondition}>Add Condition</Button>
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
                    onSubmit={scriptFormMethods.handleSubmit(handleScriptSubmit)}
                  >
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={12}>
                        <CippButtonCard title="Tenant Selector">
                          <Typography>
                            Select the tenants you want to include in this Alert.
                          </Typography>
                          <CippFormTenantSelector formControl={scriptFormMethods} />
                        </CippButtonCard>
                      </Grid>

                      <Grid item xs={12} md={12}>
                        <CippButtonCard
                          title="Alert Criteria"
                          CardButton={<Button type="submit">Save Alert</Button>}
                        >
                          <CippFormComponent
                            type="autoComplete"
                            multiple={false}
                            name="command"
                            formControl={scriptFormMethods}
                            label="What alerting script should run"
                            options={alertList.map((cmd) => ({
                              value: cmd.value,
                              label: cmd.label,
                            }))}
                          />
                          <CippFormComponent
                            type="autoComplete"
                            multiple={false}
                            name="recurrence"
                            formControl={scriptFormMethods}
                            label="When should the alert run"
                            options={recurrenceOptions.map((opt) => ({
                              value: opt.value,
                              label: opt.name,
                            }))}
                          />
                          <CippFormComponent
                            type="switch"
                            name="webhook"
                            formControl={scriptFormMethods}
                            label="Webhook"
                          />
                          <CippFormComponent
                            type="switch"
                            name="email"
                            formControl={scriptFormMethods}
                            label="Email"
                          />
                          <CippFormComponent
                            type="switch"
                            name="psa"
                            formControl={scriptFormMethods}
                            label="PSA"
                          />
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
