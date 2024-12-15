import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import { Box, Typography, Paper, Grid } from "@mui/material";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import { CippPropertyListCard } from "/src/components/CippCards/CippPropertyListCard";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";
import { getCippTranslation } from "../../../../utils/get-cipp-translation";
import dynamic from "next/dynamic";

const CippMap = dynamic(() => import("/src/components/CippComponents/CippMap"), { ssr: false });

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

  const geoLookup = ApiPostCall({
    urlFromData: true,
    queryKey: "GeoIPLookup-" + lookupIp,
    onResult: (result) => {
      setLogData((prevData) => ({
        ...prevData,
        Data: {
          ...prevData.Data,
          PotentialLocationInfo: result,
        },
      }));
    },
  });

  useEffect(() => {
    if (logRequest.isSuccess) {
      setLogData(logRequest?.data?.Results?.[0]);
      var potentialLocation = logRequest?.data?.Results?.[0]?.Data?.PotentialLocationInfo;
      if (potentialLocation && (!potentialLocation.lat || !potentialLocation.lon)) {
        setLookupIp(potentialLocation.RowKey);
        geoLookup.mutate({
          url: "/api/ExecGeoIPLookup",
          data: {
            IP: potentialLocation.RowKey,
          },
        });
      }
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

  const excludeLocationProperties = ["ETag", "PartitionKey", "RowKey", "Timestamp", "Tenant"];
  const locationInfoItems = logData?.Data?.PotentialLocationInfo
    ? Object.entries(logData.Data.PotentialLocationInfo)
        .filter(([key]) => !excludeLocationProperties.includes(key))
        .map(([key, value]) => ({
          label: getCippTranslation(key),
          value: getCippFormatting(value, key) ?? "N/A",
        }))
    : [];

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
            Audit Log Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CippPropertyListCard
                title="Log Information"
                propertyItems={propertyItems}
                isFetching={logRequest.isLoading}
                layout="multiple"
              />
            </Grid>
            {locationInfoItems.length > 0 && (
              <Grid item xs={12}>
                <CippPropertyListCard
                  title="Location Information"
                  propertyItems={locationInfoItems}
                  isFetching={logRequest.isLoading}
                  layout="multiple"
                />
              </Grid>
            )}
            {logData?.Data?.PotentialLocationInfo?.lat &&
              logData?.Data?.PotentialLocationInfo?.lon && (
                <Grid item xs={12}>
                  <CippMap
                    position={[
                      logData.Data.PotentialLocationInfo.lat,
                      logData.Data.PotentialLocationInfo.lon,
                    ]}
                    zoom={10}
                    markerPopupContents={`${logData.Data.PotentialLocationInfo.city}, ${logData.Data.PotentialLocationInfo.region} ${logData.Data.PotentialLocationInfo.country}`}
                    mapSx={{ height: "400px", width: "100%" }}
                  />
                </Grid>
              )}
            <Grid item xs={12}>
              <CippPropertyListCard
                title="Audit Data"
                propertyItems={rawDataItems}
                isFetching={logRequest.isLoading}
                layout="multiple"
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
