import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { CippAddEditGdapRoleTemplate } from "/src/components/CippFormPages/CippAddEditGdapRoleTemplate";
import { ApiGetCall } from "/src/api/ApiCall";

const Page = () => {
  const formControl = useForm({
    mode: "onChange",
  });
  const availableRoles = ApiGetCall({
    url: "/api/ListGDAPRoles",
    queryKey: "ListGDAPRoles",
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
            console.log(roleMapping);
            var role = availableRoles.data.find((role) => role.GroupId === roleMapping.value);
            console.log(role);
            newRoleMappings.push(role);
          });
          console.log(newRoleMappings);
          const shippedValues = {
            templateId: values.templateId,
            roleMappings: newRoleMappings,
          };
          console.log(shippedValues);
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
