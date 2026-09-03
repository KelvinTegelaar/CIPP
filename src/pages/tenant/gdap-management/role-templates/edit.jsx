import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import { useForm } from "react-hook-form";
import { CippAddEditGdapRoleTemplate } from "../../../../components/CippFormPages/CippAddEditGdapRoleTemplate";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ApiGetCallWithPagination } from "../../../../api/ApiCall";
import { Alert } from "@mui/material";
import GDAPRoles from "../../../../data/GDAPRoles";
import {
  buildGdapTemplatePayload,
  buildGdapTemplateSelection,
} from "../../../../utils/gdap-role-options";

const Page = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const [extraOptions, setExtraOptions] = useState([]);
  const [mixedSuffixes, setMixedSuffixes] = useState(false);
  const formControl = useForm({
    mode: "onChange",
  });
  const availableRoles = ApiGetCall({
    url: "/api/ListGDAPRoles?validate=true",
    queryKey: "ListGDAPRolesAutocomplete",
  });

  const availableTemplates = ApiGetCallWithPagination({
    url: `/api/ExecGDAPRoleTemplate`,
    queryKey: `ListGDAPRoleTemplates`,
  });

  useEffect(() => {
    if (availableTemplates.isSuccess && availableRoles.isSuccess) {
      const template = availableTemplates?.data?.pages?.[0]?.Results.find(
        (template) => template.TemplateId === templateId
      );
      // No templateId, or it no longer matches a template: nothing to populate.
      if (!template) {
        return;
      }
      const selection = buildGdapTemplateSelection(
        template.RoleMappings,
        GDAPRoles,
        availableRoles.data
      );
      setExtraOptions(selection.extraOptions);
      setMixedSuffixes(selection.mixedSuffixes);
      formControl.reset({
        templateId: template.TemplateId,
        roleMappings: selection.selected,
        customSuffix: selection.customSuffix ?? "",
      });
    }
  }, [
    availableTemplates.isSuccess,
    availableTemplates.data,
    availableRoles.isSuccess,
    availableRoles.data,
  ]);

  return (
    <>
      <CippFormPage
        queryKey={["ListGDAPRoleTemplates", "ListGDAPRoles"]}
        formControl={formControl}
        title="GDAP Role Template"
        backButtonTitle="Role Templates"
        postUrl="/api/ExecGDAPRoleTemplate?Action=Save"
        customDataformatter={(values) =>
          buildGdapTemplatePayload(values, availableRoles.data, templateId)
        }
        hideSubmit={!templateId}
      >
        {!templateId && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No template selected. Open this page from the GDAP Role Templates list to edit a
            template.
          </Alert>
        )}
        {templateId && (
          <CippAddEditGdapRoleTemplate
            formControl={formControl}
            availableRoles={availableRoles}
            extraOptions={extraOptions}
            mixedSuffixes={mixedSuffixes}
          />
        )}
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
