import { Box } from "@mui/material";
import CippFormPage from "../../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { useSettings } from "../../../../../hooks/use-settings";
import CippAddRoomListForm from "../../../../../components/CippFormPages/CippAddRoomListForm";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const tenantDomain = userSettingsDefaults.currentTenant;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      displayName: "",
      username: "",
      primDomain: null,
    },
  });

  return (
    <>
      <CippFormPage
        queryKey={`RoomLists-${userSettingsDefaults.currentTenant}`}
        formControl={formControl}
        title="Add Room List"
        backButtonTitle="Room Lists"
        backUrl="/email/resources/management/room-lists"
        postUrl="/api/AddRoomList"
        resetForm={true}
        customDataformatter={(values) => {
          return {
            tenantFilter: tenantDomain,
            displayName: values.displayName?.trim(),
            username: values.username?.trim(),
            primDomain: values.primDomain,
          };
        }}
      >
        <Box sx={{ my: 2 }}>
          <CippAddRoomListForm formControl={formControl} />
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page; 