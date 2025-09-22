import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import CippExchangeActions from "../../../../components/CippComponents/CippExchangeActions";
import { CippHVEUserDrawer } from "/src/components/CippComponents/CippHVEUserDrawer.jsx";
import { CippSharedMailboxDrawer } from "/src/components/CippComponents/CippSharedMailboxDrawer.jsx";

const Page = () => {
  const pageTitle = "Mailboxes";

  // Define off-canvas details
  const offCanvas = {
    extendedInfoFields: ["displayName", "UPN", "AdditionalEmailAddresses", "recipientTypeDetails"],
    actions: CippExchangeActions(),
  };

  const filterList = [
    {
      filterName: "View User Mailboxes",
      value: [{ id: "recipientTypeDetails", value: "UserMailbox" }],
      type: "column",
    },
    {
      filterName: "View Shared Mailboxes",
      value: [{ id: "recipientTypeDetails", value: "SharedMailbox" }],
      type: "column",
    },
    {
      filterName: "View Room Mailboxes",
      value: [{ id: "recipientTypeDetails", value: "RoomMailbox" }],
      type: "column",
    },
    {
      filterName: "View Equipment Mailboxes",
      value: [{ id: "recipientTypeDetails", value: "EquipmentMailbox" }],
      type: "column",
    },
  ];

  // Simplified columns for the table
  const simpleColumns = [
    "displayName", // Display Name
    "recipientTypeDetails", // Recipient Type Details
    "UPN", // User Principal Name
    "primarySmtpAddress", // Primary Email Address
    "recipientType", // Recipient Type
    "AdditionalEmailAddresses", // Additional Email Addresses
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListMailboxes"
      actions={CippExchangeActions()}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      filters={filterList}
      cardButton={
        <>
          <CippSharedMailboxDrawer />
          <CippHVEUserDrawer />
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
