import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Alert, Link, Typography, List, ListItem, ListItemText } from "@mui/material";
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
      <Alert severity="warning" sx={{ mx: 3, mb: 2 }}>
        <Typography variant="body1">
          <strong>
            Users in this list have been restricted from sending email due to exceeding outbound
            spam limits.
          </strong>
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          This typically indicates a compromised account.{" "}
          <Link
            href="https://aka.ms/O365-compromise"
            target="_blank"
            rel="noreferrer"
            sx={{ color: "primary.main" }}
            underline="hover"
          >
            Before unblocking, ensure you have properly secured the account.
          </Link>
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, mb: 1 }}>
          <strong>Recommended actions include:</strong>
        </Typography>
        <List sx={{ listStyleType: "disc", pl: 2 }}>
          <ListItem sx={{ display: "list-item", py: 0.25 }}>
            <ListItemText primary="Checked for suspicious sign-ins and activities" sx={{ my: 0 }} />
          </ListItem>
          <ListItem sx={{ display: "list-item", py: 0.25 }}>
            <ListItemText
              primary="Reviewed their mailbox rules and forwarding settings"
              sx={{ my: 0 }}
            />
          </ListItem>
          <ListItem sx={{ display: "list-item", py: 0.25 }}>
            <ListItemText
              primary="Investigated any unusual mailbox activity, such as unexpected sent items via message trace"
              sx={{ my: 0 }}
            />
          </ListItem>
          <ListItem sx={{ display: "list-item", py: 0.25 }}>
            <ListItemText primary="Reset the user's password if compromised" sx={{ my: 0 }} />
          </ListItem>
          <ListItem sx={{ display: "list-item", py: 0.25 }}>
            <ListItemText
              primary="Enabled MFA on the account if not already enabled"
              sx={{ my: 0 }}
            />
          </ListItem>
        </List>
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
