import Head from "next/head";
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Button,
  Card,
  CardContent,
  SvgIcon,
  Typography,
  Skeleton,
  Stack,
} from "@mui/material";
import { Grid } from "@mui/system";
import { CippChartCard } from "../components/CippCards/CippChartCard";
import { CippPropertyListCard } from "../components/CippCards/CippPropertyListCard";
import { Layout as DashboardLayout } from "../layouts/index.js";
import { useSettings } from "../hooks/use-settings";
import { getCippFormatting } from "../utils/get-cipp-formatting.js";
import Portals from "../data/portals";
import { BulkActionsMenu } from "../components/bulk-actions-menu.js";
import { CippUniversalSearch } from "../components/CippCards/CippUniversalSearch.jsx";
import { ApiGetCall } from "../api/ApiCall.jsx";
import { CippCopyToClipBoard } from "../components/CippComponents/CippCopyToClipboard.jsx";
import { ExecutiveReportButton } from "../components/ExecutiveReportButton.js";
import { CheckCircleIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { Map, Score } from "@mui/icons-material";
import Link from "next/link";

const Page = () => {
  const settings = useSettings();
  const { currentTenant } = settings;
  const [domainVisible, setDomainVisible] = useState(false);

  const organization = ApiGetCall({
    url: "/api/ListOrg",
    queryKey: `${currentTenant}-ListOrg`,
    data: { tenantFilter: currentTenant },
  });

  const dashboard = ApiGetCall({
    url: "/api/ListuserCounts",
    data: { tenantFilter: currentTenant },
    queryKey: `${currentTenant}-ListuserCounts`,
  });

  const sharepoint = ApiGetCall({
    url: "/api/ListSharepointQuota",
    queryKey: `${currentTenant}-ListSharepointQuota`,
    data: { tenantFilter: currentTenant },
  });

  const standards = ApiGetCall({
    url: "/api/ListStandardTemplates",
    queryKey: `${currentTenant}-ListStandardTemplates`,
  });

  const driftApi = ApiGetCall({
    url: "/api/listTenantDrift",
    data: {
      TenantFilter: currentTenant,
    },
    queryKey: `TenantDrift-${currentTenant}`,
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

  const secureScore = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: "security/secureScores",
      tenantFilter: currentTenant,
      noPagination: true,
      $top: 1,
    },
    queryKey: `secureScore-${currentTenant}`,
  });

  const currentTenantInfo = ApiGetCall({
    url: "/api/ListTenants",
    queryKey: `ListTenants`,
  });

  // Process drift data for chart - filter by current tenant and aggregate
  const processDriftDataForTenant = (driftData, currentTenant) => {
    if (!driftData) {
      return {
        alignedCount: 0,
        acceptedDeviationsCount: 0,
        currentDeviationsCount: 0,
        customerSpecificDeviations: 0,
        hasData: false,
      };
    }

    const rawDriftData = driftData || [];
    const tenantDriftData = Array.isArray(rawDriftData)
      ? rawDriftData.filter((item) => item.tenantFilter === currentTenant)
      : [];

    const hasData = tenantDriftData.length > 0;

    // Aggregate data across all standards for this tenant
    const aggregatedData = tenantDriftData.reduce(
      (acc, item) => {
        acc.acceptedDeviationsCount += item.acceptedDeviationsCount || 0;
        acc.currentDeviationsCount += item.currentDeviationsCount || 0;
        acc.alignedCount += item.alignedCount || 0;
        acc.customerSpecificDeviations += item.customerSpecificDeviationsCount || 0;
        return acc;
      },
      {
        acceptedDeviationsCount: 0,
        currentDeviationsCount: 0,
        alignedCount: 0,
        customerSpecificDeviations: 0,
      }
    );

    return { ...aggregatedData, hasData };
  };

  function getActionCountsForTenant(standardsData, currentTenant) {
    if (!standardsData) {
      return {
        remediateCount: 0,
        alertCount: 0,
        reportCount: 0,
        total: 0,
      };
    }

    const applicableTemplates = standardsData.filter((template) => {
      const tenantFilterArr = Array.isArray(template?.tenantFilter) ? template.tenantFilter : [];
      const excludedTenantsArr = Array.isArray(template?.excludedTenants)
        ? template.excludedTenants
        : [];

      const tenantInFilter =
        tenantFilterArr.length > 0 && tenantFilterArr.some((tf) => tf.value === currentTenant);

      const allTenantsTemplate =
        tenantFilterArr.some((tf) => tf.value === "AllTenants") &&
        (excludedTenantsArr.length === 0 ||
          !excludedTenantsArr.some((et) => et.value === currentTenant));

      return tenantInFilter || allTenantsTemplate;
    });

    // Combine standards from all applicable templates:
    let combinedStandards = {};
    for (const template of applicableTemplates) {
      for (const [standardKey, standardValue] of Object.entries(template.standards)) {
        combinedStandards[standardKey] = standardValue;
      }
    }

    // Count each action type:
    let remediateCount = 0;
    let alertCount = 0;
    let reportCount = 0;

    for (const [, standard] of Object.entries(combinedStandards)) {
      let actions = standard.action || [];
      if (!Array.isArray(actions)) {
        actions = [actions];
      }
      actions.forEach((actionObj) => {
        if (actionObj?.value === "Remediate") {
          remediateCount++;
        } else if (actionObj?.value === "Alert") {
          alertCount++;
        } else if (actionObj?.value === "Report") {
          reportCount++;
        }
      });
    }

    const total = Object.keys(combinedStandards).length;

    return { remediateCount, alertCount, reportCount, total };
  }

  const driftData = processDriftDataForTenant(driftApi.data, currentTenant);
  const { remediateCount, alertCount, reportCount, total } = getActionCountsForTenant(
    standards.data,
    currentTenant
  );

  // Process secure score data
  const getSecureScoreData = () => {
    if (!secureScore.isSuccess || !secureScore.data?.Results?.[0]) {
      return null;
    }
    const data = secureScore.data.Results[0];
    return {
      currentScore: data.currentScore,
      maxScore: data.maxScore,
      percentageCurrent: Math.round((data.currentScore / data.maxScore) * 100),
      percentageVsAllTenants: Math.round(data.averageComparativeScores?.[0]?.averageScore || 0),
      percentageVsSimilar: Math.round(data.averageComparativeScores?.[1]?.averageScore || 0),
    };
  };

  const secureScoreData = getSecureScoreData();

  const [PortalMenuItems, setPortalMenuItems] = useState([]);

  const formatStorageSize = (sizeInMB) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(2)}GB`;
    }
    return `${sizeInMB}MB`;
  };

  // Function to filter portals based on user preferences
  const getFilteredPortals = () => {
    const defaultLinks = {
      M365_Portal: true,
      Exchange_Portal: true,
      Entra_Portal: true,
      Teams_Portal: true,
      Azure_Portal: true,
      Intune_Portal: true,
      SharePoint_Admin: true,
      Security_Portal: true,
      Compliance_Portal: true,
      Power_Platform_Portal: true,
      Power_BI_Portal: true,
    };

    let portalLinks;
    if (settings.UserSpecificSettings?.portalLinks) {
      portalLinks = { ...defaultLinks, ...settings.UserSpecificSettings.portalLinks };
    } else if (settings.portalLinks) {
      portalLinks = { ...defaultLinks, ...settings.portalLinks };
    } else {
      portalLinks = defaultLinks;
    }

    // Filter the portals based on user settings
    return Portals.filter((portal) => {
      const settingKey = portal.name;
      return settingKey ? portalLinks[settingKey] === true : true;
    });
  };

  useEffect(() => {
    if (currentTenantInfo.isSuccess) {
      const tenantLookup = currentTenantInfo.data?.find(
        (tenant) => tenant.defaultDomainName === currentTenant
      );

      // Get filtered portals based on user preferences
      const filteredPortals = getFilteredPortals();

      const menuItems = filteredPortals.map((portal) => ({
        label: portal.label,
        target: "_blank",
        link: portal.url.replace(portal.variable, tenantLookup?.[portal.variable]),
        icon: portal.icon,
      }));
      setPortalMenuItems(menuItems);
    }
  }, [
    currentTenantInfo.isSuccess,
    currentTenant,
    settings.portalLinks,
    settings.UserSpecificSettings,
  ]);

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <Box sx={{ flexGrow: 1, pb: 4 }}>
        <Container maxWidth={false}>
          <Grid container spacing={3}>
            <Grid size={{ md: 12, xs: 12 }}>
              <Card>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
                  <BulkActionsMenu
                    buttonName="Portals"
                    actions={PortalMenuItems}
                    disabled={!currentTenantInfo.isSuccess || PortalMenuItems.length === 0}
                  />
                  <ExecutiveReportButton
                    tenantName={organization.data?.displayName}
                    tenantId={organization.data?.id}
                    userStats={{
                      licensedUsers: dashboard.data?.LicUsers || 0,
                      unlicensedUsers:
                        dashboard.data?.Users && dashboard.data?.LicUsers
                          ? dashboard.data?.Users - dashboard.data?.LicUsers
                          : 0,
                      guests: dashboard.data?.Guests || 0,
                      globalAdmins: dashboard.data?.Gas || 0,
                    }}
                    standardsData={driftApi.data}
                    organizationData={organization.data}
                    disabled={organization.isFetching || dashboard.isFetching}
                  />
                  <Box sx={{ flex: 1 }}>
                    {/* TODO: Remove Card from inside CippUniversalSearch to avoid double border */}
                    <CippUniversalSearch />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <Card>
                <Grid container>
                  {/* Tenant Info Section */}
                  <Grid
                    size={{ lg: 1.5, md: 3, sm: 6, xs: 12 }}
                    sx={{
                      borderRight: (theme) => ({
                        md: `1px solid ${theme.palette.divider}`,
                      }),
                      borderBottom: (theme) => ({
                        xs: `1px solid ${theme.palette.divider}`,
                        md: "none",
                      }),
                    }}
                  >
                    <Stack sx={{ p: 1.5 }}>
                      <Typography
                        color="text.secondary"
                        variant="caption"
                        sx={{
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Tenant Name
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {organization.isFetching ? (
                          <Skeleton width={100} />
                        ) : (
                          organization.data?.displayName
                        )}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid
                    size={{ lg: 1.5, md: 3, sm: 6, xs: 12 }}
                    sx={{
                      borderRight: (theme) => ({
                        md: `1px solid ${theme.palette.divider}`,
                      }),
                      borderBottom: (theme) => ({
                        xs: `1px solid ${theme.palette.divider}`,
                        md: "none",
                      }),
                    }}
                  >
                    <Stack alignItems="center" sx={{ p: 1.5 }}>
                      <Typography
                        color="text.secondary"
                        variant="caption"
                        sx={{
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Tenant ID
                      </Typography>
                      {organization.isFetching ? (
                        <Skeleton width={100} />
                      ) : (
                        <CippCopyToClipBoard text={organization.data?.id} type="chip" />
                      )}
                    </Stack>
                  </Grid>
                  <Grid
                    size={{ lg: 1.5, md: 3, sm: 6, xs: 12 }}
                    sx={{
                      borderRight: (theme) => ({
                        md: `1px solid ${theme.palette.divider}`,
                      }),
                      borderBottom: (theme) => ({
                        xs: `1px solid ${theme.palette.divider}`,
                        md: "none",
                      }),
                    }}
                  >
                    <Stack alignItems="center" sx={{ p: 1.5 }}>
                      <Typography
                        color="text.secondary"
                        variant="caption"
                        sx={{
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Default Domain
                      </Typography>
                      {organization.isFetching ? (
                        <Skeleton width={100} />
                      ) : (
                        <CippCopyToClipBoard
                          text={
                            organization.data?.verifiedDomains?.find(
                              (domain) => domain.isDefault === true
                            )?.name
                          }
                          type="chip"
                        />
                      )}
                    </Stack>
                  </Grid>
                  <Grid
                    size={{ lg: 1.5, md: 3, sm: 6, xs: 12 }}
                    sx={{
                      borderRight: (theme) => ({
                        lg: `1px solid ${theme.palette.divider}`,
                      }),
                      borderBottom: (theme) => ({
                        xs: `1px solid ${theme.palette.divider}`,
                        lg: "none",
                      }),
                    }}
                  >
                    <Stack alignItems="center" sx={{ p: 1.5 }}>
                      <Typography
                        color="text.secondary"
                        variant="caption"
                        sx={{
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        AD Sync Enabled
                      </Typography>
                      <Box sx={{ mt: 0.25 }}>
                        {organization.isFetching ? (
                          <Skeleton width={60} />
                        ) : (
                          getCippFormatting(organization.data?.onPremisesSyncEnabled, "dirsync")
                        )}
                      </Box>
                    </Stack>
                  </Grid>
                  {/* Secure Score Section - Consolidated */}
                  <Grid
                    size={{ lg: 6, md: 12, xs: 12 }}
                    component={Link}
                    href="/tenant/administration/securescore"
                    sx={{
                      textDecoration: "none",
                      color: "inherit",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-evenly"
                      sx={{ p: 1.5 }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <SvgIcon color="success" sx={{ fontSize: 18 }}>
                          <CheckCircleIcon />
                        </SvgIcon>
                        <Box>
                          <Typography
                            color="text.secondary"
                            variant="caption"
                            sx={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Secure Score
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {secureScore.isFetching ? (
                              <Skeleton width={40} />
                            ) : (
                              `${secureScoreData?.percentageCurrent || 0}%`
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <SvgIcon color="primary" sx={{ fontSize: 18 }}>
                          <GlobeAltIcon />
                        </SvgIcon>
                        <Box>
                          <Typography
                            color="text.secondary"
                            variant="caption"
                            sx={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            vs All Tenants
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {secureScore.isFetching ? (
                              <Skeleton width={40} />
                            ) : (
                              `${secureScoreData?.percentageVsAllTenants || 0}%`
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <SvgIcon color="warning" sx={{ fontSize: 18 }}>
                          <Map />
                        </SvgIcon>
                        <Box>
                          <Typography
                            color="text.secondary"
                            variant="caption"
                            sx={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            vs Similar
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {secureScore.isFetching ? (
                              <Skeleton width={40} />
                            ) : (
                              `${secureScoreData?.percentageVsSimilar || 0}%`
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <SvgIcon color="error" sx={{ fontSize: 18 }}>
                          <Score />
                        </SvgIcon>
                        <Box>
                          <Typography
                            color="text.secondary"
                            variant="caption"
                            sx={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Score Points
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {secureScore.isFetching ? (
                              <Skeleton width={60} />
                            ) : (
                              `${secureScoreData?.currentScore?.toFixed(2) || 0} / ${
                                secureScoreData?.maxScore || 0
                              }`
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            <Grid size={{ md: 4, xs: 12 }}>
              <CippChartCard
                title="User Statistics"
                isFetching={dashboard.isFetching}
                chartType="pie"
                totalLabel="Total Users"
                customTotal={dashboard.data?.Users}
                chartSeries={[
                  Number(dashboard.data?.LicUsers || 0),
                  dashboard.data?.Users && dashboard.data?.LicUsers
                    ? Number(dashboard.data?.Users - dashboard.data?.LicUsers)
                    : 0,
                  Number(dashboard.data?.Guests || 0),
                  Number(dashboard.data?.Gas || 0),
                ]}
                labels={["Licensed Users", "Unlicensed Users", "Guests", "Global Admins"]}
              />
            </Grid>

            <Grid size={{ md: 4, xs: 12 }}>
              <CippChartCard
                title={driftData.hasData ? "Drift Monitoring" : "Standards Set"}
                isFetching={driftApi.isFetching || standards.isFetching}
                chartType={driftData.hasData ? "donut" : "bar"}
                chartSeries={
                  driftData.hasData
                    ? [
                        driftData.alignedCount,
                        driftData.acceptedDeviationsCount,
                        driftData.currentDeviationsCount,
                        driftData.customerSpecificDeviations,
                      ]
                    : [remediateCount, alertCount, reportCount]
                }
                labels={
                  driftData.hasData
                    ? [
                        "Aligned Policies",
                        "Accepted Deviations",
                        "Current Deviations",
                        "Customer Specific Deviations",
                      ]
                    : ["Remediation", "Alert", "Report"]
                }
              />
            </Grid>

            <Grid size={{ md: 4, xs: 12 }}>
              <CippChartCard
                title="SharePoint Quota"
                isFetching={sharepoint.isFetching}
                chartType="donut"
                chartSeries={[
                  Number(sharepoint.data?.TenantStorageMB - sharepoint.data?.GeoUsedStorageMB) || 0,
                  Number(sharepoint.data?.GeoUsedStorageMB) || 0,
                ]}
                labels={[
                  `Free (${formatStorageSize(
                    sharepoint.data?.TenantStorageMB - sharepoint.data?.GeoUsedStorageMB
                  )})`,
                  `Used (${formatStorageSize(sharepoint.data?.GeoUsedStorageMB)})`,
                ]}
              />
            </Grid>

            {/* Converted Domain Names to Property List */}
            <Grid size={{ md: 4, xs: 12 }}>
              <CippPropertyListCard
                title="Domain Names"
                showDivider={false}
                copyItems={true}
                isFetching={organization.isFetching}
                propertyItems={organization.data?.verifiedDomains
                  ?.slice(0, domainVisible ? undefined : 3)
                  .map((domain, idx) => ({
                    label: "",
                    value: domain.name,
                  }))}
                actionButton={
                  organization.data?.verifiedDomains?.length > 3 && (
                    <Button onClick={() => setDomainVisible(!domainVisible)}>
                      {domainVisible ? "See less" : "See more..."}
                    </Button>
                  )
                }
              />
            </Grid>

            <Grid size={{ md: 4, xs: 12 }}>
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

            <Grid size={{ md: 4, xs: 12 }}>
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
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
