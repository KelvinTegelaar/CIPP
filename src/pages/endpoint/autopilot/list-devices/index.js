import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Autopilot Devices";

  const actions = [
    {
      label: "Assign device",
      type: "POST",
      url: "/api/ExecAssignAPDevice",
      data: {
        device: "id",
        serialNumber: "serialNumber",
      },
      confirmText: "Select the user to assign the device to",
      fields: [
        {
          type: "autoComplete",
          name: "user",
          label: "Select User",
          multiple: false,
          creatable: false,
          api: {
            url: "/api/listUsers",
            labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
            valueField: "userPrincipalName",
            addedField: {
              userPrincipalName: "userPrincipalName",
              addressableUserName: "displayName",
            },
          },
        },
      ],
      color: "info",
    },
    {
      label: "Delete Device",
      type: "POST",
      url: "/api/RemoveAPDevice",
      data: { ID: "id" },
      confirmText: "Are you sure you want to delete this device?",
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "userPrincipalName",
      "productKey",
      "serialNumber",
      "model",
      "manufacturer",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "displayName",
    "serialNumber",
    "model",
    "manufacturer",
    "groupTag",
    "enrollmentState",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListAPDevices"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <Button component={Link} href="/endpoint/autopilot/add-device">
            Add Autopilot Devices
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
