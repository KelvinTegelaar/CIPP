import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Alert } from "@mui/material";
import { Block as BlockIcon } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Restricted Users";

  const actions = [
    {
      label: "Unblock User",
      type: "POST",
      icon: <BlockIcon />,
      confirmText:
        "Are you sure you want to unblock [SenderAddress]? Unblocking can take up to 1 hour. Make sure you have secured the account before proceeding.",
      url: "/api/ExecRemoveRestrictedUser",
      data: { SenderAddress: "SenderAddress" },
      color: "success",
    },
  ];

  const simpleColumns = [
    "SenderAddress",
    "BlockType",
    "CreatedDatetime",
    "ChangedDatetime",
    "TemporaryBlock",
    "InternalCount",
    "ExternalCount",
  ];

  return (
    <>
      <Alert severity="warning" sx={{ mx: 3, mt: 5, mb: -2 }}>
        <strong>
          Users in this list have been restricted from sending email due to exceeding outbound spam
          limits.
        </strong>
        <br />
        This typically indicates a compromised account.{" "}
        <a href="https://aka.ms/O365-compromise" target="_blank" rel="noopener noreferrer">
          Before unblocking, ensure you have properly secured the account.
        </a>
        Recommended actions include:
        <ul>
          <li>Checked for suspicious sign-ins and activities</li>
          <li>Reviewed their mailbox rules and forwarding settings</li>
          <li>
            Investigated any unusual mailbox activity, such as unexpected sent items via message
            trace
          </li>
          <li>Reset the user&apos;s password if compromised</li>
          <li>Enabled MFA on the account if not already enabled</li>
        </ul>
      </Alert>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListRestrictedUsers"
        actions={actions}
        simpleColumns={simpleColumns}
        cardButton={null}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
