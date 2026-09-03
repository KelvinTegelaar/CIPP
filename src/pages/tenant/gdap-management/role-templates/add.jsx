import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import { useForm } from "react-hook-form";
import { CippAddEditGdapRoleTemplate } from "../../../../components/CippFormPages/CippAddEditGdapRoleTemplate";
import { ApiGetCall } from "../../../../api/ApiCall";
import { buildGdapTemplatePayload } from "../../../../utils/gdap-role-options";

const Page = () => {
  const formControl = useForm({
    mode: "onChange",
  });
  const availableRoles = ApiGetCall({
    url: "/api/ListGDAPRoles?validate=true",
    queryKey: "ListGDAPRolesAutocomplete",
  });
  return (
    <>
      <CippFormPage
        queryKey={["ListGDAPRoleTemplates", "ListGDAPRoles"]}
        formControl={formControl}
        title="GDAP Role Template"
        backButtonTitle="Role Templates"
        postUrl="/api/ExecGDAPRoleTemplate?Action=Save"
        customDataformatter={(values) => buildGdapTemplatePayload(values, availableRoles.data)}
      >
        <CippAddEditGdapRoleTemplate formControl={formControl} availableRoles={availableRoles} />
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
