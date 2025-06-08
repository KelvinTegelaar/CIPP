import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";
import { AddBusiness, Edit, Block, LockOpen, Key } from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Equipment";

  const actions = [
    {
      label: "Edit Equipment",
      link: `/email/resources/management/equipment/edit?equipmentId=[ExternalDirectoryObjectId]`,
      icon: <Edit />,
      color: "info",
      condition: (row) => !row.isDirSynced,
    },
    {
      label: "Edit permissions",
      link: "/identity/administration/users/user/exchange?userId=[ExternalDirectoryObjectId]",
      color: "info",
      icon: <Key />,
    },
    {
      label: "Block Sign In",
      type: "POST",
      icon: <Block />,
      url: "/api/ExecDisableUser",
      data: { ID: "ExternalDirectoryObjectId" },
      confirmText: "Are you sure you want to block the sign-in for this equipment mailbox?",
      multiPost: false,
      condition: (row) => !row.isDirSynced,
    },
    {
      label: "Unblock Sign In",
      type: "POST",
      icon: <LockOpen />,
      url: "/api/ExecDisableUser",
      data: { ID: "ExternalDirectoryObjectId", Enable: true },
      confirmText: "Are you sure you want to unblock sign-in for this equipment mailbox?",
      multiPost: false,
      condition: (row) => !row.isDirSynced,
    },
    {
      label: "Delete Equipment",
      type: "POST",
      icon: <TrashIcon />,
      url: "/api/RemoveUser",
      data: { ID: "ExternalDirectoryObjectId" },
      confirmText: "Are you sure you want to delete this equipment mailbox?",
      multiPost: false,
      condition: (row) => !row.isDirSynced,
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListEquipment"
      actions={actions}
      simpleColumns={[
        "DisplayName",
        "UserPrincipalName",
        "HiddenFromAddressListsEnabled",
        "PrimarySmtpAddress",
      ]}
      cardButton={
        <Button
          component={Link}
          href="/email/resources/management/equipment/add"
          startIcon={<AddBusiness />}
        >
          Add Equipment
        </Button>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
