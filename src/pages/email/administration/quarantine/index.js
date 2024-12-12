import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Skeleton } from "@mui/material";
import { Block, Close, Done, DoneAll } from "@mui/icons-material";
import { CippMessageViewer } from "/src/components/CippComponents/CippMessageViewer.jsx";
import { ApiGetCall } from "/src/api/ApiCall";
import { useSettings } from "/src/hooks/use-settings";
import { EyeIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Quarantine Management";
  const tenantFilter = useSettings().currentTenant;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState(null);
  const [messageId, setMessageId] = useState(null);

  const getMessageContents = ApiGetCall({
    url: "/api/ListMailQuarantineMessage",
    data: {
      tenantFilter: tenantFilter,
      Identity: messageId,
    },
    waiting: false,
    queryKey: `ListMailQuarantineMessage-${messageId}`,
  });

  const viewMessage = (row) => {
    console.log(row);
    const id = row.Identity;
    setMessageId(id);
    getMessageContents.waiting = true;
    getMessageContents.refetch();
    setDialogOpen(true);
  };

  useEffect(() => {
    if (getMessageContents.isSuccess) {
      setDialogContent(<CippMessageViewer emailSource={getMessageContents?.data?.Message} />);
    } else {
      setDialogContent(<Skeleton variant="rectangular" height={400} />);
    }
  }, [getMessageContents.isSuccess]);

  const actions = [
    {
      label: "Release",
      type: "POST",
      url: "/api/ExecQuarantineManagement",
      data: {
        TenantFilter: "TenantFilter",
        ID: "id",
        Type: "Release",
      },
      confirmText: "Are you sure you want to release this message?",
      icon: <Done />,
    },
    {
      label: "Deny",
      type: "POST",
      url: "/api/ExecQuarantineManagement",
      data: {
        TenantFilter: "TenantFilter",
        ID: "id",
        Type: "Deny",
      },
      confirmText: "Are you sure you want to deny this message?",
      icon: <Block />,
    },
    {
      label: "Release & Allow Sender",
      type: "POST",
      url: "/api/ExecQuarantineManagement",
      data: {
        TenantFilter: "TenantFilter",
        ID: "id",
        Type: "Release",
        AllowSender: true,
      },
      confirmText:
        "Are you sure you want to release this email and add the sender to the whitelist?",
      icon: <DoneAll />,
    },
    {
      label: "View Message",
      noConfirm: true,
      customFunction: viewMessage,
      icon: <EyeIcon />,
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["MessageId", "RecipientAddress", "Type"],
    actions: actions,
  };

  const simpleColumns = [
    "SenderAddress",
    "RecipientAddress",
    "Subject",
    "Type",
    "ReceivedTime",
    "ReleaseStatus",
    "PolicyName",
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListMailQuarantine"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
      />
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ py: 2 }}>
          Quarantine Message
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>{dialogContent}</DialogContent>
      </Dialog>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
