import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useRouter } from "next/router";
import { useSettings } from "/src/hooks/use-settings";
import { ApiGetCall } from "/src/api/ApiCall";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import { Mail } from "@mui/icons-material";
import { HeaderedTabbedLayout } from "/src/layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import { CippCopyToClipBoard } from "/src/components/CippComponents/CippCopyToClipboard";
import { Box } from "@mui/system";
import Grid from "@mui/material/Grid2";
import { CippPropertyListCard } from "/src/components/CippCards/CippPropertyListCard";
import { useEffect, useState } from "react";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { PlaceAddress } = router.query;
  const [waiting, setWaiting] = useState(false);
  useEffect(() => {
    if (PlaceAddress) {
      setWaiting(true);
    }
  }, [PlaceAddress]);

  const placeRequest = ApiGetCall({
    url: `/api/ListRooms?PlaceID=${PlaceAddress}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `PlaceList-${PlaceAddress}`,
    waiting: waiting,
  });

  const title = placeRequest.isSuccess ? <>{placeRequest.data?.[0]?.displayName}</> : "Loading...";

  const subtitle = placeRequest.isSuccess
    ? [
        {
          icon: <Mail />,
          text: <CippCopyToClipBoard type="chip" text={placeRequest.data?.[0]?.emailAddress} />,
        },
      ]
    : [];

  const data = placeRequest.data?.[0];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      isFetching={placeRequest.isLoading}
    >
      {placeRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 2]} />}
      {placeRequest.isSuccess && (
        <Box
          sx={{
            flexGrow: 1,
            py: 4,
          }}
        >
          <Grid container spacing={2}>
            <Grid item size={4}>
              <CippPropertyListCard
                title="Location"
                propertyItems={[
                  { label: "Country", value: data?.address?.countryOrRegion ?? "N/A" },
                  { label: "State", value: data?.address?.state ?? "N/A" },
                  { label: "Postal Code", value: data?.address?.postalCode ?? "N/A" },
                  { label: "City", value: data?.address?.city ?? "N/A" },
                  { label: "Street", value: data?.address?.street ?? "N/A" },
                  { label: "Building", value: data?.building ?? "N/A" },
                  { label: "Floor Number", value: data?.floorNumber ?? "N/A" },
                ]}
              />
            </Grid>
            <Grid item size={4}>
              <CippPropertyListCard
                title="Details"
                propertyItems={[
                  { label: "Capacity", value: data?.capacity ?? "N/A" },
                  { label: "Booking Type", value: data?.bookingType ?? "N/A" },
                  { label: "Label", value: data?.label ?? "N/A" },
                  { label: "Is Wheelchair Accessible", value: data?.isWheelChairAccessible ?? "N/A" },
                ]}
              />
            </Grid>
            <Grid item size={4}>
              <CippPropertyListCard
                title="Hardware"
                propertyItems={[
                  { label: "Phone", value: data?.phone ?? "N/A" },
                  { label: "Audio Device Name", value: data?.audioDeviceName ?? "N/A" },
                  { label: "Video Device Name", value: data?.videoDeviceName ?? "N/A" },
                  { label: "Display Device Name", value: data?.displayDeviceName ?? "N/A" },
                ]}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
