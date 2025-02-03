import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const actions = [
    {
      label: "Unhide from Global Address List",
      type: "POST",
      url: "/api/ExecHideFromGAL",
      data: {
        HideFromGAL: false,
        ID: "PrimarySmtpAddress",
      },
      confirmText: "Are you sure you want to show this mailbox in the Global Address List?",
    },
    {
      label: "Hide from Global Address List",
      type: "POST",
      url: "/api/ExecHideFromGAL",
      data: {
        HideFromGAL: true,
        ID: "PrimarySmtpAddress",
      },
      confirmText: "Are you sure you want to hide this mailbox from the Global Address List?",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "HiddenFromAddressListsEnabled",
      "ExternalDirectoryObjectId",
      "DisplayName",
      "PrimarySmtpAddress",
      "RecipientType",
      "RecipientTypeDetails",
      "IsDirSynced",
      "SKUAssigned",
      "EmailAddresses",
    ],
    actions: actions,
  };

  const filters = [
    {
      filterName: "Hidden from GAL",
      value: [{ id: "HiddenFromAddressListsEnabled", value: "Yes" }],
      type: "column",
    },
    {
      filterName: "Shown in GAL",
      value: [{ id: "HiddenFromAddressListsEnabled", value: "No" }],
      type: "column",
    },
    {
      filterName: "Cloud only mailboxes",
      value: [{ id: "IsDirSynced", value: "No" }],
      type: "column",
    },
  ];

  return (
    <CippTablePage
      title="Global Address List"
      apiUrl="/api/ListGlobalAddressList"
      actions={actions}
      offCanvas={offCanvas}
      filters={filters}
      simpleColumns={[
        "HiddenFromAddressListsEnabled",
        "DisplayName",
        "PrimarySmtpAddress",
        "RecipientTypeDetails",
        "IsDirSynced",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
