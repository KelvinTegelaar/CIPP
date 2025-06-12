import PropTypes from "prop-types";
import {
  Card,
  CardHeader,
  Divider,
  Skeleton,
  Chip,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import { PropertyList } from "/src/components/property-list";
import { PropertyListItem } from "/src/components/property-list-item";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { Check as CheckIcon, Close as CloseIcon, Sync } from "@mui/icons-material";
import { LinearProgressWithLabel } from "../linearProgressWithLabel";
import { Stack } from "@mui/system";

export const CippExchangeInfoCard = (props) => {
  const { exchangeData, isLoading = false, isFetching = false, handleRefresh, ...other } = props;

  // Define the protocols array
  const protocols = [
    { name: "EWS", enabled: exchangeData?.EWSEnabled },
    { name: "MAPI", enabled: exchangeData?.MailboxMAPIEnabled },
    { name: "OWA", enabled: exchangeData?.MailboxOWAEnabled },
    { name: "IMAP", enabled: exchangeData?.MailboxImapEnabled },
    { name: "POP", enabled: exchangeData?.MailboxPopEnabled },
    { name: "ActiveSync", enabled: exchangeData?.MailboxActiveSyncEnabled },
  ];

  // Define mailbox hold types array
  const holds = [
    { name: "Compliance Tag Hold", enabled: exchangeData?.ComplianceTagHold },
    { name: "Retention Hold", enabled: exchangeData?.RetentionHold },
    { name: "Litigation Hold", enabled: exchangeData?.LitigationHold },
    { name: "In-Place Hold", enabled: exchangeData?.InPlaceHold },
    { name: "eDiscovery Hold", enabled: exchangeData?.EDiscoveryHold },
    { name: "Purview Retention Hold", enabled: exchangeData?.PurviewRetentionHold },
    { name: "Excluded from Org-Wide Hold", enabled: exchangeData?.ExcludedFromOrgWideHold },
  ];

  return (
    <Card {...other}>
      <CardHeader
        title={
          <Stack
            direction="row"
            sx={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}
          >
            <Typography variant="h6">Exchange Information</Typography>
            {isFetching ? (
              <CircularProgress size={20} />
            ) : (
              <IconButton onClick={handleRefresh} size="small">
                <Sync />
              </IconButton>
            )}
          </Stack>
        }
      />
      <Divider />
      <PropertyList>
        <PropertyListItem
          divider
          label="Mailbox Type"
          value={
            isLoading ? (
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
            isLoading ? (
              <Skeleton variant="text" width={80} />
            ) : exchangeData?.TotalItemSize != null ? (
              <LinearProgressWithLabel
                sx={{ width: "100%" }}
                variant="determinate"
                addedLabel={`(${Math.round(exchangeData.TotalItemSize)} GB of ${Math.round(
                  exchangeData?.ProhibitSendReceiveQuota
                )}GB)`}
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
            isLoading ? (
              <Skeleton variant="text" width={60} />
            ) : (
              getCippFormatting(exchangeData?.HiddenFromAddressLists, "HiddenFromAddressLists")
            )
          }
        />
        <PropertyListItem
          label="Forward and Deliver"
          value={
            isLoading ? (
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
            isLoading ? (
              <Skeleton variant="text" width={180} />
            ) : (
              exchangeData?.ForwardingAddress || "N/A"
            )
          }
        />
        <PropertyListItem
          label="Archive Mailbox Enabled"
          value={
            isLoading ? (
              <Skeleton variant="text" width={60} />
            ) : (
              getCippFormatting(exchangeData?.ArchiveMailBox, "ArchiveMailBox")
            )
          }
        />
        <PropertyListItem
          label="Auto Expanding Archive"
          value={
            isLoading ? (
              <Skeleton variant="text" width={80} />
            ) : (
              getCippFormatting(exchangeData?.AutoExpandingArchive, "AutoExpandingArchive")
            )
          }
        />
        <PropertyListItem
          label="Total Archive Item Size"
          value={
            isLoading ? (
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
            isLoading ? (
              <Skeleton variant="text" width={80} />
            ) : exchangeData?.TotalArchiveItemCount != null ? (
              exchangeData.TotalArchiveItemCount
            ) : (
              "N/A"
            )
          }
        />
        {/* Combine all mailbox hold types into a single PropertyListItem */}
        <PropertyListItem
          divider
          label="Mailbox Holds"
          value={
            isLoading ? (
              <Skeleton variant="text" width={200} />
            ) : (
              <div>
                {holds.map((hold) => (
                  <Chip
                    key={hold.name}
                    label={hold.name}
                    icon={hold.enabled ? <CheckIcon /> : <CloseIcon />}
                    color={hold.enabled ? "success" : "default"}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </div>
            )
          }
        />
        {/* Combine protocols into a single PropertyListItem */}
        <PropertyListItem
          divider
          label="Mailbox Protocols"
          value={
            isLoading ? (
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
            isLoading ? (
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
  isLoading: PropTypes.bool,
  isFetching: PropTypes.bool,
  handleRefresh: PropTypes.func,
};
