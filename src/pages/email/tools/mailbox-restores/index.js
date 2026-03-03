import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { RestoreFromTrash, PlayArrow, Pause, Delete } from "@mui/icons-material";
import MailboxRestoreDetails from "../../../../components/CippComponents/MailboxRestoreDetails";
import { CippMailboxRestoreDrawer } from "../../../../components/CippComponents/CippMailboxRestoreDrawer";
import { useSettings } from "../../../../hooks/use-settings";

const Page = () => {
  const pageTitle = "Mailbox Restores";
  const tenantDomain = useSettings().currentTenant;
  const actions = [
    {
      label: "Resume Restore Request",
      type: "POST",
      url: "/api/ExecMailboxRestore",
      icon: <PlayArrow />,
      data: {
        Identity: "Identity",
        Action: "!Resume",
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
        Action: "!Suspend",
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
        Action: "!Remove",
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
      cardButton={<CippMailboxRestoreDrawer buttonText="New Restore Job" />}
      queryKey={`MailboxRestores-${tenantDomain}`}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
