import React, { useEffect, useState } from "react";
import { Button, Divider, Stack } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useFormState, useWatch } from "react-hook-form";
import { RocketLaunch } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { CippApiResults } from "./CippApiResults";
import { ApiPostCall } from "../../api/ApiCall";

const MODE_CONFIG = {
  DlpCompliancePolicy: {
    title: "Deploy DLP Compliance Policy",
    buttonLabel: "Deploy DLP Policy",
    postUrl: "/api/AddDlpCompliancePolicy",
    listTemplatesUrl: "/api/ListDlpCompliancePolicyTemplates",
    templateQueryKey: "TemplateListDlpCompliancePolicy",
    relatedQueryKeys: ["ListDlpCompliancePolicy", "ListDlpCompliancePolicyTemplates"],
    placeholder: `{
  "Name": "Block Credit Card data",
  "Comment": "Blocks documents containing credit card numbers",
  "Mode": "Enable",
  "ExchangeLocation": "All",
  "SharePointLocation": "All",
  "OneDriveLocation": "All",
  "RuleParams": {
    "Name": "Block Credit Card data Rule",
    "ContentContainsSensitiveInformation": [{ "name": "Credit Card Number", "minCount": "1" }],
    "BlockAccess": true
  }
}`,
  },
  RetentionCompliancePolicy: {
    title: "Deploy Retention Compliance Policy",
    buttonLabel: "Deploy Retention Policy",
    postUrl: "/api/AddRetentionCompliancePolicy",
    listTemplatesUrl: "/api/ListRetentionCompliancePolicyTemplates",
    templateQueryKey: "TemplateListRetentionCompliancePolicy",
    relatedQueryKeys: [
      "ListRetentionCompliancePolicy",
      "ListRetentionCompliancePolicyTemplates",
    ],
    placeholder: `{
  "Name": "7-year Email Retention",
  "Comment": "Retain Exchange mail for 7 years",
  "ExchangeLocation": "All",
  "Enabled": true,
  "RuleParams": {
    "Name": "7-year Email Retention Rule",
    "RetentionDuration": 2555,
    "RetentionComplianceAction": "Keep",
    "ExpirationDateOption": "ModificationAgeInDays"
  }
}`,
  },
  SensitivityLabel: {
    title: "Deploy Sensitivity Label",
    buttonLabel: "Deploy Sensitivity Label",
    postUrl: "/api/AddSensitivityLabel",
    listTemplatesUrl: "/api/ListSensitivityLabelTemplates",
    templateQueryKey: "TemplateListSensitivityLabel",
    relatedQueryKeys: ["ListSensitivityLabel", "ListSensitivityLabelTemplates"],
    placeholder: `{
  "Name": "Confidential",
  "DisplayName": "Confidential",
  "Tooltip": "Confidential data, do not share externally",
  "Comment": "Internal-only confidential classification",
  "ContentType": "File, Email",
  "EncryptionEnabled": true,
  "EncryptionProtectionType": "Template",
  "ContentMarkingHeaderEnabled": true,
  "ContentMarkingHeaderText": "Confidential - Internal Use Only",
  "PolicyParams": {
    "Name": "Confidential Label Policy",
    "ExchangeLocation": "All",
    "Settings": [
      ["mandatory", "false"],
      ["disablemandatoryinoutlook", "true"]
    ]
  }
}`,
  },
  SensitiveInfoType: {
    title: "Deploy Sensitive Information Type",
    buttonLabel: "Deploy SIT",
    postUrl: "/api/AddSensitiveInfoType",
    listTemplatesUrl: "/api/ListSensitiveInfoTypeTemplates",
    templateQueryKey: "TemplateListSensitiveInfoType",
    relatedQueryKeys: ["ListSensitiveInfoType", "ListSensitiveInfoTypeTemplates"],
    placeholder: `{
  "Name": "Custom Employee ID",
  "Description": "Internal Employee ID format EMP-NNNNN",
  "Pattern": "EMP-\\\\d{5}",
  "Confidence": "High",
  "Recommended": true
}

// Or with a base64-encoded XML rule pack:
// {
//   "Name": "Custom Rule Pack",
//   "FileDataBase64": "<BASE64 encoded XML rule pack>"
// }`,
  },
};

export const CippDeployCompliancePolicyDrawer = ({
  mode,
  buttonText,
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const config = MODE_CONFIG[mode];

  const [drawerVisible, setDrawerVisible] = useState(false);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      selectedTenants: [],
      TemplateList: null,
      PowerShellCommand: "",
    },
  });

  const { isValid } = useFormState({ control: formControl.control });

  const templateListVal = useWatch({ control: formControl.control, name: "TemplateList" });

  useEffect(() => {
    if (templateListVal?.value) {
      formControl.setValue("PowerShellCommand", JSON.stringify(templateListVal.value));
    }
  }, [templateListVal, formControl]);

  const deployPolicy = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: config?.relatedQueryKeys ?? [],
  });

  useEffect(() => {
    if (deployPolicy.isSuccess) {
      formControl.reset({
        selectedTenants: [],
        TemplateList: null,
        PowerShellCommand: "",
      });
    }
  }, [deployPolicy.isSuccess, formControl]);

  if (!config) {
    return null;
  }

  const handleSubmit = () => {
    formControl.trigger();
    if (!isValid) return;
    deployPolicy.mutate({
      url: config.postUrl,
      data: formControl.getValues(),
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      selectedTenants: [],
      TemplateList: null,
      PowerShellCommand: "",
    });
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<RocketLaunch />}
      >
        {buttonText ?? config.buttonLabel}
      </PermissionButton>
      <CippOffCanvas
        title={config.title}
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <Stack direction="row" spacing={2} justifyContent="flex-start">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={deployPolicy.isLoading || !isValid}
            >
              {deployPolicy.isLoading
                ? "Deploying..."
                : deployPolicy.isSuccess
                ? "Deploy Another"
                : "Deploy"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </Stack>
        }
      >
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12 }}>
            <CippFormTenantSelector
              label="Select Tenants"
              formControl={formControl}
              name="selectedTenants"
              type="multiple"
              allTenants={true}
              preselectedEnabled={true}
              validators={{ required: "At least one tenant must be selected" }}
            />
          </Grid>

          <Divider sx={{ my: 1, width: "100%" }} />

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Select a template (optional)"
              name="TemplateList"
              formControl={formControl}
              multiple={false}
              api={{
                queryKey: config.templateQueryKey,
                labelField: "name",
                valueField: (option) => option,
                url: config.listTemplatesUrl,
              }}
              placeholder="Select a template or enter PowerShell JSON manually"
            />
          </Grid>

          <Divider sx={{ my: 1, width: "100%" }} />

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Parameters (JSON)"
              name="PowerShellCommand"
              formControl={formControl}
              multiline
              rows={12}
              validators={{ required: "Please enter the PowerShell parameters as JSON." }}
              placeholder={config.placeholder}
            />
          </Grid>

          <CippApiResults apiObject={deployPolicy} />
        </Grid>
      </CippOffCanvas>
    </>
  );
};
