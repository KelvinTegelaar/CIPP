import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import { useForm, useWatch } from "react-hook-form";
import { CippFormComponent } from "/src/components/CippComponents/CippFormComponent";
import vendorTenantList from "/src/data/vendorTenantList";
import { Box, Grid, Stack } from "@mui/system";
import { Alert, Divider, Typography } from "@mui/material";

const Page = () => {
  const formControl = useForm({
    mode: "onChange",
  });

  const vendorFilter = vendorTenantList
    .map((vendor) => {
      return vendor.vendorTenantId;
    })
    .join(",");
  const vendorGraphFilter = `appOwnerOrganizationId in (${vendorFilter})`;
  const tenantId = useWatch({
    control: formControl.control,
    name: "tenantFilter",
  });

  return (
    <>
      <CippFormPage
        queryKey="ListGDAPRoles"
        formControl={formControl}
        title="Tenant Offboarding"
        hideBackButton={true}
        hidePageType={true}
        postUrl="/api/ExecOffboardTenant"
      >
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={12}>
            <Alert severity="info">
              This page is used to offboard a tenant. Please select the tenant and the actions to be
              performed. Please note that once an offboarding has been executed, it cannot be
              undone.
            </Alert>
          </Grid>
          <Grid size={12}>
            <CippFormComponent
              formControl={formControl}
              name="tenantFilter"
              label="Select Tenant to Offboard"
              type="autoComplete"
              api={{
                url: "/api/ExecExcludeTenant",
                data: {
                  ListAll: true,
                },
                queryKey: "ListAllTenants",
                labelField: (tenant) => {
                  return `${tenant.displayName} (${tenant.defaultDomainName})`;
                },
                valueField: "customerId",
              }}
              required={true}
              multiple={false}
              creatable={false}
              validators={{
                validate: (value) => {
                  if (!value) {
                    return "Tenant is required";
                  }
                  return true;
                },
              }}
            />
          </Grid>
          {tenantId && (
            <>
              <Grid size={12}>
                <Divider />
              </Grid>
              <Grid size={12}>
                <Typography variant="h6">Select offboarding actions to perform</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  The tenant will not be fully offboarded unless all the relationships/contracts are
                  terminated.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={0.5}>
                  <CippFormComponent
                    formControl={formControl}
                    name="vendorApplications"
                    label="Select Vendor Applications to Remove"
                    type="autoComplete"
                    api={{
                      url: "/api/ListGraphRequest",
                      data: {
                        Endpoint: "servicePrincipals",
                        TenantFilter: tenantId.value,
                        $filter: vendorGraphFilter,
                        $select: "id,displayName,appId,appOwnerOrganizationId",
                        $count: true,
                      },
                      dataKey: "Results",
                      queryKey: "ListVendorApps",
                      labelField: (app) => {
                        const vendor = vendorTenantList.find(
                          (v) => v?.vendorTenantId === app?.appOwnerOrganizationId
                        );
                        return `${vendor?.vendorName} - ${app?.displayName}`;
                      },
                      valueField: "appId",
                    }}
                  />
                  <CippFormComponent
                    formControl={formControl}
                    name="RemoveCSPGuestUsers"
                    label="Remove all guest users originating from the CSP tenant."
                    type="switch"
                  />
                  <CippFormComponent
                    formControl={formControl}
                    name="RemoveCSPnotificationContacts"
                    label="Remove all notification contacts originating from the CSP tenant (technical, security, marketing notifications)."
                    type="switch"
                  />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Alert severity="error" sx={{ p: 2 }}>
                  These actions will terminate all delegated access to the customer tenant!
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ pl: 1 }}>
                    <Stack spacing={0.5}>
                      <CippFormComponent
                        formControl={formControl}
                        name="RemoveMultitenantCSPApps"
                        label="Remove all multitenant applications originating from CSP tenant (including CIPP-SAM)."
                        type="switch"
                      />
                      <CippFormComponent
                        formControl={formControl}
                        name="TerminateGDAP"
                        label="Terminate all active GDAP relationships (will send email to tenant admins and contacts)."
                        type="switch"
                      />
                      <CippFormComponent
                        formControl={formControl}
                        name="TerminateContract"
                        label="Terminate contract relationship (reseller, etc)."
                        type="switch"
                      />
                    </Stack>
                  </Box>
                </Alert>
              </Grid>
            </>
          )}
        </Grid>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
