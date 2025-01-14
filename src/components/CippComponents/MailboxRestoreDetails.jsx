import React, { useEffect, useState } from "react";
import { Box, Typography, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { CippCodeBlock } from "../CippComponents/CippCodeBlock";
import { ApiGetCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";
import { Close } from "@mui/icons-material";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

const MailboxRestoreDetails = ({ data }) => {
  const tenantFilter = useSettings().currentTenant;
  const [statistics, setStatistics] = useState(null);
  const restoreStatistics = ApiGetCall({
    url: `/api/ListMailboxRestores`,
    data: {
      tenantFilter: tenantFilter,
      Statistics: true,
      Identity: data.Identity,
      IncludeReport: true,
    },
    queryKey: `ListMailboxRestores-${data.Identity}`,
  });

  const properties = [
    "Name",
    "Status",
    "StatusDetail",
    "SyncStage",
    "RequestStyle",
    "SourceExchangeGuid",
    "MailboxRestoreFlags",
    "TargetAlias",
    "TargetType",
    "TargetExchangeGuid",
    "TargetMailboxIdentity",
    "BadItemLimit",
    "BadItemsEncountered",
    "LargeItemLimit",
    "LargeItemsEncountered",
    "MissingItemsEncountered",
    "DataConsistencyScore",
    "QueuedTimestamp",
    "StartTimestamp",
    "LastUpdateTimestamp",
    "InitialSeedingCompletedTimestamp",
    "CompletionTimestamp",
    "OverallDuration",
    "TotalSuspendedDuration",
    "TotalFailedDuration",
    "TotalQueuedDuration",
    "TotalInProgressDuration",
    "TotalTransientFailureDuration",
    "EstimatedTransferSize",
    "EstimatedTransferItemCount",
    "SyncedItemCount",
    "BytesTransferred",
    "BytesTransferredPerMinute",
    "ItemsTransferred",
    "PercentComplete",
    "CompletedRequestAgeLimit",
    "RequestGuid",
    "RequestQueue",
    "Identity",
    "LastSuccessfulSyncTimestamp",
    "RequestExpiryTimestamp",
  ];

  useEffect(() => {
    if (restoreStatistics.isSuccess) {
      setStatistics(restoreStatistics?.data?.[0]);
    }
  }, [data.Identity, restoreStatistics.isSuccess]);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Dialog fullWidth maxWidth="xl" open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle sx={{ py: 2 }}>
          Mailbox Restore Report
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <CippCodeBlock
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            code={restoreStatistics?.data?.[0]?.Report}
          />
        </DialogContent>
      </Dialog>

      <Box>
        <Typography variant="h6">Mailbox Restore Statistics</Typography>
        <CippPropertyListCard
          propertyItems={properties.map((prop) => {
            return { label: getCippTranslation(prop), value: statistics?.[prop] };
          })}
          isFetching={restoreStatistics.isFetching}
          actionItems={[
            {
              label: "View Report",
              noConfirm: true,
              customFunction: () => setDialogOpen(true),
              icon: <DocumentTextIcon />,
            },
          ]}
        />
      </Box>
    </>
  );
};

export default MailboxRestoreDetails;
