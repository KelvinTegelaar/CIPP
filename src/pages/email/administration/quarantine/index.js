import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Skeleton,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Block, Close, Done, DoneAll } from "@mui/icons-material";
import { CippMessageViewer } from "/src/components/CippComponents/CippMessageViewer.jsx";
import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import { useSettings } from "/src/hooks/use-settings";
import { EyeIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";

const simpleColumns = [
  "ReceivedTime",
  "ReleaseStatus",
  "Subject",
  "SenderAddress",
  "RecipientAddress",
  "Type",
  "PolicyName",
  "Tenant",
];
const detailColumns = ["Received", "Status", "SenderAddress", "RecipientAddress"];
const pageTitle = "Quarantine Management";

const Page = () => {
  const tenantFilter = useSettings().currentTenant;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState(null);
  const [messageId, setMessageId] = useState(null);
  const [traceDialogOpen, setTraceDialogOpen] = useState(false);
  const [traceDetails, setTraceDetails] = useState([]);
  const [traceMessageId, setTraceMessageId] = useState(null);
  const [messageSubject, setMessageSubject] = useState(null);
  const [messageContentsWaiting, setMessageContentsWaiting] = useState(false);

  const getMessageContents = ApiGetCall({
    url: "/api/ListMailQuarantineMessage",
    data: {
      tenantFilter: tenantFilter,
      Identity: messageId,
    },
    waiting: messageContentsWaiting,
    queryKey: `ListMailQuarantineMessage-${messageId}`,
  });

  const getMessageTraceDetails = ApiPostCall({
    urlFromData: true,
    queryKey: `MessageTraceDetail-${traceMessageId}`,
    onResult: (result) => {
      setTraceDetails(result);
    },
  });

  const viewMessage = (row) => {
    const id = row.Identity;
    setMessageId(id);
    if (!messageContentsWaiting) {
      setMessageContentsWaiting(true);
    }
    getMessageContents.refetch();
    setDialogOpen(true);
  };

  const viewMessageTrace = (row) => {
    setTraceMessageId(row.MessageId);
    getMessageTraceDetails.mutate({
      url: "/api/ListMessageTrace",
      data: {
        tenantFilter: tenantFilter,
        messageId: row.MessageId,
      },
    });
    setMessageSubject(row.Subject);
    setTraceDialogOpen(true);
  };

  useEffect(() => {
    if (getMessageContents.isSuccess) {
      setDialogContent(<CippMessageViewer emailSource={getMessageContents?.data?.Message} />);
    } else {
      setDialogContent(<Skeleton variant="rectangular" height={400} />);
    }
  }, [getMessageContents.isSuccess, getMessageContents.data]);

  const actions = [
    {
      label: "View Message",
      noConfirm: true,
      customFunction: viewMessage,
      icon: <EyeIcon />,
    },
    {
      label: "View Message Trace",
      noConfirm: true,
      customFunction: viewMessageTrace,
      icon: <DocumentTextIcon />,
    },
    {
      label: "Release",
      type: "POST",
      url: "/api/ExecQuarantineManagement",
      multiPost: true,
      data: {
        Identity: "Identity",
        Type: "!Release",
      },
      confirmText: "Are you sure you want to release this message?",
      icon: <Done />,
      condition: (row) => row.ReleaseStatus !== "RELEASED",
    },
    {
      label: "Deny",
      type: "POST",
      url: "/api/ExecQuarantineManagement",
      data: {
        Identity: "Identity",
        Type: "!Deny",
      },
      confirmText: "Are you sure you want to deny this message?",
      icon: <Block />,
      condition: (row) => row.ReleaseStatus !== "DENIED",
    },
    {
      label: "Release & Allow Sender",
      type: "POST",
      url: "/api/ExecQuarantineManagement",
      data: {
        Identity: "Identity",
        Type: "!Release",
        AllowSender: true,
      },
      confirmText:
        "Are you sure you want to release this email and add the sender to the whitelist?",
      icon: <DoneAll />,
      condition: (row) => row.ReleaseStatus !== "RELEASED",
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["MessageId", "RecipientAddress", "Type"],
    actions: actions,
  };

  const filterList = [
    {
      filterName: "Not Released",
      value: [{ id: "ReleaseStatus", value: "NOTRELEASED" }],
      type: "column",
    },
    {
      filterName: "Released",
      value: [{ id: "ReleaseStatus", value: "RELEASED" }],
      type: "column",
    },
    {
      filterName: "Requested",
      value: [{ id: "ReleaseStatus", value: "REQUESTED" }],
      type: "column",
    },
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListMailQuarantine"
        apiDataKey="Results"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        filters={filterList}
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
      <Dialog
        open={traceDialogOpen}
        onClose={() => setTraceDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ py: 2 }}>
          Message Trace - {messageSubject}
          <IconButton
            aria-label="close"
            onClick={() => setTraceDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {getMessageTraceDetails.isPending && (
            <Typography variant="body1" sx={{ py: 4 }}>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> Loading message trace
              details...
            </Typography>
          )}
          {getMessageTraceDetails.isSuccess && (
            <CippDataTable
              noCard={true}
              title="Message Trace Details"
              simpleColumns={detailColumns}
              data={traceDetails ?? []}
              refreshFunction={() =>
                getMessageTraceDetails.mutate({
                  url: "/api/ListMessageTrace",
                  data: {
                    tenantFilter: tenantFilter,
                    messageId: traceMessageId,
                  },
                })
              }
              isFetching={getMessageTraceDetails.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
