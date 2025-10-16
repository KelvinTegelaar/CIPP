import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { useSettings } from "/src/hooks/use-settings";
import CippAddEditUser from "/src/components/CippFormPages/CippAddEditUser";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import { useEffect } from "react";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import { getCippLicenseTranslation } from "/src/utils/get-cipp-license-translation";
import CalendarIcon from "@heroicons/react/24/outline/CalendarIcon";
import { Mail, Fingerprint, Launch } from "@mui/icons-material";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { CippTimeAgo } from "../../../../../components/CippComponents/CippTimeAgo";
import { Button, Alert } from "@mui/material";
import { Box } from "@mui/system";
const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { userId } = router.query;

  const userRequest = ApiGetCall({
    url: `/api/ListUsers?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `ListUsers-${userId}`,
  });

  const formControl = useForm({
    mode: "onBlur",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
    },
  });

  useEffect(() => {
    if (userRequest.isSuccess) {
      const user = userRequest.data?.[0];
      //if we have userSettingsDefaults.userAttributes set, grab the .label from each userSsettingsDefaults, then set defaultAttributes.${label}.value to user.${label}
      let defaultAttributes = {};
      if (userSettingsDefaults.userAttributes) {
        userSettingsDefaults.userAttributes.forEach((attribute) => {
          defaultAttributes[attribute.label] = { Value: user?.[attribute.label] };
        });
      }

      // Use fallback for usageLocation if user's usageLocation is null/undefined
      const usageLocation = user?.usageLocation || userSettingsDefaults?.usageLocation || null;

      formControl.reset({
        ...user,
        usageLocation: usageLocation,
        defaultAttributes: defaultAttributes,
        tenantFilter: userSettingsDefaults.currentTenant,
        licenses: user.assignedLicenses.map((license) => ({
          label: getCippLicenseTranslation([license]),
          value: license.skuId,
        })),
      });
      formControl.trigger();
    }
  }, [userRequest.isSuccess, userRequest.data, userRequest.isLoading]);

  // Set the title and subtitle for the layout
  const title = userRequest.isSuccess ? userRequest.data?.[0]?.displayName : "Loading...";

  const subtitle = userRequest.isSuccess
    ? [
        {
          icon: <Mail />,
          text: <CippCopyToClipBoard type="chip" text={userRequest.data?.[0]?.userPrincipalName} />,
        },
        {
          icon: <Fingerprint />,
          text: <CippCopyToClipBoard type="chip" text={userRequest.data?.[0]?.id} />,
        },
        {
          icon: <CalendarIcon />,
          text: (
            <>
              Created: <CippTimeAgo data={userRequest.data?.[0]?.createdDateTime} />
            </>
          ),
        },
        {
          icon: <Launch style={{ color: "#667085" }} />,
          text: (
            <Button
              color="muted"
              style={{ paddingLeft: 0 }}
              size="small"
              href={`https://entra.microsoft.com/${userSettingsDefaults.currentTenant}/#view/Microsoft_AAD_UsersAndTenants/UserProfileMenuBlade/~/overview/userId/${userId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View in Entra
            </Button>
          ),
        },
      ]
    : [];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      isFetching={userRequest.isLoading}
    >
      {userRequest.isSuccess && userRequest.data?.[0]?.onPremisesSyncEnabled && (
        <Alert severity="error" sx={{ mb: 1 }}>
          This user is synced from on-premises Active Directory. Changes should be made in the
          on-premises environment instead.
        </Alert>
      )}
      <CippFormPage
        queryKey={[`ListUsers-${userId}`, `Licenses-${userSettingsDefaults.currentTenant}`]}
        formControl={formControl}
        title={title}
        hideBackButton={true}
        hideTitle={true}
        formPageType="Edit"
        postUrl="/api/EditUser"
      >
        {userRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 1, 1, 1, 2, 2, 2, 2, 3]} />}
        {userRequest.isSuccess && (
          <Box sx={{ my: 2 }}>
            <CippAddEditUser
              formControl={formControl}
              userSettingsDefaults={userSettingsDefaults}
              formType="edit"
            />
          </Box>
        )}
      </CippFormPage>
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
