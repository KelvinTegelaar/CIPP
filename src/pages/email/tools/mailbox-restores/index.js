import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";
import { RestoreFromTrash, PlayArrow, Pause, Delete } from "@mui/icons-material";
import MailboxRestoreDetails from "../../../../components/CippComponents/MailboxRestoreDetails";

const Page = () => {
  const pageTitle = "Mailbox Restores";

  const actions = [
    {
      label: "Resume Restore Request",
      type: "POST",
      url: "/api/ExecMailboxRestore",
      icon: <PlayArrow />,
      data: {
        Identity: "Identity",
        Action: "Resume",
      },
      confirmText: "Are you sure you want to resume this restore request?",
      color: "info",
    },
    {
      label: "Suspend Restore Request",
      type: "POST",
      url: "/api/ExecMailboxRestore",
      icon: <Pause />,
      data: {
        Identity: "Identity",
        Action: "Suspend",
      },
      confirmText: "Are you sure you want to suspend this restore request?",
      color: "warning",
    },
    {
      label: "Remove Restore Request",
      type: "POST",
      url: "/api/ExecMailboxRestore",
      icon: <Delete />,
      data: {
        Identity: "Identity",
        Action: "Remove",
      },
      confirmText: "Are you sure you want to remove this restore request?",
      color: "danger",
    },
  ];

  const offCanvas = {
    children: (data) => <MailboxRestoreDetails data={data} />,
    actions: actions,
    size: "lg",
  };

  const simpleColumns = ["Name", "Status", "TargetMailbox", "WhenCreated", "WhenChanged"];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListMailboxRestores"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <Button
            component={Link}
            href="/email/tools/mailbox-restores/add"
            startIcon={<RestoreFromTrash />}
          >
            New Restore Job
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
