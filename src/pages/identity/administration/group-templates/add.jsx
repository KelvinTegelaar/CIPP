import { Box } from "@mui/material";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { useSettings } from "../../../../hooks/use-settings";
import CippAddGroupTemplateForm from "../../../../components/CippFormPages/CippAddGroupTemplateForm";
const Page = () => {
  const userSettingsDefaults = useSettings();

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
    },
  });

  return (
    <>
      <CippFormPage
        queryKey={`GroupTemplates-${userSettingsDefaults.currentTenant}`}
        formControl={formControl}
        title="Group Template"
        backButtonTitle="Group Overview"
        postUrl="/api/AddGroupTemplate"
      >
        <Box sx={{ my: 2 }}>
          <CippAddGroupTemplateForm formControl={formControl} />
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
