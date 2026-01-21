import { useMemo } from "react";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { CloudSync, Edit } from "@mui/icons-material";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import { CippAddContactDrawer } from "../../../../components/CippComponents/CippAddContactDrawer";
import { CippDeployContactTemplateDrawer } from "../../../../components/CippComponents/CippDeployContactTemplateDrawer";

const Page = () => {
  const pageTitle = "Contacts";
  const cardButtonPermissions = ["Exchange.Contact.ReadWrite"];
  const actions = useMemo(
    () => [
      {
        label: "Edit Contact",
        link: "/email/administration/contacts/edit?id=[Guid]",
        multiPost: false,
        postEntireRow: true,
        icon: <Edit />,
        color: "warning",
        condition: (row) => !row.IsDirSynced,
      },
      {
        label: "Set Source of Authority",
        type: "POST",
        url: "/api/ExecSetCloudManaged",
        icon: <CloudSync />,
        data: {
          ID: "graphId",
          displayName: "DisplayName",
          type: "!Contact",
        },
        fields: [
          {
            type: "radio",
            name: "isCloudManaged",
            label: "Source of Authority",
            options: [
              { label: "Cloud Managed", value: true },
              { label: "On-Premises Managed", value: false },
            ],
            validators: { required: "Please select a source of authority" },
          },
        ],
        confirmText:
          "Are you sure you want to change the source of authority for '[DisplayName]'? Setting it to On-Premises Managed will take until the next sync cycle to show the change.",
        multiPost: false,
      },
      {
        label: "Remove Contact",
        type: "POST",
        url: "/api/RemoveContact",
        data: {
          GUID: "Guid",
          mail: "WindowsEmailAddress",
        },
        confirmText:
          "Are you sure you want to delete this contact? Remember this will not work if the contact is AD Synced.",
        color: "danger",
        icon: <TrashIcon />,
        condition: (row) => !row.IsDirSynced,
      },
    ],
    []
  );

  const simpleColumns = ["DisplayName", "WindowsEmailAddress", "Company", "IsDirSynced"];
  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListContacts"
      actions={actions}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <CippAddContactDrawer requiredPermissions={cardButtonPermissions} />
          <CippDeployContactTemplateDrawer requiredPermissions={cardButtonPermissions} />
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;
export default Page;
