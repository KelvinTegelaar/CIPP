import { Box, Button, Stack, SvgIcon } from "@mui/material";
import { CippIcons } from "../../utils/icon-registry";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";
import { ApiGetCall } from "../../api/ApiCall";
import { useEffect, useState } from "react";

const formatUtc = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
};

const CippVersionProperties = () => {
  const [copied, setCopied] = useState(false);

  const version = ApiGetCall({
    url: "/version.json",
    queryKey: "LocalVersion",
  });

  const cippVersion = ApiGetCall({
    url: `/api/GetVersion?LocalVersion=${encodeURIComponent(version?.data?.version ?? "")}`,
    queryKey: "CippVersion",
    waiting: false,
  });

  useEffect(() => {
    if (version.isFetched && !cippVersion.isFetched) {
      cippVersion.waiting = true;
      cippVersion.refetch();
    }
  }, [version, cippVersion]);

  const CippVersionComponent = (version, availableVersion, outOfDate) => {
    return (
      <Box>
        <SvgIcon fontSize="inherit" style={{ marginRight: 3 }}>
          {outOfDate === true ? <CippIcons.Warning color="warning" /> : <CippIcons.CheckCircle color="success" />}
        </SvgIcon>
        <span style={{ marginRight: 10 }}>v{version}</span>{" "}
        {outOfDate === true ? `(v${availableVersion} is available)` : ""}
      </Box>
    );
  };

  const hosting = cippVersion?.data?.Hosting;
  const lastUpdate = cippVersion?.data?.LastUpdate;
  const lastUpdateText = lastUpdate
    ? `v${lastUpdate.PreviousVersion} → v${lastUpdate.NewVersion} (${formatUtc(
        lastUpdate.RecordedAt
      )})`
    : "No update recorded yet";

  const handleCopy = async () => {
    const versionLine = (label, local, remote, outOfDate) =>
      `${label}: v${local ?? "Unknown"}${outOfDate === true ? ` (v${remote} available)` : ""}`;
    const text = [
      versionLine(
        "Frontend",
        version?.data?.version,
        cippVersion?.data?.RemoteCIPPVersion,
        cippVersion?.data?.OutOfDateCIPP
      ),
      versionLine(
        "Backend",
        cippVersion?.data?.LocalCIPPAPIVersion,
        cippVersion?.data?.RemoteCIPPAPIVersion,
        cippVersion?.data?.OutOfDateCIPPAPI
      ),
      `Hosting: ${hosting?.HostingType ?? "Unknown"}`,
      `SKU: ${hosting?.SKU ?? "Unknown"}`,
      `Runtime: ${hosting?.RuntimeStack ?? "Unknown"}`,
      `Last update: ${
        lastUpdate
          ? `v${lastUpdate.PreviousVersion} → v${lastUpdate.NewVersion} (${formatUtc(
              lastUpdate.RecordedAt
            )})`
          : "none recorded"
      }`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy version info: ", err);
    }
  };

  return (
    <CippPropertyListCard
      showDivider={false}
      layout="double"
      cardButton={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={handleCopy}>
            <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
              <CippIcons.ContentCopy />
            </SvgIcon>
            {copied ? "Copied!" : "Copy for Ticket"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              version.refetch();
              cippVersion.refetch();
            }}
          >
            <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
              <CippIcons.SystemUpdateAlt />
            </SvgIcon>
            Check For Updates
          </Button>
        </Stack>
      }
      title="Version"
      isFetching={cippVersion.isFetching}
      cardSx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}
      propertyItems={[
        {
          label: "Frontend",
          value: CippVersionComponent(
            version?.data?.version,
            cippVersion?.data?.RemoteCIPPVersion,
            cippVersion?.data?.OutOfDateCIPP
          ),
        },
        {
          label: "Backend",
          value: CippVersionComponent(
            cippVersion?.data?.LocalCIPPAPIVersion,
            cippVersion?.data?.RemoteCIPPAPIVersion,
            cippVersion?.data?.OutOfDateCIPPAPI
          ),
        },
        {
          label: "Hosting",
          value: hosting?.HostingType ?? "Unknown",
        },
        {
          label: "App Service SKU",
          value: hosting?.SKU ?? "Unknown",
        },
        {
          label: "Runtime Stack",
          value: hosting?.RuntimeStack ?? "Unknown",
        },
        {
          label: "Last Updated",
          value: lastUpdateText,
        },
      ].map((item) => ({ ...item, sx: { py: 0.5, px: { xs: 2, md: 3 } } }))}
    />
  );
};

export default CippVersionProperties;
