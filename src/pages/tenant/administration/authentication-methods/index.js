import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Check, Block } from "@mui/icons-material";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { useSettings } from "../../../../hooks/use-settings.js";

const Page = () => {
  const pageTitle = "Auth Methods";
  const tenant = useSettings().currentTenant;
  const apiUrl = "/api/ListGraphRequest";

  // Columns configuration based on provided structure
  const simpleColumns = ["id", "state", "includeTargets", "excludeTargets"];

  const actions = [
    {
      label: "Enable Policy",
      type: "POST",
      icon: <Check />,
      url: "/api/SetAuthMethod",
      data: { state: "!enabled", id: "id" },
      confirmText: "Are you sure you want to enable this policy?",
      multiPost: false,
    },
    {
      label: "Disable Policy",
      type: "POST",
      icon: <Block />,
      url: "/api/SetAuthMethod",
      data: { state: "!disabled", id: "id" },
      confirmText: "Are you sure you want to disable this policy?",
      multiPost: false,
    },
    {
      label: "Deploy to Custom Group",
      type: "POST",
      icon: <UserGroupIcon />,
      url: "/api/SetAuthMethod",
      confirmText: 'Select one or more groups for "[id]".',
      fields: [
        {
          type: "autoComplete",
          name: "groupTargets",
          label: "Group(s)",
          multiple: true,
          creatable: false,
          allowResubmit: true,
          validators: { required: "Please select at least one group" },
          api: {
            url: "/api/ListGraphRequest",
            dataKey: "Results",
            queryKey: `ListAuthenticationPolicyGroups-${tenant}`,
            labelField: (group) =>
              group.id ? `${group.displayName} (${group.id})` : group.displayName,
            valueField: "id",
            addedField: {
              description: "description",
            },
            data: {
              Endpoint: "groups",
              manualPagination: true,
              $select: "id,displayName,description",
              $orderby: "displayName",
              $top: 999,
              $count: true,
            },
          },
        },
      ],
      customDataformatter: (row, action, formData) => {
        const selectedGroups = Array.isArray(formData?.groupTargets) ? formData.groupTargets : [];
        const tenantFilterValue = tenant === "AllTenants" && row?.Tenant ? row.Tenant : tenant;
        return {
          tenantFilter: tenantFilterValue,
          state: row?.state,
          id: row?.id,
          GroupIds: selectedGroups.map((group) => group.value).filter(Boolean),
        };
      },
      multiPost: false,
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["id", "state", "includeTargets", "excludeTargets"],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiData={{
        Endpoint: "authenticationMethodsPolicy",
      }}
      apiDataKey="Results.0.authenticationMethodConfigurations"
      simpleColumns={simpleColumns}
      offCanvas={offCanvas}
      actions={actions}
      dynamicColumns={false}
    />
  );
};

// Adding the layout for the dashboard
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
