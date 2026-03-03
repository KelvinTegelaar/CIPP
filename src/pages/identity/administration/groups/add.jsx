import { Box } from "@mui/material";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { useForm } from "react-hook-form";
import { useSettings } from "../../../../hooks/use-settings";
import { useEffect } from "react";

import CippAddGroupForm from "../../../../components/CippFormPages/CippAddGroupForm";
const Page = () => {
  const userSettingsDefaults = useSettings();

  const formControl = useForm({
    mode: "onChange",
  });

  useEffect(() => {
    formControl.setValue(
      "tenantFilter",
      userSettingsDefaults?.currentTenant || ""
    );
  }, [userSettingsDefaults, formControl]);

  return (
    <>
      <CippFormPage
        queryKey={`Groups-${userSettingsDefaults.currentTenant}`}
        formControl={formControl}
        title="Groups"
        backButtonTitle="Group Overview"
        postUrl="/api/AddGroup"
        resetForm={true}
      >
        <Box sx={{ my: 2 }}>
          <CippAddGroupForm formControl={formControl} />
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
