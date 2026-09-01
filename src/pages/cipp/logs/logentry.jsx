import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../layouts/index";
import { ApiGetCall } from "../../../api/ApiCall";
import { Box, Container, Chip, TextField, Card, CardHeader, CardContent } from "@mui/material";
import { Stack } from "@mui/system";
import { CippPropertyListCard } from "../../../components/CippCards/CippPropertyListCard";
import { CippInfoBar } from "../../../components/CippCards/CippInfoBar";
import CippFormSkeleton from "../../../components/CippFormPages/CippFormSkeleton";
import { getCippTranslation } from "../../../utils/get-cipp-translation";

const formatRawError = (rawError) => {
  if (rawError == null || rawError === "") return "";
  try {
    if (typeof rawError === "object") {
      return JSON.stringify(rawError, null, 2) || "";
    }
    const asString = String(rawError).trim();
    if (!asString || asString === "null" || asString === "undefined" || asString === "Not available") {
      return "";
    }
    try {
      return JSON.stringify(JSON.parse(asString), null, 2) || asString;
    } catch {
      return asString;
    }
  } catch {
    return "";
  }
};

const formatLogDataValue = (value) => {
  if (value == null || value === "") return "N/A";
  try {
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2) || "N/A";
    }
    const asString = String(value);
    return asString || "N/A";
  } catch {
    return "Unable to display value";
  }
};

const Page = () => {
  const router = useRouter();
  const { logentry, dateFilter } = router.query;

  const logRequest = ApiGetCall({
    url: `/api/Listlogs`,
    data: {
      logentryid: logentry,
      dateFilter: dateFilter,
    },
    queryKey: `GetLogEntry-${logentry}`,
    waiting: !!logentry,
  });

  // Get the log data from array
  const logData = logRequest.data?.[0];

  // Top info bar data like dashboard
  const logInfo = logData
    ? [
        { name: "Log ID", data: logData.RowKey ?? "N/A" },
        {
          name: "Date & Time",
          data: logData.DateTime ? new Date(logData.DateTime).toLocaleString() : "N/A",
        },
        { name: "API", data: logData.API ?? "N/A" },
        {
          name: "Severity",
          data: (
            <Chip
              label={logData.Severity ?? "Unknown"}
              color={
                logData.Severity === "CRITICAL"
                  ? "error"
                  : logData.Severity === "Error"
                    ? "error"
                    : logData.Severity === "Warn"
                      ? "warning"
                      : logData.Severity === "Info"
                        ? "info"
                        : "default"
              }
              variant="filled"
            />
          ),
        },
      ]
    : [];

  // Main log properties
  const propertyItems = logData
    ? [
        { label: "Tenant", value: logData.Tenant ?? "N/A" },
        { label: "User", value: logData.User ?? "N/A" },
        { label: "Message", value: logData.Message ?? "N/A" },
        { label: "Tenant ID", value: logData.TenantID ?? "N/A" },
        { label: "App ID", value: logData.AppId || "None" },
        { label: "IP Address", value: logData.IP || "None" },
      ]
    : [];

  const formattedRawError = formatRawError(logData?.LogData?.RawError);

  // LogData properties (RawError is shown separately)
  const logDataItems =
    logData?.LogData && typeof logData.LogData === "object" && !Array.isArray(logData.LogData)
      ? Object.entries(logData.LogData)
          .filter(([key, value]) => key !== "RawError" && value != null && value !== "")
          .map(([key, value]) => ({
            label: key,
            value: formatLogDataValue(value),
          }))
      : [];

  const standardItems =
    logData?.Standard && typeof logData.Standard === "object" && !Array.isArray(logData.Standard)
      ? Object.entries(logData.Standard).map(([key, value]) => ({
          label: getCippTranslation(key),
          value: value ?? "N/A",
        }))
      : [];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth={false}>
        <Stack spacing={2}>
          {logRequest.isLoading && <CippFormSkeleton layout={[1, 1, 1]} />}

          {logRequest.isError && (
            <CippPropertyListCard
              title="Error"
              propertyItems={[{ label: "Error", value: "Failed to load log entry" }]}
            />
          )}

          {logRequest.isSuccess && logData && (
            <>
              {/* Top info bar like dashboard */}
              <CippInfoBar data={logInfo} isFetching={logRequest.isLoading} />

              {/* Main log information */}
              <CippPropertyListCard
                title="Log Details"
                propertyItems={propertyItems}
                isFetching={logRequest.isLoading}
              />

              {/* LogData in separate card */}
              {logDataItems.length > 0 && (
                <CippPropertyListCard
                  title="Additional Log Data"
                  propertyItems={logDataItems}
                  isFetching={logRequest.isLoading}
                  showDivider={false}
                />
              )}
              {formattedRawError ? (
                <Card>
                  <CardHeader title="Raw Error" />
                  <CardContent>
                    <TextField
                      fullWidth
                      multiline
                      minRows={8}
                      maxRows={24}
                      value={formattedRawError}
                      slotProps={{
                        input: { readOnly: true },
                      }}
                      sx={{
                        "& .MuiInputBase-input": {
                          fontFamily: "monospace",
                          fontSize: "0.8125rem",
                        },
                      }}
                    />
                  </CardContent>
                </Card>
              ) : null}
              {standardItems.length > 0 && (
                <CippPropertyListCard
                  title="Standard"
                  propertyItems={standardItems}
                  isFetching={logRequest.isLoading}
                  layout="multiple"
                  showDivider={false}
                  variant="outlined"
                />
              )}
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
