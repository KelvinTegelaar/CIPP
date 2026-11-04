import React, { useState, useEffect, useRef } from "react";
import { Button, Divider } from "@mui/material";
import { CippIcons } from "../../utils/icon-registry";
import { Grid } from "@mui/system";
import { useForm, useFormState, useWatch } from "react-hook-form";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormCondition } from "./CippFormCondition";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { CippApiResults } from "./CippApiResults";
import { ApiPostCall } from "../../api/ApiCall";

const defaultValues = { tenantFilter: [], TemplateList: null };

const groupOptions = [
  { label: "Dynamic Group", value: "dynamic" },
  { label: "Security Group", value: "generic" },
  { label: "Distribution Group", value: "distribution" },
  { label: "Azure Role Group", value: "azureRole" },
  { label: "Mail Enabled Security Group", value: "security" },
];

export const CippDeployGroupTemplateDrawer = ({
  buttonText = "Deploy Group Template",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const lastAppliedTemplate = useRef(null);
  const fillTimer = useRef(null);

  const formControl = useForm({ mode: "onChange", defaultValues });
  const { isValid } = useFormState({ control: formControl.control });
  const watcher = useWatch({ control: formControl.control, name: "TemplateList" });

  // Matches the live groups table key `groups-${tenant}`; the ReportDB cache only changes on sync.
  const deployTemplate = ApiPostCall({ relatedQueryKeys: ["groups-*"] });

  const resetForm = () => {
    clearTimeout(fillTimer.current);
    lastAppliedTemplate.current = null;
    formControl.reset(defaultValues);
  };

  useEffect(() => {
    if (deployTemplate.isSuccess) {
      resetForm();
    }
  }, [deployTemplate.isSuccess]);

  useEffect(() => {
    if (watcher?.value && watcher.value !== lastAppliedTemplate.current) {
      lastAppliedTemplate.current = watcher.value;
      const t = watcher.addedFields;

      // Set groupType first so the conditional fields are mounted before they get values
      formControl.setValue("groupType", t.groupType, { shouldValidate: true });

      clearTimeout(fillTimer.current);
      fillTimer.current = setTimeout(() => {
        formControl.setValue("displayName", t.displayName, { shouldValidate: true });
        formControl.setValue("description", t.description, { shouldValidate: true });
        formControl.setValue("username", t.username, { shouldValidate: true });
        formControl.setValue("allowExternal", t.allowExternal, { shouldValidate: true });
        formControl.setValue("membershipRules", t.membershipRules, { shouldValidate: true });
        formControl.setValue("licenses", t.licenses || [], { shouldValidate: true });
        formControl.setValue("aliases", t.aliases, { shouldValidate: true });
        formControl.setValue("hideFromGAL", t.hideFromGAL, { shouldValidate: true });
      }, 100);
    }
  }, [watcher]);

  useEffect(() => () => clearTimeout(fillTimer.current), []);

  const handleSubmit = () => {
    formControl.trigger();
    if (!isValid) {
      return;
    }
    deployTemplate.mutate({ url: "/api/AddGroup", data: formControl.getValues() });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    resetForm();
  };

  return (
    <>
      <PermissionButton
        {...(PermissionButton !== Button ? { requiredPermissions } : {})}
        onClick={() => setDrawerVisible(true)}
        startIcon={<CippIcons.RocketLaunch />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Deploy Group Template"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="md"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={deployTemplate.isPending || !isValid}
            >
              {deployTemplate.isPending
                ? "Deploying..."
                : deployTemplate.isSuccess
                ? "Deploy Another"
                : "Deploy Template"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={12}>
            <CippFormTenantSelector
              label="Select Tenants"
              formControl={formControl}
              type="multiple"
              allTenants={false}
              preselectedEnabled={true}
              validators={{ required: "At least one tenant must be selected" }}
            />
          </Grid>

          <Divider sx={{ my: 2, width: "100%" }} />

          <Grid size={12}>
            <CippFormComponent
              type="autoComplete"
              name="TemplateList"
              label="Choose a Template"
              formControl={formControl}
              creatable={false}
              multiple={false}
              api={{
                excludeTenantFilter: true,
                url: "/api/ListGroupTemplates",
                queryKey: "ListGroupTemplates",
                labelField: (option) =>
                  `${option.Displayname || option.displayName} (${option.groupType})`,
                valueField: "GUID",
                addedField: {
                  groupType: "groupType",
                  displayName: "displayName",
                  description: "description",
                  username: "username",
                  allowExternal: "allowExternal",
                  membershipRules: "membershipRules",
                  licenses: "licenses",
                  aliases: "aliases",
                  hideFromGAL: "hideFromGAL",
                },
                showRefresh: true,
              }}
            />
          </Grid>
          <Grid size={12}>
            <CippFormComponent
              type="radio"
              name="groupType"
              label="Group Type"
              formControl={formControl}
              options={groupOptions}
              validators={{ required: "Please select a group type" }}
            />
          </Grid>
          <Grid size={12}>
            <CippFormComponent
              type="textField"
              name="displayName"
              label="Group Display Name"
              formControl={formControl}
              validators={{ required: "Group display name is required" }}
            />
          </Grid>
          <Grid size={12}>
            <CippFormComponent
              type="textField"
              name="description"
              label="Group Description"
              formControl={formControl}
            />
          </Grid>
          <Grid size={12}>
            <CippFormComponent
              type="textField"
              name="username"
              label="Group Username"
              formControl={formControl}
            />
          </Grid>
          <CippFormCondition
            field="groupType"
            compareType="is"
            compareValue="distribution"
            formControl={formControl}
          >
            <Grid size={12}>
              <CippFormComponent
                type="switch"
                name="allowExternal"
                label="Allow external emails to the group"
                formControl={formControl}
              />
            </Grid>
          </CippFormCondition>
          <CippFormCondition
            field="groupType"
            compareType="isOneOf"
            compareValue={["dynamic", "dynamicDistribution"]}
            formControl={formControl}
          >
            <Grid size={12}>
              <CippFormComponent
                type="textField"
                name="membershipRules"
                label="Membership Rules"
                formControl={formControl}
                validators={{ required: "Membership rules are required" }}
              />
            </Grid>
          </CippFormCondition>
          <CippFormCondition
            field="groupType"
            compareType="isOneOf"
            compareValue={["distribution", "security"]}
            formControl={formControl}
          >
            <Grid size={12}>
              <CippFormComponent
                type="textField"
                name="aliases"
                label="Email Aliases"
                placeholder="One alias per line, e.g. postmaster@%tenantfilter%"
                formControl={formControl}
                multiline
                rows={4}
              />
            </Grid>
            <Grid size={12}>
              <CippFormComponent
                type="switch"
                name="hideFromGAL"
                label="Hide this group from the Global Address List (GAL)"
                formControl={formControl}
              />
            </Grid>
          </CippFormCondition>

          <CippApiResults apiObject={deployTemplate} />
        </Grid>
      </CippOffCanvas>
    </>
  );
};
