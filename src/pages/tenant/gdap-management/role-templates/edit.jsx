import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import { useForm } from "react-hook-form";
import { CippAddEditGdapRoleTemplate } from "../../../../components/CippFormPages/CippAddEditGdapRoleTemplate";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { ApiGetCallWithPagination } from "../../../../api/ApiCall";
import { Alert } from "@mui/material";

const Page = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const formControl = useForm({
    mode: "onChange",
  });
  const availableRoles = ApiGetCall({
    url: "/api/ListGDAPRoles",
    queryKey: "ListGDAPRolesAutocomplete",
  });

  const availableTemplates = ApiGetCallWithPagination({
    url: `/api/ExecGDAPRoleTemplate`,
    queryKey: `ListGDAPRoleTemplates`,
  });

  useEffect(() => {
    if (availableTemplates.isSuccess) {
      const template = availableTemplates?.data?.pages?.[0]?.Results.find(
        (template) => template.TemplateId === templateId
      );
      // No templateId, or it no longer matches a template: nothing to populate.
      if (!template) {
        return;
      }
      var newRoleMappings = [];
      template.RoleMappings.map((roleMapping) =>
        newRoleMappings.push({
          label: roleMapping.GroupName,
          value: roleMapping.GroupId,
        })
      );
      formControl.reset({
        templateId: template.TemplateId,
        roleMappings: newRoleMappings,
      });
    }
  }, [availableTemplates.isSuccess, availableTemplates.data]);

  return (
    <>
      <CippFormPage
        queryKey="ListGDAPRoleTemplates"
        formControl={formControl}
        title="GDAP Role Template"
        backButtonTitle="GDAP Role Templates"
        postUrl="/api/ExecGDAPRoleTemplate?Action=Edit"
        customDataformatter={(values) => {
          var newRoleMappings = [];
          values.roleMappings.map((roleMapping) => {
            var role = availableRoles.data.find((role) => role.GroupId === roleMapping.value);
            newRoleMappings.push(role);
          });
          const shippedValues = {
            originalTemplateId: templateId, // Pass the original template ID
            templateId: values.templateId,
            roleMappings: newRoleMappings,
          };
          return shippedValues;
        }}
        hideSubmit={!templateId}
      >
        {!templateId && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No template selected. Open this page from the GDAP Role Templates list to edit a
            template.
          </Alert>
        )}
        {templateId && (
          <CippAddEditGdapRoleTemplate formControl={formControl} availableRoles={availableRoles} />
        )}
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
