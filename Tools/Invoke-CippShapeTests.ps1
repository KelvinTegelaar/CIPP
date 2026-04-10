<#
.SYNOPSIS
    CIPP API Shape Tests - validates that all LIST/GET endpoints return expected response shapes.

.DESCRIPTION
    Calls every read-only API endpoint and compares the response structure (property names + basic types)
    against saved baselines. Reports shape changes, connection errors, and empty responses.

    Authenticates via OAuth2 client_credentials flow against Azure AD, then calls the CIPP API
    with a Bearer token.

.PARAMETER CippApiUrl
    Base URL of the CIPP-API instance (e.g., https://cipp-api.example.com)

.PARAMETER CippClientId
    Azure AD Application (client) ID of the CIPP API client.

.PARAMETER CippClientSecret
    Azure AD Application client secret.

.PARAMETER CippTenantId
    Azure AD tenant ID where the CIPP API client is registered.

.PARAMETER CippApiScope
    OAuth2 scope for the CIPP API. Typically api://{CIPP-SAM-App-Id}/.default

.PARAMETER TenantFilter
    Tenant domain to use for tenant-specific endpoints.

.PARAMETER ShapesPath
    Path to the Shapes directory. Defaults to ../Tests/Shapes relative to this script.

.PARAMETER UpdateBaselines
    When set, saves current API response shapes as new baselines instead of comparing.

.PARAMETER CI
    When set, emits GitHub Actions annotations and step summary.

.EXAMPLE
    ./Invoke-CippShapeTests.ps1 -CippApiUrl "https://my-cipp.com" -CippClientId "..." -CippClientSecret "..." -CippTenantId "..." -CippApiScope "api://.../.default" -UpdateBaselines
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$CippApiUrl,
    [Parameter(Mandatory)][string]$CippClientId,
    [Parameter(Mandatory)][string]$CippClientSecret,
    [Parameter(Mandatory)][string]$CippTenantId,
    [Parameter(Mandatory)][string]$CippApiScope,
    [string]$TenantFilter = '7ngn50.onmicrosoft.com',
    [string]$ShapesPath,
    [switch]$UpdateBaselines,
    [switch]$CI
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

if (-not $ShapesPath) {
    $ShapesPath = Join-Path (Split-Path $PSScriptRoot -Parent) 'Tests' 'Shapes'
}

$CippApiUrl = $CippApiUrl.TrimEnd('/')

# ─── OAuth2 Token Acquisition ────────────────────────────────────────────────────

function Get-CippAccessToken {
    $tokenUrl = "https://login.microsoftonline.com/$CippTenantId/oauth2/v2.0/token"
    $body = @{
        client_id     = $CippClientId
        client_secret = $CippClientSecret
        scope         = $CippApiScope
        grant_type    = 'client_credentials'
    }
    $response = Invoke-RestMethod -Uri $tokenUrl -Method POST -Body $body -ContentType 'application/x-www-form-urlencoded' -ErrorAction Stop
    return $response.access_token
}

Write-Host 'Acquiring OAuth2 access token...' -ForegroundColor Cyan
try {
    $script:AccessToken = Get-CippAccessToken
    Write-Host 'Token acquired successfully.' -ForegroundColor Green
} catch {
    Write-Host "Failed to acquire OAuth2 token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ─── Endpoint Registry ──────────────────────────────────────────────────────────
# Each entry: Name, RequiresTenant, ExtraParams (optional hashtable), AllowEmpty (optional bool)
#
# Endpoints that need a specific resource ID (userId, siteId, etc.) are excluded entirely
# since we can't generically test them without knowing a valid ID.
#
# Skipped endpoints (need resource IDs or special POST bodies):
#   ListAppsRepository       - needs POST body with Search param
#   ListContactPermissions   - needs UserID param
#   ListDBCache              - needs type param for meaningful results
#   ListOoO                  - needs userid param
#   ListSiteMembers          - needs SiteId param
#   ListAuditLogTest         - needs params
#   ListDevices              - skip per request
#   ListGraphRequest         - meta-endpoint, needs Endpoint param
#   ListGraphBulkRequest     - POST body with requests array
#   ListDirectoryObjects     - POST body with ids array
#   ListExoRequest           - POST body with Cmdlet param
#   ListMailQuarantineMessage - needs Identity param
#   ListScheduledItemDetails - needs RowKey param
#   ListSafeLinksPolicyDetails - needs PolicyName param
#   ListGroupSenderAuthentication - needs GroupId param
#   ListUserConditionalAccessPolicies - needs userId param
#   ListUserGroups           - needs userId param
#   ListUserMailboxDetails   - needs userId param
#   ListUserMailboxRules     - needs userId param
#   ListUserTrustedBlockedSenders - needs userId param
#   ListUserDevices          - needs userId param
#   ListUserSigninLogs       - needs userId param
#   ListMailboxMobileDevices - needs userId param
#   ListMailboxRules         - needs userId param
#   ListCalendarPermissions  - needs userId param
#   ListSharedMailboxStatistics - times out consistently (>120s, iterates all shared mailboxes)

$EndpointRegistry = @(
    # ── Global endpoints (no tenantFilter) ──────────────────────────────────────
    @{ Name = 'GetCippAlerts';                    RequiresTenant = $false }
    @{ Name = 'GetVersion';                       RequiresTenant = $false }
    @{ Name = 'ListAppApprovalTemplates';         RequiresTenant = $false }
    @{ Name = 'ListAppTemplates';                 RequiresTenant = $false }
    @{ Name = 'ListApplicationQueue';             RequiresTenant = $false; AllowEmpty = $true }
    @{ Name = 'ListAssignmentFilterTemplates';    RequiresTenant = $false }
    @{ Name = 'ListCAtemplates';                  RequiresTenant = $false }
    @{ Name = 'ListCommunityRepos';               RequiresTenant = $false }
    @{ Name = 'ListConnectionFilterTemplates';    RequiresTenant = $false }
    @{ Name = 'ListContactTemplates';             RequiresTenant = $false }
    @{ Name = 'ListCustomRole';                   RequiresTenant = $false; AllowEmpty = $true }
    @{ Name = 'ListCustomScripts';                RequiresTenant = $false; AllowEmpty = $true }
    @{ Name = 'ListDiagnosticsPresets';           RequiresTenant = $false; AllowEmpty = $true }
    @{ Name = 'ListDomainHealth';                 RequiresTenant = $false }
    @{ Name = 'ListExConnectorTemplates';         RequiresTenant = $false; AllowEmpty = $true }
    @{ Name = 'ListExcludedLicenses';             RequiresTenant = $false }
    @{ Name = 'ListExtensionSync';                RequiresTenant = $false }
    @{ Name = 'ListFeatureFlags';                 RequiresTenant = $false }
    @{ Name = 'ListGDAPInvite';                   RequiresTenant = $false }
    @{ Name = 'ListGDAPRoles';                    RequiresTenant = $false }
    @{ Name = 'ListGroupTemplates';               RequiresTenant = $false }
    @{ Name = 'ListIntuneReusableSettingTemplates'; RequiresTenant = $false }
    @{ Name = 'ListIntuneTemplates';              RequiresTenant = $false }
    @{ Name = 'ListReportBuilderTemplates';       RequiresTenant = $false }
    @{ Name = 'ListSafeLinksPolicyTemplates';     RequiresTenant = $false }
    @{ Name = 'ListSharepointSettings';           RequiresTenant = $false }
    @{ Name = 'ListSnoozedAlerts';                RequiresTenant = $false; AllowEmpty = $true }
    @{ Name = 'ListSpamFilterTemplates';          RequiresTenant = $false }
    @{ Name = 'ListTenantAllowBlockListTemplates'; RequiresTenant = $false }
    @{ Name = 'ListTenantOnboarding';             RequiresTenant = $false }
    @{ Name = 'ListTestReports';                  RequiresTenant = $false; AllowEmpty = $true }
    @{ Name = 'ListUserPhoto';                    RequiresTenant = $false }
    @{ Name = 'ListUserSettings';                 RequiresTenant = $false }
    @{ Name = 'ListWebhookAlert';                 RequiresTenant = $false; AllowEmpty = $true }

    # ── Tenant-specific endpoints ───────────────────────────────────────────────
    @{ Name = 'ListAPDevices';                    RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListAdminPortalLicenses';          RequiresTenant = $true }
    @{ Name = 'ListAlertsQueue';                  RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListAntiPhishingFilters';          RequiresTenant = $true }
    @{ Name = 'ListAppConsentRequests';           RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListAppProtectionPolicies';        RequiresTenant = $true }
    @{ Name = 'ListApps';                         RequiresTenant = $true }
    @{ Name = 'ListAssignmentFilters';            RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListAuditLogSearches';             RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListAuditLogs';                    RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListAutopilotconfig';              RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListAzureADConnectStatus';         RequiresTenant = $true }
    @{ Name = 'ListBasicAuth';                    RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListCompliancePolicies';           RequiresTenant = $true }
    @{ Name = 'ListConditionalAccessPolicies';    RequiresTenant = $true }
    @{ Name = 'ListConditionalAccessPolicyChanges'; RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListConnectionFilter';             RequiresTenant = $true }
    @{ Name = 'ListContacts';                     RequiresTenant = $true }
    @{ Name = 'ListCustomDataMappings';           RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListCustomVariables';              RequiresTenant = $true }
    @{ Name = 'ListDefenderState';                RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListDeletedItems';                 RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListDomainAnalyser';               RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListDomains';                      RequiresTenant = $true }
    @{ Name = 'ListEquipment';                    RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListExchangeConnectors';           RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListExtensionCacheData';           RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListGeneratedReports';             RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListGlobalAddressList';            RequiresTenant = $true }
    @{ Name = 'ListGroups';                       RequiresTenant = $true }
    @{ Name = 'ListInactiveAccounts';             RequiresTenant = $true }
    @{ Name = 'ListIntunePolicy';                 RequiresTenant = $true }
    @{ Name = 'ListIntuneReusableSettings';       RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListIntuneScript';                 RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListJITAdmin';                     RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListJITAdminTemplates';            RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListLicenses';                     RequiresTenant = $true }
    @{ Name = 'ListMDEOnboarding';                RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListMFAUsers';                     RequiresTenant = $true }
    @{ Name = 'ListMailQuarantine';               RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListMailboxCAS';                   RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListMailboxForwarding';            RequiresTenant = $true }
    @{ Name = 'ListMailboxRestores';              RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListMailboxes';                    RequiresTenant = $true }
    @{ Name = 'ListMalwareFilters';               RequiresTenant = $true }
    @{ Name = 'ListMessageTrace';                 RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListNewUserDefaults';              RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListOAuthApps';                    RequiresTenant = $true }
    @{ Name = 'ListPerUserMFA';                   RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListQuarantinePolicy';             RequiresTenant = $true }
    @{ Name = 'ListRestrictedUsers';              RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListRoomLists';                    RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListRooms';                        RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListSafeAttachmentsFilters';       RequiresTenant = $true }
    @{ Name = 'ListSafeLinksPolicy';              RequiresTenant = $true }
    @{ Name = 'ListScheduledItems';               RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListServiceHealth';                RequiresTenant = $true }
    @{ Name = 'ListSharedMailboxAccountEnabled';  RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListSpamfilter';                   RequiresTenant = $true }
    @{ Name = 'ListSharepointAdminUrl';           RequiresTenant = $true }
    @{ Name = 'ListSharepointQuota';              RequiresTenant = $true }
    @{ Name = 'ListSignIns';                      RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListSites';                        RequiresTenant = $true; ExtraParams = @{ Type = 'SharePointSiteUsage' } }
    @{ Name = 'ListStandards';                    RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListStandardsCompare';             RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListTeams';                        RequiresTenant = $true; ExtraParams = @{ type = 'List' }; AllowEmpty = $true }
    @{ Name = 'ListTeamsActivity';                RequiresTenant = $true; ExtraParams = @{ Type = 'TeamsUserActivityUser' }; AllowEmpty = $true }
    @{ Name = 'ListTeamsLisLocation';             RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListTeamsVoice';                   RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListTenantAlignment';              RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListTenantDetails';                RequiresTenant = $true }
    @{ Name = 'ListTenantDrift';                  RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListTenantGroups';                 RequiresTenant = $true }
    @{ Name = 'ListTenants';                      RequiresTenant = $true }
    @{ Name = 'ListTests';                        RequiresTenant = $true; AllowEmpty = $true }
    @{ Name = 'ListTransportRules';               RequiresTenant = $true }
    @{ Name = 'ListUserCounts';                   RequiresTenant = $true }
    @{ Name = 'ListUsers';                        RequiresTenant = $true }
)

# ─── Helper Functions ────────────────────────────────────────────────────────────

function Invoke-CippApiCall {
    param(
        [string]$Endpoint,
        [hashtable]$QueryParams = @{},
        [string]$Method = 'GET',
        [hashtable]$Body
    )

    $headers = @{
        'Authorization' = "Bearer $script:AccessToken"
        'Content-Type'  = 'application/json'
    }

    $uri = "$CippApiUrl/api/$Endpoint"
    if ($QueryParams.Count -gt 0) {
        $queryString = ($QueryParams.GetEnumerator() | ForEach-Object { "$($_.Key)=$([System.Uri]::EscapeDataString($_.Value))" }) -join '&'
        $uri = "$uri`?$queryString"
    }

    $params = @{
        Uri         = $uri
        Method      = $Method
        Headers     = $headers
        TimeoutSec  = 120
        ErrorAction = 'Stop'
    }

    if ($Body) {
        $params['Body'] = ($Body | ConvertTo-Json -Depth 10)
    }

    Invoke-RestMethod @params
}

function Get-FirstResultObject {
    param($Response)

    if ($null -eq $Response) { return $null }

    # If response has a Results property, use it
    if ($Response.PSObject.Properties.Name -contains 'Results') {
        $results = $Response.Results
        if ($null -eq $results) { return $null }
        if ($results -is [array]) {
            if ($results.Count -eq 0) { return $null }
            return $results[0]
        }
        return $results
    }

    # If response itself is an array
    if ($Response -is [array]) {
        if ($Response.Count -eq 0) { return $null }
        return $Response[0]
    }

    # Single object response
    return $Response
}

function Get-ObjectShape {
    param(
        $Object,
        [int]$MaxDepth = 3,
        [int]$CurrentDepth = 0
    )

    if ($null -eq $Object) { return 'null' }
    if ($CurrentDepth -ge $MaxDepth) { return 'truncated' }

    # Primitive types
    if ($Object -is [string]) { return 'string' }
    if ($Object -is [bool]) { return 'bool' }
    if ($Object -is [int] -or $Object -is [long] -or $Object -is [double] -or $Object -is [decimal] -or $Object -is [float]) { return 'number' }

    # Arrays
    if ($Object -is [array] -or $Object -is [System.Collections.IList]) {
        $arr = @($Object)
        if ($arr.Count -eq 0) {
            return [ordered]@{ '_type' = 'array'; '_element' = 'unknown' }
        }
        $elementShape = Get-ObjectShape -Object $arr[0] -MaxDepth $MaxDepth -CurrentDepth ($CurrentDepth + 1)
        return [ordered]@{ '_type' = 'array'; '_element' = $elementShape }
    }

    # Objects (PSCustomObject, hashtable)
    if ($Object -is [System.Management.Automation.PSCustomObject] -or $Object -is [hashtable]) {
        $shape = [ordered]@{}
        $properties = if ($Object -is [hashtable]) {
            $Object.Keys | Sort-Object
        } else {
            $Object.PSObject.Properties.Name | Sort-Object
        }
        foreach ($prop in $properties) {
            $value = if ($Object -is [hashtable]) { $Object[$prop] } else { $Object.$prop }
            $shape[$prop] = Get-ObjectShape -Object $value -MaxDepth $MaxDepth -CurrentDepth ($CurrentDepth + 1)
        }
        return $shape
    }

    # Fallback
    return $Object.GetType().Name.ToLower()
}

function Compare-Shape {
    param(
        $Baseline,
        $Current,
        [string]$Path = '$'
    )

    $differences = [System.Collections.Generic.List[string]]::new()

    # Both are simple type strings
    if ($Baseline -is [string] -and $Current -is [string]) {
        if ($Baseline -ne $Current) {
            $differences.Add("$Path : $Baseline -> $Current")
        }
        return $differences
    }

    # Normalize: treat all dictionary types as equivalent (OrderedDictionary, OrderedHashtable, Hashtable)
    $baselineIsDict = $Baseline -is [System.Collections.IDictionary]
    $currentIsDict = $Current -is [System.Collections.IDictionary]

    # Type mismatch (one is string, other is dict, etc.) - but not dict-vs-dict
    if (-not ($baselineIsDict -and $currentIsDict)) {
        if ($Baseline.GetType().Name -ne $Current.GetType().Name) {
            $differences.Add("$Path : type changed ($($Baseline.GetType().Name) -> $($Current.GetType().Name))")
            return $differences
        }
    }

    # Both are dicts (object shapes or array markers)
    if ($baselineIsDict -and $currentIsDict) {
        # Check for array type marker
        if ($Baseline.Contains('_type') -and $Baseline['_type'] -eq 'array') {
            if (-not $Current.Contains('_type') -or $Current['_type'] -ne 'array') {
                $differences.Add("$Path : was array, now is not")
                return $differences
            }
            $subDiffs = Compare-Shape -Baseline $Baseline['_element'] -Current $Current['_element'] -Path "$Path[]"
            if ($subDiffs) { $differences.AddRange(@($subDiffs)) }
            return $differences
        }

        # Object comparison - check for removed properties
        foreach ($key in $Baseline.Keys) {
            if ($key -eq '_type' -or $key -eq '_element') { continue }
            if (-not $Current.Contains($key)) {
                $differences.Add("$Path.$key : removed")
            } else {
                $subDiffs = Compare-Shape -Baseline $Baseline[$key] -Current $Current[$key] -Path "$Path.$key"
                if ($subDiffs) { $differences.AddRange(@($subDiffs)) }
            }
        }

        # Check for added properties
        foreach ($key in $Current.Keys) {
            if ($key -eq '_type' -or $key -eq '_element') { continue }
            if (-not $Baseline.Contains($key)) {
                $differences.Add("$Path.$key : added")
            }
        }
    }

    return $differences
}

# ─── Main Execution ──────────────────────────────────────────────────────────────

if (-not (Test-Path $ShapesPath)) {
    New-Item -ItemType Directory -Path $ShapesPath -Force | Out-Null
}

$results = [System.Collections.Generic.List[PSCustomObject]]::new()
$passCount = 0
$failCount = 0
$warnCount = 0
$skipCount = 0

Write-Host "`n=== CIPP API Shape Tests ===" -ForegroundColor Cyan
Write-Host "API: $CippApiUrl"
Write-Host "Tenant: $TenantFilter"
Write-Host "Endpoints: $($EndpointRegistry.Count)"
Write-Host "Mode: $(if ($UpdateBaselines) { 'Update Baselines' } else { 'Compare' })`n"

foreach ($ep in $EndpointRegistry) {
    $endpointName = $ep.Name
    $sw = [System.Diagnostics.Stopwatch]::StartNew()

    # Build query params: tenantFilter + any extra params for this endpoint
    $queryParams = @{}
    if ($ep.RequiresTenant) {
        $queryParams['tenantFilter'] = $TenantFilter
    }
    if ($ep.ExtraParams) {
        foreach ($kv in $ep.ExtraParams.GetEnumerator()) {
            $queryParams[$kv.Key] = $kv.Value
        }
    }

    $status = 'PASS'
    $message = ''
    $isAllowedEmpty = [bool]$ep.AllowEmpty

    try {
        $response = Invoke-CippApiCall -Endpoint $endpointName -QueryParams $queryParams
        $firstObj = Get-FirstResultObject -Response $response

        if ($null -eq $firstObj) {
            if ($isAllowedEmpty) {
                $status = 'WARN'
                $message = 'No Results (allowed empty)'
                $warnCount++
            } else {
                $status = 'ERROR'
                $message = 'No Results'
                $failCount++
            }
        } else {
            $shape = Get-ObjectShape -Object $firstObj
            $shapeFile = Join-Path $ShapesPath "$endpointName.json"

            if ($UpdateBaselines) {
                $shapeData = [ordered]@{
                    '_metadata' = [ordered]@{
                        'endpoint'      = $endpointName
                        'generatedAt'   = (Get-Date -Format 'o')
                        'tenantFilter'  = if ($ep.RequiresTenant) { $TenantFilter } else { $null }
                        'requiresTenant' = $ep.RequiresTenant
                    }
                    'shape' = $shape
                }
                $shapeData | ConvertTo-Json -Depth 20 | Set-Content -Path $shapeFile -Encoding UTF8
                $status = 'SAVED'
                $message = "Baseline saved to $endpointName.json"
                $passCount++
            } else {
                if (-not (Test-Path $shapeFile)) {
                    $status = 'SKIP'
                    $message = 'No baseline file found (run with -UpdateBaselines first)'
                    $skipCount++
                } else {
                    $baseline = Get-Content $shapeFile -Raw | ConvertFrom-Json -AsHashtable
                    $baselineShape = $baseline['shape']

                    $diffs = Compare-Shape -Baseline $baselineShape -Current $shape
                    if ($diffs.Count -gt 0) {
                        $status = 'ERROR'
                        $diffSummary = ($diffs | Select-Object -First 5) -join '; '
                        if ($diffs.Count -gt 5) { $diffSummary += " ... and $($diffs.Count - 5) more" }
                        $message = "Changed Shape ($diffSummary)"
                        $failCount++
                    } else {
                        $passCount++
                    }
                }
            }
        }
    } catch {
        $status = 'ERROR'
        $statusCode = $null
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        if ($statusCode) {
            $message = "Could not connect (HTTP $statusCode)"
        } else {
            $message = "Could not connect ($($_.Exception.Message))"
        }
        $failCount++
    }

    $sw.Stop()
    $duration = $sw.Elapsed.TotalSeconds

    $result = [PSCustomObject]@{
        Endpoint = $endpointName
        Status   = $status
        Message  = $message
        Duration = [math]::Round($duration, 2)
    }
    $results.Add($result)

    # Console output
    $color = switch ($status) {
        'PASS'  { 'Green' }
        'SAVED' { 'Green' }
        'WARN'  { 'Yellow' }
        'SKIP'  { 'DarkGray' }
        default { 'Red' }
    }
    $statusTag = "[$status]".PadRight(8)
    $line = "API /$endpointName - $statusTag"
    if ($message) { $line += " $message" }
    $line += " (${duration}s)"
    Write-Host $line -ForegroundColor $color

    # GitHub Actions annotations
    if ($CI) {
        switch ($status) {
            'ERROR' { Write-Host "::error title=API Shape Test Failed::/$endpointName - $message" }
            'WARN'  { Write-Host "::warning title=API Shape Test Warning::/$endpointName - $message" }
        }
    }
}

# ─── Summary ─────────────────────────────────────────────────────────────────────

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "PASS: $passCount | FAIL: $failCount | WARN: $warnCount | SKIP: $skipCount"
Write-Host "Total: $($results.Count) endpoints tested"

# Export results as JSON
$resultsFile = Join-Path $ShapesPath 'test-results.json'
$results | ConvertTo-Json -Depth 5 | Set-Content -Path $resultsFile -Encoding UTF8

# GitHub Actions step summary
if ($CI -and $env:GITHUB_STEP_SUMMARY) {
    $summary = @"
## CIPP Shape Test Results

| Status | Count |
|--------|-------|
| PASS | $passCount |
| FAIL | $failCount |
| WARN | $warnCount |
| SKIP | $skipCount |

### Failed Endpoints

"@
    $failed = $results | Where-Object { $_.Status -eq 'ERROR' }
    if ($failed) {
        foreach ($f in $failed) {
            $summary += "- **/$($f.Endpoint)** - $($f.Message)`n"
        }
    } else {
        $summary += "_None_`n"
    }

    $summary | Out-File -FilePath $env:GITHUB_STEP_SUMMARY -Append -Encoding UTF8
}

# Exit code
if ($failCount -gt 0) {
    Write-Host "`nShape tests FAILED with $failCount error(s)." -ForegroundColor Red
    exit 1
} else {
    Write-Host "`nShape tests PASSED." -ForegroundColor Green
    exit 0
}
