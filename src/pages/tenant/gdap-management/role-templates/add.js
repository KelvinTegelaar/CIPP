import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { useForm } from "react-hook-form";
import { CippAddEditGdapRoleTemplate } from "../../../../components/CippFormPages/CippAddEditGdapRoleTemplate";
import { ApiGetCall } from "../../../../api/ApiCall";

const Page = () => {
  const formControl = useForm({
    mode: "onChange",
  });
  const availableRoles = ApiGetCall({
    url: "/api/ListGDAPRoles",
    queryKey: "ListGDAPRolesAutocomplete",
  });
  return (
    <>
      <CippFormPage
        queryKey="ListGDAPRoleTemplates"
        formControl={formControl}
        title="GDAP Role Template"
        backButtonTitle="GDAP Role Templates"
        postUrl="/api/ExecGDAPRoleTemplate?Action=Add"
        customDataformatter={(values) => {
          var newRoleMappings = [];
          values.roleMappings.map((roleMapping) => {
            var role = availableRoles.data.find((role) => role.GroupId === roleMapping.value);
            newRoleMappings.push(role);
          });
          const shippedValues = {
            templateId: values.templateId,
            roleMappings: newRoleMappings,
          };
          return shippedValues;
        }}
      >
        <CippAddEditGdapRoleTemplate formControl={formControl} availableRoles={availableRoles} />
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
