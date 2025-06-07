import { Stack, Alert } from "@mui/material";
import CippWizardStepButtons from "./CippWizardStepButtons";
import { Grid } from "@mui/system";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { getCippValidator } from "../../utils/get-cipp-validator";
import { CippFormCondition } from "../CippComponents/CippFormCondition";
import CippPermissionPreview from "../CippComponents/CippPermissionPreview";
import { useWatch } from "react-hook-form";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";

export const CippWizardAppApproval = (props) => {
  const { postUrl, formControl, onPreviousStep, onNextStep, currentStep } = props;

  // Watch for the selected template to access permissions
  const selectedTemplate = useWatch({
    control: formControl.control,
    name: "selectedTemplate",
  });

  return (
    <Stack spacing={2}>
      {/* Mode Selector */}
      <CippFormComponent
        type="radio"
        name="configMode"
        label="Application Configuration Mode"
        defaultValue="template" // Add default value
        options={[
          { value: "template", label: "Use App Approval Template" },
          { value: "manual", label: "Manual Configuration" },
        ]}
        formControl={formControl}
      />

      {/* Template Mode */}
      <CippFormCondition
        field="configMode"
        compareType="is"
        compareValue="template"
        formControl={formControl}
      >
        <Stack spacing={2}>
          <Alert severity="info">
            Select an app approval template to deploy. Templates contain predefined permissions that
            will be applied to the application.
          </Alert>
          <CippFormComponent
            type="autoComplete"
            name="selectedTemplate"
            label="Select App Template"
            api={{
              url: "/api/ListAppApprovalTemplates",
              queryKey: "appApprovalTemplates",
              labelField: (item) => `${item.TemplateName}`,
              valueField: "TemplateId",
              addedField: {
                AppId: "AppId",
                AppName: "AppName",
                PermissionSetId: "PermissionSetId",
                PermissionSetName: "PermissionSetName",
                Permissions: "Permissions",
              },
              showRefresh: true,
            }}
            validators={{ required: "A template is required" }}
            formControl={formControl}
            multiple={false}
          />

          {selectedTemplate?.addedFields?.AppName && (
            <Stack spacing={2}>
              <CippPropertyListCard
                variant="outlined"
                showDivider={false}
                propertyItems={[
                  { label: "App Name", value: selectedTemplate.addedFields.AppName },
                  { label: "App ID", value: selectedTemplate.addedFields.AppId },
                  {
                    label: "Permission Set",
                    value: selectedTemplate.addedFields.PermissionSetName,
                  },
                ]}
                title="Template Details"
              />
              <CippPermissionPreview
                permissions={selectedTemplate.addedFields.Permissions}
                title="Template Permissions"
                maxHeight={500}
                showAppIds={true}
              />
            </Stack>
          )}
        </Stack>
      </CippFormCondition>

      {/* Manual Mode */}
      <CippFormCondition
        field="configMode"
        compareType="is"
        compareValue="manual"
        formControl={formControl}
      >
        <Grid container spacing={3}>
          <Grid size={12}>
            <CippFormComponent
              type="textField"
              label="Application ID"
              validators={{
                validate: (value) => getCippValidator(value, "guid"),
              }}
              name="AppId"
              formControl={formControl}
            />
          </Grid>
        </Grid>

        <CippFormComponent
          type="switch"
          label="Copy permissions from the existing application. This app must have been added to the partner tenant first."
          name="CopyPermissions"
          formControl={formControl}
        />

        <CippFormCondition
          field="CopyPermissions"
          compareType="is"
          compareValue={false}
          formControl={formControl}
        >
          <CippFormComponent
            type="cippDataTable"
            name="permissions"
            title="Permissions"
            label="Select your permissions"
            queryKey="GraphpermissionsList"
            api={{ url: "/permissionsList.json" }}
            simpleColumns={["displayName", "description"]}
            formControl={formControl}
          />
        </CippFormCondition>
      </CippFormCondition>

      <CippWizardStepButtons
        postUrl={postUrl}
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};
