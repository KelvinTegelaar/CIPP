import Head from "next/head";
import { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  Skeleton,
  Divider,
} from "@mui/material";
import { CippInfoBar } from "../components/CippCards/CippInfoBar";
import { CippChartCard } from "../components/CippCards/CippChartCard";
import { CippPropertyListCard } from "../components/CippCards/CippPropertyListCard";
import { ApiGetCall } from "../api/ApiCall";
import { Layout as DashboardLayout } from "../layouts/index.js";
import { useSettings } from "../hooks/use-settings";
import { getCippFormatting } from "../utils/get-cipp-formatting.js";

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

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <Box sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth={false}>
          <Grid container spacing={3}>
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
                  //the data is returned as a string, so we need to convert it to a number
                  Number(sharepoint.data?.TenantStorageMB - sharepoint.data?.GeoUsedStorageMB),
                  Number(sharepoint.data?.GeoUsedStorageMB),
                ]}
                labels={[
                  `Free (${
                    sharepoint.data?.TenantStorageMB - sharepoint.data?.GeoUsedStorageMB
                  }MB)`,
                  `Used (${sharepoint.data?.GeoUsedStorageMB}MB)`,
                ]}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Domain Names" />
                <Divider />
                <CardContent>
                  {organization.isFetching ? (
                    <Skeleton />
                  ) : (
                    <List>
                      {organization.data?.verifiedDomains?.slice(0, 3).map((item, idx) => (
                        <ListItem key={idx}>{item.name}</ListItem>
                      ))}
                      {organization.data?.verifiedDomains?.length > 3 && (
                        <>
                          {domainVisible &&
                            organization.data.verifiedDomains
                              ?.slice(3)
                              .map((item, idx) => <ListItem key={idx}>{item.name}</ListItem>)}
                          <Button onClick={() => setDomainVisible(!domainVisible)}>
                            {domainVisible ? "See less" : "See more..."}
                          </Button>
                        </>
                      )}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <CippPropertyListCard
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
                            : curr.service === "WindowsDefender"
                            ? "Windows Defender"
                            : curr.service;

                        if (!uniqueServices.includes(serviceLabel)) {
                          uniqueServices.push(serviceLabel);
                        }
                        return uniqueServices;
                      }, [])
                      .join(", "), // join the services into a comma-separated string
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
