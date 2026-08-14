import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useWatch } from "react-hook-form";
import { RocketLaunch } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { CippApiResults } from "./CippApiResults";
import { ApiPostCall } from "../../api/ApiCall";

// Deploy an existing SharePoint provisioning template to one tenant. Live progress is
// rendered by CippApiResults via its jobProgress option. Tenant is singular because the
// Site/Team Owner picker is tied to a single tenant context.
export const CippSharePointTemplateDeployDrawer = ({
  buttonText = "Deploy Template",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const formControl = useForm({
    mode: "onChange",
    defaultValues: { template: null, siteOwner: null, tenantFilter: null },
  });
  const tenantFilter = useWatch({ control: formControl.control, name: "tenantFilter" });
  const tenantFilterValue = tenantFilter?.value;

  // Owner is tenant-scoped — clear it whenever the deploy target changes.
  useEffect(() => {
    formControl.setValue("siteOwner", null, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [tenantFilterValue, formControl]);

  const deployTemplate = ApiPostCall({
    relatedQueryKeys: ["ListSharePointTemplates"],
  });

  const handleSubmit = () => {
    const values = formControl.getValues();
    deployTemplate.mutate({
      url: "/api/ExecSharePointTemplate?Action=Deploy",
      data: {
        TemplateId: values.template?.value,
        SiteOwner: values.siteOwner?.value ?? values.siteOwner,
        tenantFilter: values.tenantFilter?.value,
      },
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset();
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<RocketLaunch />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Deploy SharePoint Template"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="md"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={deployTemplate.isPending || !formControl.formState.isValid}
            >
              {deployTemplate.isPending
                ? "Queueing..."
                : deployTemplate.isSuccess
                ? "Deploy Again"
                : "Deploy Template"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Select Template"
              name="template"
              multiple={false}
              formControl={formControl}
              validators={{ required: "Please select a template to deploy" }}
              api={{
                // ListSharePointTemplates returns a bare array, so no dataKey here.
                url: "/api/ListSharePointTemplates",
                queryKey: "ListSharePointTemplates",
                labelField: "templateName",
                valueField: "TemplateId",
                showRefresh: true,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippFormTenantSelector
              label="Select Tenant"
              formControl={formControl}
              type="single"
              allTenants={false}
              preselectedEnabled={true}
              validators={{ required: "Please select a tenant" }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              name="siteOwner"
              label="Site / Team Owner"
              formControl={formControl}
              multiple={false}
              disabled={!tenantFilterValue}
              validators={{ required: "An owner is required to create sites and teams" }}
              helperText="Set as the owner of every site or Team this template creates. The owner must have a license in the selected tenant."
              api={{
                url: "/api/ListGraphRequest",
                tenantFilter: tenantFilterValue,
                queryKey: "SPTemplateDeployOwner",
                data: {
                  Endpoint: "users",
                  $filter: "accountEnabled eq true and assignedLicenses/$count ne 0",
                  $top: 999,
                  $count: true,
                  $orderby: "displayName",
                  $select: "id,displayName,userPrincipalName",
                },
                dataKey: "Results",
                labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
                valueField: "userPrincipalName",
                addedField: {
                  id: "id",
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippApiResults
              apiObject={deployTemplate}
              jobProgress={{
                idField: "DeploymentId",
                title: "Deployment Progress",
                url: (id) => `/api/ExecSharePointTemplate?Action=DeployStatus&DeploymentId=${id}`,
              }}
            />
          </Grid>
        </Grid>
      </CippOffCanvas>
    </>
  );
};

export default CippSharePointTemplateDeployDrawer;
