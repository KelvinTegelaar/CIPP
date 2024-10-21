import { Box, Grid, Typography } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippFormTenantSelector } from "../../../components/CippComponents/CippFormTenantSelector";
import { CippFormCondition } from "../../../components/CippComponents/CippFormCondition";
import { getCippValidator } from "../../../utils/get-cipp-validator";

const Page = () => {
  const formControl = useForm({ mode: "onChange" });
  const selectedCommand = useWatch({ control: formControl.control, name: "command" });
  const recurrenceOptions = [
    { value: "0", label: "Only once" },
    { value: "1d", label: "Every 1 day" },
    { value: "7d", label: "Every 7 days" },
    { value: "30d", label: "Every 30 days" },
    { value: "365d", label: "Every 365 days" },
  ];
  return (
    <CippFormPage
      backButtonTitle="Scheduler"
      formControl={formControl}
      title="Scheduler"
      postUrl="/api/AddScheduledItem"
    >
      <Box sx={{ my: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <CippFormTenantSelector
              label="Select a Tenant"
              formControl={formControl}
              type="single"
            />
          </Grid>

          <Grid item xs={12} md={12}>
            <CippFormComponent
              type="textField"
              name="taskName"
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
              api={{
                url: "/api/ListFunctionParameters?Module=CIPPCore",
                queryKey: "ListCommands",
                labelField: "Function",
                valueField: "Function",
                addedField: { description: "Synopsis", Parameters: "Parameters" },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CippFormComponent
              type="datePicker"
              name="startDate"
              label="Start Date"
              fullWidth
              formControl={formControl}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CippFormComponent
              type="autoComplete"
              name="recurrence"
              label="Recurrence"
              formControl={formControl}
              options={recurrenceOptions}
              multiple={false}
            />
          </Grid>
          {selectedCommand?.addedFields?.description && (
            <Grid item xs={12} md={12}>
              <Box sx={{ my: 1 }}>
                <Typography variant="h6">PowerShell Command:</Typography>
                <Typography variant="body2" color={"text.secondary"}>
                  {selectedCommand.addedFields.description}
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
      </Box>
    </CippFormPage>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
