import { Alert, Container } from "@mui/material";
import { Grid } from "@mui/system";
import { TabbedLayout } from "../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import tabOptions from "./tabOptions";
import CippPermissionCheck from "../../../components/CippSettings/CippPermissionCheck";
import { CippPermissionReport } from "../../../components/CippSettings/CippPermissionReport";
import { useState } from "react";
import { ApiGetCall } from "../../../api/ApiCall";

const Page = () => {
  const [importReport, setImportReport] = useState(false);

  // Same signal the Add Tenant wizard uses to decide whether partner-only flows apply.
  // No tenantFilter means the backend defaults to the CIPP host tenant.
  const organization = ApiGetCall({
    url: "/api/ListGraphRequest",
    queryKey: "ListGraphRequest-organization-partnerTenantType",
    data: {
      Endpoint: "organization",
      $select: "partnerTenantType,displayName",
    },
  });

  const partnerTenantType = organization.data?.Results?.[0]?.partnerTenantType;
  const partnerCheckComplete = organization.isSuccess || organization.isError;
  const isPartner = organization.isSuccess && Boolean(partnerTenantType);

  // Keep the GDAP check visible until we know it does not apply, and always show it when an
  // imported report contains GDAP data.
  const showGdapCheck = !partnerCheckComplete || isPartner || Boolean(importReport?.GDAP);

  return (
    <Container sx={{ pt: 3 }} maxWidth="xl">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <CippPermissionReport importReport={importReport} setImportReport={setImportReport} />
        </Grid>
        <Grid size={{ lg: 6, md: 12, sm: 12, xs: 12 }}>
          <CippPermissionCheck type="Permissions" importReport={importReport} />
        </Grid>
        <Grid size={{ lg: 6, md: 12, sm: 12, xs: 12 }}>
          {showGdapCheck ? (
            <CippPermissionCheck type="GDAP" importReport={importReport} />
          ) : (
            <Alert severity="info">
              GDAP checks do not apply to this environment. Your tenants are added directly rather
              than through Microsoft Partner Center relationships, so access is verified per tenant
              in the Tenants check below.
            </Alert>
          )}
        </Grid>
        <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
          <CippPermissionCheck type="Tenants" importReport={importReport} />
        </Grid>
      </Grid>
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
