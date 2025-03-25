import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import {
  Box,
  Typography,
  Paper,
  CardHeader,
  Card,
  CardContent,
  Button,
  Divider,
  SvgIcon,
} from "@mui/material";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import { CippPropertyListCard } from "/src/components/CippCards/CippPropertyListCard";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";
import { getCippTranslation } from "../../../../utils/get-cipp-translation";
import CippGeoLocation from "../../../../components/CippComponents/CippGeoLocation";
import { Grid } from "@mui/system";
import { OpenInNew } from "@mui/icons-material";
import auditLogTranslation from "/src/data/audit-log-translations.json";
import { ArrowLeftIcon } from "@mui/x-date-pickers";

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

  const translateAuditLogValue = (key, value) => {
    if (typeof value === "object" || Array.isArray(value)) {
      return value;
    }
    if (typeof value === "boolean") {
      return value;
    }
    if (
      typeof value === "string" &&
      (value.toLowerCase() === "true" || value.toLowerCase() === "false")
    ) {
      return value.toLowerCase() === "true";
    }
    const stringValue = String(value);
    if (auditLogTranslation[key]) {
      return auditLogTranslation[key][stringValue] ?? stringValue;
    }
    return stringValue;
  };

  useEffect(() => {
    if (logRequest.isSuccess) {
      var data = logRequest?.data?.Results?.[0];

      if (data && data?.Data?.ActionUrl?.includes("identity/administration/ViewBec")) {
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
      {
        label: "Timestamp",
        value: getCippFormatting(data?.Data?.RawData?.CreationTime, "CreationTime"),
      },
      { label: "Tenant", value: data.Tenant },
      {
        label: "User",
        value: data?.Data?.RawData?.UserKey ?? data?.Data?.RawData?.AuditRecord?.userId ?? "N/A",
      },
      { label: "IP Address", value: data?.Data?.IP },
      {
        label: "Actions Taken",
        value: getCippFormatting(data?.Data?.RawData?.CIPPAction, "CIPPAction"),
      },
      {
        label: "Webhook Rule",
        value: getCippFormatting(data?.Data?.RawData?.CIPPClause, "CIPPClause"),
      },
    ];
    return properties.map((prop) => ({
      label: prop.label,
      value: prop.value ?? "N/A",
    }));
  };

  const excludeProperties = [
    "CreationTime",
    "CIPPLocationInfo",
    "CIPPParameters",
    "CIPPModifiedProperties",
    "CIPPAction",
    "CIPPCondition",
    "CIPPIPDetected",
    "CIPPExtendedProperties",
    "CIPPDeviceProperties",
    "CIPPGeoLocation",
    "CIPPClause",
  ];
  const generateRawDataPropertyItems = (rawData) => {
    if (!rawData) return [];
    return Object.entries(rawData)
      .filter(([key]) => !excludeProperties.includes(key))
      .map(([key, value]) => ({
        label: getCippTranslation(key),
        value: getCippFormatting(translateAuditLogValue(key, value), key) ?? "N/A",
      }));
  };

  const propertyItems = generatePropertyItems(logData);
  const rawDataItems = generateRawDataPropertyItems(logData?.Data?.RawData);

  return (
    <Box sx={{ p: 3 }}>
      <Button
        color="inherit"
        onClick={() => router.back()}
        startIcon={
          <SvgIcon fontSize="small">
            <ArrowLeftIcon />
          </SvgIcon>
        }
      >
        Back
      </Button>
      {logRequest.isLoading && <CippFormSkeleton layout={[1, 1, 1]} />}
      {logRequest.isSuccess && logData && (
        <Paper elevation={3} sx={{ mt: 2, p: 3 }}>
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
