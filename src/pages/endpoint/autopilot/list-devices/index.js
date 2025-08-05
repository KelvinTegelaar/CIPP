import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { CippApiDialog } from "/src/components/CippComponents/CippApiDialog.jsx";
import { Button } from "@mui/material";
import { PersonAdd, Delete, Sync, Add, Edit, Sell } from "@mui/icons-material";
import { useDialog } from "../../../../hooks/use-dialog";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Autopilot Devices";
  const createDialog = useDialog();

  const actions = [
    {
      label: "Assign device",
      icon: <PersonAdd />,
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
      label: "Rename Device",
      icon: <Edit />,
      type: "POST",
      url: "/api/ExecRenameAPDevice",
      data: {
        deviceId: "id",
        serialNumber: "serialNumber",
      },
      confirmText: "Enter the new display name for the device.",
      fields: [
        {
          type: "textField",
          name: "displayName",
          label: "New Display Name",
          required: true,
          validate: (value) => {
            if (!value) {
              return "Display name is required.";
            }
            if (value.length > 15) {
              return "Display name must be 15 characters or less.";
            }
            if (/\s/.test(value)) {
              return "Display name cannot contain spaces.";
            }
            if (!/^[a-zA-Z0-9-]+$/.test(value)) {
              return "Display name can only contain letters, numbers, and hyphens.";
            }
            if (/^[0-9]+$/.test(value)) {
              return "Display name cannot contain only numbers.";
            }
            return true; // Indicates validation passed
          },
        },
      ],
      color: "secondary",
    },
    {
      label: "Edit Group Tag",
      icon: <Sell />,
      type: "POST",
      url: "/api/ExecSetAPDeviceGroupTag",
      data: {
        deviceId: "id",
        serialNumber: "serialNumber",
      },
      confirmText: "Enter the new group tag for the device.",
      fields: [
        {
          type: "textField",
          name: "groupTag",
          label: "Group Tag",
          validate: (value) => {
            if (value && value.length > 128) {
              return "Group tag cannot exceed 128 characters.";
            }
            return true; // Validation passed
          },
        },
      ],
      color: "secondary",
    },
    {
      label: "Delete Device",
      icon: <Delete />,
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
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListAPDevices"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        cardButton={
          <>
            <Button component={Link} href="/endpoint/autopilot/add-device" startIcon={<Add />}>
              Add Autopilot Devices
            </Button>
            <Button onClick={createDialog.handleOpen} startIcon={<Sync />}>
              Sync Devices
            </Button>
          </>
        }
      />
      <CippApiDialog
        title="Sync Autopilot Devices"
        createDialog={createDialog}
        api={{
          type: "POST",
          url: "/api/ExecSyncAPDevices",
          data: {},
          confirmText:
            "Are you sure you want to sync Autopilot devices? This can only be done every 10 minutes.",
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
