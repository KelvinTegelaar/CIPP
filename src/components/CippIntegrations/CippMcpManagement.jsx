import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { CippCopyToClipBoard } from "../CippComponents/CippCopyToClipboard";
import { CippFormComponent } from "../CippComponents/CippFormComponent";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";

// MCP connector management: the shared CIPP-MCP resource app (the token audience CIPP creates and
// manages) plus the redirect URIs of each MCPAllowed client app. Kept on its own tab so it doesn't
// clutter API client management. Enabling MCP on a client, and its role/IP, live with the client on
// the API Clients tab; here you check the connector URLs, the resource app, and add custom callbacks.
const CippMcpManagement = () => {
  const [selectedMcpClient, setSelectedMcpClient] = useState(null);
  const redirectForm = useForm({ mode: "onChange", defaultValues: { RedirectUris: [] } });
  const mcpAuthPost = ApiPostCall({ relatedQueryKeys: ["McpAuthStatus"] });

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

  useEffect(() => {
    if (mcpClients.length && !selectedMcpClient) {
      setSelectedMcpClient(mcpClients[0].AppId);
    }
  }, [mcpClients, selectedMcpClient]);

  useEffect(() => {
    const client = mcpClients.find((c) => c.AppId === selectedMcpClient);
    redirectForm.reset({ RedirectUris: client?.CustomRedirectUris ?? [] });
  }, [selectedMcpClient, mcpClients, redirectForm]);

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
            label: "Managed provider callbacks",
            value: (results?.DefaultRedirectUris || []).join(", ") || "None",
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

      {mcpAuth.isSuccess && mcpClients.length > 0 && baseMcpUrl && (
        <Card>
          <CardHeader
            title="Connector URLs"
            subheader="Give each AI connector the URL for the client app it should sign in as — each URL pins that client's role, IP range and Conditional Access."
          />
          <Divider />
          <CardContent>
            <Stack spacing={1}>
              {mcpClients.map((c) => (
                <Stack
                  key={c.AppId}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Typography variant="body2" sx={{ minWidth: 200, fontWeight: 600 }}>
                    {c.AppName || c.AppId}
                  </Typography>
                  <CippCopyToClipBoard type="chip" text={`${baseMcpUrl}?client=${c.AppId}`} />
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {mcpAuth.isSuccess && mcpClients.length > 0 && (
        <Card>
          <CardHeader
            title="Custom Redirect URIs"
            subheader="Add callback URLs for AI providers CIPP doesn't ship a built-in callback for. The managed provider callbacks above are always kept."
          />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              {mcpClients.length > 1 && (
                <FormControl size="small" sx={{ minWidth: 260 }}>
                  <InputLabel id="mcp-client-select-label">MCP client app</InputLabel>
                  <Select
                    labelId="mcp-client-select-label"
                    label="MCP client app"
                    value={selectedMcpClient || ""}
                    onChange={(e) => setSelectedMcpClient(e.target.value)}
                  >
                    {mcpClients.map((c) => (
                      <MenuItem key={c.AppId} value={c.AppId}>
                        {c.AppName || c.AppId}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <CippFormComponent
                type="autoComplete"
                name="RedirectUris"
                label="Custom redirect URIs for this client"
                formControl={redirectForm}
                multiple
                freeSolo
                creatable
                options={[]}
                placeholder="Paste a provider callback URL and press enter"
              />
              <Box>
                <Button
                  variant="contained"
                  disabled={!selectedMcpClient}
                  onClick={() =>
                    mcpAuthPost.mutate({
                      url: "/api/ExecApiClient?action=SetMcpRedirectUris",
                      data: {
                        ClientId: selectedMcpClient,
                        RedirectUris: (redirectForm.getValues("RedirectUris") || []).map(
                          (u) => u?.value ?? u
                        ),
                      },
                    })
                  }
                >
                  Save Redirect URIs
                </Button>
              </Box>
              <CippApiResults apiObject={mcpAuthPost} />
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};

export default CippMcpManagement;
