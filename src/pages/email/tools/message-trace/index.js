import { Layout as DashboardLayout } from "/src/layouts/index.js";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Container,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { ApiPostCall } from "/src/api/ApiCall";
import { useSettings } from "/src/hooks/use-settings";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";
import { useState } from "react";
import { Search, Close, ClearAll } from "@mui/icons-material";
import { Grid } from "@mui/system";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

const simpleColumns = ["Received", "Status", "SenderAddress", "RecipientAddress", "Subject"];
const detailColumns = ["Date", "Event", "Action", "Detail"];
const apiUrl = "/api/ListMessageTrace";
const pageTitle = "Message Trace";

const Page = () => {
  const tenantFilter = useSettings().currentTenant;
  const [searchResults, setSearchResults] = useState([]);
  const [messageTraceId, setMessageTraceId] = useState(null);
  const [messageTraceRecipient, setMessageTraceRecipient] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [traceDetails, setTraceDetails] = useState([]);
  const formControl = useForm({
    defaultValues: {
      dateFilter: "relative",
      days: 2,
      endDate: Math.floor(Date.now() / 1000),
      startDate: Math.floor(new Date().getTime() / 1000) - 2 * 24 * 60 * 60,
    },
    mode: "onChange",
  });

  const messageTrace = ApiPostCall({
    urlFromData: true,
    queryKey: "MessageTrace",
    onResult: (result) => {
      setSearchResults(result);
    },
  });

  const messageTraceDetail = ApiPostCall({
    urlFromData: true,
    queryKey: `MessageTraceDetail-${messageTraceId}-${messageTraceRecipient}`,
    onResult: (result) => {
      setTraceDetails(result);
    },
  });

  const startMessageTraceDetail = (row) => {
    setMessageTraceId(row.MessageTraceId);
    setMessageTraceRecipient(row.RecipientAddress);
    messageTraceDetail.mutate({
      url: "/api/ListMessageTrace",
      data: {
        tenantFilter: tenantFilter,
        id: row.MessageTraceId,
        recipient: row.RecipientAddress,
        traceDetail: true,
      },
    });
  };

  const actions = [
    {
      label: "View Details",
      noConfirm: true,
      customFunction: (row) => {
        startMessageTraceDetail(row);
        setDialogOpen(true);
      },
      icon: <DocumentTextIcon />,
    },
    {
      label: "View in Explorer",
      noConfirm: true,
      link: `https://security.microsoft.com/realtimereportsv3?tid=${tenantFilter}&dltarget=Explorer&dlstorage=Url&viewid=allemail&query-NetworkMessageId=[MessageTraceId]`,
      icon: <DocumentTextIcon />,
    },
  ];

  const onSubmit = () => {
    const formData = formControl.getValues();
    var data = {
      tenantFilter: tenantFilter,
    };

    if (formData.messageId) {
      data.messageId = formData.messageId;
    } else {
      data.fromIP = formData.fromIP;
      data.recipient = formData.recipient;
      data.sender = formData.sender;
      data.status = formData.status;
      data.toIP = formData.toIP;

      if (formControl.watch("dateFilter") === "startEnd") {
        data.startDate = formData.startDate;
        data.endDate = formData.endDate;
      } else {
        data.days = formData.days;
      }
    }

    messageTrace.mutate({
      url: apiUrl,
      data: data,
    });
  };

  const onClear = () => {
    formControl.reset({
      dateFilter: "relative",
      days: 2,
      endDate: null,
      fromIP: "",
      messageId: "",
      recipient: [],
      sender: [],
      startDate: null,
      status: [],
      toIP: "",
    });
  };

  const isIPAddress = {
    validate: (value) =>
      !value ||
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
        value
      ) ||
      /^([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)$/.test(value) ||
      "This is not a valid IP address",
  };

  const isMessageIdSet = !!formControl.watch("messageId");

  return (
    <>
      <Stack spacing={2} sx={{ p: 3, mt: 1 }}>
        <CippButtonCard
          component="accordion"
          title="Message Trace Options"
          accordionExpanded={true}
        >
          <Grid container spacing={2}>
            <Grid item size={12}>
              <CippFormComponent
                type="radio"
                row
                name="dateFilter"
                label="Date Filter Type"
                options={[
                  { label: "Relative", value: "relative" },
                  { label: "Start / End", value: "startEnd" },
                ]}
                formControl={formControl}
                disabled={isMessageIdSet}
              />
            </Grid>
            {formControl.watch("dateFilter") === "relative" && (
              <Grid item size={12}>
                <CippFormComponent
                  type="number"
                  name="days"
                  label="Number of days to search"
                  formControl={formControl}
                  disabled={isMessageIdSet}
                />
              </Grid>
            )}
            {formControl.watch("dateFilter") === "startEnd" && (
              <>
                <Grid item size={{ xs: 12, md: 6 }}>
                  <CippFormComponent
                    type="datePicker"
                    name="startDate"
                    label="Start Date"
                    dateTimeType="datetime"
                    formControl={formControl}
                    disabled={isMessageIdSet}
                  />
                </Grid>
                <Grid item size={{ xs: 12, md: 6 }}>
                  <CippFormComponent
                    type="datePicker"
                    name="endDate"
                    label="End Date"
                    dateTimeType="datetime"
                    formControl={formControl}
                    disabled={isMessageIdSet}
                  />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="autoComplete"
                freeSolo
                multiple={true}
                creatable={true}
                name="sender"
                label="Sender"
                formControl={formControl}
                disabled={isMessageIdSet}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="autoComplete"
                freeSolo
                multiple={true}
                creatable={true}
                name="recipient"
                label="Recipient"
                formControl={formControl}
                disabled={isMessageIdSet}
              />
            </Grid>
            <Grid item size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="textField"
                name="messageId"
                label="Message ID"
                formControl={formControl}
              />
            </Grid>
            <Grid item size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="autoComplete"
                name="status"
                label="Status"
                options={[
                  { label: "None", value: "None" },
                  { label: "Getting Status", value: "GettingStatus" },
                  { label: "Failed", value: "Failed" },
                  { label: "Pending", value: "Pending" },
                  { label: "Delivered", value: "Delivered" },
                  { label: "Expanded", value: "Expanded" },
                  { label: "Quarantined", value: "Quarantined" },
                  { label: "Filtered As Spam", value: "FilteredAsSpam" },
                ]}
                multiple={true}
                formControl={formControl}
                disabled={isMessageIdSet}
              />
            </Grid>
            <Grid item size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="textField"
                name="fromIP"
                label="From IP"
                formControl={formControl}
                validators={isIPAddress}
                disabled={isMessageIdSet}
              />
            </Grid>
            <Grid item size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="textField"
                name="toIP"
                label="To IP"
                formControl={formControl}
                validators={isIPAddress}
                disabled={isMessageIdSet}
              />
            </Grid>

            {/* Submit and Clear Buttons */}
            <Grid item size={12} sx={{ display: "flex", gap: 1 }}>
              <Button onClick={onSubmit} variant="contained" color="primary" startIcon={<Search />}>
                Search
              </Button>
              <Button onClick={onClear} variant="outlined" startIcon={<ClearAll />}>
                Clear
              </Button>
            </Grid>
          </Grid>
        </CippButtonCard>
        <CippDataTable
          title={
            pageTitle +
            (formControl.watch("messageId")
              ? ` - ID: ${formControl.watch("messageId")}`
              : formControl.watch("dateFilter") === "relative"
              ? ` - Last ${formControl.watch("days")} Days`
              : ` - ${new Date(
                  formControl.watch("startDate") * 1000
                ).toLocaleDateString()} to ${new Date(
                  formControl.watch("endDate") * 1000
                ).toLocaleDateString()}`)
          }
          simpleColumns={simpleColumns}
          data={searchResults}
          isFetching={messageTrace.isPending}
          refreshFunction={onSubmit}
          actions={actions}
        />
      </Stack>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ py: 2 }}>
          Message Trace Details
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {messageTraceDetail.isPending && (
            <Typography variant="body1" sx={{ py: 4 }}>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> Loading message trace
              details...
            </Typography>
          )}
          {messageTraceDetail.isSuccess && (
            <CippDataTable
              noCard={true}
              title="Message Trace Details"
              simpleColumns={detailColumns}
              data={traceDetails ?? []}
              refreshFunction={() =>
                startMessageTraceDetail({
                  MessageTraceId: messageTraceId,
                  RecipientAddress: messageTraceRecipient,
                })
              }
              isFetching={messageTraceDetail.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
