import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { ApiGetCall } from "/src/api/ApiCall";
import {
  Button,
  SvgIcon,
  Box,
  Container,
  Chip,
} from "@mui/material";
import { Stack } from "@mui/system";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import { CippPropertyListCard } from "/src/components/CippCards/CippPropertyListCard";
import { CippInfoBar } from "/src/components/CippCards/CippInfoBar";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";

const Page = () => {
  const router = useRouter();
  const { logentry } = router.query;

  const logRequest = ApiGetCall({
    url: `/api/Listlogs`,
    data: {
      logentryid: logentry,
    },
    queryKey: `GetLogEntry-${logentry}`,
    waiting: !!logentry,
  });

  const handleBackClick = () => {
    router.push("/cipp/logs");
  };

  // Get the log data from array
  const logData = logRequest.data?.[0];
  
  // Top info bar data like dashboard
  const logInfo = logData ? [
    { name: "Log ID", data: logData.RowKey },
    { name: "Date & Time", data: new Date(logData.DateTime).toLocaleString() },
    { name: "API", data: logData.API },
    { 
      name: "Severity", 
      data: (
        <Chip 
          label={logData.Severity} 
          color={
            logData.Severity === "CRITICAL" ? "error" :
            logData.Severity === "Error" ? "error" :
            logData.Severity === "Warn" ? "warning" :
            logData.Severity === "Info" ? "info" : "default"
          }
          variant="filled"
        />
      )
    },
  ] : [];

  // Main log properties
  const propertyItems = logData ? [
    { label: "Tenant", value: logData.Tenant },
    { label: "User", value: logData.User },
    { label: "Message", value: logData.Message },
    { label: "Tenant ID", value: logData.TenantID },
    { label: "App ID", value: logData.AppId || "None" },
    { label: "IP Address", value: logData.IP || "None" },
  ] : [];

  // LogData properties
  const logDataItems = logData?.LogData && typeof logData.LogData === 'object' 
    ? Object.entries(logData.LogData).map(([key, value]) => ({
        label: key,
        value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
      }))
    : [];

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth={false}>
        <Stack spacing={2}>
          {/* Back button */}
          <Button
            color="inherit"
            onClick={handleBackClick}
            startIcon={
              <SvgIcon fontSize="small">
                <ArrowLeftIcon />
              </SvgIcon>
            }
            sx={{ alignSelf: "flex-start" }}
          >
            Back to Logs
          </Button>

          {logRequest.isLoading && <CippFormSkeleton layout={[1, 1, 1]} />}
          
          {logRequest.isError && (
            <CippPropertyListCard
              title="Error"
              propertyItems={[
                { label: "Error", value: "Failed to load log entry" }
              ]}
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
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
