import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";
import { AddHomeWork, Edit, Block, LockOpen } from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Rooms";

  const actions = [
    {
      label: "Edit Room",
      link: `/email/resources/management/list-rooms/edit?roomId=[id]`,
      icon: <Edit />,
      color: "info",
      condition: (row) => !row.isDirSynced,
    },
    {
      label: "Block Sign In",
      type: "GET",
      icon: <Block />,
      url: "/api/ExecDisableUser",
      data: { ID: "id" },
      confirmText: "Are you sure you want to block the sign-in for this room mailbox?",
      multiPost: false,
      condition: (row) => !row.accountDisabled && !row.isDirSynced,
    },
    {
      label: "Unblock Sign In",
      type: "GET",
      icon: <LockOpen />,
      url: "/api/ExecDisableUser",
      data: { ID: "id", Enable: true },
      confirmText: "Are you sure you want to unblock sign-in for this room mailbox?",
      multiPost: false,
      condition: (row) => row.accountDisabled && !row.isDirSynced,
    },
    {
      label: "Delete Room",
      type: "GET",
      icon: <TrashIcon />,
      url: "/api/RemoveMailbox",
      data: { ID: "mail" },
      confirmText: "Are you sure you want to delete this room mailbox?",
      multiPost: false,
      condition: (row) => !row.isDirSynced,
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListRooms"
      actions={actions}
      simpleColumns={[
        "displayName",
        "mail",
        "building",
        "floor",
        "capacity",
        "city",
        "state",
        "countryOrRegion",
        "hiddenFromAddressListsEnabled"
      ]}
      cardButton={
        <Button
          component={Link}
          href="/email/resources/management/list-rooms/add"
          startIcon={<AddHomeWork />}
        >
          Add Room
        </Button>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
