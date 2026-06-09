Write-Host 'Starting CIPP Dev Emulators' -ForegroundColor Cyan

# Verify Windows Terminal is available
Get-Command wt -ErrorAction Stop | Out-Null

# Stop any existing node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -ErrorAction SilentlyContinue

# Get paths
$Path = (Get-Item $PSScriptRoot).Parent.Parent.FullName

# Run installation script to ensure dependencies are installed and updated before starting emulators
pwsh -File (Join-Path $PSScriptRoot 'Start-CippDevInstallation.ps1')
$ApiPath = Join-Path -Path $Path -ChildPath 'CIPP-API'
$FrontendPath = Join-Path -Path $Path -ChildPath 'CIPP'

Write-Host 'Starting emulators...' -ForegroundColor Cyan

# Build commands with error handling
$azuriteCommand = 'try { azurite } catch { Write-Error $_.Exception.Message } finally { Read-Host "Press Enter to exit" }'
$apiCommand = @'
try {
	# Use a stable local identity so timer node selection treats this as the catch-all host.
	$env:WEBSITE_SITE_NAME = "cipp"
	$env:CIPP_PROCESSOR = "false"
	$env:AzureFunctionsWebHost__hostid = "cipp-single"

	# Ensure prior offload simulation env overrides do not disable triggers in this shell.
	Remove-Item -Path "Env:AzureWebJobs.CIPPTimer.Disabled" -ErrorAction SilentlyContinue
	Remove-Item -Path "Env:AzureWebJobs.CIPPActivityFunction.Disabled" -ErrorAction SilentlyContinue
	Remove-Item -Path "Env:AzureWebJobs.CIPPOrchestrator.Disabled" -ErrorAction SilentlyContinue
	Remove-Item -Path "Env:AzureWebJobs.CIPPQueueTrigger.Disabled" -ErrorAction SilentlyContinue
	Remove-Item -Path "Env:AzureWebJobs.CIPPHttpTrigger.Disabled" -ErrorAction SilentlyContinue

	func start
} catch {
	Write-Error $_.Exception.Message
} finally {
	Read-Host "Press Enter to exit"
}
'@
$frontendCommand = 'try { npm run dev } catch { Write-Error $_.Exception.Message } finally { Read-Host "Press Enter to exit" }'
$swaCommand = 'try { npm run start-swa } catch { Write-Error $_.Exception.Message } finally { Read-Host "Press Enter to exit" }'

# Encode commands to avoid parsing issues with multi-line strings
$azuriteEncoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($azuriteCommand))
$apiEncoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($apiCommand))
$frontendEncoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($frontendCommand))
$swaEncoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($swaCommand))

# Start Windows Terminal with all tabs
wt --title CIPP`; new-tab --title 'Azurite' -d $Path pwsh -EncodedCommand $azuriteEncoded`; new-tab --title 'FunctionApp' -d $ApiPath pwsh -EncodedCommand $apiEncoded`; new-tab --title 'CIPP Frontend' -d $FrontendPath pwsh -EncodedCommand $frontendEncoded`; new-tab --title 'SWA' -d $FrontendPath pwsh -EncodedCommand $swaEncoded
