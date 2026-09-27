import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { CippCopyToClipBoard } from "../CippComponents/CippCopyToClipboard";
import { CippFormComponent } from "../CippComponents/CippFormComponent";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";

// One self-contained section per MCP-enabled client: its connector (sign-in) URL, its pre-auth
// status, and its own redirect-URI boxes. Each client has its own form + save so multiple MCP
// clients never share state or overwrite each other's callbacks.
const McpClientCard = ({ client, baseMcpUrl }) => {
  const form = useForm({
    mode: "onChange",
    defaultValues: {
      PublicRedirectUris: client.PublicRedirectUris ?? [],
      WebRedirectUris: client.WebRedirectUris ?? [],
    },
  });
  const post = ApiPostCall({ relatedQueryKeys: ["McpAuthStatus"] });

  // Re-sync when the server returns updated URIs for this client (e.g. after a save).
  useEffect(() => {
    form.reset({
      PublicRedirectUris: client.PublicRedirectUris ?? [],
      WebRedirectUris: client.WebRedirectUris ?? [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.PublicRedirectUris, client.WebRedirectUris]);

  return (
    <Card>
      <CardHeader
        title={client.AppName || client.AppId}
        subheader="This client's sign-in URL pins its role, IP range and Conditional Access. Add callback URLs under the platform each connector uses — PKCE clients (Claude, ChatGPT, CLIs) under mobile & desktop, secret-based clients (Copilot Studio) under web. The managed callbacks are always kept."
      />
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          {baseMcpUrl && (
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Connector URL
              </Typography>
              <CippCopyToClipBoard type="chip" text={`${baseMcpUrl}?client=${client.AppId}`} />
            </Stack>
          )}
          {client.UserImpersonationPreAuthorized === false && (
            <Alert severity="warning">
              This client isn&apos;t pre-authorized on the CIPP-MCP resource scope yet, so users may
              hit a consent prompt on first connect. Run <strong>Actions &gt; Save to Azure</strong>{" "}
              on the API Clients tab to apply it (it also self-heals on the next warmup).
            </Alert>
          )}
          <CippFormComponent
            type="autoComplete"
            name="PublicRedirectUris"
            label="Mobile & desktop callbacks (PKCE — Claude, ChatGPT, CLIs)"
            formControl={form}
            multiple
            freeSolo
            creatable
            options={[]}
            placeholder="Paste a provider callback URL and press enter"
          />
          <CippFormComponent
            type="autoComplete"
            name="WebRedirectUris"
            label="Web callbacks (confidential / secret — Copilot Studio)"
            formControl={form}
            multiple
            freeSolo
            creatable
            options={[]}
            placeholder="e.g. https://global.consent.azure-apim.net/redirect/…"
          />
          <Box>
            <Button
              variant="contained"
              onClick={() =>
                post.mutate({
                  url: "/api/ExecApiClient?action=SetMcpRedirectUris",
                  data: {
                    ClientId: client.AppId,
                    PublicRedirectUris: (form.getValues("PublicRedirectUris") || []).map(
                      (u) => u?.value ?? u
                    ),
                    WebRedirectUris: (form.getValues("WebRedirectUris") || []).map(
                      (u) => u?.value ?? u
                    ),
                  },
                })
              }
            >
              Save Redirect URIs
            </Button>
          </Box>
          <CippApiResults apiObject={post} />
        </Stack>
      </CardContent>
    </Card>
  );
};

// MCP connector management: the shared CIPP-MCP resource app (the token audience CIPP creates and
// manages) plus a section per MCPAllowed client app. Kept on its own tab so it doesn't clutter API
// client management. Enabling MCP on a client, and its role/IP, live with the client on the API
// Clients tab; here you check the resource app and each client's connector URL and redirect URIs.
const CippMcpManagement = () => {
  // Shared query keys with the API Clients tab — react-query dedupes, so no extra network calls.
  const azureConfig = ApiGetCall({
    url: "/api/ExecApiClient",
    data: { Action: "GetAzureConfiguration" },
    queryKey: "AzureConfiguration",
  });
  const mcpAuth = ApiGetCall({
    url: "/api/ExecApiClient",
    data: { Action: "GetMcpAuth" },
    queryKey: "McpAuthStatus",
  });

  const mcpClients = useMemo(() => mcpAuth.data?.Results?.Clients ?? [], [mcpAuth.data]);
  const results = mcpAuth.data?.Results;
  const baseMcpUrl = azureConfig.data?.Results?.ApiUrl
    ? `${azureConfig.data.Results.ApiUrl.replace(/\/+$/, "")}/api/ExecMcp`
    : null;

  const noMcpClients = mcpAuth.isSuccess && mcpClients.length === 0;

  return (
    <Stack spacing={1}>
      {noMcpClients && (
        <Alert severity="info">
          No MCP clients yet. On the <strong>API Clients</strong> tab, create or edit an API client
          and turn on <strong>MCP Access Allowed</strong>, then run <strong>Actions &gt; Save to
          Azure</strong>. CIPP creates the shared CIPP-MCP resource app and wires the client
          automatically.
        </Alert>
      )}
      {mcpAuth.isSuccess && results?.ResourceConflict && (
        <Alert
          severity="error"
          action={
            results.ResourceConflict.AppId ? (
              <Button
                color="inherit"
                size="small"
                href={`https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/${results.ResourceConflict.AppId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Entra
              </Button>
            ) : null
          }
        >
          MCP setup is blocked: the app registration{" "}
          <strong>{results.ResourceConflict.AppName || results.ResourceConflict.AppId}</strong> is
          already using the MCP resource URL. This is usually a client left over from the previous
          single-app MCP setup. Delete that app registration in Entra (and remove it from{" "}
          <strong>API Clients</strong> if it&apos;s listed there), then run{" "}
          <strong>Actions &gt; Save to Azure</strong> again.
        </Alert>
      )}
      {mcpAuth.isSuccess &&
        mcpClients.length > 0 &&
        results?.ResourceConfigured === false &&
        !results?.ResourceConflict && (
          <Alert severity="warning">
            The <strong>CIPP-MCP</strong> resource app isn&apos;t set up yet — it&apos;s the shared,
            CIPP-managed app that MCP tokens are issued for. Click <strong>Actions &gt; Save to
            Azure</strong> on the API Clients tab to create it. Until then MCP connectors can&apos;t
            sign in.
          </Alert>
        )}

      <CippPropertyListCard
        title="MCP Resource App"
        layout="dual"
        showDivider={false}
        isFetching={mcpAuth.isFetching}
        propertyItems={[
          { label: "Name", value: results?.ResourceDisplayName || "CIPP-MCP" },
          {
            label: "Application (Client) ID",
            value: results?.ResourceAppId ? (
              <CippCopyToClipBoard type="chip" text={results.ResourceAppId} />
            ) : (
              "Not configured"
            ),
          },
          {
            label: "Object ID",
            value: results?.ResourceObjectId ? (
              <CippCopyToClipBoard type="chip" text={results.ResourceObjectId} />
            ) : (
              "-"
            ),
          },
          {
            label: "Managed callbacks (mobile & desktop)",
            value: (results?.DefaultRedirectUris || []).join(", ") || "None",
          },
          {
            label: "Managed callbacks (web / confidential)",
            value: (results?.DefaultWebRedirectUris || []).join(", ") || "None",
          },
          {
            label: "Identifier URIs",
            value: (results?.ResourceIdentifierUris || []).join(", ") || "-",
          },
          {
            label: "Manage in Entra",
            value: results?.ResourceAppId ? (
              <Button
                size="small"
                variant="outlined"
                href={`https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/${results.ResourceAppId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open app registration
              </Button>
            ) : (
              "-"
            ),
          },
        ]}
      />

      {mcpAuth.isSuccess &&
        mcpClients.map((client) => (
          <McpClientCard key={client.AppId} client={client} baseMcpUrl={baseMcpUrl} />
        ))}
    </Stack>
  );
};

export default CippMcpManagement;
