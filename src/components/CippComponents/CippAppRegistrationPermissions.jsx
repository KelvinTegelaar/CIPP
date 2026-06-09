import { useMemo } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { ExpandMore, WarningAmber } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { ApiGetCall } from "../../api/ApiCall";
import riskyPermissionsJson from "../../data/RiskyPermissions.json";

const normalizeApiLabel = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();

const apiLabelsMatch = (resourceDisplayName, jsonApi) => {
  if (!jsonApi) return true;
  if (!resourceDisplayName) return true;
  const a = normalizeApiLabel(resourceDisplayName);
  const b = normalizeApiLabel(jsonApi);
  if (a === b) return true;
  return a.includes(b) || b.includes(a);
};

const buildRiskyPermissionLookup = (rows) => {
  const map = new Map();
  for (const row of rows) {
    const key = `${String(row.id).toLowerCase()}|${row.type}`;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(row);
  }
  return map;
};

const RISKY_BY_ID_AND_TYPE = buildRiskyPermissionLookup(riskyPermissionsJson);

const lookupPermissionRisk = (permissionId, permissionKind, apiDisplayHint) => {
  const typeStr = permissionKind === "application" ? "Application" : "Delegated";
  const key = `${String(permissionId).toLowerCase()}|${typeStr}`;
  const candidates = RISKY_BY_ID_AND_TYPE.get(key);
  if (!candidates?.length) {
    return null;
  }
  if (candidates.length === 1) {
    return candidates[0];
  }
  const byApi = candidates.find((c) => apiLabelsMatch(apiDisplayHint, c.api));
  return byApi || candidates[0];
};

const riskChipColor = (risk) => {
  switch (risk) {
    case "Critical":
      return "error";
    case "High":
      return "warning";
    case "Medium":
      return "info";
    case "Low":
      return "default";
    default:
      return "default";
  }
};

const riskAccentColor = (risk, theme) => {
  switch (risk) {
    case "Critical":
      return theme.palette.error.main;
    case "High":
      return theme.palette.warning.main;
    case "Medium":
      return theme.palette.info.main;
    case "Low":
      return theme.palette.text.secondary;
    default:
      return "transparent";
  }
};

const RISK_ORDER = { Critical: 4, High: 3, Medium: 2, Low: 1 };

const summariseAccordionRisk = (metas) => {
  const list = metas.filter(Boolean);
  if (list.length === 0) return null;
  const worst = list.reduce((acc, m) =>
    (RISK_ORDER[m.risk] ?? 0) > (RISK_ORDER[acc.risk] ?? 0) ? m : acc
  );
  return { count: list.length, worst: worst.risk };
};

