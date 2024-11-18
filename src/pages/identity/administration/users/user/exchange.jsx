import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useSettings } from "/src/hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import CalendarIcon from "@heroicons/react/24/outline/CalendarIcon";
import { Check, Error, Mail } from "@mui/icons-material";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import ReactTimeAgo from "react-time-ago";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { Box, Stack } from "@mui/system";
import Grid from "@mui/material/Grid2";
import { Typography } from "@mui/material";
import { CippBannerListCard } from "../../../../../components/CippCards/CippBannerListCard";
import { CippExchangeInfoCard } from "../../../../../components/CippCards/CippExchangeInfoCard";
import { useEffect, useState } from "react";
import CippExchangeSettingsForm from "../../../../../components/CippFormPages/CippExchangeSettingsForm";
import { useForm } from "react-hook-form";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const [waiting, setWaiting] = useState(false);
  const router = useRouter();
  const { userId } = router.query;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
    },
  });

  const userRequest = ApiGetCall({
    url: `/api/ListUserMailboxDetails?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `Mailbox-${userId}`,
    waiting: waiting,
  });

  const calPermissions = ApiGetCall({
    url: `/api/ListCalendarPermissions?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `CalendarPermissions-${userId}`,
    waiting: waiting,
  });

  useEffect(() => {
    //if userId is defined, we can fetch the user data
    if (userId) {
      setWaiting(true);
    }
  }, [userId]);

  const title = userRequest.isSuccess
    ? userRequest.data?.[0]?.Mailbox?.[0]?.DisplayName
    : "Loading...";

  const subtitle = userRequest.isSuccess
    ? [
        {
          icon: <Mail />,
          text: (
            <CippCopyToClipBoard
              type="chip"
              text={userRequest.data?.[0]?.Mailbox?.[0]?.UserPrincipalName}
            />
          ),
        },
        {
          icon: <CalendarIcon />,
          text: (
            <>
              Created:{" "}
              {userRequest.data?.[0]?.Mailbox?.[0]?.WhenCreated ? (
                <ReactTimeAgo date={new Date(userRequest.data?.[0]?.Mailbox?.[0]?.WhenCreated)} />
              ) : (
                "Unknown"
              )}
            </>
          ),
        },
      ]
    : [];

  const data = userRequest.data?.[0];

  const permissions = [
    {
      id: 1,
      cardLabelBox: {
        cardLabelBoxHeader:
          userRequest.data?.[0]?.Permissions?.length !== 0 ? <Check /> : <Error />,
      },
      text: "Current mailbox permissions",
      subtext:
        userRequest.data?.[0]?.Permissions?.length !== 0
          ? "Other users have access to this mailbox"
          : "No other users have access to this mailbox",
      statusColor: "green.main",
      //map each of the permissions to a label/value pair, where the label is the user's name and the value is the permission level
      propertyItems:
        userRequest.data?.[0]?.Permissions?.map((permission) => ({
          label: permission.User,
          value: permission.AccessRights,
        })) || [],
    },
  ];

  const calCard = [
    {
      id: 1,
      cardLabelBox: {
        cardLabelBoxHeader: calPermissions.data?.length !== 0 ? <Check /> : <Error />,
      },
      text: "Current Calendar permissions",
      subtext: calPermissions.data?.length
        ? "Other users have access to this users calendar"
        : "No other users have access to this users calendar",
      statusColor: "green.main",
      //map each of the permissions to a label/value pair, where the label is the user's name and the value is the permission level
      propertyItems:
        calPermissions.data?.map((permission) => ({
          label: `${permission.User} - ${permission.FolderName}`,
          value: permission.AccessRights.join(", "),
        })) || [],
    },
  ];
  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      isFetching={userRequest.isLoading}
    >
      {userRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 2]} />}
      {userRequest.isSuccess && (
        <Box
          sx={{
            flexGrow: 1,
            py: 4,
          }}
        >
          <Grid container spacing={2}>
            <Grid item size={4}>
              <CippExchangeInfoCard exchangeData={data} isFetching={userRequest.isLoading} />
            </Grid>
            <Grid item size={8}>
              <Stack spacing={3}>
                <Typography variant="h6">Permissions</Typography>
                <CippBannerListCard
                  isFetching={userRequest.isLoading}
                  items={permissions}
                  isCollapsible={userRequest.data?.[0]?.Permissions?.length !== 0}
                />
                <CippBannerListCard
                  isFetching={calPermissions.isLoading}
                  items={calCard}
                  isCollapsible={calPermissions.data?.length !== 0}
                />
                <CippExchangeSettingsForm
                  calPermissions={calPermissions.data}
                  currentSettings={userRequest.data?.[0]}
                  formControl={formControl}
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
