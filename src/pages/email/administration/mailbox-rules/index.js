import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { TrashIcon } from "@heroicons/react/24/outline";
import { getCippTranslation } from "../../../../utils/get-cipp-translation";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";
import { CippPropertyListCard } from "../../../../components/CippCards/CippPropertyListCard";

const Page = () => {
  const pageTitle = "Mailbox Rules";
  const actions = [
    {
      label: "Remove Mailbox Rule",
      type: "POST",
      icon: <TrashIcon />,
      url: "/api/ExecRemoveMailboxRule",
      data: { ruleId: "Identity", userPrincipalName: "UserPrincipalName", ruleName: "Name" },
      confirmText: "Are you sure you want to remove this mailbox rule?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    children: (data) => {
      const keys = Object.keys(data).filter(
        (key) => !key.includes("@odata") && !key.includes("@data")
      );
      const properties = [];
      keys.forEach((key) => {
        if (data[key] && data[key].length > 0) {
          properties.push({
            label: getCippTranslation(key),
            value: getCippFormatting(data[key], key),
          });
        }
      });
      return (
        <CippPropertyListCard
          cardSx={{ p: 0, m: -2 }}
          title="Rule Details"
          propertyItems={properties}
          actionItems={actions}
        />
      );
    },
  };
  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListMailboxRules"
      apiDataKey="Results"
      simpleColumns={["Name", "Priority", "Enabled", "UserPrincipalName", "From"]}
      offCanvas={offCanvas}
      actions={actions}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
