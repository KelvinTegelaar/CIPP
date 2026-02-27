import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { PermissionButton } from "../../../../utils/permissions.js";
import { CippPolicyDeployDrawer } from "../../../../components/CippComponents/CippPolicyDeployDrawer.jsx";
import { useSettings } from "../../../../hooks/use-settings.js";
import { useCippIntunePolicyActions } from "../../../../components/CippComponents/CippIntunePolicyActions.jsx";

const Page = () => {
  const pageTitle = "App Protection & Configuration Policies";
  const cardButtonPermissions = ["Endpoint.MEM.ReadWrite"];
  const tenant = useSettings().currentTenant;

  const actions = useCippIntunePolicyActions(tenant, "URLName", {
    templateData: {
      ID: "id",
      URLName: "managedAppPolicies",
    },
    platformType: "deviceAppManagement",
    deleteUrlName: "URLName",
  });

  const offCanvas = {
    extendedInfoFields: [
      "createdDateTime",
      "displayName",
      "lastModifiedDateTime",
      "PolicyTypeName",
      "PolicySource",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "displayName",
    "PolicyTypeName",
    "PolicyAssignment",
    "PolicyExclude",
    "lastModifiedDateTime",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListAppProtectionPolicies"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <CippPolicyDeployDrawer
          buttonText="Deploy Policy"
          requiredPermissions={cardButtonPermissions}
          PermissionButton={PermissionButton}
        />
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
