import PropTypes from "prop-types";
import { Card, CardHeader, Divider, Skeleton, Chip } from "@mui/material";
import { PropertyList } from "/src/components/property-list";
import { PropertyListItem } from "/src/components/property-list-item";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { Check as CheckIcon, Close as CloseIcon } from "@mui/icons-material";
import { LinearProgressWithLabel } from "../linearProgressWithLabel";

export const CippExchangeInfoCard = (props) => {
  const { exchangeData, isFetching = false, ...other } = props;

  // Define the protocols array
  const protocols = [
    { name: "EWS", enabled: exchangeData?.EWSEnabled },
    { name: "MAPI", enabled: exchangeData?.MailboxMAPIEnabled },
    { name: "OWA", enabled: exchangeData?.MailboxOWAEnabled },
    { name: "IMAP", enabled: exchangeData?.MailboxImapEnabled },
    { name: "POP", enabled: exchangeData?.MailboxPopEnabled },
    { name: "ActiveSync", enabled: exchangeData?.MailboxActiveSyncEnabled },
  ];

  return (
    <Card {...other}>
      <CardHeader title="Exchange Details" />
      <Divider />
      <PropertyList>
        <PropertyListItem
          divider
          label="Mailbox Type"
          value={
            isFetching ? (
              <Skeleton variant="text" width={120} />
            ) : (
              exchangeData?.RecipientTypeDetails || "N/A"
            )
          }
        />
        <PropertyListItem
          divider
          label="Mailbox Usage"
          value={
            isFetching ? (
              <Skeleton variant="text" width={80} />
            ) : exchangeData?.TotalItemSize != null ? (
              <LinearProgressWithLabel
                sx={{ width: "100%" }}
                variant="determinate"
                value={
                  Math.round(
                    (exchangeData?.TotalItemSize / exchangeData?.ProhibitSendReceiveQuota) *
                      100 *
                      100
                  ) / 100
                }
              />
            ) : (
              "N/A"
            )
          }
        />
        <PropertyListItem
          divider
          label="Hidden From Address Lists"
          value={
            isFetching ? (
              <Skeleton variant="text" width={60} />
            ) : (
              getCippFormatting(exchangeData?.HiddenFromAddressLists, "HiddenFromAddressLists")
            )
          }
        />
        <PropertyListItem
          label="Forward and Deliver"
          value={
            isFetching ? (
              <Skeleton variant="text" width={60} />
            ) : (
              getCippFormatting(exchangeData?.ForwardAndDeliver, "ForwardAndDeliver")
            )
          }
        />
        <PropertyListItem
          divider
          label="Forwarding Address"
          value={
            isFetching ? (
              <Skeleton variant="text" width={180} />
            ) : (
              exchangeData?.ForwardingAddress || "N/A"
            )
          }
        />
        <PropertyListItem
          label="Archive Mailbox Enabled"
          value={
            isFetching ? (
              <Skeleton variant="text" width={60} />
            ) : (
              getCippFormatting(exchangeData?.ArchiveMailBox, "ArchiveMailBox")
            )
          }
        />
        <PropertyListItem
          label="Auto Expanding Archive"
          value={
            isFetching ? (
              <Skeleton variant="text" width={80} />
            ) : (
              getCippFormatting(exchangeData?.AutoExpandingArchive, "AutoExpandingArchive")
            )
          }
        />
        <PropertyListItem
          label="Total Archive Item Size"
          value={
            isFetching ? (
              <Skeleton variant="text" width={80} />
            ) : exchangeData?.TotalArchiveItemSize != null ? (
              `${exchangeData.TotalArchiveItemSize} GB`
            ) : (
              "N/A"
            )
          }
        />
        <PropertyListItem
          divider
          label="Total Archive Item Count"
          value={
            isFetching ? (
              <Skeleton variant="text" width={80} />
            ) : exchangeData?.TotalArchiveItemCount != null ? (
              exchangeData.TotalArchiveItemCount
            ) : (
              "N/A"
            )
          }
        />
        <PropertyListItem
          divider
          label="Litigation Hold"
          value={
            isFetching ? (
              <Skeleton variant="text" width={60} />
            ) : (
              getCippFormatting(exchangeData?.LitigationHold, "LitigationHold")
            )
          }
        />
        {/* Combine protocols into a single PropertyListItem */}
        <PropertyListItem
          divider
          label="Mailbox Protocols"
          value={
            isFetching ? (
              <Skeleton variant="text" width={200} />
            ) : (
              <div>
                {protocols.map((protocol) => (
                  <Chip
                    key={protocol.name}
                    label={protocol.name}
                    icon={protocol.enabled ? <CheckIcon /> : <CloseIcon />}
                    color={protocol.enabled ? "success" : "default"}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </div>
            )
          }
        />
        <PropertyListItem
          divider
          label="Blocked For Spam"
          value={
            isFetching ? (
              <Skeleton variant="text" width={60} />
            ) : (
              getCippFormatting(exchangeData?.BlockedForSpam, "BlockedForSpam")
            )
          }
        />
      </PropertyList>
    </Card>
  );
};

CippExchangeInfoCard.propTypes = {
  exchangeData: PropTypes.object,
  isFetching: PropTypes.bool,
};
