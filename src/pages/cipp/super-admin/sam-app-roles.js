import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Alert, CardContent, Stack, Typography } from "@mui/material";
import { WarningAmberOutlined } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { ApiGetCall, ApiGetCallWithPagination } from "../../../api/ApiCall";
import { useEffect } from "react";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";
import GDAPRoles from "/src/data/GDAPRoles";
import { CippFormTenantSelector } from "../../../components/CippComponents/CippFormTenantSelector";

const Page = () => {
  const pageTitle = "SAM App Roles";

  const formControl = useForm({
    mode: "onChange",
  });

  const execSAMRoles = ApiGetCall({
    url: "/api/ExecSAMRoles",
    queryKey: "ExecSAMRoles",
  });

  const { data: tenantsData = { pages: [] }, isSuccess: tenantsSuccess } = ApiGetCallWithPagination({
    url: "/api/ListTenants?AllTenantSelector=true",
    queryKey: "ListTenants-AllTenantSelector",
  });
  const tenants = tenantsData?.pages?.[0] || [];

  useEffect(() => {
    if (execSAMRoles.isSuccess && tenantsSuccess) {
      var selectedTenants = [];
      execSAMRoles.data?.Tenants.map((tenant) => {
        var tenantObj = false;
        if (tenant?.value) {
          tenantObj = tenants.find((t) => t?.defaultDomainName === tenant?.value);
        } else {
          tenantObj = tenants.find((t) => t?.defaultDomainName === tenant);
        }
        if (tenantObj) {
          selectedTenants.push({
            value: tenantObj?.defaultDomainName,
            label: tenantObj?.displayName,
          });
        }
      });
      formControl.reset({
        Roles: execSAMRoles.data?.Roles,
        Tenants: selectedTenants,
      });
    }
  }, [execSAMRoles.isSuccess, tenantsSuccess]);

  return (
    <CippFormPage
      title={pageTitle}
      hideBackButton={true}
      hidePageType={true}
      formControl={formControl}
      resetForm={false}
      postUrl="/api/ExecSAMRoles?Action=Update"
      queryKey={"execSAMRoles"}
    >
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="body2">
            Add your CIPP-SAM application Service Principal directly to Admin Roles in the tenant.
            This is an advanced use case where you need access to additional Graph endpoints or
            Exchange Cmdlets otherwise unavailable via Delegated permissions.
          </Typography>
          <Alert color="warning" icon={<WarningAmberOutlined />}>
            This functionality is in beta and should be treated as such. Roles are added during the
            Update Permissions process or a CPV refresh.
          </Alert>
          <CippFormComponent
            formControl={formControl}
            type="autoComplete"
            name="Roles"
            label="Admin Roles"
            options={GDAPRoles.map((role) => {
              return { value: role.ObjectId, label: role.Name };
            })}
          />
          <CippFormTenantSelector formControl={formControl} name="Tenants" allTenants={true} />
        </Stack>
      </CardContent>
    </CippFormPage>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
