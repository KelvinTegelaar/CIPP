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
  Alert,
} from "@mui/material";
import { PropertyList } from "/src/components/property-list";
import { PropertyListItem } from "/src/components/property-list-item";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { Check as CheckIcon, Close as CloseIcon, Sync } from "@mui/icons-material";
import { LinearProgressWithLabel } from "../linearProgressWithLabel";
import { Stack, Grid } from "@mui/system";

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
      {exchangeData?.BlockedForSpam === true ? (
        <Alert severity="warning" sx={{ mx: 2, mt: 2, mb: 2 }}>
          This mailbox is currently blocked for spam.
        </Alert>
      ) : null}
      <Divider />
      <PropertyList>
        <PropertyListItem
          divider
          value={
            isLoading ? (
              <Skeleton variant="text" width={200} />
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="inherit" color="text.primary" gutterBottom>
                    Mailbox Type:
                  </Typography>
                  <Typography variant="inherit">
                    {exchangeData?.RecipientTypeDetails || "N/A"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="inherit" color="text.primary" gutterBottom>
                    Hidden from GAL:
                  </Typography>
                  <Typography variant="inherit">
                    {getCippFormatting(
                      exchangeData?.HiddenFromAddressLists,
                      "HiddenFromAddressLists"
                    )}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="inherit" color="text.primary" gutterBottom>
                    Blocked For Spam:
                  </Typography>
                  <Typography variant="inherit">
                    {getCippFormatting(exchangeData?.BlockedForSpam, "BlockedForSpam")}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 12 }}>
                  <Typography variant="inherit" color="text.primary" gutterBottom>
                    Retention Policy:
                  </Typography>
                  <Typography variant="inherit">
                    {getCippFormatting(exchangeData?.RetentionPolicy, "RetentionPolicy")}
                  </Typography>
                </Grid>
              </Grid>
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
          value={
            isLoading ? (
              <Skeleton variant="text" width={200} />
            ) : (
              (() => {
                const forwardingAddress = exchangeData?.ForwardingAddress;
                const forwardAndDeliver = exchangeData?.ForwardAndDeliver;

                // Determine forwarding type and clean address
                let forwardingType = "None";
                let cleanAddress = "";

                if (forwardingAddress) {
                  if (forwardingAddress.startsWith("smtp:")) {
                    forwardingType = "External";
                    cleanAddress = forwardingAddress.replace("smtp:", "");
                  } else {
                    forwardingType = "Internal";
                    cleanAddress = forwardingAddress;
                  }
                }

                return (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="inherit" color="text.primary" gutterBottom>
                        Forwarding Status:
                      </Typography>
                      <Typography variant="inherit">
                        {forwardingType === "None"
                          ? getCippFormatting(false, "ForwardingStatus")
                          : `${forwardingType} Forwarding`}
                      </Typography>
                    </Grid>
                    {forwardingType !== "None" && (
                      <>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Keep Copy in Mailbox:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(forwardAndDeliver, "ForwardAndDeliver")}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Forwarding Address:
                          </Typography>
                          <Typography variant="inherit">{cleanAddress}</Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                );
              })()
            )
          }
        />

        {/* Archive section - always show status */}
        <PropertyListItem
          divider
          value={
            isLoading ? (
              <Skeleton variant="text" width={200} />
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="inherit" color="text.primary" gutterBottom>
                    Archive Mailbox Enabled:
                  </Typography>
                  <Typography variant="inherit">
                    {getCippFormatting(exchangeData?.ArchiveMailBox, "ArchiveMailBox")}
                  </Typography>
                </Grid>
                {exchangeData?.ArchiveMailBox && (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="inherit" color="text.primary" gutterBottom>
                        Auto Expanding Archive:
                      </Typography>
                      <Typography variant="inherit">
                        {getCippFormatting(
                          exchangeData?.AutoExpandingArchive,
                          "AutoExpandingArchive"
                        )}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="inherit" color="text.primary" gutterBottom>
                        Total Archive Item Size:
                      </Typography>
                      <Typography variant="inherit">
                        {exchangeData?.TotalArchiveItemSize != null
                          ? `${exchangeData.TotalArchiveItemSize} GB`
                          : "N/A"}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="inherit" color="text.primary" gutterBottom>
                        Total Archive Item Count:
                      </Typography>
                      <Typography variant="inherit">
                        {exchangeData?.TotalArchiveItemCount != null
                          ? exchangeData.TotalArchiveItemCount
                          : "N/A"}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            )
          }
        />

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
