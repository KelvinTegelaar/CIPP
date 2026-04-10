import { useEffect, useMemo, useRef } from "react";
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
import { ApiPostCall } from "../../api/ApiCall";
import { getListGraphBulkRequestRows } from "../../utils/getListGraphBulkRequestRows.js";
import riskyPermissionsJson from "../../data/RiskyPermissions.json";

const normalizeApiLabel = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();

const apiLabelsMatch = (resourceDisplayName, jsonApi) => {
  if (!jsonApi || !resourceDisplayName) return true;
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

const lookupApplicationRisk = (appRoleId, apiDisplayHint) => {
  const key = `${String(appRoleId).toLowerCase()}|Application`;
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

const lookupDelegatedRiskByScopeName = (scopeName, apiDisplayHint) => {
  const matches = riskyPermissionsJson.filter(
    (r) => r.type === "Delegated" && r.name === scopeName,
  );
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];
  return matches.find((r) => apiLabelsMatch(apiDisplayHint, r.api)) || matches[0];
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

const parseBulkSpBody = (entry) => {
  const body = entry?.body;
  if (!body) return null;
  if (body.value && Array.isArray(body.value)) {
    return body.value[0] || null;
  }
  if (body.id) {
    return body;
  }
  return null;
};

const PermissionLine = ({
  primary,
  secondary,
  riskMeta,
}) => {
  const theme = useTheme();
  const accent = riskMeta ? riskAccentColor(riskMeta.risk, theme) : null;
  return (
    <ListItem
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
        primary={primary}
        secondary={secondary || undefined}
        primaryTypographyProps={{ variant: "body2", fontWeight: "medium" }}
        secondaryTypographyProps={{ variant: "caption" }}
      />
    </ListItem>
  );
};

const ResourceAccordion = ({ title, resourceId, chipLabel, children, riskSummary }) => {
  const theme = useTheme();
  return (
    <Accordion
      variant="outlined"
      sx={{
        mb: 1,
        ...(riskSummary && {
          borderLeftWidth: 3,
          borderLeftStyle: "solid",
          borderLeftColor: riskAccentColor(riskSummary.worst, theme),
        }),
      }}
      disableGutters
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%", pr: 1 }}>
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {riskSummary && (
            <Tooltip
              title={`This API includes ${riskSummary.count} permission(s) listed in the risky-permissions set (highest: ${riskSummary.worst}).`}
            >
              <Chip
                size="small"
                icon={<WarningAmber sx={{ fontSize: 18 }} />}
                label={`${riskSummary.worst} (${riskSummary.count})`}
                color={riskChipColor(riskSummary.worst)}
                variant={riskSummary.worst === "Low" ? "outlined" : "filled"}
                sx={{ flexShrink: 0, cursor: "help", maxWidth: 160 }}
              />
            </Tooltip>
          )}
          <Chip size="small" label={resourceId} variant="outlined" sx={{ maxWidth: 260 }} />
          {chipLabel != null && <Chip size="small" label={String(chipLabel)} />}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

const CippEnterpriseAppPermissions = ({ servicePrincipalId, tenantFilter }) => {
  const permissionsBulk = ApiPostCall({ urlFromData: true });
  const resourcesBulk = ApiPostCall({ urlFromData: true });
  const resourcesFetchStarted = useRef(false);

  useEffect(() => {
    resourcesFetchStarted.current = false;
  }, [servicePrincipalId]);

  useEffect(() => {
    if (!servicePrincipalId || !tenantFilter) {
      return;
    }
    permissionsBulk.mutate({
      url: "/api/ListGraphBulkRequest",
      data: {
        tenantFilter,
        Requests: [
          {
            id: "appRoleAssignments",
            url: `/servicePrincipals/${servicePrincipalId}/appRoleAssignments`,
            method: "GET",
          },
          {
            id: "oauth2Grants",
            url: `/oauth2PermissionGrants?$filter=clientId eq '${servicePrincipalId}'`,
            method: "GET",
          },
        ],
      },
    });
  }, [servicePrincipalId, tenantFilter]);

  const permBulkRows = getListGraphBulkRequestRows(permissionsBulk);
  const assignments =
    permBulkRows.find((r) => r.id === "appRoleAssignments")?.body?.value || [];
  const grants = permBulkRows.find((r) => r.id === "oauth2Grants")?.body?.value || [];

  const resourceIds = useMemo(() => {
    const s = new Set();
    assignments.forEach((a) => {
      if (a.resourceId) s.add(a.resourceId);
    });
    grants.forEach((g) => {
      if (g.resourceId) s.add(g.resourceId);
    });
    return [...s];
  }, [assignments, grants]);

  useEffect(() => {
    if (!permissionsBulk.isSuccess || !tenantFilter) {
      return;
    }
    if (resourceIds.length === 0) {
      return;
    }
    if (resourcesFetchStarted.current) {
      return;
    }
    resourcesFetchStarted.current = true;
    resourcesBulk.mutate({
      url: "/api/ListGraphBulkRequest",
      data: {
        tenantFilter,
        Requests: resourceIds.map((rid) => ({
          id: `sp-res-${rid}`,
          url: `/servicePrincipals/${rid}?$select=id,displayName,appId,appRoles,oauth2PermissionScopes,publishedPermissionScopes`,
          method: "GET",
        })),
      },
    });
  }, [permissionsBulk.isSuccess, tenantFilter, resourceIds.join(",")]);

  const resourceSpMap = useMemo(() => {
    const map = {};
    getListGraphBulkRequestRows(resourcesBulk).forEach((entry) => {
      const sp = parseBulkSpBody(entry);
      if (sp?.id) {
        map[sp.id] = sp;
      }
    });
    return map;
  }, [resourcesBulk?.data?.data]);

  const scopesForResource = useMemo(() => {
    const m = {};
    grants.forEach((g) => {
      const rid = g.resourceId;
      if (!rid) return;
      if (!m[rid]) m[rid] = new Set();
      String(g.scope || "")
        .split(/\s+/)
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((sc) => m[rid].add(sc));
    });
    const out = {};
    Object.keys(m).forEach((k) => {
      out[k] = [...m[k]].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    });
    return out;
  }, [grants]);

  const resolveAppRole = (resourceId, appRoleId) => {
    const sp = resourceSpMap[resourceId];
    const role = sp?.appRoles?.find((r) => r.id === appRoleId);
    return {
      name: role?.value || appRoleId,
      description: role?.description || null,
    };
  };

  const resolveDelegatedScope = (resourceId, scopeValue) => {
    const sp = resourceSpMap[resourceId];
    const scopes = sp?.oauth2PermissionScopes || sp?.publishedPermissionScopes || [];
    const scope = scopes.find((s) => s.value === scopeValue);
    return {
      name: scopeValue,
      description:
        scope?.userConsentDescription || scope?.adminConsentDescription || scope?.value || null,
    };
  };

  const assignmentsByResource = useMemo(() => {
    const m = {};
    assignments.forEach((a) => {
      const rid = a.resourceId;
      if (!rid) return;
      if (!m[rid]) m[rid] = [];
      m[rid].push(a);
    });
    return m;
  }, [assignments]);

  const sortedResourceIdsApp = useMemo(() => {
    return Object.keys(assignmentsByResource).sort((a, b) => {
      const nameA =
        resourceSpMap[a]?.displayName || assignmentsByResource[a][0]?.resourceDisplayName || a;
      const nameB =
        resourceSpMap[b]?.displayName || assignmentsByResource[b][0]?.resourceDisplayName || b;
      return String(nameA).localeCompare(String(nameB), undefined, { sensitivity: "base" });
    });
  }, [assignmentsByResource, resourceSpMap]);

  const sortedResourceIdsDelegated = useMemo(() => {
    return Object.keys(scopesForResource).sort((a, b) => {
      const nameA = resourceSpMap[a]?.displayName || a;
      const nameB = resourceSpMap[b]?.displayName || b;
      return String(nameA).localeCompare(String(nameB), undefined, { sensitivity: "base" });
    });
  }, [scopesForResource, resourceSpMap]);

  const permLoading =
    permissionsBulk.isPending ||
    permissionsBulk.isLoading ||
    (!permissionsBulk.isIdle && !permissionsBulk.isSuccess);
  const resLoading =
    resourceIds.length > 0 &&
    (resourcesBulk.isPending || resourcesBulk.isLoading);

  return (
    <Stack spacing={4} sx={{ py: 2 }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Application permissions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          App roles assigned to this enterprise application (app-only), grouped by resource API.
        </Typography>
        {permLoading && <Skeleton variant="rectangular" height={80} />}
        {!permLoading && sortedResourceIdsApp.length === 0 && (
          <Alert severity="info">No application permissions are assigned.</Alert>
        )}
        {!permLoading &&
          sortedResourceIdsApp.map((rid) => {
            const title =
              resourceSpMap[rid]?.displayName ||
              assignmentsByResource[rid][0]?.resourceDisplayName ||
              `API (${rid})`;
            const list = assignmentsByResource[rid];
            const riskSummary = summariseAccordionRisk(
              list.map((a) => lookupApplicationRisk(a.appRoleId, title)),
            );
            return (
              <ResourceAccordion
                key={`app-${rid}`}
                title={title}
                resourceId={rid}
                chipLabel={list.length}
                riskSummary={riskSummary}
              >
                {resLoading && <Skeleton variant="rectangular" height={64} />}
                {!resLoading && (
                  <List dense disablePadding>
                    {list.map((a, idx) => {
                      const { name, description } = resolveAppRole(rid, a.appRoleId);
                      const riskMeta = lookupApplicationRisk(a.appRoleId, title);
                      return (
                        <PermissionLine
                          key={`${a.id || a.appRoleId}-${idx}`}
                          primary={name}
                          secondary={description}
                          riskMeta={riskMeta}
                        />
                      );
                    })}
                  </List>
                )}
              </ResourceAccordion>
            );
          })}
      </Box>

      <Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Delegated permissions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          OAuth2 delegated permission grants for this enterprise application, grouped by resource API.
        </Typography>
        {permLoading && <Skeleton variant="rectangular" height={80} />}
        {!permLoading && sortedResourceIdsDelegated.length === 0 && (
          <Alert severity="info">No delegated permission grants are present.</Alert>
        )}
        {!permLoading &&
          sortedResourceIdsDelegated.map((rid) => {
            const title = resourceSpMap[rid]?.displayName || `API (${rid})`;
            const scopeList = scopesForResource[rid] || [];
            const riskSummary = summariseAccordionRisk(
              scopeList.map((s) => lookupDelegatedRiskByScopeName(s, title)),
            );
            return (
              <ResourceAccordion
                key={`deleg-${rid}`}
                title={title}
                resourceId={rid}
                chipLabel={scopeList.length}
                riskSummary={riskSummary}
              >
                {resLoading && <Skeleton variant="rectangular" height={64} />}
                {!resLoading && (
                  <List dense disablePadding>
                    {scopeList.map((scopeName, idx) => {
                      const { description } = resolveDelegatedScope(rid, scopeName);
                      const riskMeta = lookupDelegatedRiskByScopeName(scopeName, title);
                      return (
                        <PermissionLine
                          key={`${scopeName}-${idx}`}
                          primary={scopeName}
                          secondary={description}
                          riskMeta={riskMeta}
                        />
                      );
                    })}
                  </List>
                )}
              </ResourceAccordion>
            );
          })}
      </Box>
    </Stack>
  );
};

export default CippEnterpriseAppPermissions;
