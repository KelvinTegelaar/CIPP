import Head from "next/head";
import { useState } from "react";
import { Box, Container, Grid, Button } from "@mui/material";
import { CippInfoBar } from "../components/CippCards/CippInfoBar";
import { CippChartCard } from "../components/CippCards/CippChartCard";
import { CippPropertyListCard } from "../components/CippCards/CippPropertyListCard";
import { Layout as DashboardLayout } from "../layouts/index.js";
import { useSettings } from "../hooks/use-settings";
import { getCippFormatting } from "../utils/get-cipp-formatting.js";
import Portals from "../data/portals";
import { BulkActionsMenu } from "../components/bulk-actions-menu.js";
import { CippUniversalSearch } from "../components/CippCards/CippUniversalSearch.jsx";
import { ApiGetCall } from "../api/ApiCall.jsx";
const Page = () => {
  const { currentTenant } = useSettings();
  const [domainVisible, setDomainVisible] = useState(false);

  const organization = ApiGetCall({
    url: "/api/ListOrg",
    queryKey: `${currentTenant}-ListOrg`,
    data: { tenantFilter: currentTenant },
  });

  const dashboard = ApiGetCall({
    url: "/api/ListuserCounts",
    queryKey: `${currentTenant}-ListuserCounts`,
  });

  const GlobalAdminList = ApiGetCall({
    url: "/api/ListGraphRequest",
    queryKey: `${currentTenant}-ListGraphRequest`,
    data: {
      tenantFilter: currentTenant,
      Endpoint: "/directoryRoles(roleTemplateId='62e90394-69f5-4237-9190-012177145e10')/members",
      $select: "displayName,userPrincipalName,accountEnabled",
    },
  });

  const sharepoint = ApiGetCall({
    url: "/api/ListSharepointQuota",
    queryKey: `${currentTenant}-ListSharepointQuota`,
    data: { tenantFilter: currentTenant },
  });

  const standards = ApiGetCall({
    url: "/api/ListStandards",
    queryKey: `${currentTenant}-ListStandards`,
    data: { ShowConsolidated: true, TenantFilter: currentTenant },
  });

  const partners = ApiGetCall({
    url: "/api/ListGraphRequest",
    queryKey: `${currentTenant}-ListPartners`,
    data: {
      Endpoint: "policies/crossTenantAccessPolicy/partners",
      tenantFilter: currentTenant,
      ReverseTenantLookup: true,
    },
  });

  const currentTenantInfo = ApiGetCall({
    url: "/api/ListTenants",
    queryKey: `ListTenants`,
  });

  // Top bar data
  const tenantInfo = [
    { name: "Tenant Name", data: organization.data?.displayName },
    { name: "Tenant ID", data: organization.data?.id },
    { name: "Default Domain", data: organization.data?.verifiedDomains?.[0]?.name },
    {
      name: "AD Sync Enabled",
      data: getCippFormatting(organization.data?.onPremisesSyncEnabled, "dirsync"),
    },
  ];

  const filteredStandardsCount = (type) =>
    standards.data
      ? standards.data.filter((standard) => standard.Settings?.[type] === true).length
      : 0;
  const tenantLookup = currentTenantInfo.data?.find(
    (tenant) => tenant.defaultDomainName === currentTenant
  );
  console.log("tenantLookup", tenantLookup);
  const PortalMenuItems = Portals.map((portal) => ({
    label: portal.label,
    target: "_blank",
    link: portal.url.replace(portal.variable, tenantLookup?.[portal.variable]),
  }));
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <Box sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth={false}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={11}>
              <CippUniversalSearch />
            </Grid>
            <Grid item xs={12} md={1}>
              <BulkActionsMenu buttonName="Portals" actions={PortalMenuItems} />
            </Grid>
            <Grid item xs={12} md={12}>
              <CippInfoBar data={tenantInfo} isFetching={organization.isFetching} />
            </Grid>
            <Grid item xs={12} md={4}>
              <CippChartCard
                title="User Statistics"
                isFetching={dashboard.isFetching || GlobalAdminList.isFetching}
                chartType="pie"
                chartSeries={[
                  dashboard.data?.Users,
                  dashboard.data?.LicUsers,
                  dashboard.data?.Guests,
                  GlobalAdminList.data?.Results?.length,
                ]}
                labels={["Total Users", "Licensed Users", "Guests", "Global Admins"]}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <CippChartCard
                title="Standards Set"
                isFetching={standards.isFetching}
                chartType="line"
                chartSeries={[
                  standards.data ? filteredStandardsCount("remediate") : 0,
                  standards.data ? filteredStandardsCount("alert") : 0,
                  standards.data ? filteredStandardsCount("report") : 0,
                  standards.data?.length || 0,
                ]}
                labels={["Remediation", "Alert", "Report", "Total Available"]}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <CippChartCard
                title="SharePoint Quota"
                isFetching={sharepoint.isFetching}
                chartType="donut"
                chartSeries={[
                  Number(sharepoint.data?.TenantStorageMB - sharepoint.data?.GeoUsedStorageMB),
                  Number(sharepoint.data?.GeoUsedStorageMB),
                ]}
                labels={[
                  `Free (${
                    sharepoint.data?.TenantStorageMB - sharepoint.data?.GeoUsedStorageMB
                  }MB)`,
                  `Used (${Number(sharepoint.data?.GeoUsedStorageMB)}MB)`,
                ]}
              />
            </Grid>

            {/* Converted Domain Names to Property List */}
            <Grid item xs={12} md={4}>
              <CippPropertyListCard
                title="Domain Names"
                showDivider={false}
                copyItems={true}
                isFetching={organization.isFetching}
                propertyItems={organization.data?.verifiedDomains
                  ?.slice(0, domainVisible ? undefined : 3)
                  .map((domain, idx) => ({
                    label: `Domain`,
                    value: domain.name,
                  }))}
                actions={
                  organization.data?.verifiedDomains?.length > 3 && (
                    <Button onClick={() => setDomainVisible(!domainVisible)}>
                      {domainVisible ? "See less" : "See more..."}
                    </Button>
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <CippPropertyListCard
                showDivider={false}
                copyItems={true}
                title="Partner Relationships"
                isFetching={partners.isFetching}
                propertyItems={partners.data?.Results.map((partner, idx) => ({
                  label: partner.TenantInfo?.displayName,
                  value: partner.TenantInfo?.defaultDomainName,
                }))}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <CippPropertyListCard
                copyItems={true}
                showDivider={false}
                title="Tenant Capabilities"
                isFetching={organization.isFetching}
                propertyItems={[
                  {
                    label: "Services",
                    value: organization.data?.assignedPlans
                      ?.filter(
                        (plan) =>
                          plan.capabilityStatus === "Enabled" &&
                          ["exchange", "AADPremiumService", "WindowsDefenderATP"].includes(
                            plan.service
                          )
                      )
                      .reduce((uniqueServices, curr) => {
                        const serviceLabel =
                          curr.service === "exchange"
                            ? "Exchange"
                            : curr.service === "AADPremiumService"
                            ? "AAD Premium"
                            : curr.service === "Windows Defender"
                            ? "Windows Defender"
                            : curr.service;

                        if (!uniqueServices.includes(serviceLabel)) {
                          uniqueServices.push(serviceLabel);
                        }
                        return uniqueServices;
                      }, [])
                      .join(", "),
                  },
                ]}
              />
            </Grid>
          </Grid>

          {currentTenant?.customerId === "AllTenants" && (
            <Card>
              <CardHeader title="All Tenants" />
              <CardContent>Select a Tenant to show the dashboard</CardContent>
            </Card>
          )}
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
