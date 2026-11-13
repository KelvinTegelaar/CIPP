import { Alert, Container } from "@mui/material";
import { Grid } from "@mui/system";
import { TabbedLayout } from "../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../layouts/index";
import tabOptions from "./tabOptions";
import CippPermissionCheck from "../../../components/CippSettings/CippPermissionCheck";
import { CippPermissionReport } from "../../../components/CippSettings/CippPermissionReport";
import { useState } from "react";
import { ApiGetCall } from "../../../api/ApiCall";
import { usePermissions } from "../../../hooks/use-permissions";
import { CippAutoComplete } from "../../../components/CippComponents/CippAutocomplete";

const Page = () => {
  const [importReport, setImportReport] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState("");
  const { checkRoles } = usePermissions();

  const featureFlags = ApiGetCall({
    url: "/api/ListFeatureFlags",
    queryKey: "featureFlags",
    staleTime: 600000,
  });
  const multiPartnerEnabled =
    Array.isArray(featureFlags.data) &&
    featureFlags.data.some((flag) => flag.Id === "MultiPartner" && flag.Enabled === true) &&
    checkRoles(["superadmin"]);

  const partnerTenants = ApiGetCall({
    url: "/api/ListPartnerTenants",
    queryKey: "partnerTenants",
    waiting: multiPartnerEnabled,
  });
  const partnerOptions = (partnerTenants.data?.Results || []).map((partner) => ({
    label: partner.displayName,
    value: partner.IsPrimary ? "" : partner.partnerTenantId,
  }));
  const partnerPicker = multiPartnerEnabled ? (
    <CippAutoComplete
      options={partnerOptions}
      label="Run checks as partner tenant"
      multiple={false}
      creatable={false}
      disableClearable={true}
      isFetching={partnerTenants.isFetching}
      value={partnerOptions.find((option) => option.value === selectedPartner) ?? null}
      onChange={(selected) => setSelectedPartner(selected?.value ?? "")}
    />
  ) : null;

  // Same signal the Add Tenant wizard uses to decide whether partner-only flows apply, and the
  // same shared query key so the two pages hit one cache entry.
  const organization = ApiGetCall({
    url: "/api/ListPartnerTenantInfo",
    queryKey: "ListPartnerTenantInfo",
  });

  const partnerCheckComplete = organization.isSuccess || organization.isError;
  const isPartner = organization.isSuccess && Boolean(organization.data?.isPartnerTenant);

  // Keep the GDAP check visible until we know it does not apply, and always show it when an
  // imported report contains GDAP data.
  const showGdapCheck = !partnerCheckComplete || isPartner || Boolean(importReport?.GDAP);

  return (
    <Container sx={{ pt: 0, px: { xs: 1.5, md: 3 } }} maxWidth="xl">
      <Grid container spacing={2}>
        {/* Below lg the report renders as a fixed FAB (plus a portaled dialog), so this item
            is empty in flow — display: contents dissolves it, or grid spacing leaves a blank
            16px row between the picker and the first card. */}
        <Grid size={{ xs: 12 }} sx={{ display: { xs: "contents", lg: "block" } }}>
          <CippPermissionReport
            importReport={importReport}
            setImportReport={setImportReport}
            actions={partnerPicker}
          />
        </Grid>

        <Grid size={{ lg: 6, md: 12, sm: 12, xs: 12 }}>
          <CippPermissionCheck
            type="Permissions"
            importReport={importReport}
            partnerTenantId={selectedPartner || undefined}
          />
        </Grid>
        <Grid size={{ lg: 6, md: 12, sm: 12, xs: 12 }}>
          {showGdapCheck ? (
            <CippPermissionCheck
              type="GDAP"
              importReport={importReport}
              partnerTenantId={selectedPartner || undefined}
            />
          ) : (
            <Alert severity="info">
              GDAP checks do not apply to this environment. Your tenants are added directly rather
              than through Microsoft Partner Center relationships, so access is verified per tenant
              in the Tenants check below.
            </Alert>
          )}
        </Grid>
        <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
          <CippPermissionCheck
            type="Tenants"
            importReport={importReport}
            partnerTenantId={selectedPartner || undefined}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout usesTenant={false}>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
