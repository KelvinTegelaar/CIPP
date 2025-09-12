import { Box, CircularProgress } from "@mui/material";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { useSettings } from "../../../../hooks/use-settings";
import CippAddGroupTemplateForm from "../../../../components/CippFormPages/CippAddGroupTemplateForm";
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
    url: `/api/ListGroupTemplates?id=${id}`,
    queryKey: `GroupTemplate-${id}`,
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
          username: templateData.username,
          groupType: templateData.groupType,
          membershipRules: templateData.membershipRules,
          allowExternal: templateData.allowExternal,
          tenantFilter: userSettingsDefaults.currentTenant,
        });
      }
    }
  }, [template, formControl, userSettingsDefaults.currentTenant]);

  return (
    <>
      <CippFormPage
        resetForm={false}
        queryKey={[`ListGroupTemplates`, `GroupTemplate-${id}`]}
        formControl={formControl}
        title="Edit Group Template"
        backButtonTitle="Group Overview"
        postUrl="/api/AddGroupTemplate"
        isFetching={isFetching}
        backUrl="/identity/administration/group-templates"
      >
        {/* Add debugging output to check what values are set */}
        <pre style={{ display: "none" }}>{JSON.stringify(formControl.watch(), null, 2)}</pre>

        <Box sx={{ my: 2 }}>
          <CippAddGroupTemplateForm formControl={formControl} />
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
