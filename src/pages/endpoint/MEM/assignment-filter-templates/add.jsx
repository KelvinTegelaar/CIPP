import { Box } from "@mui/material";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { useForm } from "react-hook-form";
import { useSettings } from "../../../../hooks/use-settings";
import CippAddAssignmentFilterTemplateForm from "../../../../components/CippFormPages/CippAddAssignmentFilterTemplateForm";
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
        resetForm={false}
        queryKey={`AssignmentFilterTemplates-${userSettingsDefaults.currentTenant}`}
        formControl={formControl}
        title="Assignment Filter Template"
        backButtonTitle="Assignment Filter Overview"
        postUrl="/api/AddAssignmentFilterTemplate"
      >
        <Box sx={{ my: 2 }}>
          <CippAddAssignmentFilterTemplateForm formControl={formControl} />
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
