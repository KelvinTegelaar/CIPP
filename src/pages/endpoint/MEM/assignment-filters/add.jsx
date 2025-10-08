import { Box } from "@mui/material";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { useSettings } from "../../../../hooks/use-settings";
import { useEffect } from "react";
import CippAddAssignmentFilterForm from "../../../../components/CippFormPages/CippAddAssignmentFilterForm";

const Page = () => {
  const userSettingsDefaults = useSettings();

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      assignmentFilterManagementType: "devices",
    },
  });

  useEffect(() => {
    formControl.setValue("tenantFilter", userSettingsDefaults?.currentTenant || "");
  }, [userSettingsDefaults, formControl]);

  return (
    <>
      <CippFormPage
        queryKey={`AssignmentFilters-${userSettingsDefaults.currentTenant}`}
        formControl={formControl}
        title="Assignment Filter"
        backButtonTitle="Assignment Filters"
        postUrl="/api/AddAssignmentFilter"
      >
        <Box sx={{ my: 2 }}>
          <CippAddAssignmentFilterForm formControl={formControl} />
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