const ResourcePermissionsAccordion = ({
  resourceAppId,
  resourceAccess,
  permissionKind,
  servicePrincipalObjectId,
  apiDisplayHint,
}) => {
  const theme = useTheme();
  const { data, isFetching, isLoading } = ApiGetCall({
    url: "/api/ExecServicePrincipals",
    data: { Id: servicePrincipalObjectId },
    queryKey: `execSP-appreg-perms-${servicePrincipalObjectId}-${resourceAppId}`,
    waiting: !!servicePrincipalObjectId,
  });

  const spDetails = data?.Results;

  const getPermissionDetails = (permissionId) => {
    if (!spDetails) {
      return { name: permissionId, description: null };
    }
    if (permissionKind === "application") {
      const role = spDetails.appRoles?.find((r) => r.id === permissionId);
      return {
        name: role?.value || permissionId,
        description: role?.description || null,
      };
    }
    const scope = spDetails.publishedPermissionScopes?.find((s) => s.id === permissionId);
    return {
      name: scope?.value || permissionId,
      description: scope?.userConsentDescription || scope?.description || null,
    };
  };

  const showSkeleton = !!servicePrincipalObjectId && (isLoading || isFetching);
  const canResolve = !!spDetails;

  const title = showSkeleton
    ? apiDisplayHint || "Loading…"
    : spDetails?.displayName || apiDisplayHint || `API (${resourceAppId})`;

  const accordionRisk = useMemo(() => {
    const metas = resourceAccess.map((access) =>
      lookupPermissionRisk(access.id, permissionKind, apiDisplayHint),
    );
    return summariseAccordionRisk(metas);
  }, [resourceAccess, permissionKind, apiDisplayHint]);

  return (
    <Accordion
      variant="outlined"
      sx={{
        mb: 1,
        ...(accordionRisk && {
          borderLeftWidth: 3,
          borderLeftStyle: "solid",
          borderLeftColor: riskAccentColor(accordionRisk.worst, theme),
        }),
      }}
      disableGutters
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%", pr: 1 }}>
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {accordionRisk && (
            <Tooltip
              title={`This API includes ${accordionRisk.count} permission(s) listed in the risky-permissions set (highest: ${accordionRisk.worst}).`}
            >
              <Chip
                size="small"
                icon={<WarningAmber sx={{ fontSize: 18 }} />}
                label={`${accordionRisk.worst} (${accordionRisk.count})`}
                color={riskChipColor(accordionRisk.worst)}
                variant={accordionRisk.worst === "Low" ? "outlined" : "filled"}
                sx={{ flexShrink: 0, cursor: "help", maxWidth: 160 }}
              />
            </Tooltip>
          )}
          <Chip size="small" label={resourceAppId} variant="outlined" sx={{ maxWidth: 280 }} />
          <Chip size="small" label={`${resourceAccess.length}`} />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {!servicePrincipalObjectId && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            No service principal for this resource API was found in the tenant. Names show as raw
            permission IDs until the API is present.
          </Alert>
        )}
        {showSkeleton && <Skeleton variant="rectangular" height={72} sx={{ mb: 1 }} />}
        {!showSkeleton && (
          <List dense disablePadding>
            {resourceAccess.map((access, idx) => {
              const details = canResolve
                ? getPermissionDetails(access.id)
                : { name: access.id, description: null };
              const riskMeta = lookupPermissionRisk(access.id, permissionKind, apiDisplayHint);
              const accent = riskMeta ? riskAccentColor(riskMeta.risk, theme) : null;
              return (
                <ListItem
                  key={`${access.id}-${idx}`}
                  sx={{
                    py: 0.5,
                    alignItems: "flex-start",
                    pl: riskMeta ? 1 : 0,
                    borderLeft: riskMeta ? 3 : 0,
                    borderLeftColor: accent || "transparent",
                    borderLeftStyle: riskMeta ? "solid" : "none",
                  }}
                  secondaryAction={
                    riskMeta ? (
                      <Tooltip
                        arrow
                        placement="left"
                        title={
                          <Box sx={{ maxWidth: 380, py: 0.25 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                              {riskMeta.risk}
                              {riskMeta.name ? ` — ${riskMeta.name}` : ""}
                            </Typography>
                            <Typography variant="body2" component="p" sx={{ m: 0 }}>
                              {riskMeta.reason}
                            </Typography>
                          </Box>
                        }
                      >
                        <span>
                          <Chip
                            size="small"
                            label={riskMeta.risk}
                            color={riskChipColor(riskMeta.risk)}
                            variant={riskMeta.risk === "Low" ? "outlined" : "filled"}
                            sx={{ cursor: "help", maxWidth: 120 }}
                          />
                        </span>
                      </Tooltip>
                    ) : null
                  }
                >
                  <ListItemText
                    primary={details.name}
                    secondary={details.description || undefined}
                    primaryTypographyProps={{ variant: "body2", fontWeight: "medium" }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

const buildResourcesByType = (requiredResourceAccess, type) =>
  (requiredResourceAccess || [])
    .map((r) => ({
      resourceAppId: r.resourceAppId,
      resourceAccess: (r.resourceAccess || []).filter((a) => a.type === type),
    }))
    .filter((r) => r.resourceAccess.length > 0);

const CippAppRegistrationPermissions = ({ requiredResourceAccess }) => {
  const {
    data: spListData,
    isSuccess: spListSuccess,
    isLoading: spListLoading,
    isFetching: spListFetching,
  } = ApiGetCall({
    url: "/api/ExecServicePrincipals",
    data: { Select: "appId,displayName,id" },
    queryKey: "execServicePrincipalList-app-registration-permissions",
    waiting: true,
  });

  const spByAppId = useMemo(() => {
    const map = {};
    if (spListSuccess && spListData?.Results) {
      spListData.Results.forEach((sp) => {
        if (sp.appId) {
          map[sp.appId] = sp.id;
        }
      });
    }
    return map;
  }, [spListSuccess, spListData]);

  const appResources = useMemo(
    () => buildResourcesByType(requiredResourceAccess, "Role"),
    [requiredResourceAccess],
  );
  const delegatedResources = useMemo(
    () => buildResourcesByType(requiredResourceAccess, "Scope"),
    [requiredResourceAccess],
  );

  const sortByApiName = (resources) => {
    const results = spListData?.Results || [];
    return [...resources].sort((a, b) => {
      const nameA = results.find((sp) => sp.appId === a.resourceAppId)?.displayName || a.resourceAppId;
      const nameB = results.find((sp) => sp.appId === b.resourceAppId)?.displayName || b.resourceAppId;
      return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
    });
  };

  const appSorted = useMemo(() => sortByApiName(appResources), [appResources, spListData]);
  const delegatedSorted = useMemo(
    () => sortByApiName(delegatedResources),
    [delegatedResources, spListData],
  );

  const displayNameByResourceAppId = useMemo(() => {
    const map = {};
    (spListData?.Results || []).forEach((sp) => {
      if (sp.appId) {
        map[sp.appId] = sp.displayName;
      }
    });
    return map;
  }, [spListData]);

  const listBusy = spListLoading || spListFetching;

  if (!requiredResourceAccess || requiredResourceAccess.length === 0) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert severity="info">
          This app registration has no required resource access (API permissions) configured.
        </Alert>
      </Box>
    );
  }

  return (
    <Stack spacing={4} sx={{ py: 2 }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Application permissions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          App-only (admin consent) permissions, grouped by resource API.
        </Typography>
        {listBusy && <Skeleton variant="rectangular" height={100} sx={{ mb: 1 }} />}
        {!listBusy && appSorted.length === 0 && (
          <Alert severity="info">No application permissions are configured.</Alert>
        )}
        {!listBusy &&
          appSorted.map((r) => (
            <ResourcePermissionsAccordion
              key={`app-${r.resourceAppId}`}
              resourceAppId={r.resourceAppId}
              resourceAccess={r.resourceAccess}
              permissionKind="application"
              servicePrincipalObjectId={spByAppId[r.resourceAppId]}
              apiDisplayHint={displayNameByResourceAppId[r.resourceAppId]}
            />
          ))}
      </Box>

      <Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Delegated permissions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Delegated (user or admin consent) permissions, grouped by resource API.
        </Typography>
        {listBusy && <Skeleton variant="rectangular" height={100} sx={{ mb: 1 }} />}
        {!listBusy && delegatedSorted.length === 0 && (
          <Alert severity="info">No delegated permissions are configured.</Alert>
        )}
        {!listBusy &&
          delegatedSorted.map((r) => (
            <ResourcePermissionsAccordion
              key={`deleg-${r.resourceAppId}`}
              resourceAppId={r.resourceAppId}
              resourceAccess={r.resourceAccess}
              permissionKind="delegated"
              servicePrincipalObjectId={spByAppId[r.resourceAppId]}
              apiDisplayHint={displayNameByResourceAppId[r.resourceAppId]}
            />
          ))}
      </Box>
    </Stack>
  );
};

export default CippAppRegistrationPermissions;
