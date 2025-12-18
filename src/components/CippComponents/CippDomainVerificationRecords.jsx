import React, { useState } from "react";
import { useSettings } from "../../hooks/use-settings";
import { ApiGetCall } from "../../api/ApiCall";
import {
  Card,
  CardContent,
  CardHeader,
  Stack,
  Box,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";
import { ContentCopy, Check } from "@mui/icons-material";

const DnsRecordField = ({ label, value, copyable = true }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="textSecondary">
          {label}
        </Typography>
        <Typography variant="body2" sx={{ wordBreak: "break-all", fontFamily: "monospace" }}>
          {value}
        </Typography>
      </Box>
      {copyable && (
        <Tooltip title={copied ? "Copied!" : "Copy"}>
          <IconButton size="small" onClick={handleCopy} sx={{ ml: 1, flexShrink: 0 }}>
            {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

const renderRecordDetails = (record) => {
  switch (record.recordType) {
    case "Txt":
      return <DnsRecordField label="Text" value={record.text} />;
    case "Mx":
      return (
        <>
          <DnsRecordField label="Mail Exchange" value={record.mailExchange} />
          <DnsRecordField
            label="Preference"
            value={record.preference?.toString()}
            copyable={false}
          />
        </>
      );
    case "CName":
      return <DnsRecordField label="Canonical Name" value={record.canonicalName} />;
    case "Srv":
      return (
        <>
          <DnsRecordField label="Name Target" value={record.nameTarget} />
          <DnsRecordField label="Service" value={record.service} copyable={false} />
          <DnsRecordField label="Protocol" value={record.protocol} copyable={false} />
          <DnsRecordField label="Priority" value={record.priority?.toString()} copyable={false} />
          <DnsRecordField label="Weight" value={record.weight?.toString()} copyable={false} />
          <DnsRecordField label="Port" value={record.port?.toString()} copyable={false} />
        </>
      );
    default:
      return null;
  }
};

export const CippDomainVerificationRecords = ({ row }) => {
  const tenantFilter = useSettings().currentTenant;

  const recordsQuery = ApiGetCall({
    url: "/api/ListGraphRequest",
    queryKey: `domain-verification-${row.id}`,
    waiting: true,
    data: {
      Endpoint: `domains/${row.id}/verificationDnsRecords`,
      tenantFilter: tenantFilter,
    },
  });

  if (recordsQuery.isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (recordsQuery.isError) {
    return <Typography color="error">Failed to load records</Typography>;
  }

  const records = recordsQuery.data?.Results || [];

  if (records.length === 0) {
    return <Typography>No verification records found</Typography>;
  }

  return (
    <Stack spacing={2}>
      {records.map((record) => (
        <Card key={record.id} variant="outlined">
          <CardHeader
            title={
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle1">{record.label}</Typography>
                <Chip label={record.recordType} size="small" variant="outlined" />
              </Stack>
            }
            subheader={`TTL: ${record.ttl} | Optional: ${record.isOptional ? "Yes" : "No"}`}
            sx={{ pb: 1 }}
          />
          <CardContent>
            <Stack spacing={1}>{renderRecordDetails(record)}</Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};
