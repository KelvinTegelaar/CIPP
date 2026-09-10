[CmdletBinding()]
param(
    [int]$HttpPort = 7071,
    [int]$ProcessorPort = 7072,
    [switch]$NoFrontend
)

Write-Host 'Starting CIPP local offload simulation' -ForegroundColor Cyan

# Verify Windows Terminal is available
Get-Command wt -ErrorAction Stop | Out-Null

# Stop any existing node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -ErrorAction SilentlyContinue

# Run installation script to ensure dependencies are installed and updated before starting emulators
pwsh -File (Join-Path $PSScriptRoot 'Start-CippDevInstallation.ps1')
Write-Host 'Starting emulators...' -ForegroundColor Cyan

$repoRoot = (Get-Item $PSScriptRoot).Parent.Parent.FullName
$apiPath = Join-Path -Path $repoRoot -ChildPath 'CIPP-API'
$frontendPath = Join-Path -Path $repoRoot -ChildPath 'CIPP'

if (-not (Test-Path $apiPath)) {
    throw "CIPP-API path not found: $apiPath"
}

$azuriteCommand = 'try { azurite } catch { Write-Error $_.Exception.Message } finally { Read-Host "Press Enter to exit" }'

$httpHostCommand = @'
try {
    $env:WEBSITE_SITE_NAME = "cipp-http"
    $env:CIPP_PROCESSOR = "false"
    $env:AzureFunctionsWebHost__hostid = "cipp-http"

    Set-Item -Path "Env:AzureWebJobs.CIPPTimer.Disabled" -Value "1"
    Set-Item -Path "Env:AzureWebJobs.CIPPActivityFunction.Disabled" -Value "1"
    Set-Item -Path "Env:AzureWebJobs.CIPPOrchestrator.Disabled" -Value "1"
    Set-Item -Path "Env:AzureWebJobs.CIPPQueueTrigger.Disabled" -Value "1"

    func start --port {HTTP_PORT}
} catch {
    Write-Error $_.Exception.Message
} finally {
    Read-Host "Press Enter to exit"
}
'@

$processorHostCommand = @'
try {
    $env:WEBSITE_SITE_NAME = "cipp-proc"
    $env:CIPP_PROCESSOR = "true"
    $env:AzureFunctionsWebHost__hostid = "cipp-proc"

    Set-Item -Path "Env:AzureWebJobs.CIPPHttpTrigger.Disabled" -Value "1"

    func start --port {PROCESSOR_PORT}
} catch {
    Write-Error $_.Exception.Message
} finally {
    Read-Host "Press Enter to exit"
}
'@

$httpHostCommand = $httpHostCommand.Replace('{HTTP_PORT}', $HttpPort.ToString())
$processorHostCommand = $processorHostCommand.Replace('{PROCESSOR_PORT}', $ProcessorPort.ToString())

$frontendCommand = 'try { npm run dev } catch { Write-Error $_.Exception.Message } finally { Read-Host "Press Enter to exit" }'
$swaCommand = 'try { npm run start-swa } catch { Write-Error $_.Exception.Message } finally { Read-Host "Press Enter to exit" }'

$azuriteEncoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($azuriteCommand))
$httpHostEncoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($httpHostCommand))
$processorHostEncoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($processorHostCommand))
$frontendEncoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($frontendCommand))
$swaEncoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($swaCommand))

if ($NoFrontend) {
    wt --title CIPP-Offload-Sim`; new-tab --title 'Azurite' -d $repoRoot pwsh -EncodedCommand $azuriteEncoded`; new-tab --title 'FunctionApp-HTTP' -d $apiPath pwsh -EncodedCommand $httpHostEncoded`; new-tab --title 'FunctionApp-Processor' -d $apiPath pwsh -EncodedCommand $processorHostEncoded
} else {
    wt --title CIPP-Offload-Sim`; new-tab --title 'Azurite' -d $repoRoot pwsh -EncodedCommand $azuriteEncoded`; new-tab --title 'FunctionApp-HTTP' -d $apiPath pwsh -EncodedCommand $httpHostEncoded`; new-tab --title 'FunctionApp-Processor' -d $apiPath pwsh -EncodedCommand $processorHostEncoded`; new-tab --title 'CIPP Frontend' -d $frontendPath pwsh -EncodedCommand $frontendEncoded`; new-tab --title 'SWA' -d $frontendPath pwsh -EncodedCommand $swaEncoded
}

Write-Host "Started offload simulation tabs (HTTP:$HttpPort, Processor:$ProcessorPort)." -ForegroundColor Green
