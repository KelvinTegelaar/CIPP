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
import { Mail, Fingerprint } from "@mui/icons-material";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { CippTimeAgo } from "../../../../../components/CippComponents/CippTimeAgo";
const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { userId } = router.query;

  const userRequest = ApiGetCall({
    url: `/api/ListUsers?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `ListUsers-${userId}`,
  });

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
    },
  });

  useEffect(() => {
    if (userRequest.isSuccess) {
      const user = userRequest.data?.[0];
      formControl.reset({
        ...user,
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
      ]
    : [];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      isFetching={userRequest.isLoading}
    >
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
          <CippAddEditUser
            formControl={formControl}
            userSettingsDefaults={userSettingsDefaults}
            formType="edit"
          />
        )}
      </CippFormPage>
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
