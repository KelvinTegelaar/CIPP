import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useRouter } from "next/router";
import { useSettings } from "/src/hooks/use-settings";
import { ApiGetCall } from "/src/api/ApiCall";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import { Group, Mail } from "@mui/icons-material";
import PhoneIcon from '@mui/icons-material/Phone';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import { HeaderedTabbedLayout } from "/src/layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import { CippCopyToClipBoard } from "/src/components/CippComponents/CippCopyToClipboard";
import { Box, Stack } from "@mui/system";
import Grid from "@mui/material/Grid2";
import { CippBannerListCard } from "/src/components/CippCards/CippBannerListCard";
import { CippInfoCard } from "/src/components/CippCards/CippInfoCard";
import { useEffect, useState } from "react";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { RoomListAddress } = router.query;
  const [waiting, setWaiting] = useState(false);
  useEffect(() => {
    if (RoomListAddress) {
      setWaiting(true);
    }
  }, [RoomListAddress]);

  const roomRequest = ApiGetCall({
    url: `/api/ListRoomLists?PlaceListID=${RoomListAddress}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `PlaceList-${RoomListAddress}`,
    waiting: waiting,
  });

  const listRequest = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: `/places/${RoomListAddress}/microsoft.graph.roomlist/rooms`,
        tenantFilter: userSettingsDefaults.currentTenant,
        AsApp: true,
        manualPagination: true,
        $count: true,
        $top: 999,
    },
    queryKey: `list-${RoomListAddress}`,
    waiting: waiting,
  });

  const title = roomRequest.isSuccess ? <>{roomRequest.data?.[0]?.displayName}</> : "Loading...";

  const subtitle = roomRequest.isSuccess
    ? [
        {
          icon: <Mail />,
          text: <CippCopyToClipBoard type="chip" text={roomRequest.data?.[0]?.emailAddress} />,
        },
      ]
    : [];

  const data = roomRequest.data?.[0];

  const listRoomItems = listRequest.isSuccess
    ? [
        {
          id: 1,
          cardLabelBox: {
            cardLabelBoxHeader: <Group />,
          },
          text: "Roomlist Members",
          subtext: "List of rooms included in this room list",
          table: {
            title: "Roomlist Members",
            hideTitle: true,
            /*actions: [
              {
                label: "Edit Room",
                link: "/email/resources/management/list-rooms/edit?PlaceID=[id]",
              },
            ],*/
            data: listRequest?.data?.Results,
          },
        },
      ]
    : [];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      isFetching={roomRequest.isLoading}
    >
      {roomRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 2]} />}
      {roomRequest.isSuccess && (
        <Box
          sx={{
            flexGrow: 1,
            py: 4,
          }}
        >
          <Grid container spacing={2}>
          <Grid item size={4}>
              <CippInfoCard
                isFetching={roomRequest.isLoading}
                label="Phone"
                value={data?.phone}
                icon={<PhoneIcon />}
              />
              <CippInfoCard
                isFetching={roomRequest.isLoading}
                label="Country"
                value={data?.address.countryOrRegion}
                icon={<LocationCityIcon />}
              />
              <CippInfoCard
                isFetching={roomRequest.isLoading}
                label="State"
                value={data?.address.state}
                icon={<LocationCityIcon />}
              />
              <CippInfoCard
                isFetching={roomRequest.isLoading}
                label="City"
                value={data?.address.city}
                icon={<LocationCityIcon />}
              />
              <CippInfoCard
                isFetching={roomRequest.isLoading}
                label="Street"
                value={data?.address.street}
                icon={<LocationCityIcon />}
              />
            </Grid>
            <Grid item size={8}>
              <Stack spacing={3}>
                <CippBannerListCard
                  isFetching={listRequest.isLoading}
                  items={listRoomItems}
                  isCollapsible={listRoomItems.length > 0 ? true : false}
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
