import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { CippCopyToClipBoard } from "./CippCopyToClipboard";
import { ApiGetCall } from "../../api/ApiCall";

const Field = ({ label, value, mono = false }) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        py: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ minWidth: 160 }}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
          {label}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{ flex: 1, fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-all" }}
      >
        {String(value)}
      </Typography>
      <CippCopyToClipBoard text={String(value)} />
    </Box>
  );
};

export const CippLicenseDetailsDrawer = ({ data }) => {
  if (!data) return null;
  const fromCatalog = data.source === "catalog";

  // For catalog-only hits, backfill tenant usage from the API by skuId.
  const usageQuery = ApiGetCall({
    url: `/api/ExecUniversalSearchV2`,
    data: {
      searchTerms: data.skuId || data.skuPartNumber || "",
      limit: 1,
      type: "Licenses",
    },
    queryKey: `licenseUsage-${data.skuId || data.skuPartNumber || ""}`,
    waiting: fromCatalog && Boolean(data.skuId || data.skuPartNumber),
  });

  const apiMatch = (() => {
    if (!fromCatalog || !usageQuery.isSuccess) return null;
    const rows = Array.isArray(usageQuery.data) ? usageQuery.data : [];
    const target = String(data.skuId || "").toLowerCase();
    const hit =
      rows.find((r) => String(r?.Data?.skuId || "").toLowerCase() === target) || rows[0];
    return hit?.Data || null;
  })();

  const merged = apiMatch
    ? {
        ...data,
        tenantCount: apiMatch.tenantCount ?? data.tenantCount,
        totalAssigned: apiMatch.totalAssigned ?? data.totalAssigned,
        totalAvailable: apiMatch.totalAvailable ?? data.totalAvailable,
        tenants: Array.isArray(apiMatch.tenants) ? apiMatch.tenants : [],
      }
    : data;

  const servicePlans = Array.isArray(merged.servicePlans) ? merged.servicePlans : [];
  const tenants = Array.isArray(merged.tenants) ? merged.tenants : [];
  const hasUsage = !fromCatalog || apiMatch !== null;
  const usageLoading = fromCatalog && usageQuery.isFetching && !apiMatch;
  const usageNotFound = fromCatalog && usageQuery.isSuccess && !apiMatch;

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="h6">
          {merged.displayName || merged.skuPartNumber || "License"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {hasUsage
            ? `${merged.tenantCount || 0} tenant${merged.tenantCount === 1 ? "" : "s"} · ${
                merged.totalAssigned || 0
              }/${merged.totalAvailable || 0} assigned`
            : usageLoading
              ? "Microsoft published catalog · loading tenant usage…"
              : usageNotFound
                ? "Microsoft published catalog · not assigned in any tenant"
                : "Microsoft published catalog"}
        </Typography>
      </Stack>

      <Field label="Display name" value={merged.displayName} />
      <Field label="SKU part number" value={merged.skuPartNumber} mono />
      <Field label="SKU ID (GUID)" value={merged.skuId} mono />

      {hasUsage && (
        <>
          <Field label="Tenants using this SKU" value={merged.tenantCount} />
          <Field label="Total assigned" value={merged.totalAssigned} />
          <Field label="Total available" value={merged.totalAvailable} />
        </>
      )}

      {usageLoading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Looking up tenant usage…
          </Typography>
        </Box>
      )}

      {servicePlans.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            Service plans ({servicePlans.length})
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Friendly name</TableCell>
                  <TableCell>Service plan ID</TableCell>
                  <TableCell width={48} />
                </TableRow>
              </TableHead>
              <TableBody>
                {servicePlans.map((plan, idx) => {
                  const id = plan.servicePlanId || plan.servicePlanid || "";
                  const name = plan.servicePlanName || "";
                  const friendly = plan.friendlyName || "";
                  return (
                    <TableRow key={id || `${name}-${idx}`}>
                      <TableCell sx={{ fontFamily: "monospace" }}>{name}</TableCell>
                      <TableCell>{friendly}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace" }}>{id}</TableCell>
                      <TableCell>{id && <CippCopyToClipBoard text={id} />}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tenants.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Tenants ({tenants.length})
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell align="right">Used</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell width={48} />
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.map((t, idx) => (
                  <TableRow key={`${t.tenant}-${idx}`}>
                    <TableCell>{t.tenant}</TableCell>
                    <TableCell align="right">{t.used ?? "-"}</TableCell>
                    <TableCell align="right">{t.total ?? "-"}</TableCell>
                    <TableCell>
                      {t.tenant && <CippCopyToClipBoard text={String(t.tenant)} />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};
