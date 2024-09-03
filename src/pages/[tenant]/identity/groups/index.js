import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";

const Page = () => {
  const pageTitle = "Groups";
  const actions = [
    {
      label: "Delete User",
      type: "POST",
      url: "api/DeleteUser",
      data: { email: "DisplayName" },
      confirmText: "Are you sure you want to delete this user?",
      multiPost: false,
    },
  ];
  const offCanvas = {
    extendedInfoFields: [
      "displayName",
      "userPrincipalName",
      "id",
      "mail",
      "mobilePhone",
      "officePhone",
      "jobtitle",
      "department",
      "city",
    ],
    actions: actions,
  };
  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      apiData={{
        Endpoint: "groups",
        $select:
          "id,createdDateTime,displayName,description,mail,mailEnabled,mailNickname,resourceProvisioningOptions,securityEnabled,visibility,organizationId,onPremisesSamAccountName,membershipRule,grouptypes,onPremisesSyncEnabled,resourceProvisioningOptions,userPrincipalName",
        $expand: "members($select=userPrincipalName)",
        $count: true,
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={[
        "displayName",
        "description",
        "mail",
        "mailEnabled",
        "mailNickname",
        "resourceProvisioningOptions",
        "securityEnabled",
        "visibility",
        "organizationId",
        "onPremisesSamAccountName",
        "membershipRule",
        "grouptypes",
        "onPremisesSyncEnabled",
        "resourceProvisioningOptions",
        "userPrincipalName",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
