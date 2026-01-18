import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { useSettings } from "../../../../hooks/use-settings";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippAddIntuneReusableSettingTemplateForm from "../../../../components/CippFormPages/CippAddIntuneReusableSettingTemplateForm";

const Page = () => {
  const userSettingsDefaults = useSettings();

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
    },
  });

  return (
    <CippFormPage
      resetForm={false}
      queryKey={`IntuneReusableSettingTemplates-${userSettingsDefaults.currentTenant}`}
      formControl={formControl}
      title="Reusable Settings Template"
      backButtonTitle="Reusable Settings Templates"
      postUrl="/api/AddIntuneReusableSettingTemplate"
    >
      <Box sx={{ my: 2 }}>
        <CippAddIntuneReusableSettingTemplateForm formControl={formControl} />
      </Box>
    </CippFormPage>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
