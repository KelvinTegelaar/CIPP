import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Book, DoDisturb, Done, Edit } from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { CippAddTransportRuleDrawer } from "../../../../components/CippComponents/CippAddTransportRuleDrawer";
import { CippTransportRuleDrawer } from "../../../../components/CippComponents/CippTransportRuleDrawer";
import { useSettings } from "../../../../hooks/use-settings";
import { useRef } from "react";

const Page = () => {
  const pageTitle = "Transport Rules";
  const cardButtonPermissions = ["Exchange.TransportRule.ReadWrite"];
  const tableRef = useRef();
  const currentTenant = useSettings().currentTenant;

  const handleRuleSuccess = () => {
    // Refresh the table after successful create/edit
    if (tableRef.current) {
      tableRef.current.refreshData();
    }
  };

  const actions = [
    {
      label: "Create template based on rule",
      type: "POST",
      url: "/api/AddTransportTemplate",
      postEntireRow: true,
      confirmText: "Are you sure you want to create a template based on this rule?",
      icon: <Book />,
    },
    {
      label: "Enable Rule",
      type: "POST",
      url: "/api/AddEditTransportRule",
      data: {
        Enabled: "!Enabled",
        Identity: "Guid",
        Name: "Name",
      },
      condition: (row) => row.State === "Disabled",
      confirmText: "Are you sure you want to enable this rule?",
      icon: <Done />,
    },
    {
      label: "Edit Rule",
      customComponent: (row, {drawerVisible, setDrawerVisible}) => (
        <CippTransportRuleDrawer
          isEditMode={true}
          ruleId={row.Guid}
          requiredPermissions={cardButtonPermissions}
          onSuccess={handleRuleSuccess}
          drawerVisible={drawerVisible}
          setDrawerVisible={setDrawerVisible}
        />
      ),
      icon: <Edit />,
      multiPost: false,
    },
    {
      label: "Disable Rule",
      type: "POST",
      url: "/api/AddEditTransportRule",
      data: {
        Enabled: "!Disabled",
        Identity: "Guid",
        Name: "Name",
      },
      condition: (row) => row.State === "Enabled",
      confirmText: "Are you sure you want to disable this rule?",
      icon: <DoDisturb />,
    },
    {
      label: "Delete Rule",
      type: "POST",
      url: "/api/RemoveTransportRule",
      data: {
        GUID: "Guid",
      },
      confirmText: "Are you sure you want to delete this rule?",
      color: "danger",
      icon: <TrashIcon />,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "Guid",
      "CreatedBy",
      "LastModifiedBy",
      "WhenChanged",
      "Name",
      "Comments",
      "Description",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "Name",
    "State",
    "Mode",
    "RuleErrorAction",
    "WhenChanged",
    "Comments",
    "Tenant",
  ];

  const filters = [
    {
      filterName: "Enabled Rules",
      value: [{ id: "State", value: "Enabled" }],
      type: "column",
    },
    {
      filterName: "Disabled Rules",
      value: [{ id: "State", value: "Disabled" }],
      type: "column",
    },
  ];

  return (
    <CippTablePage
      ref={tableRef}
      title={pageTitle}
      apiUrl="/api/ListTransportRules"
      apiDataKey="Results"
      queryKey= {`Transport Rules - ${currentTenant}`}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      filters={filters}
      cardButton={
        <>
          <CippAddTransportRuleDrawer requiredPermissions={cardButtonPermissions} />
          <CippTransportRuleDrawer
            buttonText="New Transport Rule"
            isEditMode={false}
            requiredPermissions={cardButtonPermissions}
            onSuccess={handleRuleSuccess}
          />
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>;
export default Page;
