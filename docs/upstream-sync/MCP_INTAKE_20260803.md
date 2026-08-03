# MCP Feature Intake — 2026-08-03

Cycle type: **Feature intake** per [PROCESS.md](PROCESS.md).

## Feature: MCP Server (internal team)

- Upstream refs: `Invoke-ExecMcp.ps1`, `Modules/CIPPCore/Public/MCP/*`, `Set-CIPPMCPClientApp.ps1`, `Config/openapi.json`, MCPAllowed wiring in ApiClient + auth
- Fork gap: Feature flag `MCPServer` existed (disabled) and `New-CippCoreRequest` already mapped MCP principals; missing endpoint, MCP helpers, OpenAPI spec, UI toggle
- Protected conflicts: Adapt `Set-CippApiAuth` / `CippApiClientManagement` — preserve SWA auth path and Manage365 branding (do not take CIPPNG/SSO EasyAuth rewrite)
- Scope: **capability only** — `MCPServer` remains **Enabled: false** until ops validates; internal team use
- Phases: backend → frontend → tab hygiene → verify → PR
- Approval: [x] design [x] implement [x] deploy (enable flag after smoke)

## Also in this intake

- Super-admin tab hygiene: removed 404 links for CIPP Users, SSO, Container Management from `tabOptions.json`
- Container management / logs / worker health: **not** intaken (Craft bridges required)
- Teams V2: **unchanged deferred**

## Taken

### CIPP-API

- `Modules/CIPPCore/Public/MCP/{Get-CippMcpSpec,Get-CippMcpToolList,Get-CippMcpToolResult}.ps1`
- `Modules/CIPPHTTP/.../CIPP/MCP/Invoke-ExecMcp.ps1`
- `Modules/CIPPCore/Public/Authentication/Set-CIPPMCPClientApp.ps1`
- `Config/openapi.json` (upstream baseline for tool projection)
- `Get-CippApiClient` projects `MCPAllowed`
- `Invoke-ExecApiClient` persists MCPAllowed, configures MCP app on enable, SaveToAzure passes `McpClientIds` + PRM scope app setting
- `Set-CippApiAuth` gains optional `-McpClientIds` host/appId audiences (fork ARM path kept)

### CIPP

- `CippApiClientManagement.jsx`: MCPAllowed switch + warning, MCP API URL chip, table column
- `super-admin/tabOptions.json`: dropped CIPP Users / SSO / Container Management tabs

## Enablement (post-deploy)

1. Deploy all Function slots + SWA
2. Create/enable an API client with **MCP Access Allowed**, then **Save to Azure**
3. Toggle feature flag **MCP Server** on in CIPP settings / Feature Flags
4. Smoke: POST `tools/list` then one `.Read` tool via MCP client against `/api/ExecMcp`

## Verification

- PowerShell AST parse: all new/changed MCP and auth files OK
- `MCPServer.Enabled` remains `false` in `Config/FeatureFlags.json`
