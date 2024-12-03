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
        TenantFilter: "Tenant",
        userid: "id",
        message: "message",
        Device: "id",
      },
      confirmText: "Select the user to assign",
      modalDropdown: {
        url: "/api/listUsers",
        labelField: "userPrincipalName",
        valueField: "id",
        addedField: {
          userPrincipalName: "userPrincipalName",
          addressableUserName: "displayName",
          groupName: "displayName",
        },
      },
      color: "info",
    },
    {
      label: "Delete Device",
      type: "POST",
      url: "/api/RemoveAPDevice",
      data: { ID: "id", tenantFilter: "Tenant" },
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
