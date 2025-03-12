import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { Close, ReceiptLong } from "@mui/icons-material";
import { CippPropertyList } from "./CippPropertyList";

const forefrontHeaderMapping = {
  ARC: {
    label: "ARC Protocol",
    values: {
      AAR: "Records the content of the Authentication-results header from DMARC.",
      AMS: "Includes cryptographic signatures of the message.",
      AS: "Includes cryptographic signatures of the message headers",
    },
  },
  CAT: {
    label: "The category of protection policy",
    values: {
      BULK: "Bulk",
      DIMP: "Domain Impersonation",
      GIMP: "Mailbox intelligence based impersonation",
      HPHSH: "High confidence phishing",
      HPHISH: "High confidence phishing",
      HSPM: "High confidence spam",
      MALW: "Malware",
      PHSH: "Phishing",
      SPM: "Spam",
      SPOOF: "Spoofing",
      UIMP: "User Impersonation",
      AMP: "Anti-malware",
      SAP: "Safe attachments",
      OSPM: "Outbound spam",
      NONE: "Clean message",
    },
  },
  CIP: {
    label: "Connecting IP Address",
  },
  CTRY: {
    label: "The source country as determined by the connecting IP address",
  },
  H: {
    label: "The HELO or EHLO string of the connecting email server",
  },
  IPV: {
    label: "Ingress Peer Verification status",
    values: {
      CAL: "Source IP address was Configured in Allowed List (CAL)",
      NLI: "The IP address was not found on any IP reputation list.",
    },
  },
  EFV: {
    label: "Egress Verification status",
    values: {
      CAL: "Source IP address was Configured in Allowed List (CAL)",
      NLI: "The IP address was not found on any IP reputation list.",
    },
  },
  DIR: {
    label: "Direction of email verification",
    values: {
      INB: "Inbound email verification",
      OUT: "Outbound email verification",
      OUB: "Outbound email verification",
      OTB: "Outbound email verification",
    },
  },
  LANG: {
    label: "The language in which the message was written",
  },
  PTR: {
    label: "Reverse DNS of the Connecting IP peer's address",
  },
  SFTY: {
    label: "The message was identified as phishing",
    values: {
      "9.19": "Domain impersonation. The sending domain is attempting to impersonate a protected domain",
      "9.20":
        "User impersonation. The sending user is attempting to impersonate a user in the recipient's organization",
    },
  },
  SRV: {
    label: "Bulk Email analysis results",
    values: {
      BULK: "The message was identified as bulk email by spam filtering and the bulk complaint level (BCL) threshold",
    },
  },
  SFV: {
    label: "Message Filtering",
    values: {
      BLK: "Filtering was skipped and the message was blocked because it was sent from an address in a user's Blocked Senders list.",
      NSPM: "Spam filtering marked the message as non-spam and the message was sent to the intended recipients.",
      SFE: "Filtering was skipped and the message was allowed because it was sent from an address in a user's Safe Senders list.",
      SKA: "The message skipped spam filtering and was delivered to the Inbox because the sender was in the allowed senders list or allowed domains list in an anti-spam policy.",
      SKB: "The message was marked as spam because it matched a sender in the blocked senders list or blocked domains list in an anti-spam policy.",
      SKI: "Similar to SFV:SKN, the message skipped spam filtering for another reason (for example, an intra-organizational email within a tenant).",
      SKN: "The message was marked as non-spam prior to being processed by spam filtering. For example, the message was marked as SCL -1 or Bypass spam filtering by a mail flow rule.",
      SKQ: "The message was released from the quarantine and was sent to the intended recipients.",
      SKS: "The message was marked as spam prior to being processed by spam filtering. For example, the message was marked as SCL 5 to 9 by a mail flow rule.",
      SPM: "The message was marked as spam by spam filtering.",
    },
  },
  SCL: {
    label: "Spam Confidence Level",
    values: {
      "-1": "-1: The message skipped spam filtering. Deliver the message to recipient Inbox folders.",
      "0": "0: Spam filtering determined the message wasn't spam. Deliver the message to recipient Inbox folders.",
      "1": "1: Spam filtering determined the message wasn't spam. Deliver the message to recipient Inbox folders.",
      "5": "5: Spam filtering marked the message as Spam. Deliver the message to recipient Junk Email folders.",
      "6": "6: Spam filtering marked the message as Spam. Deliver the message to recipient Junk Email folders.",
      "7": "7: Spam filtering marked the message as High confidence spam. Deliver the message to recipient Junk Email folders.",
      "8": "8: Spam filtering marked the message as High confidence spam. Deliver the message to recipient Junk Email folders.",
      "9": "9: Spam filtering marked the message as High confidence spam. Deliver the message to recipient Junk Email folders.",
    },
  },
};

const parseForefrontHeader = (header) => {
  const fields = header.split(";");
  return fields.map((field) => {
    const [key, value] = field.split(":");
    return { key: key.trim(), value: value?.trim() };
  });
};

const CippForefrontHeaderDialog = ({ open, onClose, header }) => {
  const parsedFields = parseForefrontHeader(header);

  const propertyItems = parsedFields
    .filter((field) => field.key && field.value && field.key !== "SFS")
    .map((field) => ({
      label: forefrontHeaderMapping[field.key]?.label || field.key,
      value: forefrontHeaderMapping[field.key]?.values?.[field.value] || field.value || "N/A",
    }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ py: 2 }}>
        <ReceiptLong /> Anti-Spam Report
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <CippPropertyList propertyItems={propertyItems} />
      </DialogContent>
    </Dialog>
  );
};

export default CippForefrontHeaderDialog;
