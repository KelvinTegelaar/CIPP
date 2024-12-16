import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import { Box, Typography, Paper, CardHeader, Card, CardContent, Button, Divider } from "@mui/material";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import { CippPropertyListCard } from "/src/components/CippCards/CippPropertyListCard";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";
import { getCippTranslation } from "../../../../utils/get-cipp-translation";
import CippGeoLocation from "../../../../components/CippComponents/CippGeoLocation";
import { Grid } from "@mui/system";
import { OpenInNew } from "@mui/icons-material";

const Page = () => {
  const router = useRouter();
  const { id } = router.query;
  const [logData, setLogData] = useState(null);
  const [lookupIp, setLookupIp] = useState(null);

  const logRequest = ApiGetCall({
    url: `/api/ListAuditLogs`,
    data: {
      logId: id,
    },
    queryKey: `GetAuditLog-${id}`,
  });

  useEffect(() => {
    if (logRequest.isSuccess) {
      var data = logRequest?.data?.Results?.[0];

      if (data && data?.Data.ActionUrl.includes("identity/administration/ViewBec")) {
        data.Data.ActionUrl = data.Data.ActionUrl.replace(
          "identity/administration/ViewBec",
          "identity/administration/users/user/bec"
        );
        data.Data.ActionUrl = data.Data.ActionUrl.replace("tenantDomain", "tenantFilter");
      }
      setLogData(data);
      setLookupIp(
        data?.Data?.IP ??
          data?.Data?.PotentialLocationInfo?.RowKey ??
          data?.Data?.RawData?.ClientIP ??
          null
      );
    }
  }, [logRequest.isSuccess]);

  const generatePropertyItems = (data) => {
    if (!data) return [];
    const properties = [
      { label: "Timestamp", value: data.Timestamp },
      { label: "Tenant", value: data.Tenant },
      { label: "Title", value: data.Title },
      { label: "Actions Taken", value: data.ActionsTaken },
      { label: "User", value: data.User },
      { label: "IP Address", value: data.IPAddress },
    ];
    return properties.map((prop) => ({
      label: prop.label,
      value: prop.value ?? "N/A",
    }));
  };

  const excludeProperties = ["CIPPLocationInfo", "CIPPParameters", "CIPPModifiedProperties"];
  const generateRawDataPropertyItems = (rawData) => {
    if (!rawData) return [];
    return Object.entries(rawData)
      .filter(([key]) => !excludeProperties.includes(key))
      .map(([key, value]) => ({
        label: getCippTranslation(key),
        value: getCippFormatting(value, key) ?? "N/A",
      }));
  };

  const propertyItems = generatePropertyItems(logData);
  const rawDataItems = generateRawDataPropertyItems(logData?.Data?.RawData);

  return (
    <Box sx={{ p: 3 }}>
      {logRequest.isLoading && <CippFormSkeleton layout={[1, 1, 1]} />}
      {logRequest.isSuccess && logData && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {logData.Title}
          </Typography>
          <Grid container spacing={2}>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <CippPropertyListCard
                title="Log Information"
                propertyItems={propertyItems}
                isFetching={logRequest.isLoading}
                layout="multiple"
                showDivider={false}
                variant="outlined"
                actionButton={
                  logData?.Data?.ActionUrl && logData?.Data?.ActionText ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<OpenInNew />}
                      onClick={() => window.open(logData.Data.ActionUrl, "_blank")}
                    >
                      {logData.Data.ActionText}
                    </Button>
                  ) : null
                }
              />
            </Grid>

            {lookupIp && (
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined">
                  <CardHeader title={`Location Information for ${lookupIp}`} />
                  <Divider />
                  <CardContent>
                    <CippGeoLocation ipAddress={lookupIp} />
                  </CardContent>
                </Card>
              </Grid>
            )}
            <Grid item xs={12}>
              <CippPropertyListCard
                title="Audit Data"
                propertyItems={rawDataItems}
                isFetching={logRequest.isLoading}
                layout="multiple"
                showDivider={false}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
