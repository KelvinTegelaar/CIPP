import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box, Stack } from "@mui/system";

// Split the raw email source into its header section and unfold RFC 5322 folded
// headers (continuation lines that begin with whitespace belong to the previous
// header).
const getUnfoldedHeaderLines = (source) => {
  if (!source || typeof source !== "string") return [];
  const headerEnd = source.search(/\r?\n\r?\n/);
  const headerSection = headerEnd === -1 ? source : source.slice(0, headerEnd);
  const lines = headerSection.split(/\r?\n/);
  const unfolded = [];
  for (const line of lines) {
    if (/^[ \t]/.test(line) && unfolded.length) {
      unfolded[unfolded.length - 1] += " " + line.trim();
    } else {
      unfolded.push(line);
    }
  }
  return unfolded;
};

const getHeaderValues = (lines, name) => {
  const prefix = new RegExp(`^${name}\\s*:`, "i");
  return lines.filter((l) => prefix.test(l)).map((l) => l.replace(prefix, "").trim());
};

const isValidDate = (d) => d instanceof Date && !isNaN(d);

const parseHop = (raw) => {
  const lastSemi = raw.lastIndexOf(";");
  const dateStr = lastSemi !== -1 ? raw.slice(lastSemi + 1).trim() : null;
  // Strip trailing parenthetical timezone notes like "(UTC)" that break Date().
  const cleanedDate = dateStr ? dateStr.replace(/\s*\([^)]*\)\s*$/, "").trim() : null;
  const date = cleanedDate ? new Date(cleanedDate) : null;
  return {
    from: raw.match(/\bfrom\s+([^\s;]+)/i)?.[1] ?? null,
    by: raw.match(/\bby\s+([^\s;]+)/i)?.[1] ?? null,
    with: raw.match(/\bwith\s+([^\s;()]+)/i)?.[1] ?? null,
    for: raw.match(/\bfor\s+<?([^\s;>]+)>?/i)?.[1] ?? null,
    date: isValidDate(date) ? date : null,
    raw,
  };
};

const formatDelay = (ms) => {
  if (ms == null || isNaN(ms)) return "—";
  if (ms < 0) ms = 0;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  if (m < 60) return rs ? `${m}m ${rs}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h}h ${rm}m` : `${h}h`;
};

const authColor = (result) => {
  switch ((result || "").toLowerCase()) {
    case "pass":
      return "success";
    case "fail":
    case "hardfail":
      return "error";
    case "softfail":
    case "neutral":
    case "none":
    case "temperror":
    case "permerror":
      return "warning";
    default:
      return "default";
  }
};

export const CippMessageDeliveryInfo = ({ emailSource }) => {
  const { hops, totalMs, auth } = useMemo(() => {
    const lines = getUnfoldedHeaderLines(emailSource);

    // Received headers are prepended by each MTA, so the raw order is
    // newest-first. Reverse to get chronological (oldest) order.
    const received = getHeaderValues(lines, "Received")
      .map(parseHop)
      .reverse();

    // Delay for hop i is the time between the previous hop and this one.
    let total = null;
    if (received.length > 1) {
      const first = received[0].date;
      const last = received[received.length - 1].date;
      if (isValidDate(first) && isValidDate(last)) total = last - first;
    }
    for (let i = 0; i < received.length; i++) {
      const prev = received[i - 1]?.date;
      const cur = received[i].date;
      received[i].delayMs =
        i > 0 && isValidDate(prev) && isValidDate(cur) ? cur - prev : null;
    }

    // Combine every Authentication-Results / ARC-Authentication-Results value.
    const authText = [
      ...getHeaderValues(lines, "Authentication-Results"),
      ...getHeaderValues(lines, "ARC-Authentication-Results"),
    ].join("; ");
    const grab = (key) => authText.match(new RegExp(`\\b${key}=(\\w+)`, "i"))?.[1] ?? null;
    const authResults = {
      SPF: grab("spf"),
      DKIM: grab("dkim"),
      DMARC: grab("dmarc"),
      CompAuth: grab("compauth"),
      ARC: grab("arc"),
    };

    return { hops: received, totalMs: total, auth: authResults };
  }, [emailSource]);

  const authEntries = Object.entries(auth).filter(([, v]) => v);
  const hasHops = hops.length > 0;

  // Nothing worth showing (e.g. a body-only message with no Received chain).
  if (!hasHops && authEntries.length === 0) return null;

  const maxDelay = Math.max(0, ...hops.map((h) => h.delayMs ?? 0));

  return (
    <Card sx={{ mt: 2, mb: 4 }}>
      <CardHeader
        title={<Typography variant="h6">Delivery Information</Typography>}
        action={
          totalMs != null ? (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={`Total delivery time: ${formatDelay(totalMs)}`}
              sx={{ mt: 1.5, mr: 1 }}
            />
          ) : null
        }
      />
      <CardContent>
        {authEntries.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: hasHops ? 3 : 0, flexWrap: "wrap", gap: 1 }}>
            {authEntries.map(([label, result]) => (
              <Chip
                key={label}
                size="small"
                color={authColor(result)}
                label={`${label}: ${result}`}
              />
            ))}
          </Stack>
        )}

        {hasHops && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Delay</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>By</TableCell>
                  <TableCell>With</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hops.map((hop, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 60,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: "action.hover",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              width:
                                maxDelay > 0 && hop.delayMs
                                  ? `${Math.max(4, (hop.delayMs / maxDelay) * 100)}%`
                                  : "0%",
                              backgroundColor:
                                hop.delayMs > 10000 ? "warning.main" : "primary.main",
                            }}
                          />
                        </Box>
                        <Typography variant="caption">{formatDelay(hop.delayMs)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={hop.raw} placement="top-start">
                        <Typography variant="caption">{hop.from ?? "—"}</Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{hop.by ?? "—"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{hop.with ?? "—"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {hop.date ? hop.date.toLocaleString() : "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default CippMessageDeliveryInfo;
