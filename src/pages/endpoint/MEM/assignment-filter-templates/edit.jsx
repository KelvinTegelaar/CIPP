import { Box, CircularProgress } from "@mui/material";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { useForm } from "react-hook-form";
import { useSettings } from "../../../../hooks/use-settings";
import CippAddAssignmentFilterTemplateForm from "../../../../components/CippFormPages/CippAddAssignmentFilterTemplateForm";
import { useRouter } from "next/router";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useEffect } from "react";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { id } = router.query;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
    },
  });

  // Fetch template data
  const { data: template, isFetching } = ApiGetCall({
    url: `/api/ListAssignmentFilterTemplates?id=${id}`,
    queryKey: `AssignmentFilterTemplate-${id}`,
    waiting: !!id,
  });

  // Map groupType values to valid radio options

  // Set form values when template data is loaded
  useEffect(() => {
    if (template) {
      const templateData = template[0];

      // Make sure we have the necessary data before proceeding
      if (templateData) {
        formControl.reset({
          GUID: templateData.GUID,
          displayName: templateData.displayName,
          description: templateData.description,
          platform: templateData.platform,
          rule: templateData.rule,
          assignmentFilterManagementType: templateData.assignmentFilterManagementType,
          tenantFilter: userSettingsDefaults.currentTenant,
        });
      }
    }
  }, [template, formControl, userSettingsDefaults.currentTenant]);

  return (
    <>
      <CippFormPage
        resetForm={false}
        queryKey={[`ListAssignmentFilterTemplates`, `AssignmentFilterTemplate-${id}`]}
        formControl={formControl}
        title="Edit Assignment Filter Template"
        backButtonTitle="Assignment Filter Overview"
        postUrl="/api/AddAssignmentFilterTemplate"
        isFetching={isFetching}
        backUrl="/endpoint/MEM/assignment-filter-templates"
      >
        {/* Add debugging output to check what values are set */}
        <pre style={{ display: "none" }}>{JSON.stringify(formControl.watch(), null, 2)}</pre>

        <Box sx={{ my: 2 }}>
          <CippAddAssignmentFilterTemplateForm formControl={formControl} />
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
